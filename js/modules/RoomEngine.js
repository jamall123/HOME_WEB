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
            return this.currentUser.role === 'instructor' || this.currentUser.role === 'admin';
        }
        try {
            const doc = await window.firebase.firestore().collection('users').doc(this.currentUser.uid).get();
            if (doc.exists) {
                return doc.data().role === 'instructor' || doc.data().role === 'admin';
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
            const validModes = ['video', 'link', 'slides', 'channel', 'audio', 'archive'];
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
            
            if (this.state.room.mode === 'video' && this.state.presentation.videoUrl) {
                const playerVideo = document.getElementById('player-video');
                if (playerVideo) {
                    if (playerVideo.src !== this.state.presentation.videoUrl) {
                        playerVideo.src = this.state.presentation.videoUrl;
                        playerVideo.load();
                    }
                    if (this.state.presentation.status === 'playing') {
                        playerVideo.play().catch(e => console.log('Playback prevented', e));
                    } else if (this.state.presentation.status === 'paused') {
                        playerVideo.pause();
                    }
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

                const playerVideo = document.getElementById('player-video');
                if (playerVideo && (lesson.contentUrl || lesson.url)) {
                    playerVideo.src = lesson.contentUrl || lesson.url;
                    playerVideo.load();
                    playerVideo.play().catch(e => console.log('Autoplay prevented', e));
                    
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
                    btnLowBandwidth.style.background = 'var(--primary-color)';
                    NotificationManager.show('تم تفعيل وضع توفير البيانات', 'success');
                } else {
                    btnLowBandwidth.style.background = 'rgba(0,0,0,0.4)';
                    NotificationManager.show('تم إيقاف وضع توفير البيانات', 'info');
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
                            channelTimestamp: data.channelUpdate ? data.channelUpdate.timestamp : 0
                        },
                        permissions: {
                            chatLocked: data.permissions ? data.permissions.chatLocked : false,
                            resourcesLocked: data.permissions ? data.permissions.resourcesLocked : false
                        }
                    });

                    // Force student Curriculum to match instructor's active lesson
                    if (!this.isInstructor && data.videoUrl) {
                        import('./CurriculumController.js').then(({ CurriculumController }) => {
                            // Find the lesson ID corresponding to the videoUrl or pass it directly if we start storing lessonId in active_sessions
                            // Assuming we sync lessonId in future: CurriculumController.selectLesson(data.lessonId);
                        });
                    }
                }
            }, err => {
                console.error("[RoomEngine] Room Sync Error:", err);
                if(err.code !== 'permission-denied') {
                    NotificationManager.show('خطأ في مزامنة الغرفة', 'error');
                }
            });
            
        // Additional listeners (chat, resources, presence) will be initialized here by their managers
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
