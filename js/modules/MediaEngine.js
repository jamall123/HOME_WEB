/**
 * MediaEngine.js
 * Centralized handler for all multimedia modes (Live Video, Pre-recorded, Slides, Channel).
 * Enhanced with robust transitions, loading states, and error recovery.
 */

import { EventBus, Events } from './EventBus.js';
import { StateStore } from './StateStore.js';
import { jhomeDb } from './FirebaseAdapter.js';
import { PermissionEngine } from './PermissionEngine.js';

export const MediaEngine = {
    agoraClient: null,
    localTracks: { video: null, audio: null },
    mainContainer: '#main-video-container',
    
    init() {
        EventBus.subscribe(Events.MEDIA_MODE_CHANGED, (payload) => {
            this.handleModeChange(payload.mode, payload.data);
        });

        EventBus.subscribe('INTERNAL_START_BROADCAST', async () => {
            await this.startLiveWebRTC();
        });
    },

    showLoader(message = 'جاري التحميل...') {
        const container = document.querySelector(this.mainContainer);
        if (!container) return;
        
        const loaderId = 'media-loader-overlay';
        let loader = document.getElementById(loaderId);
        
        if (!loader) {
            loader = document.createElement('div');
            loader.id = loaderId;
            loader.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:50; color:#fff; transition: opacity 0.3s;';
            container.appendChild(loader);
        }
        
        loader.innerHTML = `<i class="fas fa-circle-notch fa-spin fa-3x" style="color: var(--primary-color); margin-bottom: 1rem;"></i><p>${message}</p>`;
        loader.style.opacity = '1';
    },

    hideLoader() {
        const loader = document.getElementById('media-loader-overlay');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 300);
        }
    },

    showError(message) {
        const container = document.querySelector(this.mainContainer);
        if (!container) return;
        this.hideLoader();
        
        const errorHtml = `
            <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:#000; display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:40; color:#EF4444; padding: 2rem; text-align: center;">
                <i class="fas fa-exclamation-triangle fa-3x" style="margin-bottom: 1rem;"></i>
                <h3 style="color: #fff;">حدث خطأ</h3>
                <p style="color: var(--text-muted);">${message}</p>
                <button class="btn btn-primary" style="margin-top: 1rem;" onclick="location.reload()">إعادة تحميل الغرفة</button>
            </div>
        `;
        
        // Hide all inner mode containers
        container.querySelectorAll('> div').forEach(el => {
            if (el.id !== 'media-loader-overlay') el.style.opacity = '0';
        });
        
        container.insertAdjacentHTML('beforeend', errorHtml);
    },

    transitionToContainer(containerId) {
        const parent = document.querySelector(this.mainContainer);
        if (!parent) return null;
        
        let targetContainer = document.getElementById(containerId);
        
        // If it doesn't exist, create it dynamically
        if (!targetContainer) {
            targetContainer = document.createElement('div');
            targetContainer.id = containerId;
            targetContainer.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; opacity:0; transition: opacity 0.5s ease-in-out; background: #000; display:flex; justify-content:center; align-items:center; flex-direction:column;';
            parent.appendChild(targetContainer);
        }

        // Fade out others
        parent.querySelectorAll('> div').forEach(el => {
            if (el.id !== containerId && el.id !== 'media-loader-overlay') {
                el.style.opacity = '0';
                setTimeout(() => { if(el.style.opacity === '0') el.style.display = 'none'; }, 500);
            }
        });

        // Fade in target
        targetContainer.style.display = 'flex';
        // Force reflow
        void targetContainer.offsetWidth;
        targetContainer.style.opacity = '1';

        return targetContainer;
    },

    async handleModeChange(mode, data) {
        // console.log(`[MediaEngine] Mode changed to: ${mode}`, data);
        this.showLoader(`جاري التحويل لوضع ${mode}...`);
        
        try {
            switch(mode) {
                case 'video':
                    if (data.isLive) {
                        await this.prepareLiveStreamUI();
                    } else if (data.videoLink) {
                        await this.playRecordedVideo(data.videoLink);
                    } else {
                        throw new Error("لا يوجد رابط فيديو أو بث مباشر.");
                    }
                    break;
                case 'slides':
                    if (!data.slideUrl) throw new Error("رابط العرض التقديمي مفقود.");
                    await this.renderSlides(data.slideUrl);
                    break;
                case 'channel':
                    await this.showChannelUI();
                    break;
                default:
                    throw new Error("وضع العرض غير مدعوم.");
            }
            this.hideLoader();
        } catch (error) {
            console.error(error);
            this.showError(error.message);
        }
    },

    async prepareLiveStreamUI() {
        const container = this.transitionToContainer('mode-live-stream');
        container.innerHTML = '<div id="live-player" style="width:100%; height:100%;"></div>';
        // In a real implementation, subscriber logic goes here
    },

    async startLiveWebRTC() {
        if (!window.AgoraRTC) {
            this.showError("مكتبة البث المباشر (Agora) غير محملة.");
            return;
        }

        this.showLoader('جاري الاتصال بالبث المباشر...');

        try {
            this.agoraClient = window.AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
            const APP_ID = 'YOUR_AGORA_APP_ID';
            const roomId = StateStore.getState('currentRoomId');
            
            await this.agoraClient.join(APP_ID, roomId, null, null);
            
            this.localTracks.audio = await window.AgoraRTC.createMicrophoneAudioTrack();
            this.localTracks.video = await window.AgoraRTC.createCameraVideoTrack();
            
            await this.agoraClient.publish(Object.values(this.localTracks));
            
            const container = this.transitionToContainer('mode-live-stream');
            container.innerHTML = '<div id="instructor-local-video" style="width:100%; height:100%;"></div>';
            this.localTracks.video.play('instructor-local-video');
            
            this.hideLoader();
        } catch (error) {
            console.error("[MediaEngine] WebRTC Error:", error);
            if (error.code === 'PERMISSION_DENIED') {
                this.showError("يرجى السماح بالوصول إلى الكاميرا والميكروفون لبدء البث.");
            } else {
                this.showError("فشل في الاتصال بخادم البث. " + error.message);
            }
        }
    },

    async playRecordedVideo(url) {
        return new Promise((resolve) => {
            const container = this.transitionToContainer('mode-recorded-video');
            container.innerHTML = `
                <video id="recorded-player" controls playsinline style="width:100%; height:100%; object-fit:contain; background:#000;">
                    <source src="${url}" type="video/mp4">
                    متصفحك لا يدعم تشغيل الفيديو.
                </video>
            `;
            const video = container.querySelector('video');
            
            // Handle loading state via events
            video.addEventListener('canplay', () => resolve());
            video.addEventListener('error', () => {
                this.showError("فشل في تحميل الفيديو المسجل.");
                resolve();
            });
            
            // Timeout fallback
            setTimeout(resolve, 3000); 
        });
    },

    async renderSlides(url) {
        return new Promise((resolve) => {
            const container = this.transitionToContainer('mode-slides');
            const img = new Image();
            img.style.cssText = 'max-width:100%; max-height:100%; object-fit:contain; border-radius: var(--radius-md); box-shadow: 0 10px 25px rgba(0,0,0,0.5);';
            
            img.onload = () => {
                container.innerHTML = '';
                container.appendChild(img);
                resolve();
            };
            
            img.onerror = () => {
                this.showError("فشل في تحميل العرض التقديمي.");
                resolve();
            };
            
            img.src = url;
        });
    },

    async showChannelUI() {
        const container = this.transitionToContainer('mode-channel');
        container.innerHTML = `
            <div style="text-align:center; padding: 2rem;">
                <i class="fas fa-podcast fa-4x" style="color: var(--primary-color); margin-bottom: 1rem;"></i>
                <h3 style="color:#fff; margin-bottom: 0.5rem;">الوضع الصوتي</h3>
                <p style="color:var(--text-muted);">أنت تستمع إلى البث الصوتي فقط.</p>
                <!-- Audio visualizations could go here -->
            </div>
        `;
    }
};

MediaEngine.init();
