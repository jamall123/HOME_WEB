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
import { ChatRepository } from '../../repositories/ChatRepository.js';
import { PresenceController } from '../presence/PresenceController.js';

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
                ...this.currentUser,
                displayName: stateUser.name,
                name: stateUser.name,
                username: stateUser.username
            };
        }

        if (!this.currentUser) {
            console.error("[RoomController] Fatal: Unauthenticated user.");
            return;
        }

        this.isInstructor = await this.checkUserRole();
        
        this.roomState.restoreLocalState(this.courseId);
        
        this.roomRenderer.init(this.courseId, this.isInstructor);
        this.roomEvents.init(this.courseId, this.currentUser, this.isInstructor);
        this.roomSync.init(this.courseId, this.isInstructor);

        ThemeManager.init();
        NotificationManager.init();
        TeachingRenderer.init();
        WorkspaceUI.init(this);
        ChatUI.init(this);
        
        try {
            await Promise.all([
                PresenceController.startPresenceSession(this.courseId, this.currentUser, this.state),
                import('../chat/ChatController.js').then(({ ChatController }) => ChatController.init(this)),
                import('../../features/media/MediaManager.js').then(({ MediaManager }) => MediaManager.init(this))
            ]);

            if (this.isInstructor) {
                import('../instructor/index.js').then(({ InstructorController }) => {
                    InstructorController.init(this);
                    InstructorController.listenForHandRaises();
                });
            }

            import('../../features/offline/OfflineSyncEngine.js').then(({ OfflineSyncEngine }) => OfflineSyncEngine.init());
            import('../../features/progress/ProgressManager.js').then(({ ProgressManager }) => ProgressManager.init(this));

        } catch (error) {
            console.error("Feature initialization failed", error);
        }

        import('../curriculum/index.js').then(({ CurriculumController }) => {
            CurriculumController.isInstructor = this.isInstructor;
            CurriculumController.init(this.courseId);
        });
        CurriculumUI.init(this.isInstructor);

        import('../../features/resource/ResourceManager.js').then(({ ResourceManager }) => {
            ResourceManager.init(this);
        });

        import('../../features/archive/ArchiveManager.js').then(({ ArchiveManager }) => {
            ArchiveManager.init(this);
        });

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
            const { FirebaseManager } = await import('../../core/FirebaseManager.js');
            const db = FirebaseManager.getFirestore();
            const courseDoc = await db.collection('courses').doc(this.courseId).get();
            if (!courseDoc.exists) return;
            const courseData = courseDoc.data();
            const instructorId = courseData.instructorId || courseData.createdBy || courseData.uid;
            if (!instructorId) return;

            const instructor = await UserRepository.getUser(instructorId);
            if (!instructor) return;

            const nameEl = document.getElementById('info-instructor-name');
            const photoEl = document.getElementById('info-instructor-photo');
            const specialtyEl = document.getElementById('info-instructor-specialty');

            if (nameEl) nameEl.textContent = instructor.displayName || instructor.name || instructor.fullName || 'المدرب';
            if (photoEl && (instructor.photoURL || instructor.avatar)) {
                photoEl.src = instructor.photoURL || instructor.avatar;
                photoEl.onerror = () => { photoEl.src = 'assets/images/avatar.png'; };
            }
            if (specialtyEl) specialtyEl.textContent = instructor.specialty || instructor.title || instructor.bio?.slice(0, 60) || '';
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
                this.currentUser = { 
                    uid: this.currentUser.uid, 
                    email: this.currentUser.email, 
                    ...this.currentUser, 
                    ...userData,
                    displayName: this.currentUser.displayName || userData.displayName
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
}

export const RoomEngine = new RoomControllerClass();
window.RoomEngine = RoomEngine;
