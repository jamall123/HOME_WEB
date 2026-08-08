/**
 * @file RoomRenderer.js
 * @purpose Rendering loop and DOM updates for RoomEngine state.
 */
import { TeachingRenderer } from '../../features/room/TeachingRenderer.js';
import { WorkspaceUI } from '../../features/global/WorkspaceUI.js';

export class RoomRenderer {
    constructor(roomState) {
        this.roomState = roomState;
        this.isInstructor = false;
        this.courseId = null;
        
        // Bind to state render schedule
        this.roomState.onRenderScheduled = () => this.scheduleRender();
    }

    init(courseId, isInstructor) {
        this.courseId = courseId;
        this.isInstructor = isInstructor;
    }

    scheduleRender() {
        if (this.roomState.isRendering) return;
        this.roomState.isRendering = true;
        
        requestAnimationFrame(() => {
            this.processRenderQueue();
            this.roomState.isRendering = false;
        });
    }

    processRenderQueue() {
        const state = this.roomState.state;
        const prevState = this.roomState.prevState;
        const renderQueue = this.roomState.renderQueue;

        if (renderQueue.has('room') || renderQueue.has('network') || renderQueue.has('presentation')) {
            TeachingRenderer.renderMode(state.room.mode, state.network.lowBandwidth);
            TeachingRenderer.updateLiveBadge(state.room.isLive);

            // Sync float bar online count
            const floatCount = document.getElementById('float-online-count');
            const chatCount  = document.getElementById('chat-online-count');
            if (floatCount && chatCount) {
                const num = chatCount.textContent.replace(/[^\d]/g, '');
                floatCount.textContent = num || '0';
            }

            if (renderQueue.has('network')) {
                const btnLowBandwidth = document.getElementById('btn-low-bandwidth');
                if (btnLowBandwidth) {
                    if (state.network.lowBandwidth) {
                        btnLowBandwidth.classList.add('active');
                    } else {
                        btnLowBandwidth.classList.remove('active');
                    }
                }
            }

            // Student mic button
            if (!this.isInstructor) {
                const studentMicBtn = document.getElementById('btn-student-mic');
                if (studentMicBtn) {
                    const voiceModes = ['live', 'audio', 'slides'];
                    const hasAudio   = voiceModes.includes(state.room.mode) &&
                        (state.room.mode !== 'slides' || state.presentation.audioStream);
                    studentMicBtn.style.display = hasAudio ? 'inline-flex' : 'none';
                }
            }
            
            if (state.room.mode === 'video' && state.presentation.videoUrl) {
                const playerVideo = document.getElementById('player-video');
                if (playerVideo) {
                    if (playerVideo.getAttribute('src') !== state.presentation.videoUrl) {
                        playerVideo.src = state.presentation.videoUrl;
                        playerVideo.setAttribute('src', state.presentation.videoUrl);
                        playerVideo.load();
                    }
                    if (state.presentation.status === 'playing') {
                        playerVideo.play().catch(e => console.log('Playback prevented', e));
                    } else if (state.presentation.status === 'paused') {
                        playerVideo.pause();
                    }
                }
            }

            if (state.room.mode === 'slides' && state.presentation.slides) {
                TeachingRenderer.renderSlidesLayout(state.presentation.slides, state.presentation.layout);
            }

            // Agora Student Subscriptions
            if (state.room.mode === 'live' && !this.isInstructor) {
                import('../../features/media/MediaEngine.js').then(({ MediaEngine }) => {
                    MediaEngine.joinLiveWebRTC(this.courseId);
                });
            } else if (state.room.mode === 'slides' && state.presentation.audioStream && !this.isInstructor) {
                import('../../features/media/MediaEngine.js').then(({ MediaEngine }) => {
                    MediaEngine.joinLiveWebRTC(this.courseId); // Subscribes to audio
                });
            } else if (prevState) {
                const wasLiveOrAudio = (prevState.room.mode === 'live') || 
                                       (prevState.room.mode === 'slides' && prevState.presentation.audioStream);
                const isLiveOrAudio = (state.room.mode === 'live') || 
                                      (state.room.mode === 'slides' && state.presentation.audioStream);
                                      
                if (wasLiveOrAudio && !isLiveOrAudio && !this.isInstructor) {
                    import('../../features/media/MediaEngine.js').then(({ MediaEngine }) => {
                        MediaEngine.leaveLiveWebRTC();
                    });
                }
            }
        }

        if (renderQueue.has('layout')) {
            WorkspaceUI.updateLayout(state.layout);
        }

        renderQueue.clear();
    }
}
