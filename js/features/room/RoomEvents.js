/**
 * @file RoomEvents.js
 * @purpose DOM Event bindings for the Room Engine.
 */
import { NotificationManager } from '../../features/global/NotificationManager.js';
import { RoomRepository } from '../../repositories/RoomRepository.js';

import { EventBus, Events } from '../../core/EventBus.js';
import { CurriculumProgress } from '../curriculum/index.js';

export class RoomEvents {
    constructor(roomState) {
        this.roomState = roomState;
        this.isInstructor = false;
        this.courseId = null;
        this.currentUser = null;
    }

    init(courseId, currentUser, isInstructor) {
        this.courseId = courseId;
        this.currentUser = currentUser;
        this.isInstructor = isInstructor;
        this.attachGlobalListeners();
    }

    attachGlobalListeners() {
        window.addEventListener('online', () => {
            this.roomState.updateState({ network: { isOffline: false } });
            NotificationManager.show('تم استعادة الاتصال بالإنترنت', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.roomState.updateState({ network: { isOffline: true } });
            NotificationManager.show('انقطع الاتصال بالإنترنت', 'error', 0);
        });

        EventBus.subscribe(Events.PLAY_LECTURE, (lesson) => {
            if (!lesson) return;
            let mode = 'video';
            if (lesson.type && lesson.type !== 'video' && lesson.type !== 'audio') mode = 'link';
            
            // Update Overview metadata
            const titleEl = document.getElementById('info-title');
            const descEl = document.getElementById('info-desc');
            if (titleEl) titleEl.textContent = lesson.title || 'درس بدون عنوان';
            if (descEl) descEl.textContent = lesson.description || 'لا يوجد وصف متاح لهذا الدرس.';
            
            this.roomState.updateState({
                room: { mode: mode },
                presentation: { videoUrl: lesson.contentUrl || lesson.url, activeLessonId: lesson.id }
            });

            // If instructor: broadcast lessonId to active_sessions so students auto-sync their curriculum
            if (this.isInstructor && lesson.id) {
                RoomRepository.setSessionState(this.courseId, { lessonId: lesson.id })
                    .catch(e => console.warn('[RoomEngine] Failed to sync lessonId', e));
            }

            const playerVideo = document.getElementById('player-video');
            if (playerVideo && (lesson.contentUrl || lesson.url)) {
                playerVideo.src = lesson.contentUrl || lesson.url;
                playerVideo.load();

                if (lesson.autoResume && lesson.id) {
                    const savedTime = CurriculumProgress.getVideoTimestamp(lesson.id);
                    if (savedTime > 0) {
                        playerVideo.currentTime = savedTime;
                    }
                    playerVideo.play().catch(e => console.log('Autoplay prevented', e));
                } else {
                    playerVideo.play().catch(e => console.log('Autoplay prevented', e));
                }
                
                playerVideo.onended = () => {
                    if (this.roomState.state.presentation.activeLessonId) {
                        CurriculumProgress.markLessonComplete(this.roomState.state.presentation.activeLessonId);
                    }
                };
                
                playerVideo.ontimeupdate = () => {
                    if (playerVideo.currentTime > 0 && Math.floor(playerVideo.currentTime) % 5 === 0) {
                        if (this.roomState.state.presentation.activeLessonId) {
                            CurriculumProgress.updateVideoTimestamp(this.roomState.state.presentation.activeLessonId, playerVideo.currentTime);
                        }
                    }
                };
            }
        });

        EventBus.subscribe(Events.MULTIPLE_DEVICES_DETECTED, (payload) => {
            if (window.Swal) {
                window.Swal.fire({
                    title: 'تنبيه الأمان',
                    text: payload.message || 'تم تسجيل الدخول من جهاز آخر. سيتم إنهاء الجلسة الحالية.',
                    icon: 'warning',
                    confirmButtonText: 'حسناً',
                    allowOutsideClick: false,
                    allowEscapeKey: false
                }).then(() => {
                    window.location.href = 'courses.html';
                });
            } else {
                alert(payload.message || 'تم تسجيل الدخول من جهاز آخر. سيتم إنهاء الجلسة الحالية.');
                window.location.href = 'courses.html';
            }
        });

        // Low bandwidth toggle handler
        const btnLowBandwidth = document.getElementById('btn-low-bandwidth');
        if (btnLowBandwidth) {
            btnLowBandwidth.addEventListener('click', () => {
                this.roomState.updateState({
                    network: { lowBandwidth: !this.roomState.state.network.lowBandwidth }
                });
                
                if (this.roomState.state.network.lowBandwidth) {
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
                    try {
                        await RoomRepository.cancelMicRequest(this.courseId, this.currentUser.uid);
                        studentMicBtn.classList.remove('requesting');
                        studentMicBtn.title = 'طلب الكلام';
                        studentMicBtn.querySelector('i').className = 'fas fa-hand-paper';
                    } catch(e) { console.warn('handRaise cancel error', e); }
                } else {
                    // Send request
                    studentMicBtn.classList.add('requesting');
                    studentMicBtn.title = 'إلغاء طلب الكلام';
                    studentMicBtn.querySelector('i').className = 'fas fa-hand-paper';
                    NotificationManager.show('تم إرسال طلب الكلام. انتظر موافقة المدرب.', 'info');
                    try {
                        await RoomRepository.requestMic(this.courseId, this.currentUser);
                    } catch(e) {
                        console.warn('handRaise write error', e);
                        studentMicBtn.classList.remove('requesting');
                    }
                }
            });
        }
    }
}
