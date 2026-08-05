import { AuthService } from './AuthService.js';
import { ThemeManager } from './ThemeManager.js';
import { NotificationManager } from './NotificationManager.js';
import { TeachingRenderer } from './TeachingRenderer.js';
import { WorkspaceUI } from './WorkspaceUI.js';
import { ChatUI } from './ChatUI.js';
import { CurriculumUI } from './CurriculumUI.js';
import { PresenceManager } from './PresenceManager.js';

/**
 * RoomEngine.js
 * Central State Manager and Orchestrator for the Smart Teaching Room.
 * Implements strict state validation, diffing, and rAF rendering pipeline.
 */

class RoomEngineClass {
    constructor() {
        this.courseId = null;
        this.currentUser = null;
        this.isInstructor = false;

        // Central State Object
        this.state = {
            room: {
                mode: 'video', // video, slides, channel, audio, link
                isLive: false,
                title: '',
                description: '',
                instructor: null
            },
            presentation: {
                videoUrl: null,
                currentSlideUrl: null,
                channelTimestamp: 0
            },
            network: {
                lowBandwidth: false,
                isOffline: false
            },
            chat: {
                unreadCount: 0
            },
            layout: {
                activeTab: 'overview',
                sidebarOpen: false,
                chatOpen: false,
                bottomSheetOpen: false
            }
        };

        this.prevState = JSON.parse(JSON.stringify(this.state));
        this.renderQueue = new Set();
        this.isRendering = false;
        
        this.listeners = {
            room: null,
            chat: null,
            resources: null
        };
    }

    async init(courseId) {
        if (!courseId) {
            console.error("[RoomEngine] Fatal: No courseId provided.");
            return;
        }

        this.courseId = courseId;
        this.currentUser = AuthService.getCurrentUser();
        
        if (!this.currentUser) {
            console.error("[RoomEngine] Fatal: Unauthenticated user.");
            return;
        }

        // Determine user role securely via claims/DB (mocked for now)
        this.isInstructor = await this.checkUserRole();
        
        // Initialize Submodules
        ThemeManager.init();
        NotificationManager.init();
        TeachingRenderer.init();
        WorkspaceUI.init(this);
        ChatUI.init(this);
        
        // Initialize features
        try {
            await Promise.all([
                import('./PresenceManager.js').then(({ PresenceManager }) => PresenceManager.init(this)),
                import('./ChatController.js').then(({ ChatController }) => ChatController.init(this)),
                import('./AttendanceController.js').then(({ AttendanceController }) => AttendanceController.init(this.courseId, this.currentUser.uid))
            ]);

            if (this.isInstructor) {
                import('./InstructorController.js').then(({ InstructorController }) => {
                    InstructorController.init(this);
                    // Start listening for student hand-raise requests
                    InstructorController.listenForHandRaises();
                });
            }

            // Sync Offline Data (Phase 8 Enterprise)
            import('./OfflineSyncEngine.js').then(({ OfflineSyncEngine }) => OfflineSyncEngine.init());

            // Enterprise Progress & Analytics (Phase 9)
            import('./ProgressManager.js').then(({ ProgressManager }) => ProgressManager.init(this));

        } catch (error) {
            console.error("Feature initialization failed", error);
        }

        // Initialize Curriculum Pipeline
        import('./CurriculumController.js').then(({ CurriculumController }) => {
            CurriculumController.isInstructor = this.isInstructor;
            CurriculumController.init(this.courseId);
        });
        CurriculumUI.init(this.isInstructor);

        import('./ResourceManager.js').then(({ ResourceManager }) => {
            ResourceManager.init(this);
        });

        import('./ArchiveManager.js').then(({ ArchiveManager }) => {
            ArchiveManager.init(this);
        });

        this.detectNetworkConditions();
        this.restoreLocalState();

        this.attachGlobalListeners();
        this.setupFirestoreListeners();

        const badge = document.getElementById('role-badge');
        if (badge) {
            if (this.isInstructor) {
                badge.textContent = 'مدرب / مشرف';
                badge.style.background = '#8b5cf6'; // Violet color for instructor
            } else {
                badge.textContent = 'طالب';
                badge.style.background = 'var(--primary-color)';
            }
        }

        // console.log(`[RoomEngine] Initialized for ${courseId} | Role: ${this.isInstructor ? 'Instructor' : 'Student'}`);
    }

    async checkUserRole() {
        if (this.currentUser && this.currentUser.role) {
            return ['instructor', 'admin', 'supervisor'].includes(this.currentUser.role);
        }
        
        try {
            // Check custom claims from token first (used for legacy course credentials)
            if (this.currentUser.getIdTokenResult) {
                const tokenResult = await this.currentUser.getIdTokenResult();
                if (tokenResult && tokenResult.claims && tokenResult.claims.role) {
                    if (['instructor', 'admin', 'supervisor'].includes(tokenResult.claims.role)) {
                        return true;
                    }
                }
            }

            // Fallback to firestore 'users' collection
            const doc = await window.firebase.firestore().collection('users').doc(this.currentUser.uid).get();
            if (doc.exists) {
                const userData = doc.data();
                this.currentUser = { 
                    uid: this.currentUser.uid, 
                    email: this.currentUser.email, 
                    displayName: this.currentUser.displayName,
                    ...this.currentUser, 
                    ...userData 
                };
                return ['instructor', 'admin', 'supervisor'].includes(userData.role);
            }
        } catch(e) {
            // console.warn("[RoomEngine] Failed to fetch role", e);
        }
        return false;
    }

    // =========================================================================
    // STATE MANAGEMENT PIPELINE
    // =========================================================================

    /**
     * Entry point for all state mutations.
     * @param {Object} partialState - Deep partial object representing changes.
     */
    updateState(partialState) {
        // 1. State Validation
        if (!this.validateState(partialState)) {
            // console.warn("[RoomEngine] Invalid state update rejected.", partialState);
            return;
        }

        // 2. Apply Update (Merge)
        const newState = this.mergeState(this.state, partialState);
        
        // 3. State Diff
        const changes = this.diffState(this.state, newState);
        
        if (Object.keys(changes).length === 0) return; // No changes

        this.prevState = JSON.parse(JSON.stringify(this.state));
        this.state = newState;

        // 4. Queue for Render
        Object.keys(changes).forEach(key => this.renderQueue.add(key));

        this.scheduleRender();
        this.persistLocalState();
    }

    validateState(partialState) {
        if (partialState.room && partialState.room.mode) {
            const validModes = ['video', 'link', 'slides', 'channel', 'audio', 'archive', 'live'];
            if (!validModes.includes(partialState.room.mode)) return false;
        }
        return true;
    }

    mergeState(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.mergeState(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        return result;
    }

    diffState(oldState, newState, path = '') {
        const changes = {};
        for (const key in newState) {
            const newPath = path ? `${path}.${key}` : key;
            if (typeof newState[key] === 'object' && newState[key] !== null && !Array.isArray(newState[key])) {
                const nestedDiff = this.diffState(oldState[key] || {}, newState[key], newPath);
                Object.assign(changes, nestedDiff);
            } else if (oldState[key] !== newState[key]) {
                // Top level category changed
                const rootKey = newPath.split('.')[0];
                changes[rootKey] = true;
            }
        }
        return changes;
    }

    // =========================================================================
    // RENDER PIPELINE
    // =========================================================================

    scheduleRender() {
        if (this.isRendering) return;
        this.isRendering = true;
        
        requestAnimationFrame(() => {
            this.processRenderQueue();
            this.isRendering = false;
        });
    }

    processRenderQueue() {
        if (this.renderQueue.has('room') || this.renderQueue.has('network') || this.renderQueue.has('presentation')) {
            TeachingRenderer.renderMode(this.state.room.mode, this.state.network.lowBandwidth);
            TeachingRenderer.updateLiveBadge(this.state.room.isLive);

            // Sync float bar online count
            const floatCount = document.getElementById('float-online-count');
            const chatCount  = document.getElementById('chat-online-count');
            if (floatCount && chatCount) {
                const num = chatCount.textContent.replace(/[^\d]/g, '');
                floatCount.textContent = num || '0';
            }

            if (this.renderQueue.has('network')) {
                const btnLowBandwidth = document.getElementById('btn-low-bandwidth');
                if (btnLowBandwidth) {
                    if (this.state.network.lowBandwidth) {
                        btnLowBandwidth.classList.add('active');
                    } else {
                        btnLowBandwidth.classList.remove('active');
                    }
                }
            }

            // Student mic button: show only when a voice stream is possible
            if (!this.isInstructor) {
                const studentMicBtn = document.getElementById('btn-student-mic');
                if (studentMicBtn) {
                    const voiceModes = ['live', 'audio', 'slides'];
                    const hasAudio   = voiceModes.includes(this.state.room.mode) &&
                        (this.state.room.mode !== 'slides' || this.state.presentation.audioStream);
                    studentMicBtn.style.display = hasAudio ? 'inline-flex' : 'none';
                }
            }
            
            if (this.state.room.mode === 'video' && this.state.presentation.videoUrl) {
                const playerVideo = document.getElementById('player-video');
                if (playerVideo) {
                    if (playerVideo.getAttribute('src') !== this.state.presentation.videoUrl) {
                        playerVideo.src = this.state.presentation.videoUrl;
                        playerVideo.setAttribute('src', this.state.presentation.videoUrl);
                        playerVideo.load();
                    }
                    if (this.state.presentation.status === 'playing') {
                        playerVideo.play().catch(e => console.log('Playback prevented', e));
                    } else if (this.state.presentation.status === 'paused') {
                        playerVideo.pause();
                    }
                }
            }

            if (this.state.room.mode === 'slides' && this.state.presentation.slides) {
                TeachingRenderer.renderSlidesLayout(this.state.presentation.slides, this.state.presentation.layout);
            }

            // Agora Student Subscriptions (Audio or Video)
            if (this.state.room.mode === 'live' && !this.isInstructor) {
                import('./MediaEngine.js').then(({ MediaEngine }) => {
                    MediaEngine.joinLiveWebRTC(this.courseId);
                });
            } else if (this.state.room.mode === 'slides' && this.state.presentation.audioStream && !this.isInstructor) {
                import('./MediaEngine.js').then(({ MediaEngine }) => {
                    MediaEngine.joinLiveWebRTC(this.courseId); // Subscribes to audio
                });
            } else if (this.prevState) {
                const wasLiveOrAudio = (this.prevState.room.mode === 'live') || 
                                       (this.prevState.room.mode === 'slides' && this.prevState.presentation.audioStream);
                const isLiveOrAudio = (this.state.room.mode === 'live') || 
                                      (this.state.room.mode === 'slides' && this.state.presentation.audioStream);
                                      
                if (wasLiveOrAudio && !isLiveOrAudio && !this.isInstructor) {
                    import('./MediaEngine.js').then(({ MediaEngine }) => {
                        MediaEngine.leaveLiveWebRTC();
                    });
                }
            }
        }

        if (this.renderQueue.has('layout')) {
            WorkspaceUI.updateLayout(this.state.layout);
        }

        this.renderQueue.clear();
    }

    // =========================================================================
    // PERSISTENCE & RECOVERY
    // =========================================================================

    persistLocalState() {
        const localData = {
            lowBandwidth: this.state.network.lowBandwidth,
            layout: this.state.layout,
            timestamp: Date.now()
        };
        localStorage.setItem(`room_state_${this.courseId}`, JSON.stringify(localData));
    }

    restoreLocalState() {
        try {
            const saved = localStorage.getItem(`room_state_${this.courseId}`);
            if (saved) {
                const data = JSON.parse(saved);
                if (Date.now() - data.timestamp < 86400000) { // 24 hours
                    this.updateState({
                        network: { lowBandwidth: data.lowBandwidth || false },
                        layout: data.layout || this.state.layout
                    });
                }
            }
        } catch (e) {
            console.error("[RoomEngine] Failed to restore local state", e);
        }
    }

    /**
     * Auto-enables data-saving mode on first visit when the browser reports a
     * slow connection (2G/3G) or the user has "Data Saver" turned on.
     * Only applies on the very first visit to this room; afterwards the
     * user's own choice (restored above) always takes priority.
     */
    detectNetworkConditions() {
        try {
            const alreadyVisited = !!localStorage.getItem(`room_state_${this.courseId}`);
            if (alreadyVisited) return;

            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (!connection) return;

            const isSlow = connection.saveData === true ||
                ['slow-2g', '2g', '3g'].includes(connection.effectiveType);

            if (isSlow) {
                this.updateState({ network: { lowBandwidth: true } });
                NotificationManager.show('تم تفعيل وضع توفير البيانات تلقائياً بسبب ضعف الاتصال. يمكنك إيقافه من الأعلى.', 'info', 5000);
            }
        } catch (e) {
            // Network Information API not supported; ignore silently.
        }
    }

    // =========================================================================
    // LISTENERS & ACTIONS
    // =========================================================================

    attachGlobalListeners() {
        window.addEventListener('online', () => {
            this.updateState({ network: { isOffline: false } });
            NotificationManager.show('تم استعادة الاتصال بالإنترنت', 'success');
        });
        window.addEventListener('offline', () => {
            this.updateState({ network: { isOffline: true } });
            NotificationManager.show('انقطع الاتصال بالإنترنت', 'error', 0);
        });

        import('./EventBus.js').then(({ EventBus, Events }) => {
            EventBus.subscribe(Events.PLAY_LECTURE, (lesson) => {
                if (!lesson) return;
                let mode = 'video';
                if (lesson.type && lesson.type !== 'video' && lesson.type !== 'audio') mode = 'link';
                
                // Update Overview metadata
                const titleEl = document.getElementById('info-title');
                const descEl = document.getElementById('info-desc');
                if (titleEl) titleEl.textContent = lesson.title || 'درس بدون عنوان';
                if (descEl) descEl.textContent = lesson.description || 'لا يوجد وصف متاح لهذا الدرس.';
                
                this.updateState({
                    room: { mode: mode },
                    presentation: { videoUrl: lesson.contentUrl || lesson.url, activeLessonId: lesson.id }
                });

                // If instructor: broadcast lessonId to active_sessions so students auto-sync their curriculum
                if (this.isInstructor && lesson.id) {
                    window.firebase.firestore()
                        .collection('active_sessions').doc(this.courseId)
                        .set({ lessonId: lesson.id }, { merge: true })
                        .catch(e => console.warn('[RoomEngine] Failed to sync lessonId', e));
                }

                const playerVideo = document.getElementById('player-video');
                if (playerVideo && (lesson.contentUrl || lesson.url)) {
                    playerVideo.src = lesson.contentUrl || lesson.url;
                    playerVideo.load();

                    // Bug 5 Fix: Restore saved timestamp on autoResume
                    if (lesson.autoResume && lesson.id) {
                        import('./CurriculumProgress.js').then(({ CurriculumProgress }) => {
                            const savedTime = CurriculumProgress.getVideoTimestamp(lesson.id);
                            if (savedTime > 0) {
                                playerVideo.currentTime = savedTime;
                            }
                            playerVideo.play().catch(e => console.log('Autoplay prevented', e));
                        });
                    } else {
                        playerVideo.play().catch(e => console.log('Autoplay prevented', e));
                    }
                    
                    // Track video progress and completion
                    playerVideo.onended = () => {
                        import('./CurriculumProgress.js').then(({ CurriculumProgress }) => {
                            if (this.state.presentation.activeLessonId) {
                                CurriculumProgress.markLessonComplete(this.state.presentation.activeLessonId);
                            }
                        });
                    };
                    
                    // Update timestamp periodically (e.g. every 5 seconds)
                    playerVideo.ontimeupdate = () => {
                        if (playerVideo.currentTime > 0 && Math.floor(playerVideo.currentTime) % 5 === 0) {
                            import('./CurriculumProgress.js').then(({ CurriculumProgress }) => {
                                if (this.state.presentation.activeLessonId) {
                                    CurriculumProgress.updateVideoTimestamp(this.state.presentation.activeLessonId, playerVideo.currentTime);
                                }
                            });
                        }
                    };
                }
            });
        });

        // Low bandwidth toggle handler
        const btnLowBandwidth = document.getElementById('btn-low-bandwidth');
        if (btnLowBandwidth) {
            btnLowBandwidth.addEventListener('click', () => {
                this.updateState({
                    network: { lowBandwidth: !this.state.network.lowBandwidth }
                });
                
                if (this.state.network.lowBandwidth) {
                    btnLowBandwidth.classList.add('active');
                    NotificationManager.show('تم تفعيل وضع توفير البيانات', 'success');
                } else {
                    btnLowBandwidth.classList.remove('active');
                    NotificationManager.show('تم إيقاف وضع توفير البيانات', 'info');
                }
            });
        }

        // Student mic request button
        const studentMicBtn = document.getElementById('btn-student-mic');
        if (studentMicBtn && !this.isInstructor) {
            studentMicBtn.addEventListener('click', async () => {
                const isRequesting = studentMicBtn.classList.contains('requesting');

                if (isRequesting) {
                    // Cancel the request
                    studentMicBtn.classList.remove('requesting');
                    studentMicBtn.title = 'طلب الكلام';
                    studentMicBtn.querySelector('i').className = 'fas fa-hand-paper';
                    // Remove from Firestore
                    try {
                        const db = window.firebase.firestore();
                        await db.collection('active_sessions').doc(this.courseId)
                            .collection('handRaises').doc(this.currentUser.uid).delete();
                    } catch(e) { console.warn('handRaise cancel error', e); }
                } else {
                    // Send request
                    studentMicBtn.classList.add('requesting');
                    studentMicBtn.title = 'إلغاء طلب الكلام';
                    studentMicBtn.querySelector('i').className = 'fas fa-hand-paper';
                    NotificationManager.show('تم إرسال طلب الكلام. انتظر موافقة المدرب.', 'info');
                    try {
                        const db = window.firebase.firestore();
                        await db.collection('active_sessions').doc(this.courseId)
                            .collection('handRaises').doc(this.currentUser.uid).set({
                                name: this.currentUser.displayName || this.currentUser.email || 'طالب',
                                uid: this.currentUser.uid,
                                timestamp: window.firebase.firestore.FieldValue.serverTimestamp()
                            });
                    } catch(e) {
                        console.warn('handRaise write error', e);
                        studentMicBtn.classList.remove('requesting');
                    }

                    // Listen for instructor approval
                    const db = window.firebase.firestore();
                    const unsubPermission = db.collection('active_sessions').doc(this.courseId)
                        .onSnapshot(doc => {
                            if (!doc.exists) return;
                            const perms = doc.data().micPermissions || {};
                            if (perms[this.currentUser.uid]) {
                                unsubPermission();
                                studentMicBtn.classList.remove('requesting');
                                studentMicBtn.style.display = 'none';
                                NotificationManager.show('وافق المدرب! يمكنك الآن التحدث.', 'success', 6000);
                                // Join Agora as publisher
                                import('./MediaEngine.js').then(({ MediaEngine }) => {
                                    MediaEngine.joinLiveWebRTC(this.courseId, true); // true = publish audio
                                });
                            }
                        });
                }
            });
        }
    }

    setupFirestoreListeners() {
        const db = window.firebase.firestore();
        
        // 1. Room Session Sync
        this.listeners.room = db.collection('active_sessions').doc(this.courseId)
            .onSnapshot(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    this.updateState({
                        room: {
                            mode: data.mode || 'video',
                            isLive: (data.metadata && data.metadata.isLive) || data.isLive || false
                        },
                        presentation: {
                            videoUrl: (data.metadata && data.metadata.videoUrl) || data.videoUrl,
                            status: (data.metadata && data.metadata.status) || 'playing',
                            currentSlideUrl: (data.metadata && data.metadata.currentSlideUrl) || data.currentSlideUrl,
                            slides: (data.metadata && data.metadata.slides) || [],
                            layout: (data.metadata && data.metadata.layout) || 'slides-layout-1',
                            audioStream: (data.metadata && data.metadata.audioStream) || false,
                            lastChannelMessage: (data.metadata && data.metadata.lastMessage) ? data.metadata.lastMessage : null
                        },
                        permissions: {
                            chatLocked: data.permissions ? data.permissions.chatLocked : false,
                            resourcesLocked: data.permissions ? data.permissions.resourcesLocked : false
                        }
                    });

                    // Force student Curriculum to match instructor's active lesson
                    if (!this.isInstructor && data.lessonId) {
                        import('./CurriculumController.js').then(({ CurriculumController }) => {
                            if (data.lessonId !== CurriculumController.cache?.currentLessonId) {
                                CurriculumController.selectLesson(data.lessonId);
                            }
                        });
                    }
                }
            }, err => {
                console.error("[RoomEngine] Room Sync Error:", err);
                if(err.code !== 'permission-denied') {
                    NotificationManager.show('خطأ في مزامنة الغرفة', 'error');
                }
            });
            
        // 2. Channel Messages Sync
        this.listeners.channel = db.collection('courses').doc(this.courseId).collection('channelMessages')
            .orderBy('timestamp', 'asc')
            .onSnapshot(snapshot => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        const data = change.doc.data();
                        TeachingRenderer.renderChannelMessage(data);
                        
                        this.updateState({
                            presentation: {
                                lastChannelMessage: data
                            }
                        });
                    }
                });
            }, err => {
                console.error("[RoomEngine] Channel Sync Error:", err);
            });
            
        // Additional listeners (chat, resources, presence) will be initialized here by their managers

        // 3. Real-time Online Users Count
        this.listeners.presence = db.collection('courses').doc(this.courseId)
            .collection('connected_users')
            .onSnapshot(snapshot => {
                // Filter to users with a recent heartbeat (last 90 seconds)
                const now = Date.now();
                let activeCount = 0;
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.lastSeen) {
                        const lastSeenMs = data.lastSeen.toMillis ? data.lastSeen.toMillis() : now;
                        if ((now - lastSeenMs) < 90000) activeCount++;
                    } else {
                        activeCount++; // count if no timestamp yet
                    }
                });

                // Update the chat header count
                const countEl = document.getElementById('chat-online-count');
                if (countEl) {
                    countEl.innerHTML = `<i class="fas fa-users"></i> ${activeCount}`;
                }

                // Update the sidebar stats count if exists
                const sidebarCount = document.getElementById('online-students-count');
                if (sidebarCount) sidebarCount.textContent = activeCount;

                // Update header "متصل الآن" count
                const headerCount = document.querySelector('.active-students-count');
                if (headerCount) headerCount.textContent = activeCount;

            }, err => {
                console.warn('[RoomEngine] Presence listener error:', err);
            });
    }


    destroy() {
        // Clean up all Firestore listeners
        for (const key in this.listeners) {
            if (typeof this.listeners[key] === 'function') {
                this.listeners[key]();
            }
        }
        this.listeners = {};

        // Stop rendering loop
        this.isRendering = false;
        
        // Let child managers know
        import('./PresenceManager.js').then(({ PresenceManager }) => {
            PresenceManager.leave();
        });
        
        import('./ChatService.js').then(({ ChatService }) => {
            ChatService.unsubscribeAll();
        });
    }
}

// Export singleton instance
export const RoomEngine = new RoomEngineClass();

// Bind to window for global inline handlers if strictly necessary (legacy support)
window.RoomEngine = RoomEngine;
