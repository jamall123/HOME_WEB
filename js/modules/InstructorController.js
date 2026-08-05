/**
 * InstructorController.js
 * The brain of the Instructor Workspace.
 * Mediates between InstructorUI, InstructorService, and the main RoomEngine.
 */

import { InstructorService } from './InstructorService.js';
import { InstructorUI } from './InstructorUI.js';
// Import sub-managers
import { TeachingModes } from './TeachingModes.js';
import { ClassroomManager } from './ClassroomManager.js';
import { StudentManager } from './StudentManager.js';
import { AnnouncementManager } from './AnnouncementManager.js';
import { InstructorAnalytics } from './InstructorAnalytics.js';

class InstructorControllerClass {
    constructor() {
        this.engine = null;
        this.isInitialized = false;
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
                await window.firebase.firestore().collection('courses').doc(this.engine.courseId).update({ activeVideoUrl: url });
                
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
        const courseRef = window.firebase.firestore().collection('courses').doc(this.engine.courseId);
        try {
            // Get current video URL from Firestore to delete from Storage
            const courseDoc = await courseRef.get();
            const activeVideoUrl = courseDoc.data()?.activeVideoUrl;
            
            if (activeVideoUrl) {
                try {
                    // Delete file from Firebase Storage
                    const storageRef = window.firebase.storage().refFromURL(activeVideoUrl);
                    await storageRef.delete();
                } catch(e) {
                    console.warn('[InstructorController] Storage delete failed (may have already been removed):', e.message);
                }
            }
            
            // Clear from Firestore
            await courseRef.update({ activeVideoUrl: window.firebase.firestore.FieldValue.delete() });
            
            // Reset teaching mode - clear the video
            await TeachingModes.setMode('video', { isLive: false, videoUrl: null, status: 'paused' });
            
            this._hideVideoManagementPanel();
            
        } catch (error) {
            alert('فشل حذف الفيديو: ' + error.message);
        }
    }

    async replaceVideo() {
        // First delete the old one silently, then prompt a new upload
        const courseRef = window.firebase.firestore().collection('courses').doc(this.engine.courseId);
        try {
            const courseDoc = await courseRef.get();
            const activeVideoUrl = courseDoc.data()?.activeVideoUrl;
            if (activeVideoUrl) {
                try {
                    const storageRef = window.firebase.storage().refFromURL(activeVideoUrl);
                    await storageRef.delete();
                } catch(e) {
                    console.warn('[InstructorController] Old video delete on replace failed:', e.message);
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
        if (previewEl) previewEl.src = url;
        
        panel.style.display = 'block';
        panel.style.animation = 'fadeIn 0.3s ease';
    }

    /** Hide the video management panel (e.g. after deletion) */
    _hideVideoManagementPanel() {
        const panel = document.getElementById('video-management-panel');
        if (panel) panel.style.display = 'none';
        const previewEl = document.getElementById('current-video-preview');
        if (previewEl) previewEl.src = '';
    }

    /** Called on room init to restore the management panel if a video is already set */
    async restoreVideoManagementPanel() {
        try {
            const courseDoc = await window.firebase.firestore().collection('courses').doc(this.engine.courseId).get();
            const url = courseDoc.data()?.activeVideoUrl;
            if (url) {
                this._showVideoManagementPanel(url, 'فيديو محمّل مسبقاً');
            }
        } catch(e) {
            // Non-fatal
        }
    }


    async playVideo() {
        await TeachingModes.setMode('video', { status: 'playing' });
    }

    async pauseVideo() {
        await TeachingModes.setMode('video', { status: 'paused' });
    }

    async startAgoraLive() {
        try {
            const { MediaEngine } = await import('./MediaEngine.js');
            await TeachingModes.setMode('live', { isLive: true });
            await MediaEngine.startLiveWebRTC(this.engine.courseId);
        } catch(e) {
            console.error('[InstructorController] Failed to start live stream:', e);
            const { NotificationManager } = await import('./NotificationManager.js');
            NotificationManager.show('تعذر بدء البث المباشر: ' + e.message, 'error');
            throw e;
        }
    }

    async stopAgoraLive() {
        const { MediaEngine } = await import('./MediaEngine.js');
        await TeachingModes.setMode('video', { isLive: false }); // Fallback to video mode when stopped
        MediaEngine.stopLiveWebRTC(this.engine.courseId);
    }

    async toggleAgoraMic() {
        const { MediaEngine } = await import('./MediaEngine.js');
        const isMuted = MediaEngine.toggleMic();
        document.getElementById('btn-agora-mic').innerHTML = isMuted ? '<i class="fas fa-microphone-slash"></i> تم الكتم' : '<i class="fas fa-microphone"></i> كتم المايك';
    }

    async switchAgoraCamera() {
        const { MediaEngine } = await import('./MediaEngine.js');
        MediaEngine.switchCamera();
    }

    async setTeachingMode(modeName, metadata = {}) {
        await TeachingModes.setMode(modeName, metadata);
        
        if (modeName === 'slides') {
            this.loadSlidesGallery();
        }
    }
    
    // --- SLIDES CONTROLS ---
    
    async loadSlidesGallery() {
        try {
            const db = window.firebase.firestore();
            const doc = await db.collection('courses').doc(this.engine.courseId).get();
            const data = doc.data() || {};
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
            
            const db = window.firebase.firestore();
            await db.collection('courses').doc(this.engine.courseId).update({
                slidesGallery: window.firebase.firestore.FieldValue.arrayUnion(...urls)
            });
            
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
        const { MediaEngine } = await import('./MediaEngine.js');
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
        const { MediaEngine } = await import('./MediaEngine.js');
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
        const { MediaEngine } = await import('./MediaEngine.js');
        this.isAudioOnlyActive = true;
        
        document.getElementById('btn-audio-start').style.display = 'none';
        document.getElementById('btn-audio-stop').style.display = 'block';
        
        await TeachingModes.setMode('audio', {
            audioStream: true
        });
        
        MediaEngine.startAudioOnlyWebRTC(this.engine.courseId);
    }

    async stopAudioOnly() {
        const { MediaEngine } = await import('./MediaEngine.js');
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
            await InstructorService.addChannelMessage(this.engine.courseId, msgData);

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
            
            await InstructorService.addChannelMessage(this.engine.courseId, msgData);
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

            await InstructorService.addChannelMessage(this.engine.courseId, msgData);
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
                this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                this.mediaRecorder = new MediaRecorder(this.audioStream);
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

                        await InstructorService.addChannelMessage(this.engine.courseId, msgData);
                        await TeachingModes.setMode('channel', {
                            lastMessage: msgData
                        });
                    } catch (error) {
                        console.error("Failed to upload audio:", error);
                        const { NotificationManager } = await import('./NotificationManager.js');
                        NotificationManager.show('فشل رفع المقطع الصوتي: ' + error.message, 'error');
                    }
                };

                this.mediaRecorder.start();
                this.isRecordingVoice = true;
                btn.innerHTML = '<i class="fas fa-stop-circle"></i> إيقاف التسجيل';
                btn.classList.replace('btn-dark', 'btn-danger');
            } catch (err) {
                console.error("Error accessing microphone:", err);
                const { NotificationManager } = await import('./NotificationManager.js');
                NotificationManager.show('لم نتمكن من الوصول إلى الميكروفون. يرجى التأكد من منح الصلاحيات.', 'error');
            }
        } else {
            this.mediaRecorder.stop();
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
            const db = window.firebase.firestore();
            await db.collection('active_sessions').doc(this.engine.courseId).update({
                [`micPermissions.${studentUid}`]: true
            });
            const { NotificationManager } = await import('./NotificationManager.js');
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
            const db = window.firebase.firestore();
            await db.collection('active_sessions').doc(this.engine.courseId).update({
                [`micPermissions.${studentUid}`]: window.firebase.firestore.FieldValue.delete()
            });
        } catch (e) {
            console.error('[InstructorController] revokeStudentMic failed:', e);
        }
    }

    /**
     * Sets up a Firestore listener for hand-raise requests from students.
     */
    listenForHandRaises() {
        const db = window.firebase.firestore();
        this._handRaiseUnsubscribe = db
            .collection('active_sessions').doc(this.engine.courseId)
            .collection('handRaises')
            .onSnapshot(snapshot => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        const data = change.doc.data();
                        this.showHandRaiseNotification(data.name || 'طالب', change.doc.id);
                    }
                });
            }, err => {
                console.warn('[InstructorController] handRaises listener error:', err);
            });
    }
}

export const InstructorController = new InstructorControllerClass();
