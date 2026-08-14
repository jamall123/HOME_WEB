/**
 * MediaEngine.js
 * Centralized handler for all multimedia modes (Live Video, Pre-recorded, Slides, Channel).
 * Enhanced with robust transitions, loading states, and error recovery.
 */

import { eventBus, Events } from '../../core/EventBus.js';
import { stateStore } from '../../core/StateStore.js';
import { MediaRepository } from '../../repositories/MediaRepository.js';
import { NotificationManager } from '../global/NotificationManager.js';
import { CurriculumController } from '../curriculum/index.js';

export const MediaEngine = {
    agoraClient: null,
    localTracks: { video: null, audio: null },
    mainContainer: '#teaching-renderer',
    lastNetworkWarningAt: 0,

    /**
     * Reacts to Agora's per-second network quality report (1 = excellent, 6 = down).
     * Surfaces a lightweight, throttled notice instead of spamming the user.
     */
    handleNetworkQuality(stats) {
        const quality = stats && stats.downlinkNetworkQuality;
        if (!quality || quality < 5) return;

        const now = Date.now();
        if (now - this.lastNetworkWarningAt < 30000) return; // Throttle to once per 30s
        this.lastNetworkWarningAt = now;

        NotificationManager.show('اتصالك بالإنترنت ضعيف، تم تقليل جودة البث تلقائياً لضمان استمرارية المشاهدة.', 'info');
    },

    init() {
        eventBus.subscribe(Events.MEDIA_MODE_CHANGED, (payload) => {
            this.handleModeChange(payload.mode, payload.data);
        });

        eventBus.subscribe('INTERNAL_START_BROADCAST', async () => {
            await this.startLiveWebRTC();
        });

        eventBus.subscribe(Events.DESTROY_ROOM_SESSION, async () => {
            if (typeof this.stopLiveWebRTC === 'function') await this.stopLiveWebRTC();
            if (typeof this.leaveLiveWebRTC === 'function') await this.leaveLiveWebRTC();
            if (this.agoraClient && typeof this.agoraClient.removeAllListeners === 'function') {
                this.agoraClient.removeAllListeners();
            }
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
        Array.from(container.children).forEach(el => {
            if (el.tagName === 'DIV' && el.id !== 'media-loader-overlay') el.style.opacity = '0';
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
        Array.from(parent.children).forEach(el => {
            if (el.tagName === 'DIV' && el.id !== containerId && el.id !== 'media-loader-overlay') {
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

    async startLiveWebRTC(courseId) {
        if (!window.AgoraRTC) {
            let msg = "مكتبة البث المباشر (Agora) غير محملة. قد يكون هناك مانع إعلانات يمنع تحميلها.";
            this.showError(msg);
            alert(msg);
            return;
        }

        // Guard: prevent double-publishing
        if (this._isPublishing) {
            console.warn("[MediaEngine] Already broadcasting, ignoring duplicate call.");
            return;
        }
        this._isPublishing = true;
        
        // Ensure any existing client is disconnected
        if (this.agoraClient) {
            try { await this.agoraClient.leave(); } catch (e) {}
            this.agoraClient = null;
            this._joinedChannel = null;
        }

        this.showLoader('جاري الاتصال بالبث المباشر...');

        // ── Profiling Metrics ──
        const startTotalTime = performance.now();
        let camTime = 0, joinTime = 0, publishTime = 0;

        // ── STEP 0: Check camera/mic permissions explicitly ───────────────────────
        let permStream = null;
        try {
            permStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            // Immediately stop the test stream – we just needed the permission
            permStream.getTracks().forEach(t => t.stop());
        } catch (permErr) {
            this._isPublishing = false;
            this.hideLoader();
            let permMsg = "تعذر الوصول إلى الكاميرا أو الميكروفون.";
            if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
                permMsg = "❌ تم رفض صلاحية الوصول للكاميرا/الميكروفون.\n\nيرجى:\n1. النقر على أيقونة القفل في شريط العنوان\n2. السماح للموقع بالوصول للكاميرا والميكروفون\n3. تحديث الصفحة والمحاولة مرة أخرى";
            } else if (permErr.name === 'NotFoundError') {
                permMsg = "❌ لم يتم العثور على كاميرا أو ميكروفون. تأكد من توصيل الجهاز.";
            } else if (permErr.name === 'NotReadableError') {
                permMsg = "❌ الكاميرا/الميكروفون مستخدمة من تطبيق آخر. أغلقها وحاول مرة أخرى.";
            } else {
                permMsg = `❌ خطأ في الصلاحيات: ${permErr.name} - ${permErr.message}`;
            }
            this.showError(permMsg);
            alert(permMsg);
            return;
        }

        try {
            // ── STEP 1: Fetch Agora Token ─────────────────────────────────────────
            let tokenData;
            let localUid = Math.floor(Math.random() * 100000) + 1;
            try {
                tokenData = await MediaRepository.generateAgoraToken({ channelName: courseId, role: 'publisher', uid: localUid });
            } catch (tokenErr) {
                throw new Error(`فشل في الحصول على رمز البث [STEP-TOKEN]: ${tokenErr.message}`);
            }
            
            const APP_ID = tokenData.appId;
            const token = tokenData.token;
            const channel = tokenData.channel;
            const uid = tokenData.uid;

            if (!APP_ID || !token || !channel) {
                throw new Error(`بيانات البث غير مكتملة [STEP-TOKEN-DATA]: appId=${APP_ID}, channel=${channel}, token=${!!token}`);
            }

            // ── STEP 2: Create Agora Client ───────────────────────────────────────
            let client;
            try {
                client = window.AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
                this.agoraClient = client;
            } catch (clientErr) {
                throw new Error(`فشل في إنشاء عميل Agora [STEP-CLIENT]: ${clientErr.message}`);
            }

            // ── STEP 3: Join Channel ──────────────────────────────────────────────
            try {
                const startJoin = performance.now();
                await client.join(APP_ID, channel, token, uid);
                joinTime = performance.now() - startJoin;
            } catch (joinErr) {
                throw new Error(`فشل في الانضمام للقناة [STEP-JOIN]: ${joinErr.message || joinErr.code || JSON.stringify(joinErr)}`);
            }

            // ── STEP 4: Create Audio Track ────────────────────────────────────────
            try {
                this.localTracks.audio = await window.AgoraRTC.createMicrophoneAudioTrack({
                    AEC: true,
                    ANS: true,
                    AGC: true
                });
            } catch (micErr) {
                throw new Error(`فشل في فتح الميكروفون [STEP-MIC]: ${micErr.message || micErr.name}`);
            }

            // ── STEP 5: Create Video Track ────────────────────────────────────────
            try {
                const startCam = performance.now();
                this.localTracks.video = await window.AgoraRTC.createCameraVideoTrack({ encoderConfig: '480p_1' });
                camTime = performance.now() - startCam;
            } catch (camErr) {
                throw new Error(`فشل في فتح الكاميرا [STEP-CAM]: ${camErr.message || camErr.name}`);
            }

            // ── STEP 6: Enable Dual Stream ────────────────────────────────────────
            try {
                await client.enableDualStream();
                client.setLowStreamParameter({ width: 160, height: 120, framerate: 10, bitrate: 80 });
            } catch (dualErr) {
                console.warn('[MediaEngine] Dual stream not available:', dualErr);
            }

            // ── STEP 7: Publish Tracks ────────────────────────────────────────────
            const tracksToPublish = [this.localTracks.audio, this.localTracks.video].filter(Boolean);
            if (tracksToPublish.length === 0) {
                throw new Error("لم يتم العثور على كاميرا أو ميكروفون [STEP-PUBLISH]");
            }
            try {
                const startPublish = performance.now();
                await client.publish(tracksToPublish);
                publishTime = performance.now() - startPublish;
            } catch (pubErr) {
                throw new Error(`فشل في نشر البث [STEP-PUBLISH]: ${pubErr.message || pubErr.code || JSON.stringify(pubErr)}`);
            }

            // Mark channel as joined
            this._joinedChannel = channel;

            // Show video in the instructor dashboard immediately (InstructorUI handles button toggles)
            const videoContainer = document.getElementById('agora-live-container'); // FIX: Use the agora container
            if (videoContainer) {
                // We need to append the Agora video track to a div, not a <video> element.
                // Let's create an overlay or replace the video element
                let liveDiv = document.getElementById('agora-local-live');
                if (!liveDiv) {
                    liveDiv = document.createElement('div');
                    liveDiv.id = 'agora-local-live';
                    liveDiv.style.width = '100%';
                    liveDiv.style.height = '100%';
                    liveDiv.style.position = 'absolute';
                    liveDiv.style.top = '0';
                    liveDiv.style.left = '0';
                    liveDiv.style.zIndex = '5';
                    videoContainer.appendChild(liveDiv); // FIX: append directly to container
                }
                liveDiv.style.display = 'block';
                this.localTracks.video.play(liveDiv.id);
            }
            
            // ── Emit BROADCAST_STARTED EVENT ──
            const totalTime = performance.now() - startTotalTime;
            console.log(`[MediaEngine] Profiling: Cam=${camTime.toFixed(0)}ms, Join=${joinTime.toFixed(0)}ms, Publish=${publishTime.toFixed(0)}ms, Total=${totalTime.toFixed(0)}ms`);
            
            eventBus.emit(Events.BROADCAST_STARTED, {
                courseId,
                channel,
                metrics: { camTime, joinTime, publishTime, totalTime }
            });
            
            // Update Firestore so students know it's live
            await MediaRepository.setCourseLiveStatus(courseId, true, channel);
            
            // Toggle UI buttons
            const btnStartAgora = document.getElementById('btn-start-agora');
            if (btnStartAgora) btnStartAgora.style.display = 'none';
            const btnStopAgora = document.getElementById('btn-stop-agora');
            if (btnStopAgora) btnStopAgora.style.display = 'block';
            
            // Setup Local Recording
            try {
                const audioTrack = this.localTracks.audio.getMediaStreamTrack();
                const videoTrack = this.localTracks.video.getMediaStreamTrack();
                const stream = new MediaStream([audioTrack, videoTrack]);
                
                this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8,opus' });
                this.recordedChunks = [];
                
                this.mediaRecorder.ondataavailable = (event) => {
                    if (event.data && event.data.size > 0) {
                        this.recordedChunks.push(event.data);
                    }
                };
                
                this.mediaRecorder.start(1000); // chunk every second
                console.log("[MediaEngine] Local recording started");
                NotificationManager.show('بدأ تسجيل المحاضرة تلقائياً', 'info');
            } catch (recErr) {
                console.warn("[MediaEngine] Failed to start local recording:", recErr);
            }
            
            this.hideLoader();
            alert('تم بدء البث المباشر بنجاح!');
        } catch (error) {
            console.error("[MediaEngine] WebRTC Error:", error);
            let errMsg = "فشل في الاتصال بخادم البث. " + (error.message || "");
            if (error.code === 'PERMISSION_DENIED' || (error.message && error.message.includes('Permission denied'))) {
                errMsg = "يرجى السماح بالوصول إلى الكاميرا والميكروفون من إعدادات المتصفح لبدء البث.";
            }
            this.showError(errMsg);
            alert("حدث خطأ أثناء الاتصال: " + errMsg);
            this._isPublishing = false; // Reset so user can retry
        }
    },

    async joinLiveWebRTC(channel) {
        if (!window.AgoraRTC) {
            this.showError("مكتبة البث المباشر (Agora) غير محملة.");
            return;
        }

        // Guard: don't join twice if already connected
        if (this._joinedChannel === channel) {
            console.log("[MediaEngine] Already joined channel:", channel);
            return;
        }
        // If previously connected to a different channel, leave first
        if (this.agoraClient && this._joinedChannel) {
            try { await this.agoraClient.leave(); } catch(e) {}
            this.agoraClient = null;
            this._joinedChannel = null;
        }

        try {
            // Fetch dynamic token from Firebase
            let localUid = Math.floor(Math.random() * 100000) + 1;
            const tokenData = await MediaRepository.generateAgoraToken({ channelName: channel, role: 'subscriber', uid: localUid });
            const APP_ID = tokenData.appId;
            const token = tokenData.token;
            const uid = tokenData.uid;

            if (!this.agoraClient) {
                this.agoraClient = window.AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
            }

            // Remove any existing listeners first to avoid stacking
            this.agoraClient.removeAllListeners();

            // Continuously monitor connection quality
            this.agoraClient.on("network-quality", (stats) => {
                this.handleNetworkQuality(stats);
            });

            this.agoraClient.on("user-published", async (user, mediaType) => {
                await this.agoraClient.subscribe(user, mediaType);
                if (mediaType === "video") {
                    // Let Agora automatically fall back to the low stream, then audio-only,
                    // when this viewer's downlink quality degrades (adaptive bitrate).
                    try {
                        await this.agoraClient.setStreamFallbackOption(user.uid, 2);
                    } catch (e) { /* Fallback option not critical if it fails */ }

                    const videoTrack = user.videoTrack;
                    let liveDiv = document.getElementById('agora-student-live');
                    if (!liveDiv) {
                        const container = document.getElementById('agora-live-container');
                        if (container) {
                            liveDiv = document.createElement('div');
                            liveDiv.id = 'agora-student-live';
                            liveDiv.style.width = '100%';
                            liveDiv.style.height = '100%';
                            container.appendChild(liveDiv);
                        }
                    }
                    if (liveDiv) {
                        videoTrack.play(liveDiv.id);
                    }
                }
                if (mediaType === "audio") {
                    user.audioTrack.play();
                }
            });

            this.agoraClient.on("user-unpublished", (user) => {
                // handle unpublish if needed
            });

            await this.agoraClient.join(APP_ID, channel, token, uid);
            this._joinedChannel = channel;
            console.log("[MediaEngine] Successfully joined channel:", channel);
        } catch (error) {
            console.error("[MediaEngine] Failed to join live stream:", error);
            this._joinedChannel = null;
        }
    },
    
    async startAudioOnlyWebRTC(courseId) {
        if (!window.AgoraRTC) {
            this.showError("مكتبة البث (Agora) غير متوفرة.");
            return;
        }

        if (this._isPublishing) {
            console.warn("[MediaEngine] Already publishing, ignoring duplicate call.");
            return;
        }
        
        this._isPublishing = true;

        // Ensure any existing client is disconnected
        if (this.agoraClient) {
            try { await this.agoraClient.leave(); } catch (e) {}
            this.agoraClient = null;
            this._joinedChannel = null;
        }

        this.showLoader('جاري الاتصال بالبث الصوتي...');

        // Explicit permission check for microphone
        let permStream = null;
        try {
            permStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            permStream.getTracks().forEach(t => t.stop());
        } catch (permErr) {
            this._isPublishing = false;
            this.hideLoader();
            let permMsg = "تعذر الوصول إلى الميكروفون.";
            if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
                permMsg = "❌ تم رفض صلاحية الوصول للميكروفون.\n\nيرجى السماح بالوصول للميكروفون من إعدادات المتصفح لبدء البث.";
            } else if (permErr.name === 'NotFoundError') {
                permMsg = "❌ لم يتم العثور على ميكروفون. تأكد من توصيل الجهاز.";
            } else if (permErr.name === 'NotReadableError') {
                permMsg = "❌ الميكروفون مستخدم من تطبيق آخر. أغلقه وحاول مرة أخرى.";
            }
            this.showError(permMsg);
            alert(permMsg);
            return;
        }
        
        try {
            // Fetch dynamic token from Firebase
            let localUid = Math.floor(Math.random() * 100000) + 1;
            const tokenData = await MediaRepository.generateAgoraToken({ channelName: courseId, role: 'publisher', uid: localUid });
            
            const APP_ID = tokenData.appId;
            const token = tokenData.token;
            const channel = tokenData.channel;
            const uid = tokenData.uid;
            
            this.agoraClient = window.AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
            
            await this.agoraClient.join(APP_ID, channel, token, uid);
            this._joinedChannel = channel;
            
            // Create only audio track
            this.localTracks.audio = await window.AgoraRTC.createMicrophoneAudioTrack({
                AEC: true,
                ANS: true,
                AGC: true
            });
            await this.agoraClient.publish([this.localTracks.audio]);
            
            this.hideLoader();
            
        } catch (error) {
            console.error("[MediaEngine] Audio WebRTC Error:", error);
            this._isPublishing = false;
            this.hideLoader();
            this.showError("فشل في بدء البث الصوتي. " + (error.message || ""));
        }
    },

    async leaveLiveWebRTC() {
        if (this.agoraClient) {
            try {
                this.agoraClient.removeAllListeners();
                await this.agoraClient.leave();
            } catch (e) {}
            this.agoraClient = null;
        }
        this._joinedChannel = null;
        this._isPublishing = false;
        const liveDiv = document.getElementById('agora-student-live');
        if (liveDiv) liveDiv.remove();
    },

    async stopLiveWebRTC(courseId) {
        // ── 1. Stop the local recording ──────────────────────────────────────────
        const saveRecording = () => new Promise(resolve => {
            if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
                resolve(null);
                return;
            }
            this.mediaRecorder.onstop = async () => {
                try {
                    const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
                    this.recordedChunks = [];
                    resolve(blob);
                } catch (e) {
                    console.error('[MediaEngine] Failed to build recording blob:', e);
                    resolve(null);
                }
            };
            this.mediaRecorder.stop();
        });

        const recordingBlob = await saveRecording();
        this.mediaRecorder = null;

        // ── 2. Stop Agora tracks ─────────────────────────────────────────────────
        if (this.localTracks.audio) {
            this.localTracks.audio.close();
            this.localTracks.audio = null;
        }
        if (this.localTracks.video) {
            this.localTracks.video.close();
            this.localTracks.video = null;
        }
        if (this.agoraClient) {
            try {
                this.agoraClient.removeAllListeners();
                await this.agoraClient.leave();
            } catch(e) {}
            this.agoraClient = null;
        }
        // Reset state flags so instructor can re-broadcast
        this._isPublishing = false;
        this._joinedChannel = null;

        const liveDiv = document.getElementById('agora-local-live');
        if (liveDiv) liveDiv.style.display = 'none';

        const btnStartAgora = document.getElementById('btn-start-agora');
        if (btnStartAgora) btnStartAgora.style.display = 'block';
        const btnStopAgora = document.getElementById('btn-stop-agora');
        if (btnStopAgora) btnStopAgora.style.display = 'none';
        // ── 3. Upload recording and link to current lesson ────────────────────────
        if (recordingBlob) {
            NotificationManager.show('جاري رفع تسجيل المحاضرة... انتظر لحظة', 'info', 8000);

            try {
                const lessonId = CurriculumController.cache?.currentLessonId;

                const timestamp = Date.now();
                const downloadUrl = await MediaRepository.uploadRecording(courseId, lessonId, timestamp, recordingBlob);

                // Attach recording to the lesson document as a resource
                if (lessonId) {
                    await MediaRepository.attachRecordingToLesson(lessonId, downloadUrl, timestamp);
                    console.log('[MediaEngine] Recording saved to lesson:', lessonId, downloadUrl);
                }

                NotificationManager.show('✅ تم حفظ تسجيل المحاضرة ورفعه للطلاب!', 'success', 6000);
            } catch (uploadErr) {
                console.error('[MediaEngine] Failed to upload recording:', uploadErr);
                NotificationManager.show('⚠️ فشل رفع التسجيل. تحقق من الاتصال.', 'warning', 6000);
            }
        }

        NotificationManager.show('تم إنهاء البث المباشر', 'info');
    },
    
    toggleMic() {
        if (this.localTracks.audio) {
            const isMuted = !this.localTracks.audio.muted;
            this.localTracks.audio.setMuted(isMuted);
            return isMuted;
        }
        return false;
    },
    
    async switchCamera() {
        if (this.localTracks.video) {
            const devices = await window.AgoraRTC.getCameras();
            if (devices.length > 1) {
                // Simplified switch, usually we find 'facingMode' but Agora SDK 4.x handles it mostly via setDevice
                const currentId = this.localTracks.video.getTrackLabel();
                const nextDevice = devices.find(d => d.label !== currentId) || devices[0];
                await this.localTracks.video.setDevice(nextDevice.deviceId);
            }
        }
    },

    async playRecordedVideo(url) {
        return new Promise((resolve) => {
            const container = this.transitionToContainer('mode-recorded-video');
            container.innerHTML = `
                <video id="recorded-player" controls playsinline preload="metadata" style="width:100%; height:100%; object-fit:contain; background:#000;">
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
