/**
 * InstructorController.js
 * The brain of the Instructor Workspace.
 * Mediates between InstructorUI, InstructorService, and the main RoomEngine.
 */

import { InstructorService } from './InstructorService.js';
import { InstructorRepository } from '../../repositories/InstructorRepository.js';
import { CourseRepository } from '../../repositories/CourseRepository.js';
import { RoomRepository } from '../../repositories/RoomRepository.js';
import { MediaRepository } from '../../repositories/MediaRepository.js';
import { InstructorUI } from './InstructorUI.js';
// Import sub-managers
import { TeachingModes } from './TeachingModes.js';
import { ClassroomManager } from './ClassroomManager.js';
import { StudentManager } from './StudentManager.js';
import { AnnouncementManager } from './AnnouncementManager.js';
import { InstructorAnalytics } from './InstructorAnalytics.js';

import { Constants } from '../../core/Constants.js';
import { eventBus, Events } from '../../core/EventBus.js';

class InstructorControllerClass {
    constructor() {
        this.engine = null;
        this.isInitialized = false;
        this.activeSessionsUnsubscribe = null;
        this.activeLessonId = null;
    }

    /**
     * Called strictly by RoomEngine ONLY if user is an instructor.
     */
    init(engine) {
        if (this.isInitialized) return;
        this.engine = engine;
        
        // Strict Validation: Secondary guard against DOM hijacking
        if (!this.engine.isInstructor) {
            console.error("SECURITY VIOLATION: Non-instructor attempting to initialize InstructorController.");
            return;
        }

        // console.log("[InstructorController] Initializing Enterprise Workspace...");

        // Subscribe to lesson changes
        eventBus.subscribe(Events.PLAY_LECTURE, (lesson) => {
            if (lesson && lesson.id) {
                this.activeLessonId = lesson.id;
            }
        });

        // Initialize UI
        InstructorUI.init(this);

        // Initialize Sub-Managers
        TeachingModes.init(this);
        ClassroomManager.init(this);
        StudentManager.init(this);
        AnnouncementManager.init(this);
        InstructorAnalytics.init(this);

        this.isInitialized = true;

        // Restore video management panel if a video was previously uploaded
        this.restoreVideoManagementPanel();
        
        // Start Hand Raise Listener
        this.listenForHandRaises();
    }

    // --- DELEGATED METHODS (UI -> Controller -> SubManager/Service) ---

    async updateProfile(profileData) {
        try {
            await InstructorService.updateProfile(this.engine.currentUser.uid, profileData);
            await InstructorService.updateCourseProfile(this.engine.courseId, profileData);
            // Optionally notify UI of success
        } catch (error) {
            console.error("Profile update failed", error);
            throw error;
        }
    }

    // --- VIDEO & LIVE STREAM CONTROLS ---

    async promptVideoUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/mp4,video/webm,video/ogg';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Show loading state
            const uploadBtn = document.getElementById('btn-video-upload');
            if (uploadBtn) { uploadBtn.disabled = true; uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الرفع...'; }
            
            try {
                const url = await InstructorService.uploadMedia(file, `courses/${this.engine.courseId}/videos`);
                
                // Store current video URL in Firestore for management
                await CourseRepository.updateCourse(this.engine.courseId, { activeVideoUrl: url });
                
                // Once uploaded, set mode and broadcast the video URL
                await TeachingModes.setMode('video', { 
                    isLive: false, 
                    videoUrl: url,
                    status: 'playing',
                    timestamp: 0
                });
                
                this._showVideoManagementPanel(url, file.name);
                
            } catch (error) {
                alert('فشل رفع الفيديو: ' + error.message);
            } finally {
                if (uploadBtn) { uploadBtn.disabled = false; uploadBtn.innerHTML = '<i class="fas fa-upload"></i> رفع فيديو'; }
            }
        };
        input.click();
    }

    async deleteVideo() {
        try {
            // Get current video URL from Firestore to delete from Storage
            const course = await CourseRepository.getCourse(this.engine.courseId);
            const activeVideoUrl = course?.activeVideoUrl;
            
            if (activeVideoUrl) {
                try {
                    await MediaRepository.deleteStorageObjectByUrl(activeVideoUrl);
                    console.log("[InstructorController] Deleted temporary active video file");
                } catch(e) {
                    console.warn('[InstructorController] Storage delete failed (may have already been removed):', e.message);
                }
            }
            
            // Clear from Firestore
            await CourseRepository.clearActiveVideo(this.engine.courseId);
            
            // Reset teaching mode - clear the video
            await TeachingModes.setMode('video', { isLive: false, videoUrl: null, status: 'paused' });
            
            this._hideVideoManagementPanel();
            
        } catch (error) {
            alert('فشل حذف الفيديو: ' + error.message);
        }
    }

    async replaceVideo() {
        // First delete the old one silently, then prompt a new upload
        try {
            const course = await CourseRepository.getCourse(this.engine.courseId);
            const activeVideoUrl = course?.activeVideoUrl;
            if (activeVideoUrl) {
                try {
                    await MediaRepository.deleteStorageObjectByUrl(activeVideoUrl);
                    console.log("[InstructorController] Deleted temporary active video file");
                } catch (e) {
                    console.warn("[InstructorController] Could not delete video file from storage", e);
                }
            }
        } catch(e) {
            // Non-fatal
        }
        this.promptVideoUpload();
    }

    /** Update the UI when a video has been uploaded successfully */
    _showVideoManagementPanel(url, name) {
        const panel = document.getElementById('video-management-panel');
        if (!panel) return;
        
        const nameEl = document.getElementById('current-video-name');
        const previewEl = document.getElementById('current-video-preview');
        
        if (nameEl) nameEl.textContent = name || 'فيديو محمّل';
        if (previewEl) {
            previewEl.src = url;
            this._attachVideoSyncListeners(previewEl);
        }
        
        panel.style.display = 'block';
        panel.style.animation = 'fadeIn 0.3s ease';
    }

    _attachVideoSyncListeners(videoEl) {
        this._removeVideoSyncListeners(); // Clean up if existing
        
        // Cache bound handlers so we can remove them later
        this._videoTarget = videoEl;
        this._videoHandlers = {
            play: () => TeachingModes.setMode('video', { status: 'playing', timestamp: videoEl.currentTime }),
            pause: () => TeachingModes.setMode('video', { status: 'paused', timestamp: videoEl.currentTime }),
            seeked: () => TeachingModes.setMode('video', { timestamp: videoEl.currentTime }), // Preserve status, just update time
            timeupdate: (() => {
                let lastTime = 0;
                return () => {
                    const now = Date.now();
                    // Throttle updates to every 2 seconds during playback
                    if (now - lastTime > 2000 && !videoEl.paused) {
                        TeachingModes.setMode('video', { status: 'playing', timestamp: videoEl.currentTime });
                        lastTime = now;
                    }
                };
            })()
        };

        if (this._videoTarget) {
            this._videoTarget.addEventListener('play', this._videoHandlers.play);
            this._videoTarget.addEventListener('pause', this._videoHandlers.pause);
            this._videoTarget.addEventListener('seeked', this._videoHandlers.seeked);
            this._videoTarget.addEventListener('timeupdate', this._videoHandlers.timeupdate);
        }
    }

    _removeVideoSyncListeners() {
        if (this._videoTarget && this._videoHandlers) {
            this._videoTarget.removeEventListener('play', this._videoHandlers.play);
            this._videoTarget.removeEventListener('pause', this._videoHandlers.pause);
            this._videoTarget.removeEventListener('seeked', this._videoHandlers.seeked);
            this._videoTarget.removeEventListener('timeupdate', this._videoHandlers.timeupdate);
        }
        this._videoHandlers = null;
        this._videoTarget = null;
    }

    /** Hide the video management panel (e.g. after deletion) */
    _hideVideoManagementPanel() {
        const panel = document.getElementById('video-management-panel');
        if (panel) panel.style.display = 'none';
        this._removeVideoSyncListeners();
    }

    /** Called on room init to restore the management panel if a video is already set */
    async restoreVideoManagementPanel() {
        try {
            const course = await CourseRepository.getCourse(this.engine.courseId);
            const url = course?.activeVideoUrl;
            if (url) {
                this._showVideoManagementPanel(url, 'فيديو محمّل مسبقاً');
            }
        } catch(e) {
            // Non-fatal
        }
    }


    async playVideo() {
        const previewEl = document.getElementById('current-video-preview');
        if (previewEl) previewEl.play().catch(e => console.warn('Play prevented', e));
    }

    async pauseVideo() {
        const previewEl = document.getElementById('current-video-preview');
        if (previewEl) previewEl.pause();
    }

    async startAgoraLive() {
        try {
            const { MediaEngine } = await import('../../features/media/MediaEngine.js');
            // Connect Agora FIRST, then update mode so students can join
            await MediaEngine.startLiveWebRTC(this.engine.courseId);
            // Only broadcast mode change after Agora is up and running
            await TeachingModes.setMode('live', { isLive: true });
        } catch(e) {
            console.error('[InstructorController] Failed to start live stream:', e);
            const { NotificationManager } = await import('../../features/global/NotificationManager.js');
            NotificationManager.show('تعذر بدء البث المباشر: ' + e.message, 'error');
            throw e;
        }
    }

    async stopAgoraLive() {
        const { MediaEngine } = await import('../../features/media/MediaEngine.js');
        await TeachingModes.setMode('video', { isLive: false }); // Fallback to video mode when stopped
        MediaEngine.stopLiveWebRTC(this.engine.courseId);
    }

    async toggleAgoraMic() {
        const { MediaEngine } = await import('../../features/media/MediaEngine.js');
        const isMuted = MediaEngine.toggleMic();
        document.getElementById('btn-agora-mic').innerHTML = isMuted ? '<i class="fas fa-microphone-slash"></i> تم الكتم' : '<i class="fas fa-microphone"></i> كتم المايك';
    }

    async switchAgoraCamera() {
        const { MediaEngine } = await import('../../features/media/MediaEngine.js');
        MediaEngine.switchCamera();
    }

    async setTeachingMode(modeName, metadata = {}) {
        // Aggressive Cleanup: Stop any active broadcasts when switching modes
        const { MediaEngine } = await import('../../features/media/MediaEngine.js');
        
        // Reset Slides Audio State
        this.isSlidesAudioActive = false;
        const btnSlidesStart = document.getElementById('btn-slides-mic-start');
        const btnSlidesStop = document.getElementById('btn-slides-mic-stop');
        if (btnSlidesStart) btnSlidesStart.style.display = 'inline-block';
        if (btnSlidesStop) btnSlidesStop.style.display = 'none';

        // Reset Audio Only State
        this.isAudioOnlyActive = false;
        const btnAudioStart = document.getElementById('btn-audio-start');
        const btnAudioStop = document.getElementById('btn-audio-stop');
        if (btnAudioStart) btnAudioStart.style.display = 'inline-block';
        if (btnAudioStop) btnAudioStop.style.display = 'none';
        
        // Stop any Agora publisher client safely
        if (MediaEngine.agoraClient || MediaEngine._isPublishing) {
            try { await MediaEngine.stopLiveWebRTC(this.engine.courseId); } catch(e){}
        }

        await TeachingModes.setMode(modeName, metadata);
        
        if (modeName === 'slides') {
            this.loadSlidesGallery();
        }
    }
    
    // --- SLIDES CONTROLS ---
    
    async loadSlidesGallery() {
        try {
            const course = await CourseRepository.getCourse(this.engine.courseId);
            const data = course || {};
            this.courseSlides = data.slidesGallery || [];
            this.renderSlidesGallery();
        } catch (e) {
            console.error("Failed to load slides gallery", e);
        }
    }
    
    renderSlidesGallery() {
        const gallery = document.getElementById('inst-slides-gallery');
        if (!gallery) return;
        
        gallery.innerHTML = '';
        this.selectedSlides = [];
        
        this.courseSlides.forEach((url, index) => {
            const img = document.createElement('img');
            img.src = url;
            img.style.width = '100%';
            img.style.height = '60px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '4px';
            img.style.cursor = 'pointer';
            img.style.border = '2px solid transparent';
            
            img.onclick = () => {
                const isSelected = this.selectedSlides.includes(url);
                if (isSelected) {
                    this.selectedSlides = this.selectedSlides.filter(s => s !== url);
                    img.style.borderColor = 'transparent';
                } else {
                    const layoutSelect = document.getElementById('inst-slides-layout');
                    const layout = layoutSelect ? layoutSelect.value : 'slides-layout-1';
                    
                    let maxImages = 1;
                    if (layout === 'slides-layout-2') maxImages = 2;
                    else if (layout === 'slides-layout-3') maxImages = 3;
                    else if (layout === 'slides-layout-4') maxImages = 4;
                    else if (layout === 'slides-layout-5') maxImages = 5;

                    if (this.selectedSlides.length >= maxImages) {
                        const removedUrl = this.selectedSlides.shift();
                        const allImgs = gallery.querySelectorAll('img');
                        allImgs.forEach(imgEl => {
                            if (imgEl.src === removedUrl) {
                                imgEl.style.borderColor = 'transparent';
                            }
                        });
                    }
                    
                    this.selectedSlides.push(url);
                    img.style.borderColor = '#34d399';
                }
            };
            
            gallery.appendChild(img);
        });
    }

    async uploadSlides(e) {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        
        try {
            const uploadPromises = files.map(file => 
                InstructorService.uploadMedia(file, `courses/${this.engine.courseId}/slides`)
            );
            const urls = await Promise.all(uploadPromises);
            
            await CourseRepository.addSlidesToGallery(this.engine.courseId, urls);
            
            await this.loadSlidesGallery();
            alert('تم رفع الصور بنجاح.');
        } catch (error) {
            console.error("Failed to upload slides:", error);
            alert("فشل رفع الصور: " + error.message);
        }
    }

    handleSlideLayoutChange(e) {
        const layout = e.target.value;
        let maxImages = 1;
        if (layout === 'slides-layout-2') maxImages = 2;
        else if (layout === 'slides-layout-3') maxImages = 3;
        else if (layout === 'slides-layout-4') maxImages = 4;
        else if (layout === 'slides-layout-5') maxImages = 5;

        // If currently selected images exceed the new layout's max, truncate the array
        if (this.selectedSlides && this.selectedSlides.length > maxImages) {
            const numToRemove = this.selectedSlides.length - maxImages;
            const removedUrls = this.selectedSlides.splice(0, numToRemove); // remove from beginning (oldest)

            const gallery = document.getElementById('inst-slides-gallery');
            if (gallery) {
                const allImgs = gallery.querySelectorAll('img');
                allImgs.forEach(imgEl => {
                    if (removedUrls.includes(imgEl.src)) {
                        imgEl.style.borderColor = 'transparent';
                    }
                });
            }
        }
    }

    async presentSelectedSlides() {
        if (!this.selectedSlides || this.selectedSlides.length === 0) {
            alert('يرجى اختيار صورة واحدة على الأقل للعرض.');
            return;
        }
        
        const layoutSelect = document.getElementById('inst-slides-layout');
        const layout = layoutSelect ? layoutSelect.value : 'slides-layout-1';
        
        await TeachingModes.setMode('slides', {
            slides: this.selectedSlides,
            layout: layout,
            audioStream: this.isSlidesAudioActive || false
        });
    }

    async startSlidesAudio() {
        const { MediaEngine } = await import('../../features/media/MediaEngine.js');
        this.isSlidesAudioActive = true;
        
        document.getElementById('btn-slides-mic-start').style.display = 'none';
        document.getElementById('btn-slides-mic-stop').style.display = 'block';
        
        await TeachingModes.setMode('slides', {
            slides: this.selectedSlides || [],
            layout: document.getElementById('inst-slides-layout')?.value || 'slides-layout-1',
            audioStream: true
        });
        
        MediaEngine.startAudioOnlyWebRTC(this.engine.courseId);
    }

    async stopSlidesAudio() {
        const { MediaEngine } = await import('../../features/media/MediaEngine.js');
        this.isSlidesAudioActive = false;
        
        document.getElementById('btn-slides-mic-start').style.display = 'block';
        document.getElementById('btn-slides-mic-stop').style.display = 'none';
        
        await TeachingModes.setMode('slides', {
            slides: this.selectedSlides || [],
            layout: document.getElementById('inst-slides-layout')?.value || 'slides-layout-1',
            audioStream: false
        });
        
        MediaEngine.stopLiveWebRTC(this.engine.courseId);
    }
    
    // --- AUDIO MODE CONTROLS ---
    
    async startAudioOnly() {
        const { MediaEngine } = await import('../../features/media/MediaEngine.js');
        this.isAudioOnlyActive = true;
        
        document.getElementById('btn-audio-start').style.display = 'none';
        document.getElementById('btn-audio-stop').style.display = 'block';
        
        await TeachingModes.setMode('audio', {
            audioStream: true
        });
        
        MediaEngine.startAudioOnlyWebRTC(this.engine.courseId);
    }

    async stopAudioOnly() {
        const { MediaEngine } = await import('../../features/media/MediaEngine.js');
        this.isAudioOnlyActive = false;
        
        document.getElementById('btn-audio-start').style.display = 'block';
        document.getElementById('btn-audio-stop').style.display = 'none';
        
        await TeachingModes.setMode('audio', {
            audioStream: false
        });
        
        MediaEngine.stopLiveWebRTC(this.engine.courseId);
    }

    // --- CHANNEL MODE CONTROLS ---

    async sendChannelMessage() {
        const textInput = document.getElementById('inst-channel-text');
        if (!textInput || !textInput.value.trim()) return;
        
        const message = textInput.value.trim();
        textInput.value = '';
        
        const msgData = {
            type: 'text',
            content: message,
            timestamp: Date.now()
        };

        try {
            const { InstructorService } = await import('./InstructorService.js');
            await InstructorService.addChannelMessage(this.engine.courseId, this.activeLessonId, msgData);

            await TeachingModes.setMode('channel', {
                lastMessage: msgData
            });
        } catch (error) {
            console.error("Failed to send channel text:", error);
        }
    }

    async sendChannelImage(e) {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = '';
        
        try {
            const { InstructorService } = await import('./InstructorService.js');
            const url = await InstructorService.uploadMedia(file, `courses/${this.engine.courseId}/channel`);
            
            const msgData = {
                type: 'image',
                content: url,
                timestamp: Date.now()
            };
            
            await InstructorService.addChannelMessage(this.engine.courseId, this.activeLessonId, msgData);
            await TeachingModes.setMode('channel', {
                lastMessage: msgData
            });
        } catch (error) {
            console.error("Failed to upload channel image:", error);
            alert("فشل رفع الصورة: " + error.message);
        }
    }

    async sendChannelVideo(e) {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = '';
        
        try {
            const { InstructorService } = await import('./InstructorService.js');
            const url = await InstructorService.uploadMedia(file, `courses/${this.engine.courseId}/channel`);
            
            const msgData = {
                type: 'video',
                content: url,
                timestamp: Date.now()
            };

            await InstructorService.addChannelMessage(this.engine.courseId, this.activeLessonId, msgData);
            await TeachingModes.setMode('channel', {
                lastMessage: msgData
            });
        } catch (error) {
            console.error("Failed to upload channel video:", error);
            alert("فشل رفع الفيديو: " + error.message);
        }
    }

    async toggleChannelVoice() {
        const btn = document.getElementById('btn-channel-voice');
        if (!this.isRecordingVoice) {
            try {
                this.audioStream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        noiseSuppression: true,
                        echoCancellation: true,
                        autoGainControl: true,
                        channelCount: 1,
                        sampleRate: 44100
                    }
                });
                
                // --- Audio Processing Engine ---
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                this.audioCtx = new AudioContext();
                const source = this.audioCtx.createMediaStreamSource(this.audioStream);

                // 1. Highpass Filter: Remove low-frequency hum/rumble (air conditioner, wind)
                const highpass = this.audioCtx.createBiquadFilter();
                highpass.type = 'highpass';
                highpass.frequency.value = 85; 

                // 2. Lowpass Filter: Remove high-frequency hiss
                const lowpass = this.audioCtx.createBiquadFilter();
                lowpass.type = 'lowpass';
                lowpass.frequency.value = 9000;

                // 3. Compressor: Level out voice volume (make quiet parts louder, prevent loud distortion)
                const compressor = this.audioCtx.createDynamicsCompressor();
                compressor.threshold.value = -40; // DB threshold
                compressor.knee.value = 30;
                compressor.ratio.value = 10;
                compressor.attack.value = 0.005;
                compressor.release.value = 0.1;

                // Connect the chain: Source -> Highpass -> Lowpass -> Compressor -> Destination
                source.connect(highpass);
                highpass.connect(lowpass);
                lowpass.connect(compressor);

                const destination = this.audioCtx.createMediaStreamDestination();
                compressor.connect(destination);

                // Use the processed stream for recording
                this.mediaRecorder = new MediaRecorder(destination.stream);
                this.audioChunks = [];

                this.mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        this.audioChunks.push(event.data);
                    }
                };

                this.mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                    const file = new File([audioBlob], `audio_${Date.now()}.webm`, { type: 'audio/webm' });
                    
                    try {
                        const { InstructorService } = await import('./InstructorService.js');
                        const url = await InstructorService.uploadMedia(file, `courses/${this.engine.courseId}/channel`);
                        
                        const msgData = {
                            type: 'audio',
                            content: url,
                            timestamp: Date.now()
                        };

                        await InstructorService.addChannelMessage(this.engine.courseId, this.activeLessonId, msgData);
                        await TeachingModes.setMode('channel', {
                            lastMessage: msgData
                        });
                    } catch (error) {
                        console.error("Failed to upload audio:", error);
                        const { NotificationManager } = await import('../../features/global/NotificationManager.js');
                        NotificationManager.show('فشل رفع المقطع الصوتي: ' + error.message, 'error');
                    }
                };

                this.mediaRecorder.start();
                this.isRecordingVoice = true;
                btn.innerHTML = '<i class="fas fa-stop-circle"></i> إيقاف التسجيل';
                btn.classList.replace('btn-dark', 'btn-danger');
            } catch (err) {
                console.error("Error accessing microphone:", err);
                const { NotificationManager } = await import('../../features/global/NotificationManager.js');
                NotificationManager.show('لم نتمكن من الوصول إلى الميكروفون. يرجى التأكد من منح الصلاحيات.', 'error');
            }
        } else {
            this.mediaRecorder.stop();
            this.audioStream.getTracks().forEach(track => track.stop());
            if (this.audioCtx) {
                this.audioCtx.close().catch(e => console.warn(e));
                this.audioCtx = null;
            }
            this.isRecordingVoice = false;
            btn.innerHTML = '<i class="fas fa-microphone"></i> تسجيل صوتي';
            btn.classList.replace('btn-danger', 'btn-dark');
            
            // Stop mic tracks
            if (this.audioStream) {
                this.audioStream.getTracks().forEach(track => track.stop());
                this.audioStream = null;
            }
        }
    }

    // =========================================================================
    // STUDENT MIC / HAND RAISE SYSTEM
    // =========================================================================

    /**
     * Called by RoomEngine when a student requests to speak.
     * Displays a toast notification to the instructor.
     */
    showHandRaiseNotification(studentName, studentUid) {
        const container = document.getElementById('hand-raise-toasts');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'hand-raise-toast';
        toast.dataset.uid = studentUid;
        toast.innerHTML = `
            <div class="toast-icon">✋</div>
            <div class="toast-info">
                <div class="toast-name">${studentName}</div>
                <div class="toast-desc">يطلب الكلام في الدرس</div>
            </div>
            <button class="toast-allow-btn" data-uid="${studentUid}">سماح</button>
        `;

        // Allow button
        toast.querySelector('.toast-allow-btn').addEventListener('click', () => {
            this.allowStudentMic(studentUid, studentName);
            toast.remove();
        });

        // Auto-dismiss after 15 seconds
        container.appendChild(toast);
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 15000);
    }

    /**
     * Grants a student permission to use their microphone in Agora.
     */
    async allowStudentMic(studentUid, studentName) {
        try {
            await RoomRepository.setSessionState(this.engine.courseId, {
                [`micPermissions.${studentUid}`]: true
            });
            const { NotificationManager } = await import('../../features/global/NotificationManager.js');
            NotificationManager.show(`تم السماح لـ ${studentName} بالكلام`, 'success');
        } catch (e) {
            console.error('[InstructorController] allowStudentMic failed:', e);
        }
    }

    /**
     * Revokes a student's microphone permission.
     */
    async revokeStudentMic(studentUid) {
        try {
            await RoomRepository.revokeMicPermission(this.engine.courseId, studentUid);
            NotificationManager.show('تم سحب صلاحية الميكروفون بنجاح', 'success');
        } catch (error) {
            console.error('[InstructorController] revoke mic error', error);
            NotificationManager.show('حدث خطأ أثناء سحب الصلاحية', 'error');
        }
    }

    async kickStudent(studentUid) {
        try {
            await RoomRepository.kickStudent(this.engine.courseId, studentUid);
            NotificationManager.show('تم طرد الطالب من الغرفة بنجاح', 'success');
        } catch (error) {
            console.error('[InstructorController] kick student error', error);
            NotificationManager.show('حدث خطأ أثناء محاولة طرد الطالب', 'error');
        }
    }

    /**
     * Sets up a Firestore listener for hand-raise requests from students.
     */
    listenForHandRaises() {
        this._handRaiseUnsubscribe = RoomRepository.onHandRaisesSnapshot(this.engine.courseId, (changes) => {
            changes.forEach(change => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    this.showHandRaiseNotification(data.name || 'طالب', change.doc.id);
                }
            });
        });
    }

    showHandRaiseNotification(name, id) {
        const container = document.getElementById('hand-raise-toasts');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'hand-raise-toast';
        toast.style.cssText = 'background:rgba(0,0,0,0.8); border:1px solid var(--primary-color); border-radius:10px; padding:1rem; display:flex; flex-direction:column; gap:0.5rem; animation: slideInRight 0.3s ease;';
        toast.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:bold; color:var(--text-primary);"><i class="fas fa-hand-paper" style="color:var(--primary-color);"></i> ${name} يطلب الكلام</span>
            </div>
            <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
                <button class="btn btn-sm btn-primary" style="flex:1;" onclick="InstructorController.handleHandRaise('${id}', '${name}', true, this.parentElement.parentElement)">قبول</button>
                <button class="btn btn-sm btn-dark" style="flex:1;" onclick="InstructorController.handleHandRaise('${id}', '${name}', false, this.parentElement.parentElement)">رفض</button>
            </div>
        `;
        container.appendChild(toast);
        
        // Auto-remove after 20 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.animation = 'slideOutRight 0.3s ease forwards';
                setTimeout(() => toast.remove(), 300);
                RoomRepository.cancelMicRequest(this.engine.courseId, id).catch(() => {});
            }
        }, 20000);
    }

    async handleHandRaise(studentUid, studentName, isAccepted, toastElement) {
        if (toastElement) {
            toastElement.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => toastElement.remove(), 300);
        }
        
        try {
            await RoomRepository.cancelMicRequest(this.engine.courseId, studentUid); // Clear request
            if (isAccepted) {
                await this.allowStudentMic(studentUid, studentName);
            }
        } catch (e) {
            console.error('[InstructorController] handleHandRaise error:', e);
        }
    }

    destroy() {
        if (this._handRaiseUnsubscribe) {
            this._handRaiseUnsubscribe();
            this._handRaiseUnsubscribe = null;
        }
        if (this.activeSessionsUnsubscribe) {
            this.activeSessionsUnsubscribe();
            this.activeSessionsUnsubscribe = null;
        }
        this._removeVideoSyncListeners();
        this.isInitialized = false;
        this.engine = null;
    }
}

export const InstructorController = new InstructorControllerClass();
