/**
 * @file RoomSync.js
 * @purpose Firestore real-time sync for RoomEngine.
 */
import { RoomRepository } from '../../repositories/RoomRepository.js';
import { ChatRepository } from '../../repositories/ChatRepository.js';
import { PresenceRepository } from '../../repositories/PresenceRepository.js';
import { TeachingRenderer } from '../../features/room/TeachingRenderer.js';
import { NotificationManager } from '../../features/global/NotificationManager.js';

export class RoomSync {
    constructor(roomState) {
        this.roomState = roomState;
        this.isInstructor = false;
        this.courseId = null;
        this.listeners = {};
        this._wasLive = false;
    }

    init(courseId, isInstructor) {
        this.courseId = courseId;
        this.isInstructor = isInstructor;
        this.setupFirestoreListeners();
    }

    setupFirestoreListeners() {
        // 1. Room Session Sync
        this.listeners.room = RoomRepository.onRoomSessionSnapshot(this.courseId, data => {
            if (data) {
                this.roomState.updateState({
                    room: {
                        mode: data.mode || 'video',
                        isLive: (data.metadata && data.metadata.isLive) || data.isLive || false
                    },
                    presentation: {
                        videoUrl: (data.metadata && data.metadata.videoUrl) || data.videoUrl,
                        status: (data.metadata && data.metadata.status) || 'playing',
                        timestamp: (data.metadata && data.metadata.timestamp) || 0,
                        updatedAt: data.updatedAt || null,
                        currentSlideUrl: (data.metadata && data.metadata.currentSlideUrl) || data.currentSlideUrl,
                        slides: (data.metadata && data.metadata.slides) || [],
                        layout: (data.metadata && data.metadata.layout) || 'slides-layout-1',
                        audioStream: (data.metadata && data.metadata.audioStream) || false,
                        lastChannelMessage: (data.metadata && data.metadata.lastMessage) ? data.metadata.lastMessage : null
                    },
                    permissions: {
                        chatLocked: data.permissions ? data.permissions.chatLocked : false,
                        resourcesLocked: data.permissions ? data.permissions.resourcesLocked : false,
                        micPermissions: data.micPermissions || {}
                    }
                });

                // Trigger notification if live stream just started
                if (this.roomState.state.room.isLive && !this._wasLive && !this.isInstructor) {
                    NotificationManager.showBrowserNotification('بدأ البث المباشر', { body: 'المدرب متصل الآن، انضم للمشاهدة!' });
                }
                this._wasLive = this.roomState.state.room.isLive;

                // Force student Curriculum to match instructor's active lesson
                if (!this.isInstructor && data.lessonId) {
                    import('../curriculum/index.js').then(({ CurriculumController }) => {
                        if (data.lessonId !== CurriculumController.cache?.currentLessonId) {
                            CurriculumController.selectLesson(data.lessonId);
                        }
                    });
                }
            }
        });
            
        // 2. Channel Messages Sync
        this.listeners.channel = ChatRepository.onCourseChannelMessagesSnapshot(this.courseId, docChanges => {
            docChanges.forEach(change => {
                if (change.type === 'added' || change.type === 'modified') {
                    const data = change.doc.data();
                    TeachingRenderer.renderChannelMessage(data, change.doc.id);
                    
                    // Send notification for new messages if the tab is not in focus
                    if (change.type === 'added' && Date.now() - data.timestamp < 10000 && !document.hasFocus() && !this.isInstructor) {
                        let notifBody = 'مرفق جديد';
                        if (data.type === 'text') notifBody = data.content;
                        NotificationManager.showBrowserNotification('رسالة جديدة في القناة', { body: notifBody });
                    }

                    this.roomState.updateState({
                        presentation: {
                            lastChannelMessage: data
                        }
                    });
                }
            });
        });

        // 3. Real-time Online Users Count
        this.listeners.presence = PresenceRepository.onPresenceSnapshot(this.courseId, users => {
            // Filter to users with a recent heartbeat (last 90 seconds)
            const now = Date.now();
            let activeCount = 0;
            users.forEach(data => {
                if (data.lastSeen) {
                    const lastSeenMs = data.lastSeen.toMillis ? data.lastSeen.toMillis() : (typeof data.lastSeen === 'number' ? data.lastSeen : now);
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
        });
    }

    destroy() {
        for (const key in this.listeners) {
            if (typeof this.listeners[key] === 'function') {
                this.listeners[key]();
            }
        }
        this.listeners = {};
    }
}
