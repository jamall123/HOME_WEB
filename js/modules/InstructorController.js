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
        await TeachingModes.setMode('video', { status: 'playing' }); // Simplified, we should fetch current metadata and update
        // We will improve this via RoomEngine syncing. Let's just update the document for now.
        InstructorService.updateTeachingMode(this.engine.courseId, {
            mode: 'video',
            metadata: { status: 'playing' }
        });
    }

    async pauseVideo() {
        InstructorService.updateTeachingMode(this.engine.courseId, {
            mode: 'video',
            metadata: { status: 'paused' }
        });
    }

    async startAgoraLive() {
        const { MediaEngine } = await import('./MediaEngine.js');
        MediaEngine.startLiveWebRTC(this.engine.courseId);
    }

    async stopAgoraLive() {
        const { MediaEngine } = await import('./MediaEngine.js');
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
    }
}

export const InstructorController = new InstructorControllerClass();
