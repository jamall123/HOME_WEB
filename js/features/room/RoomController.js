/**
 * @file RoomController.js
 * @purpose Main orchestrator for Room features, replacing the monolithic RoomEngine.
 */
import { AuthController as AuthService } from '../auth/AuthController.js';
import { stateStore } from '../../core/StateStore.js';
import { ThemeManager } from '../../features/global/ThemeManager.js';
import { NotificationManager } from '../../features/global/NotificationManager.js';
import { TeachingRenderer } from '../../features/room/TeachingRenderer.js';
import { WorkspaceUI } from '../../features/global/WorkspaceUI.js';
import { ChatUI } from '../chat/ChatUI.js';
import { CurriculumUI } from '../curriculum/index.js';
import { PermissionManager } from '../../core/PermissionManager.js';
import { UserRepository } from '../../repositories/UserRepository.js';
import { CourseRepository } from '../../repositories/CourseRepository.js';
import { ChatRepository } from '../../repositories/ChatRepository.js';
import { PresenceController } from '../presence/PresenceController.js';

import { ChatController } from '../chat/ChatController.js';
import { MediaManager } from '../../features/media/MediaManager.js';
import { CurriculumController } from '../curriculum/index.js';
import { ResourceManager } from '../../features/resource/ResourceManager.js';
import { ArchiveManager } from '../../features/archive/ArchiveManager.js';
import { OfflineSyncEngine } from '../../features/offline/OfflineSyncEngine.js';
import { ProgressManager } from '../../features/progress/ProgressManager.js';
import { InstructorController } from '../instructor/index.js';

import { RoomState } from './RoomState.js';
import { RoomRenderer } from './RoomRenderer.js';
import { RoomEvents } from './RoomEvents.js';
import { RoomSync } from './RoomSync.js';

class RoomControllerClass {
    constructor() {
        this.courseId = null;
        this.currentUser = null;
        this.isInstructor = false;

        this.roomState = new RoomState();
        this.roomRenderer = new RoomRenderer(this.roomState);
        this.roomEvents = new RoomEvents(this.roomState);
        this.roomSync = new RoomSync(this.roomState);
    }

    // Facade accessors for legacy support
    get state() { return this.roomState.state; }
    get prevState() { return this.roomState.prevState; }

    updateState(partialState) {
        this.roomState.updateState(partialState);
    }

    async init(courseId) {
        if (!courseId) {
            console.error("[RoomController] Fatal: No courseId provided.");
            return;
        }

        this.courseId = courseId;
        
        NotificationManager.requestBrowserPermission().catch(() => {});

        this.currentUser = AuthService.getCurrentUser();
        
        const stateUser = stateStore.getState('userData');
        if (stateUser) {
            this.currentUser = {
                uid: this.currentUser.uid,
                email: this.currentUser.email,
                role: this.currentUser.role,
                getIdTokenResult: this.currentUser.getIdTokenResult ? this.currentUser.getIdTokenResult.bind(this.currentUser) : undefined,
                ...this.currentUser,
                displayName: stateUser.fullName || stateUser.fullname || stateUser.name || this.currentUser.displayName,
                name: stateUser.fullName || stateUser.fullname || stateUser.name || this.currentUser.displayName,
                username: stateUser.username || this.currentUser.displayName
            };
        } else if (this.currentUser) {
            try {
                const userDoc = await UserRepository.getUser(this.currentUser.uid);
                if (userDoc && userDoc.name) {
                    this.currentUser = {
                        uid: this.currentUser.uid,
                        email: this.currentUser.email,
                        role: this.currentUser.role || userDoc.role,
                        getIdTokenResult: this.currentUser.getIdTokenResult ? this.currentUser.getIdTokenResult.bind(this.currentUser) : undefined,
                        ...this.currentUser,
                        displayName: userDoc.fullName || userDoc.fullname || userDoc.name,
                        name: userDoc.fullName || userDoc.fullname || userDoc.name,
                        username: userDoc.username || userDoc.name
                    };
                }
            } catch (e) {
                console.warn('[RoomController] Could not fetch user doc for name override', e);
            }
        }

        if (!this.currentUser) {
            console.error("[RoomController] Fatal: Unauthenticated user.");
            return;
        }

        this.isInstructor = await this.checkUserRole();
        
        this.roomState.restoreLocalState(this.courseId);
        
        this.roomRenderer.init(this.courseId, this.isInstructor, this.currentUser);
        this.roomEvents.init(this.courseId, this.currentUser, this.isInstructor);
        this.roomSync.init(this.courseId, this.isInstructor, this.currentUser);

        ThemeManager.init();
        NotificationManager.init();
        TeachingRenderer.init();
        WorkspaceUI.init(this);
        ChatUI.init(this);
        
        try {
            await Promise.all([
                PresenceController.startPresenceSession(this.courseId, this.currentUser, this.state),
                ChatController.init(this),
                MediaManager.init(this)
            ]);

            if (this.isInstructor) {
                InstructorController.init(this);
                InstructorController.listenForHandRaises();
            }

            OfflineSyncEngine.init();
            ProgressManager.init(this);

        } catch (error) {
            console.error("Feature initialization failed", error);
        }

        CurriculumController.isInstructor = this.isInstructor;
        CurriculumController.init(this.courseId);
        
        CurriculumUI.init(this.isInstructor);

        ResourceManager.init(this);
        ArchiveManager.init(this);

        this.detectNetworkConditions();

        const badge = document.getElementById('role-badge');
        if (badge) {
            if (this.isInstructor) {
                badge.textContent = 'مدرب / مشرف';
                badge.style.background = '#8b5cf6';
            } else {
                badge.textContent = 'طالب';
                badge.style.background = 'var(--primary-color)';
            }
        }
        // Load instructor info for the course details panel
        this.loadInstructorInfo();
    }

    async loadInstructorInfo() {
        try {
            const courseData = await CourseRepository.getCourse(this.courseId);
            if (!courseData) return;

            const nameEl = document.getElementById('info-instructor-name');
            const imgEl = document.getElementById('info-instructor-photo');
            const specialtyEl = document.getElementById('info-instructor-specialty');

            let instructor = null;
            // 1. Check if course has instructor embedded object or string
            let instObj = courseData.instructor;
            let name = (typeof instObj === 'object' && instObj !== null) ? (instObj.name || 'مقدم الدورة') : (instObj || courseData.instructorName || 'المدرب');
            let photo = (typeof instObj === 'object' && instObj !== null && instObj.photo) ? instObj.photo : courseData.instructorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1E293B&color=A5B4FC`;
            if (photo && typeof photo === 'string' && photo.includes('instructor.png')) photo = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1E293B&color=A5B4FC`;
            let specialty = (typeof instObj === 'object' && instObj !== null && instObj.specialty) ? instObj.specialty : courseData.instructorSpecialty || 'غير محدد';
            
            // 2. If it has instructorId, fetch from users collection to override
            const instructorId = courseData.instructorId || courseData.createdBy || courseData.uid;
            if (instructorId) {
                instructor = await UserRepository.getUser(instructorId).catch(e => null);
                if (instructor) {
                    if (instructor.name) name = instructor.name;
                    if (instructor.photo || instructor.photoURL || instructor.avatar) photo = instructor.photo || instructor.photoURL || instructor.avatar;
                    if (instructor.specialty || instructor.title) specialty = instructor.specialty || instructor.title;
                }
            }

            if (nameEl) nameEl.textContent = name;
            if (imgEl) {
                imgEl.src = photo;
                imgEl.onerror = () => { imgEl.src = 'assets/images/default-avatar.png'; };
            }
            if (specialtyEl) specialtyEl.textContent = specialty;
        } catch (e) {
            console.warn('[RoomController] Could not load instructor info:', e);
        }
    }

    async checkUserRole() {
        if (this.currentUser && this.currentUser.role) {
            return PermissionManager.isTeachingStaff(this.currentUser);
        }
        
        try {
            if (this.currentUser.getIdTokenResult) {
                const tokenResult = await this.currentUser.getIdTokenResult();
                if (tokenResult && tokenResult.claims && tokenResult.claims.role) {
                    if (PermissionManager.isTeachingStaff({ role: tokenResult.claims.role })) {
                        return true;
                    }
                }
            }

            const userData = await UserRepository.getUser(this.currentUser.uid);
            if (userData) {
                const realName = userData.fullName || userData.fullname || userData.name || userData.studentName || userData.displayName || this.currentUser.displayName;
                this.currentUser = { 
                    uid: this.currentUser.uid, 
                    email: this.currentUser.email, 
                    ...this.currentUser, 
                    ...userData,
                    displayName: realName,
                    name: realName
                };

                if (userData.legacyCredentialId) {
                    try {
                        const { CoursesCredentialsRepository } = await import('../../repositories/CoursesCredentialsRepository.js');
                        const credData = await CoursesCredentialsRepository.getCredential(userData.legacyCredentialId);
                        if (credData) {
                            const realName = credData.fullName || credData.studentName || credData.fullname || (credData.student && (credData.student.fullName || credData.student.name)) || credData.name;
                            if (realName) {
                                this.currentUser.displayName = realName;
                                this.currentUser.name = realName;
                            }
                        }
                    } catch (err) {}
                }
                return PermissionManager.isTeachingStaff(userData);
            }
        } catch(e) {}
        return false;
    }

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
        } catch (e) {}
    }

    async toggleReaction(msgId, reactionType) {
        try {
            if (!this.courseId) return;
            await ChatRepository.toggleCourseChannelReaction(this.courseId, msgId, reactionType);
        } catch (e) {
            console.error('Reaction toggle failed', e);
        }
    }

    destroy() {
        this.roomSync.destroy();
        if (this.isInstructor) {
            import('../instructor/index.js').then(({ InstructorController }) => {
                if (typeof InstructorController.destroy === 'function') {
                    InstructorController.destroy();
                }
            });
        }
    }

    async destroyRoomSession() {
        import('../../core/EventBus.js').then(({ eventBus, Events }) => {
            eventBus.emit(Events.DESTROY_ROOM_SESSION);
        });

        // Safe teardown of controllers (if they implement destroy)
        if (ChatController && typeof ChatController.destroy === 'function') await ChatController.destroy();
        if (ResourceManager && typeof ResourceManager.destroy === 'function') await ResourceManager.destroy();
        if (this.roomSync && typeof this.roomSync.destroy === 'function') this.roomSync.destroy();
        if (PresenceController && typeof PresenceController.destroy === 'function') await PresenceController.destroy();
        if (MediaManager && typeof MediaManager.destroy === 'function') await MediaManager.destroy();
        
        // Media Engine teardown
        const { MediaEngine } = await import('../../features/media/MediaEngine.js');
        if (MediaEngine) {
            if (typeof MediaEngine.stopLiveWebRTC === 'function') await MediaEngine.stopLiveWebRTC(this.courseId);
            if (typeof MediaEngine.leaveLiveWebRTC === 'function') await MediaEngine.leaveLiveWebRTC();
        }

        if (OfflineSyncEngine && typeof OfflineSyncEngine.pause === 'function') await OfflineSyncEngine.pause();
        if (ArchiveManager && typeof ArchiveManager.destroy === 'function') await ArchiveManager.destroy();
        if (ProgressManager && typeof ProgressManager.destroy === 'function') await ProgressManager.destroy();

        // Clear hanging UI/Cache
        this.roomState.currentLesson = null;
        this.roomState.currentSession = null;
        
        // Clear UI DOM elements (like chat, resources)
        import('../../features/room/TeachingRenderer.js').then(({ TeachingRenderer }) => {
            TeachingRenderer.clearChannelMessages();
        });
        
        const resourceList = document.getElementById('resources-list');
        if (resourceList) resourceList.innerHTML = '';
        
        const liveContainer = document.getElementById('agora-live-container');
        if (liveContainer) liveContainer.innerHTML = '';
    }
}

export const RoomEngine = new RoomControllerClass();
window.RoomEngine = RoomEngine;
