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
            
            // Upload to Firebase Storage
            try {
                // We should show a loader in UI ideally
                const url = await InstructorService.uploadMedia(file, `courses/${this.engine.courseId}/videos`);
                
                // Once uploaded, set mode and broadcast the video URL
                await TeachingModes.setMode('video', { 
                    isLive: false, 
                    videoUrl: url,
                    status: 'playing',
                    timestamp: 0
                });
                
                alert('تم رفع الفيديو وتعيينه للعرض بنجاح.');
            } catch (error) {
                alert('فشل رفع الفيديو: ' + error.message);
            }
        };
        input.click();
    }

    async playVideo() {
        await TeachingModes.setMode('video', { status: 'playing' });
    }

    async pauseVideo() {
        await TeachingModes.setMode('video', { status: 'paused' });
    }

    async startAgoraLive() {
        const { MediaEngine } = await import('./MediaEngine.js');
        await TeachingModes.setMode('live', { isLive: true });
        MediaEngine.startLiveWebRTC(this.engine.courseId);
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
                    if (this.selectedSlides.length >= 5) {
                        alert('يمكنك اختيار 5 صور كحد أقصى.');
                        return;
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
}

export const InstructorController = new InstructorControllerClass();
