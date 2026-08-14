/**
 * InstructorUI.js
 * Renders the instructor control center in the DOM and binds event listeners.
 * Each teaching mode has its own dedicated workspace panel.
 */

/**
 * RoomConfirmDialog
 * Lightweight replacement for window.confirm() / window.alert().
 */
const RoomConfirmDialog = {
    show({ icon = '📢', title = 'تأكيد', body = '', okLabel = 'تأكيد', cancelLabel = 'إلغاء', danger = false } = {}) {
        return new Promise((resolve) => {
            const overlay = document.getElementById('room-confirm-overlay');
            const iconEl  = document.getElementById('confirm-icon');
            const titleEl = document.getElementById('confirm-title');
            const bodyEl  = document.getElementById('confirm-body');
            const okBtn   = document.getElementById('confirm-ok-btn');
            const cancelBtn = document.getElementById('confirm-cancel-btn');

            if (!overlay) { resolve(true); return; }

            if (iconEl)  iconEl.textContent  = icon;
            if (titleEl) titleEl.textContent = title;
            if (bodyEl)  bodyEl.textContent  = body;
            if (okBtn)   okBtn.textContent   = okLabel;
            if (cancelBtn) cancelBtn.textContent = cancelLabel;

            if (okBtn) {
                okBtn.className = danger ? 'btn-confirm-ok danger-ok' : 'btn-confirm-ok';
            }

            const cleanup = (result) => {
                overlay.classList.remove('active');
                okBtn.onclick = null;
                cancelBtn.onclick = null;
                resolve(result);
            };

            okBtn.onclick = () => cleanup(true);
            cancelBtn.onclick = () => cleanup(false);
            overlay.onclick = (e) => { if (e.target === overlay) cleanup(false); };

            overlay.classList.add('active');
        });
    },

    alert({ icon = 'ℹ️', title = 'تنبيه', body = '', okLabel = 'حسناً' } = {}) {
        return new Promise((resolve) => {
            const overlay = document.getElementById('room-confirm-overlay');
            if (!overlay) { resolve(); return; }

            document.getElementById('confirm-icon').textContent  = icon;
            document.getElementById('confirm-title').textContent = title;
            document.getElementById('confirm-body').textContent  = body;
            document.getElementById('confirm-ok-btn').textContent = okLabel;
            document.getElementById('confirm-cancel-btn').style.display = 'none';

            const okBtn = document.getElementById('confirm-ok-btn');
            okBtn.className = 'btn-confirm-ok';

            const cleanup = () => {
                overlay.classList.remove('active');
                okBtn.onclick = null;
                document.getElementById('confirm-cancel-btn').style.display = '';
                resolve();
            };
            okBtn.onclick = () => cleanup();
            overlay.onclick = (e) => { if (e.target === overlay) cleanup(); };
            overlay.classList.add('active');
        });
    }
};

const RoomPromptDialog = {
    show({ title = 'بيانات الدرس', body = 'يرجى إدخال عنوان وتفاصيل الدرس الجديد', okLabel = 'حفظ', cancelLabel = 'إلغاء' } = {}) {
        return new Promise((resolve) => {
            const overlay = document.getElementById('room-prompt-overlay');
            const titleEl = document.getElementById('prompt-title');
            const bodyEl  = document.getElementById('prompt-body');
            const inputTitle = document.getElementById('prompt-input-title');
            const inputDesc = document.getElementById('prompt-input-desc');
            const okBtn   = document.getElementById('prompt-ok-btn');
            const cancelBtn = document.getElementById('prompt-cancel-btn');

            if (!overlay) { resolve({ title: null, description: null }); return; }

            if (titleEl) titleEl.textContent = title;
            if (bodyEl)  bodyEl.textContent  = body;
            if (okBtn)   okBtn.textContent   = okLabel;
            if (cancelBtn) cancelBtn.textContent = cancelLabel;

            inputTitle.value = '';
            inputDesc.value = '';

            const cleanup = (isOk) => {
                overlay.classList.remove('active');
                okBtn.onclick = null;
                cancelBtn.onclick = null;
                
                if (isOk) {
                    resolve({
                        title: inputTitle.value.trim() || null,
                        description: inputDesc.value.trim() || ''
                    });
                } else {
                    resolve({ title: null, description: null });
                }
            };

            okBtn.onclick = () => cleanup(true);
            cancelBtn.onclick = () => cleanup(false);
            // overlay.onclick = (e) => { if (e.target === overlay) cleanup(false); }; // Prevent closing by clicking outside to enforce input

            overlay.classList.add('active');
            inputTitle.focus();
        });
    }
};

// Expose globally so ResourceManager.js can use it for delete confirmations
window.RoomConfirmDialog = RoomConfirmDialog;
window.RoomPromptDialog = RoomPromptDialog;

export class InstructorUIClass {
    init(controller) {
        this.controller = controller;
        this.cacheDOM();
        this.renderDashboardLayout();
        this.attachListeners();
    }

    cacheDOM() {
        this.mountPoint = document.getElementById('instructor-dashboard-mount');
        this.tabBtn = document.getElementById('tab-btn-instructor-side');
    }

    renderDashboardLayout() {
        if (!this.mountPoint) return;

        // Unhide the instructor tab button
        if (this.tabBtn) this.tabBtn.style.display = 'flex';

        this.mountPoint.innerHTML = `
            <div class="instructor-workspace" style="display: flex; flex-direction: column; height: 100%; gap: 0; overflow: hidden;">

                <!-- ══ Top Navigation Tabs ══ -->
                <div style="display: flex; gap: 0.3rem; padding: 0.7rem 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.07); background: rgba(0,0,0,0.15); flex-shrink: 0; overflow-x: auto; scrollbar-width: none;">
                    <button class="inst-nav btn btn-sm btn-primary" data-view="dashboard" style="border-radius: 20px; padding: 0.35rem 0.9rem; white-space: nowrap; font-size: 0.82rem;">
                        <i class="fas fa-sliders-h"></i> التحكم
                    </button>
                    <button class="inst-nav btn btn-sm btn-dark" data-view="students" style="border-radius: 20px; padding: 0.35rem 0.9rem; white-space: nowrap; font-size: 0.82rem;">
                        <i class="fas fa-users"></i> الطلاب
                    </button>
                    <button class="inst-nav btn btn-sm btn-dark" data-view="resources" style="border-radius: 20px; padding: 0.35rem 0.9rem; white-space: nowrap; font-size: 0.82rem;">
                        <i class="fas fa-folder-open"></i> الموارد
                    </button>
                    <button class="inst-nav btn btn-sm btn-dark" data-view="profile" style="border-radius: 20px; padding: 0.35rem 0.9rem; white-space: nowrap; font-size: 0.82rem;">
                        <i class="fas fa-user-tie"></i> ملفي
                    </button>
                </div>

                <!-- ══ Scrollable Views Container ══ -->
                <div style="flex: 1; overflow-y: auto; overflow-x: hidden;">

                    <!-- ═══════════════════════════════════════
                         VIEW 1: CONTROL CENTER (DASHBOARD)
                         ═══════════════════════════════════════ -->
                    <div id="inst-view-dashboard" class="inst-view" style="display: flex; flex-direction: column; gap: 1rem; padding: 0.9rem;">

                        <!-- Stats Strip -->
                        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 0.75rem 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
                            <div>
                                <div style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.2rem;">متصل الآن</div>
                                <div style="display: flex; align-items: center; gap: 0.4rem;">
                                    <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981; animation: pulse 2s infinite;"></div>
                                    <span id="inst-stat-online" style="font-size: 1.5rem; font-weight: bold; color: white; line-height: 1;">0</span>
                                    <span style="color: var(--text-secondary); font-size: 0.82rem;">طالب</span>
                                </div>
                            </div>
                            <button class="btn btn-danger btn-sm" onclick="window.InstructorAPI.endCurrentLesson()" style="border-radius: 8px; font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                                <i class="fas fa-flag-checkered"></i> إنهاء الدرس
                            </button>
                        </div>

                        <!-- ══ Teaching Mode Selector ══ -->
                        <div>
                            <div style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.4rem;">
                                <i class="fas fa-chalkboard-teacher" style="color: var(--primary-color);"></i> وضع التدريس
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.4rem;">
                                <!-- Video Mode Button -->
                                <button class="inst-mode-btn" data-mode="video" onclick="window.InstructorAPI.setMode('video')"
                                    style="display:flex;flex-direction:column;align-items:center;gap:0.3rem;padding:0.75rem 0.2rem;border-radius:10px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.03);cursor:pointer;transition:all 0.2s;font-size:0.68rem;color:var(--text-secondary);font-family:var(--font-ar);">
                                    <i class="fas fa-video" style="font-size:1.1rem;color:#60a5fa;"></i>
                                    <span>فيديو</span>
                                </button>
                                <!-- Live Mode Button -->
                                <button class="inst-mode-btn" data-mode="live" onclick="window.InstructorAPI.setMode('live')"
                                    style="display:flex;flex-direction:column;align-items:center;gap:0.3rem;padding:0.75rem 0.2rem;border-radius:10px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.03);cursor:pointer;transition:all 0.2s;font-size:0.68rem;color:var(--text-secondary);font-family:var(--font-ar);">
                                    <i class="fas fa-satellite-dish" style="font-size:1.1rem;color:#f87171;"></i>
                                    <span>بث حي</span>
                                </button>
                                <!-- Slides Mode Button -->
                                <button class="inst-mode-btn" data-mode="slides" onclick="window.InstructorAPI.setMode('slides')"
                                    style="display:flex;flex-direction:column;align-items:center;gap:0.3rem;padding:0.75rem 0.2rem;border-radius:10px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.03);cursor:pointer;transition:all 0.2s;font-size:0.68rem;color:var(--text-secondary);font-family:var(--font-ar);">
                                    <i class="fas fa-images" style="font-size:1.1rem;color:#34d399;"></i>
                                    <span>شرائح</span>
                                </button>
                                <!-- Audio Mode Button -->
                                <button class="inst-mode-btn" data-mode="audio" onclick="window.InstructorAPI.setMode('audio')"
                                    style="display:flex;flex-direction:column;align-items:center;gap:0.3rem;padding:0.75rem 0.2rem;border-radius:10px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.03);cursor:pointer;transition:all 0.2s;font-size:0.68rem;color:var(--text-secondary);font-family:var(--font-ar);">
                                    <i class="fas fa-podcast" style="font-size:1.1rem;color:#a78bfa;"></i>
                                    <span>صوت</span>
                                </button>
                                <!-- Channel Mode Button -->
                                <button class="inst-mode-btn" data-mode="channel" onclick="window.InstructorAPI.setMode('channel')"
                                    style="display:flex;flex-direction:column;align-items:center;gap:0.3rem;padding:0.75rem 0.2rem;border-radius:10px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.03);cursor:pointer;transition:all 0.2s;font-size:0.68rem;color:var(--text-secondary);font-family:var(--font-ar);">
                                    <i class="fas fa-bullhorn" style="font-size:1.1rem;color:#fbbf24;"></i>
                                    <span>قناة</span>
                                </button>
                            </div>
                        </div>

                        <!-- ══════════════════════════════════════════════════
                             MODE WORKSPACES — each mode gets its own section
                             ══════════════════════════════════════════════════ -->

                        <!-- ─── VIDEO MODE WORKSPACE ─── -->
                        <div id="mode-ws-video" class="mode-workspace"
                            style="background: linear-gradient(135deg, rgba(96,165,250,0.06) 0%, rgba(15,23,42,0.4) 100%); border: 1px solid rgba(96,165,250,0.25); border-radius: 14px; overflow: hidden;">
                            <!-- Header -->
                            <div style="background: rgba(96,165,250,0.1); padding: 0.75rem 1rem; display: flex; align-items: center; gap: 0.5rem; border-bottom: 1px solid rgba(96,165,250,0.15);">
                                <i class="fas fa-video" style="color: #60a5fa;"></i>
                                <span style="font-weight: bold; font-size: 0.9rem; color: #60a5fa;">إدارة الفيديو</span>
                            </div>
                            <div style="padding: 0.9rem;">


                                <!-- Recorded Panel -->
                                <div id="v-panel-recorded">
                                    <button class="btn btn-sm btn-dark" id="btn-video-upload" onclick="window.InstructorAPI.promptVideoUpload()"
                                        style="width: 100%; margin-bottom: 0.6rem; border-radius: 8px; border: 1px dashed rgba(96,165,250,0.4);">
                                        <i class="fas fa-cloud-upload-alt" style="color:#60a5fa;"></i> رفع فيديو
                                    </button>
                                    <div style="display: flex; gap: 0.4rem; margin-bottom: 0.6rem;">
                                        <button class="btn btn-sm btn-dark" onclick="window.InstructorAPI.playVideo()" style="flex:1;color:#34d399;border-radius:8px;">
                                            <i class="fas fa-play"></i> تشغيل
                                        </button>
                                        <button class="btn btn-sm btn-dark" onclick="window.InstructorAPI.pauseVideo()" style="flex:1;color:#fbbf24;border-radius:8px;">
                                            <i class="fas fa-pause"></i> إيقاف
                                        </button>
                                    </div>
                                    <!-- Video Management Panel (shown after upload) -->
                                    <div id="video-management-panel" style="display:none; background:rgba(0,0,0,0.3);border-radius:10px;border:1px solid rgba(96,165,250,0.25);padding:0.75rem;animation:fadeIn 0.3s ease;">
                                        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
                                            <i class="fas fa-film" style="color:#60a5fa;font-size:0.85rem;"></i>
                                            <span id="current-video-name" style="font-size:0.8rem;color:var(--text-secondary);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">فيديو محمّل</span>
                                            <span style="font-size:0.7rem;background:rgba(52,211,153,0.15);color:#34d399;padding:0.15rem 0.5rem;border-radius:99px;border:1px solid rgba(52,211,153,0.3);">✔ مرفوع</span>
                                        </div>
                                        <video id="current-video-preview" controls muted style="width:100%;border-radius:8px;max-height:110px;background:#000;margin-bottom:0.5rem;" preload="metadata"></video>
                                        <div style="display:flex;gap:0.4rem;">
                                            <button class="btn btn-sm" onclick="window.InstructorAPI.replaceVideo()" style="flex:1;border-radius:7px;background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.3);color:#fbbf24;font-size:0.78rem;">
                                                <i class="fas fa-exchange-alt"></i> تغيير
                                            </button>
                                            <button class="btn btn-sm" onclick="window.InstructorAPI.deleteVideo()" style="flex:1;border-radius:7px;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);color:#f87171;font-size:0.78rem;">
                                                <i class="fas fa-trash"></i> حذف
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <!-- ─── LIVE MODE WORKSPACE ─── -->
                        <div id="mode-ws-live" class="mode-workspace"
                            style="display:none; background: linear-gradient(135deg, rgba(248,113,113,0.06) 0%, rgba(15,23,42,0.4) 100%); border: 1px solid rgba(248,113,113,0.25); border-radius: 14px; overflow: hidden;">
                            <!-- Header -->
                            <div style="background:rgba(248,113,113,0.12);padding:0.75rem 1rem;display:flex;align-items:center;gap:0.5rem;border-bottom:1px solid rgba(248,113,113,0.2);">
                                <i class="fas fa-satellite-dish" style="color:#f87171;"></i>
                                <span style="font-weight:bold;font-size:0.9rem;color:#f87171;">البث المباشر</span>
                                <span id="live-on-badge" style="display:none;margin-right:auto;background:#ef4444;color:white;font-size:0.65rem;padding:0.15rem 0.5rem;border-radius:99px;font-weight:bold;animation:pulse 1s infinite;">● LIVE</span>
                            </div>
                            <div style="padding:0.9rem;">
                                <!-- Status indicator -->
                                <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:1.2rem;text-align:center;margin-bottom:1rem;">
                                    <i class="fas fa-satellite-dish" style="font-size:2.5rem;color:#f87171;margin-bottom:0.5rem;display:block;"></i>
                                    <div id="live-ws-status" style="font-size:0.85rem;color:var(--text-secondary);">البث غير نشط حالياً</div>
                                    <div id="live-ws-timer" style="font-size:1.8rem;font-weight:bold;font-family:monospace;color:#f87171;margin-top:0.3rem;display:none;">00:00</div>
                                </div>
                                <!-- Start / Stop buttons -->
                                <button id="btn-start-agora-live" onclick="window.InstructorAPI.startAgoraLiveDedicated()" style="width:100%;margin-bottom:0.6rem;border-radius:10px;padding:0.75rem;background:linear-gradient(135deg,#f87171,#ef4444);border:none;color:white;font-weight:bold;font-size:0.9rem;cursor:pointer;">
                                    <i class="fas fa-satellite-dish"></i> بدء البث الحي
                                </button>
                                <button id="btn-stop-agora-live" onclick="window.InstructorAPI.stopAgoraLiveDedicated()" style="display:none;width:100%;margin-bottom:0.6rem;border-radius:10px;padding:0.75rem;background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.4);color:#f87171;font-weight:bold;font-size:0.9rem;cursor:pointer;">
                                    <i class="fas fa-stop-circle"></i> إنهاء البث
                                </button>
                                <!-- Mic / Camera controls -->
                                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-top:0.4rem;">
                                    <button class="btn btn-sm btn-dark" id="btn-live-mic" onclick="window.InstructorAPI.toggleAgoraMic()" style="border-radius:8px;">
                                        <i class="fas fa-microphone"></i> المايك
                                    </button>
                                    <button class="btn btn-sm btn-dark" id="btn-live-cam" onclick="window.InstructorAPI.switchAgoraCamera()" style="border-radius:8px;">
                                        <i class="fas fa-sync-alt"></i> الكاميرا
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- ─── SLIDES MODE WORKSPACE ─── -->
                        <div id="mode-ws-slides" class="mode-workspace"
                            style="display:none; background: linear-gradient(135deg, rgba(52,211,153,0.06) 0%, rgba(15,23,42,0.4) 100%); border: 1px solid rgba(52,211,153,0.25); border-radius: 14px; overflow: hidden;">
                            <!-- Header -->
                            <div style="background:rgba(52,211,153,0.1);padding:0.75rem 1rem;display:flex;align-items:center;gap:0.5rem;border-bottom:1px solid rgba(52,211,153,0.2);">
                                <i class="fas fa-images" style="color:#34d399;"></i>
                                <span style="font-weight:bold;font-size:0.9rem;color:#34d399;">إدارة الشرائح</span>
                            </div>
                            <div style="padding:0.9rem;display:flex;flex-direction:column;gap:0.75rem;">
                                <!-- Upload Button -->
                                <button class="btn btn-sm btn-dark" onclick="document.getElementById('inst-slides-upload').click()"
                                    style="width:100%;border-radius:8px;border:1px dashed rgba(52,211,153,0.4);padding:0.6rem;">
                                    <i class="fas fa-cloud-upload-alt" style="color:#34d399;"></i> إضافة صور للمعرض
                                </button>
                                <input type="file" id="inst-slides-upload" multiple accept="image/*" style="display:none;" onchange="window.InstructorAPI.uploadSlides(event)">

                                <!-- Gallery -->
                                <div id="inst-slides-gallery"
                                    style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.4rem;max-height:150px;overflow-y:auto;background:rgba(0,0,0,0.2);border-radius:8px;padding:0.4rem;min-height:40px;">
                                    <!-- Images injected by JS -->
                                </div>

                                <!-- Layout Selector -->
                                <div>
                                    <label style="font-size:0.78rem;color:var(--text-secondary);display:block;margin-bottom:0.3rem;">قالب العرض:</label>
                                    <select id="inst-slides-layout" class="form-input" style="width:100%;padding:0.4rem 0.6rem;font-size:0.82rem;" onchange="window.InstructorAPI.handleSlideLayoutChange(event)">
                                        <option value="slides-layout-1">صورة واحدة (Full)</option>
                                        <option value="slides-layout-2">صورتان (1×2)</option>
                                        <option value="slides-layout-3">٣ صور (كبيرة + ٢ صغار)</option>
                                        <option value="slides-layout-4">٤ صور (شبكة 2×2)</option>
                                        <option value="slides-layout-5">٥ صور (شبكة 3×2)</option>
                                    </select>
                                </div>

                                <!-- Present Button -->
                                <button onclick="window.InstructorAPI.presentSelectedSlides()"
                                    style="width:100%;border-radius:8px;padding:0.65rem;background:linear-gradient(135deg,#34d399,#10b981);border:none;color:#0f172a;font-weight:bold;font-size:0.88rem;cursor:pointer;">
                                    <i class="fas fa-tv"></i> عرض الصور المحددة
                                </button>

                                <!-- Audio Controls -->
                                <div style="display:flex;gap:0.4rem;">
                                    <button class="btn btn-sm btn-dark" id="btn-slides-mic-start" onclick="window.InstructorAPI.startSlidesAudio()"
                                        style="flex:1;border-radius:8px;color:#a78bfa;border-color:rgba(167,139,250,0.3);">
                                        <i class="fas fa-microphone"></i> بدء الشرح الصوتي
                                    </button>
                                    <button class="btn btn-sm btn-danger" id="btn-slides-mic-stop" onclick="window.InstructorAPI.stopSlidesAudio()"
                                        style="display:none;flex:1;border-radius:8px;">
                                        <i class="fas fa-microphone-slash"></i> إيقاف الصوت
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- ─── AUDIO MODE WORKSPACE ─── -->
                        <div id="mode-ws-audio" class="mode-workspace"
                            style="display:none; background: linear-gradient(135deg, rgba(167,139,250,0.06) 0%, rgba(15,23,42,0.4) 100%); border: 1px solid rgba(167,139,250,0.25); border-radius: 14px; overflow: hidden;">
                            <!-- Header -->
                            <div style="background:rgba(167,139,250,0.1);padding:0.75rem 1rem;display:flex;align-items:center;gap:0.5rem;border-bottom:1px solid rgba(167,139,250,0.2);">
                                <i class="fas fa-podcast" style="color:#a78bfa;"></i>
                                <span style="font-weight:bold;font-size:0.9rem;color:#a78bfa;">البث الصوتي فقط</span>
                            </div>
                            <div style="padding:0.9rem;">
                                <!-- Status -->
                                <div style="text-align:center;background:rgba(0,0,0,0.3);border-radius:12px;padding:1.5rem;margin-bottom:1rem;">
                                    <div id="audio-mic-icon" style="font-size:3rem;color:#a78bfa;margin-bottom:0.5rem;">
                                        <i class="fas fa-podcast"></i>
                                    </div>
                                    <div id="audio-ws-status" style="font-size:0.85rem;color:var(--text-secondary);">البث الصوتي غير نشط</div>
                                    <div id="audio-ws-timer" style="font-size:1.6rem;font-weight:bold;font-family:monospace;color:#a78bfa;margin-top:0.3rem;display:none;">00:00</div>
                                </div>
                                <!-- Start / Stop -->
                                <button id="btn-audio-start" onclick="window.InstructorAPI.startAudioOnly()"
                                    style="width:100%;margin-bottom:0.5rem;border-radius:10px;padding:0.75rem;background:linear-gradient(135deg,#a78bfa,#7c3aed);border:none;color:white;font-weight:bold;font-size:0.9rem;cursor:pointer;">
                                    <i class="fas fa-microphone"></i> بدء البث الصوتي
                                </button>
                                <button id="btn-audio-stop" onclick="window.InstructorAPI.stopAudioOnly()"
                                    style="display:none;width:100%;border-radius:10px;padding:0.75rem;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.4);color:#f87171;font-weight:bold;font-size:0.9rem;cursor:pointer;">
                                    <i class="fas fa-stop-circle"></i> إيقاف البث الصوتي
                                </button>
                            </div>
                        </div>

                        <!-- ─── CHANNEL MODE WORKSPACE ─── -->
                        <div id="mode-ws-channel" class="mode-workspace"
                            style="display:none; background: linear-gradient(135deg, rgba(251,191,36,0.06) 0%, rgba(15,23,42,0.4) 100%); border: 1px solid rgba(251,191,36,0.25); border-radius: 14px; overflow: hidden;">
                            <!-- Header -->
                            <div style="background:rgba(251,191,36,0.1);padding:0.75rem 1rem;display:flex;align-items:center;gap:0.5rem;border-bottom:1px solid rgba(251,191,36,0.2);">
                                <i class="fas fa-bullhorn" style="color:#fbbf24;"></i>
                                <span style="font-weight:bold;font-size:0.9rem;color:#fbbf24;">قناة البث للطلاب</span>
                            </div>
                            <div style="padding:0.9rem;display:flex;flex-direction:column;gap:0.75rem;">
                                <!-- Text Message -->
                                <div>
                                    <textarea id="inst-channel-text" class="form-input"
                                        style="width:100%;height:80px;padding:0.6rem;resize:none;font-size:0.88rem;border-radius:8px;font-family:var(--font-ar);"
                                        placeholder="اكتب رسالتك للطلاب..."></textarea>
                                    <button onclick="window.InstructorAPI.sendChannelMessage()"
                                        style="width:100%;margin-top:0.4rem;border-radius:8px;padding:0.6rem;background:linear-gradient(135deg,#fbbf24,#f59e0b);border:none;color:#0f172a;font-weight:bold;font-size:0.88rem;cursor:pointer;">
                                        <i class="fas fa-paper-plane"></i> إرسال النص
                                    </button>
                                </div>
                                <!-- Divider -->
                                <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:0.6rem;">
                                    <div style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:0.5rem;text-align:center;">— إرسال مرفقات —</div>
                                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.5rem;">
                                        <!-- Image -->
                                        <button onclick="document.getElementById('inst-channel-image').click()"
                                            style="display:flex;flex-direction:column;align-items:center;gap:0.3rem;padding:0.7rem 0.3rem;border-radius:10px;background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.2);cursor:pointer;font-size:0.72rem;color:#34d399;font-family:var(--font-ar);">
                                            <i class="fas fa-image" style="font-size:1.3rem;"></i>
                                            <span>صورة</span>
                                        </button>
                                        <input type="file" id="inst-channel-image" accept="image/*" style="display:none;" onchange="window.InstructorAPI.sendChannelImage(event)">

                                        <!-- Video -->
                                        <button onclick="document.getElementById('inst-channel-video').click()"
                                            style="display:flex;flex-direction:column;align-items:center;gap:0.3rem;padding:0.7rem 0.3rem;border-radius:10px;background:rgba(96,165,250,0.1);border:1px solid rgba(96,165,250,0.2);cursor:pointer;font-size:0.72rem;color:#60a5fa;font-family:var(--font-ar);">
                                            <i class="fas fa-video" style="font-size:1.3rem;"></i>
                                            <span>فيديو</span>
                                        </button>
                                        <input type="file" id="inst-channel-video" accept="video/*" style="display:none;" onchange="window.InstructorAPI.sendChannelVideo(event)">

                                        <!-- Voice Recording -->
                                        <button id="btn-channel-voice" onclick="window.InstructorAPI.toggleChannelVoice()"
                                            style="display:flex;flex-direction:column;align-items:center;gap:0.3rem;padding:0.7rem 0.3rem;border-radius:10px;background:rgba(167,139,250,0.1);border:1px solid rgba(167,139,250,0.2);cursor:pointer;font-size:0.72rem;color:#a78bfa;font-family:var(--font-ar);">
                                            <i class="fas fa-microphone" style="font-size:1.3rem;"></i>
                                            <span>تسجيل</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ══ Room Management Section ══ -->
                        <div>
                            <div style="font-size:0.72rem;color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px;margin-bottom:0.6rem;display:flex;align-items:center;gap:0.4rem;">
                                <i class="fas fa-cogs" style="color:var(--primary-color);"></i> إدارة الغرفة
                            </div>
                            <div style="display:flex;flex-direction:column;gap:0.5rem;">
                                <div style="background:rgba(255,255,255,0.02);padding:0.75rem 1rem;border:1px solid rgba(255,255,255,0.06);border-radius:10px;display:flex;justify-content:space-between;align-items:center;">
                                    <span style="font-size:0.85rem;"><i class="fas fa-comment-slash" style="color:var(--text-secondary);margin-left:0.4rem;"></i> إغلاق الدردشة</span>
                                    <label class="switch"><input type="checkbox" id="inst-toggle-chat"><span class="slider"></span></label>
                                </div>
                                <div style="background:rgba(255,255,255,0.02);padding:0.75rem 1rem;border:1px solid rgba(255,255,255,0.06);border-radius:10px;display:flex;justify-content:space-between;align-items:center;">
                                    <span style="font-size:0.85rem;"><i class="fas fa-lock" style="color:var(--text-secondary);margin-left:0.4rem;"></i> منع تحميل الموارد</span>
                                    <label class="switch"><input type="checkbox" id="inst-toggle-resources"><span class="slider"></span></label>
                                </div>
                            </div>
                        </div>

                    </div> <!-- end inst-view-dashboard -->


                    <!-- ═══════════════════════════════════════
                         VIEW 2: STUDENTS MANAGEMENT
                         ═══════════════════════════════════════ -->
                    <div id="inst-view-students" class="inst-view" style="display:none;padding:0.9rem;">
                        <h3 style="font-size:1rem;margin-bottom:1rem;">
                            <i class="fas fa-users" style="color:var(--primary-color);"></i> إدارة الطلاب
                        </h3>
                        <div id="instructor-student-list" style="display: flex; flex-direction: column; gap: 0.8rem;">
                            <div style="text-align:center;padding:2rem;color:var(--text-secondary);background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;">جاري التحميل...</div>
                        </div>
                    </div>


                    <!-- ═══════════════════════════════════════
                         VIEW 3: RESOURCES MANAGEMENT
                         ═══════════════════════════════════════ -->
                     <div id="inst-view-resources" class="inst-view" style="display:none; flex-direction:column; height:100%; overflow:hidden;">
                        
                        <!-- Section Header -->
                        <div style="padding: 0.75rem 0.9rem 0.5rem; flex-shrink:0; border-bottom: 1px solid rgba(255,255,255,0.06); display:flex; align-items:center; gap:0.5rem;">
                            <i class="fas fa-folder-open" style="color:var(--primary-color); font-size:0.9rem;"></i>
                            <span style="font-size:0.88rem; font-weight:600;">إدارة الموارد</span>
                        </div>

                        <!-- Scrollable Content Area -->
                        <div style="flex:1; overflow-y:auto; padding: 0.75rem 0.9rem; display:flex; flex-direction:column; gap: 0.75rem;">

                            <!-- Upload Dropzone (Compact) -->
                            <div id="inst-resource-dropzone" 
                                 onclick="document.getElementById('inst-new-resource-file').click();"
                                 style="display:flex; align-items:center; gap:0.75rem; padding:0.75rem; background:rgba(255,255,255,0.03); border:1.5px dashed rgba(255,255,255,0.18); border-radius:10px; cursor:pointer; transition:all 0.2s;"
                                 onmouseover="this.style.borderColor='var(--primary-color)'; this.style.background='rgba(255,255,255,0.07)';"
                                 onmouseout="this.style.borderColor='rgba(255,255,255,0.18)'; this.style.background='rgba(255,255,255,0.03)';">
                                <i class="fas fa-cloud-upload-alt" style="font-size:1.6rem; color:var(--primary-color); flex-shrink:0;"></i>
                                <div>
                                    <div style="font-size:0.82rem; font-weight:600; margin-bottom:0.1rem;">اختر ملفات أو اسحبها</div>
                                    <div style="font-size:0.7rem; color:var(--text-secondary);">PDF, صور, فيديو, مستندات · أقصى 100MB</div>
                                </div>
                                <input type="file" id="inst-new-resource-file" style="display:none;" multiple>
                            </div>

                            <!-- File Preview (hidden until files selected) -->
                            <div id="inst-resource-preview-container" style="display:none; background:rgba(0,0,0,0.25); border-radius:10px; border:1px solid rgba(255,255,255,0.07); overflow:hidden;">
                                <div style="padding: 0.5rem 0.75rem; background:rgba(255,255,255,0.04); font-size:0.75rem; color:var(--text-secondary); display:flex; align-items:center; gap:0.4rem;">
                                    <i class="fas fa-list"></i> الملفات المختارة
                                </div>
                                <div id="inst-resource-preview-list" style="max-height:120px; overflow-y:auto; padding:0.4rem 0.5rem;"></div>
                                <div style="padding:0.5rem;">
                                    <button id="inst-resource-upload-btn" class="btn btn-primary" style="width:100%; border-radius:8px; font-family:var(--font-ar); font-size:0.85rem; padding:0.5rem;">
                                        <i class="fas fa-upload"></i> بدء الرفع
                                    </button>
                                </div>
                            </div>

                            <!-- Active Upload Queue -->
                            <div id="inst-resource-list" style="display:flex; flex-direction:column; gap:0.4rem;"></div>

                            <!-- ── Published Resources (Instructor view with delete) ── -->
                            <div style="border-top:1px solid rgba(255,255,255,0.06); padding-top:0.6rem;">
                                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.5rem;">
                                    <span style="font-size:0.72rem; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px;">
                                        <i class="fas fa-paperclip" style="margin-left:0.3rem;"></i> الملفات المنشورة
                                    </span>
                                    <span id="inst-res-count-badge" style="font-size:0.68rem; background:rgba(255,255,255,0.08); padding:0.1rem 0.5rem; border-radius:10px; color:var(--text-secondary);">0</span>
                                </div>
                                <div id="inst-uploaded-resources-list" style="display:flex; flex-direction:column; gap:0.4rem;">
                                    <div style="text-align:center; padding:1rem 0; color:var(--text-secondary); font-size:0.8rem;">
                                        <i class="fas fa-inbox" style="font-size:1.5rem; opacity:0.3; display:block; margin-bottom:0.4rem;"></i>
                                        لا توجد ملفات منشورة
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>


                    <!-- ═══════════════════════════════════════
                         VIEW 4: INSTRUCTOR PROFILE
                         ═══════════════════════════════════════ -->
                    <div id="inst-view-profile" class="inst-view" style="display:none;padding:0.9rem;">
                        <h3 style="font-size:1rem;margin-bottom:1rem;">
                            <i class="fas fa-user-tie" style="color:var(--primary-color);"></i> الملف الشخصي
                        </h3>
                        <form id="inst-profile-form" style="display:grid;gap:1rem;background:rgba(255,255,255,0.02);padding:1.2rem;border-radius:12px;border:1px solid rgba(255,255,255,0.06);">
                            <div>
                                <label style="font-size:0.8rem;color:var(--text-secondary);display:block;margin-bottom:0.3rem;">الاسم الكامل</label>
                                <input type="text" id="inst-prof-name" class="form-input" placeholder="الاسم الكامل" style="width:100%;">
                            </div>
                            <div>
                                <label style="font-size:0.8rem;color:var(--text-secondary);display:block;margin-bottom:0.3rem;">التخصص الدقيق</label>
                                <input type="text" id="inst-prof-spec" class="form-input" placeholder="مثال: أستاذ رياضيات" style="width:100%;">
                            </div>
                            <div>
                                <label style="font-size:0.8rem;color:var(--text-secondary);display:block;margin-bottom:0.3rem;">نبذة تعريفية</label>
                                <textarea id="inst-prof-bio" class="form-input" placeholder="تحدث عن خبراتك..." rows="3" style="width:100%;"></textarea>
                            </div>
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.8rem;">
                                <div>
                                    <label style="font-size:0.8rem;color:var(--text-secondary);display:block;margin-bottom:0.3rem;">صورة شخصية</label>
                                    <input type="file" id="inst-prof-photo" class="form-input" accept="image/*" style="width:100%;font-size:0.78rem;padding:0.4rem;">
                                </div>
                                <div>
                                    <label style="font-size:0.8rem;color:var(--text-secondary);display:block;margin-bottom:0.3rem;">السيرة الذاتية (PDF)</label>
                                    <input type="file" id="inst-prof-cv" class="form-input" accept=".pdf" style="width:100%;font-size:0.78rem;padding:0.4rem;">
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary" style="width:100%;border-radius:8px;">
                                <i class="fas fa-save"></i> حفظ البيانات
                            </button>
                        </form>
                    </div>

                </div><!-- end scrollable views container -->

            </div><!-- end instructor-workspace -->
        `;
    }

    // ─── Toggle Video Sub-Tab (Recorded / Live) ─────────────────────────────
    toggleVideoTabUI(tab) {
        const recordedTab = document.getElementById('v-tab-recorded');
        const liveTab     = document.getElementById('v-tab-live');
        if (tab === 'recorded') {
            if (recordedTab) recordedTab.className = 'btn btn-sm btn-primary';
            if (liveTab)     liveTab.className     = 'btn btn-sm btn-dark';
            const rp = document.getElementById('v-panel-recorded');
            const lp = document.getElementById('v-panel-live');
            if (rp) rp.style.display = 'block';
            if (lp) lp.style.display = 'none';
        } else {
            if (recordedTab) recordedTab.className = 'btn btn-sm btn-dark';
            if (liveTab)     liveTab.className     = 'btn btn-sm btn-primary';
            const rp = document.getElementById('v-panel-recorded');
            const lp = document.getElementById('v-panel-live');
            if (rp) rp.style.display = 'none';
            if (lp) lp.style.display = 'block';
        }
    }

    // ─── Switch Active Mode Workspace ───────────────────────────────────────
    _switchModeWorkspace(mode) {
        // Hide all workspaces
        const workspaces = this.mountPoint.querySelectorAll('.mode-workspace');
        workspaces.forEach(ws => ws.style.display = 'none');

        // Show target workspace
        const target = this.mountPoint.querySelector(`#mode-ws-${mode}`);
        if (target) {
            target.style.display = 'block';
            target.style.animation = 'fadeIn 0.25s ease';
        }

        // Update mode button highlight
        const modeBtns = this.mountPoint.querySelectorAll('.inst-mode-btn');
        modeBtns.forEach(b => {
            b.style.borderColor = 'rgba(255,255,255,0.06)';
            b.style.background  = 'rgba(255,255,255,0.03)';
            b.style.color       = 'var(--text-secondary)';
            b.style.transform   = 'scale(1)';
        });
        const activeBtn = this.mountPoint.querySelector(`.inst-mode-btn[data-mode="${mode}"]`);
        if (activeBtn) {
            activeBtn.style.borderColor = 'var(--primary-color)';
            activeBtn.style.background  = 'rgba(99,102,241,0.18)';
            activeBtn.style.color       = 'white';
            activeBtn.style.transform   = 'scale(1.04)';
        }
    }

    // ─── Attach Event Listeners ─────────────────────────────────────────────
    attachListeners() {
        if (!this.mountPoint) return;

        import('../../core/EventBus.js').then(({ eventBus, Events }) => {
            eventBus.subscribe(Events.BROADCAST_STARTED, (payload) => {
                const btnStart = document.getElementById('btn-start-agora-live');
                const btnStop = document.getElementById('btn-stop-agora-live');
                if (btnStart) btnStart.style.display = 'none';
                if (btnStop) btnStop.style.display  = 'block';
                
                const liveBadge = document.getElementById('live-on-badge');
                if (liveBadge) liveBadge.style.display = 'inline';
                
                const liveStatus = document.getElementById('live-ws-status');
                if (liveStatus) liveStatus.textContent  = 'البث نشط الآن';
                
                const btnMic = document.getElementById('float-btn-mic');
                const btnCam = document.getElementById('float-btn-cam');
                const btnFloatStop = document.getElementById('float-btn-stop');
                if (btnMic) btnMic.style.display  = 'inline-flex';
                if (btnCam) btnCam.style.display  = 'inline-flex';
                if (btnFloatStop) btnFloatStop.style.display = 'inline-flex';
                
                this._startTimer('live-ws-timer');
                
                // Show profiling metrics notification to instructor (for auditing/debugging)
                import('../global/NotificationManager.js').then(({ NotificationManager }) => {
                    const m = payload.metrics;
                    const msg = `زمن فتح الكاميرا: ${m.camTime.toFixed(0)}ms | الاتصال: ${m.joinTime.toFixed(0)}ms | النشر: ${m.publishTime.toFixed(0)}ms`;
                    NotificationManager.show(msg, 'info', 5000);
                });
            });
        });

        // ── Expose global InstructorAPI ──
        window.InstructorAPI = {

            // Mode switch
            setMode: (mode) => {
                this.controller.setTeachingMode(mode);
                this._switchModeWorkspace(mode);
                this._updateFloatBar(mode);
            },

            // Lesson management
            endCurrentLesson: async () => {
                const ok = await RoomConfirmDialog.show({
                    icon: '🏁', title: 'إنهاء الدرس الحالي',
                    body: 'هل أنت متأكد من إنهاء الدرس الحالي وبدء دورة درس جديدة؟',
                    okLabel: 'نعم، إنهاء', danger: true
                });
                if (ok) {
                    import('../curriculum/index.js').then(({ CurriculumController }) => CurriculumController.endCurrentLesson());
                }
            },

            // Video sub-tab switch
            toggleVideoTab: (tab) => this.toggleVideoTabUI(tab),

            // Slides controls
            handleSlideLayoutChange: (e) => this.controller.handleSlideLayoutChange(e),
            uploadSlides: (e)           => this.controller.uploadSlides(e),
            presentSelectedSlides: ()   => this.controller.presentSelectedSlides(),

            startSlidesAudio: () => {
                this.controller.startSlidesAudio();
                const floatMicBtn  = document.getElementById('float-btn-mic');
                const floatStopBtn = document.getElementById('float-btn-stop');
                if (floatMicBtn)  floatMicBtn.style.display  = 'inline-flex';
                if (floatStopBtn) floatStopBtn.style.display = 'inline-flex';
            },
            stopSlidesAudio: () => {
                this.controller.stopSlidesAudio();
                const floatMicBtn  = document.getElementById('float-btn-mic');
                const floatStopBtn = document.getElementById('float-btn-stop');
                if (floatMicBtn)  floatMicBtn.style.display  = 'none';
                if (floatStopBtn) floatStopBtn.style.display = 'none';
            },

            // Audio mode controls
            startAudioOnly: () => {
                this.controller.startAudioOnly();
                document.getElementById('audio-ws-status').textContent = 'البث الصوتي نشط الآن...';
                const floatMicBtn  = document.getElementById('float-btn-mic');
                const floatStopBtn = document.getElementById('float-btn-stop');
                if (floatMicBtn)  floatMicBtn.style.display  = 'inline-flex';
                if (floatStopBtn) floatStopBtn.style.display = 'inline-flex';
                this._startTimer('audio-ws-timer');
            },
            stopAudioOnly: () => {
                this.controller.stopAudioOnly();
                document.getElementById('audio-ws-status').textContent = 'البث الصوتي غير نشط';
                const floatMicBtn  = document.getElementById('float-btn-mic');
                const floatStopBtn = document.getElementById('float-btn-stop');
                if (floatMicBtn)  floatMicBtn.style.display  = 'none';
                if (floatStopBtn) floatStopBtn.style.display = 'none';
                this._stopTimer('audio-ws-timer');
            },

            // Video (recorded) controls
            promptVideoUpload: () => this.controller.promptVideoUpload(),
            playVideo:         () => this.controller.playVideo(),
            pauseVideo:        () => this.controller.pauseVideo(),
            deleteVideo: async () => {
                const ok = await RoomConfirmDialog.show({
                    icon: '🗑️', title: 'حذف الفيديو',
                    body: 'هل أنت متأكد من حذف الفيديو الحالي؟',
                    okLabel: 'نعم، احذف', danger: true
                });
                if (ok) await this.controller.deleteVideo();
            },
            replaceVideo: async () => {
                const ok = await RoomConfirmDialog.show({
                    icon: '🔄', title: 'تغيير الفيديو',
                    body: 'سيتم استبدال الفيديو الحالي بفيديو جديد. هل تريد المتابعة؟',
                    okLabel: 'نعم، تغيير'
                });
                if (ok) await this.controller.replaceVideo();
            },

            // Agora live (from Video workspace sub-tab)
            startAgoraLive: async () => {
                const ok = await RoomConfirmDialog.show({
                    icon: '📡', title: 'بدء البث الحي',
                    body: 'سيتم بدء البث الحي للطلاب. \n\n⚠️ يرجى عدم إغلاق المتصفح أو التبويبة فجأة أثناء البث حتى لا تفقد التسجيل.\n💡 إذا كانت المحاضرة طويلة جداً (أكثر من ساعتين)، يُفضل إنهاؤها وبدء بث جديد لضمان جودة رفع التسجيل.\n\nهل أنت جاهز لبدء البث؟',
                    okLabel: 'بدء البث'
                });
                if (!ok) return;
                this.controller.startAgoraLive().catch(async (err) => {
                    await RoomConfirmDialog.alert({ icon: '❌', title: 'خطأ', body: 'تعذر بدء البث: ' + err.message });
                });
                document.getElementById('btn-start-agora').style.display = 'none';
                document.getElementById('btn-stop-agora').style.display  = 'block';
                const floatBar = document.getElementById('instructor-float-bar');
                if (floatBar) {
                    document.getElementById('float-btn-mic').style.display  = 'inline-flex';
                    document.getElementById('float-btn-cam').style.display  = 'inline-flex';
                    document.getElementById('float-btn-stop').style.display = 'inline-flex';
                }
            },
            stopAgoraLive: async () => {
                const ok = await RoomConfirmDialog.show({
                    icon: '⏹', title: 'إنهاء البث',
                    body: 'هل تريد إنهاء البث الحي الآن؟',
                    okLabel: 'إنهاء البث', danger: true
                });
                if (!ok) return;
                this.controller.stopAgoraLive();
                const startBtn = document.getElementById('btn-start-agora');
                const stopBtn  = document.getElementById('btn-stop-agora');
                if (startBtn) startBtn.style.display = 'block';
                if (stopBtn)  stopBtn.style.display  = 'none';
                document.getElementById('float-btn-mic').style.display  = 'none';
                document.getElementById('float-btn-cam').style.display  = 'none';
                document.getElementById('float-btn-stop').style.display = 'none';
            },

            // Agora live (from dedicated Live workspace)
            startAgoraLiveDedicated: async () => {
                const ok = await RoomConfirmDialog.show({
                    icon: '📡', title: 'بدء البث الحي',
                    body: 'سيبدأ البث الحي للطلاب. \n\n⚠️ يرجى عدم إغلاق المتصفح أو التبويبة فجأة أثناء البث حتى لا تفقد التسجيل.\n💡 إذا كانت المحاضرة طويلة جداً (أكثر من ساعتين)، يُفضل إنهاؤها وبدء بث جديد لضمان جودة رفع التسجيل.\n\nهل أنت جاهز لبدء البث؟',
                    okLabel: 'بدء البث'
                });
                if (!ok) return;
                this.controller.startAgoraLive().catch(async (err) => {
                    await RoomConfirmDialog.alert({ icon: '❌', title: 'خطأ', body: 'تعذر بدء البث: ' + err.message });
                });
                // Note: Timer and UI updates are now handled by BROADCAST_STARTED listener
            },
            stopAgoraLiveDedicated: async () => {
                const ok = await RoomConfirmDialog.show({
                    icon: '⏹', title: 'إنهاء البث',
                    body: 'هل تريد إنهاء البث الحي الآن؟',
                    okLabel: 'إنهاء البث', danger: true
                });
                if (!ok) return;
                this.controller.stopAgoraLive();
                document.getElementById('btn-start-agora-live').style.display = 'block';
                document.getElementById('btn-stop-agora-live').style.display  = 'none';
                document.getElementById('live-on-badge').style.display  = 'none';
                document.getElementById('live-ws-status').textContent   = 'البث غير نشط حالياً';
                document.getElementById('float-btn-mic').style.display  = 'none';
                document.getElementById('float-btn-cam').style.display  = 'none';
                document.getElementById('float-btn-stop').style.display = 'none';
                this._stopTimer('live-ws-timer');
            },

            toggleAgoraMic: async () => {
                const { MediaEngine } = await import('../../features/media/MediaEngine.js');
                const isMuted = MediaEngine.toggleMic();
                const btnIds = ['btn-agora-mic', 'btn-live-mic'];
                const floatMicBtn = document.getElementById('float-btn-mic');
                btnIds.forEach(id => {
                    const btn = document.getElementById(id);
                    if (btn) {
                        btn.innerHTML = isMuted
                            ? '<i class="fas fa-microphone-slash"></i> مكتوم'
                            : '<i class="fas fa-microphone"></i> المايك';
                        isMuted ? btn.classList.add('btn-danger') : btn.classList.remove('btn-danger');
                    }
                });
                if (floatMicBtn) {
                    floatMicBtn.innerHTML = isMuted
                        ? '<i class="fas fa-microphone-slash"></i><span class="fb-label"> مكتوم</span>'
                        : '<i class="fas fa-microphone"></i><span class="fb-label"> المايك</span>';
                    isMuted ? floatMicBtn.classList.add('active') : floatMicBtn.classList.remove('active');
                }
            },

            switchAgoraCamera: async () => {
                const { MediaEngine } = await import('../../features/media/MediaEngine.js');
                MediaEngine.switchCamera();
            },

            // Channel mode
            sendChannelMessage: async () => {
                const textInput = document.getElementById('inst-channel-text');
                const msg = textInput ? textInput.value.trim() : '';
                if (!msg) {
                    await RoomConfirmDialog.alert({ icon: '✏️', title: 'الرسالة فارغة', body: 'يرجى كتابة رسالة قبل الإرسال.' });
                    return;
                }
                const ok = await RoomConfirmDialog.show({
                    icon: '📢', title: 'تأكيد إرسال الرسالة',
                    body: msg.length > 120 ? msg.slice(0, 120) + '...' : msg,
                    okLabel: 'إرسال'
                });
                if (ok) this.controller.sendChannelMessage();
            },
            sendChannelImage: async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const ok = await RoomConfirmDialog.show({
                    icon: '🖼️', title: 'إرسال صورة',
                    body: `هل تريد إرسال الصورة "${file.name}" للطلاب؟`,
                    okLabel: 'إرسال الصورة'
                });
                if (ok) this.controller.sendChannelImage(e);
                else e.target.value = '';
            },
            sendChannelVideo: async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const ok = await RoomConfirmDialog.show({
                    icon: '🎬', title: 'إرسال فيديو',
                    body: `هل تريد إرسال الفيديو "${file.name}" للطلاب؟`,
                    okLabel: 'إرسال الفيديو'
                });
                if (ok) this.controller.sendChannelVideo(e);
                else e.target.value = '';
            },
            toggleChannelVoice: () => this.controller.toggleChannelVoice()
        };

        // ── Float bar wiring ──
        this._wireFloatBar();
        this._updateFloatBar('video');

        // ── Nav Tab switching ──
        const navBtns = this.mountPoint.querySelectorAll('.inst-nav');
        navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.getAttribute('data-view');
                navBtns.forEach(b => {
                    b.classList.remove('btn-primary');
                    b.classList.add('btn-dark');
                });
                e.currentTarget.classList.remove('btn-dark');
                e.currentTarget.classList.add('btn-primary');
                this.mountPoint.querySelectorAll('.inst-view').forEach(v => v.style.display = 'none');
                const targetView = this.mountPoint.querySelector(`#inst-view-${view}`);
                if (targetView) targetView.style.display = 'flex';
                // Make dashboard use flex-direction column
                if (view === 'dashboard' && targetView) {
                    targetView.style.flexDirection = 'column';
                }
            });
        });

        // ── Profile form submission ──
        const profileForm = this.mountPoint.querySelector('#inst-profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = profileForm.querySelector('button[type="submit"]');
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
                btn.disabled = true;

                const profileData = {
                    name:      document.getElementById('inst-prof-name').value.trim(),
                    specialty: document.getElementById('inst-prof-spec').value.trim(),
                    bio:       document.getElementById('inst-prof-bio').value.trim()
                };
                const photoFile = document.getElementById('inst-prof-photo').files[0];
                const cvFile    = document.getElementById('inst-prof-cv').files[0];

                try {
                    const { InstructorService } = await import('./InstructorService.js');
                    if (photoFile) {
                        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري رفع الصورة...';
                        profileData.photo = await InstructorService.uploadMedia(photoFile, `profiles/${this.controller.engine.currentUser.uid}`);
                    }
                    if (cvFile) {
                        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري رفع السيرة...';
                        profileData.cv = await InstructorService.uploadMedia(cvFile, `profiles/${this.controller.engine.currentUser.uid}`);
                    }
                    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
                    await this.controller.updateProfile(profileData);
                    btn.innerHTML = '<i class="fas fa-check"></i> تم الحفظ بنجاح';
                    setTimeout(() => { btn.innerHTML = originalHTML; btn.disabled = false; }, 3000);
                } catch (error) {
                    await RoomConfirmDialog.alert({ icon: '❌', title: 'خطأ', body: 'حدث خطأ: ' + (error.message || '') });
                    btn.innerHTML = originalHTML;
                    btn.disabled = false;
                }
            });
        }
    }

    // ─── Timer helpers ──────────────────────────────────────────────────────
    _startTimer(elementId) {
        this._stopTimer(elementId);
        const el = document.getElementById(elementId);
        if (!el) return;
        el.style.display = 'block';
        let seconds = 0;
        this._timers = this._timers || {};
        this._timers[elementId] = setInterval(() => {
            seconds++;
            const m = String(Math.floor(seconds / 60)).padStart(2, '0');
            const s = String(seconds % 60).padStart(2, '0');
            el.textContent = `${m}:${s}`;
        }, 1000);
    }

    _stopTimer(elementId) {
        if (this._timers && this._timers[elementId]) {
            clearInterval(this._timers[elementId]);
            delete this._timers[elementId];
        }
        const el = document.getElementById(elementId);
        if (el) { el.style.display = 'none'; el.textContent = '00:00'; }
    }

    // ─── Floating Bar ───────────────────────────────────────────────────────
    _updateFloatBar(mode) {
        const bar      = document.getElementById('instructor-float-bar');
        const label    = document.getElementById('float-mode-label');
        const modeText = document.getElementById('float-mode-text');
        if (!bar) return;

        bar.classList.add('visible');

        const modeConfig = {
            video:   { cls: 'mode-video',   icon: 'fa-video',          text: 'فيديو' },
            link:    { cls: 'mode-video',   icon: 'fa-link',           text: 'رابط' },
            live:    { cls: 'mode-live',    icon: 'fa-satellite-dish', text: 'بث حي' },
            slides:  { cls: 'mode-slides',  icon: 'fa-images',         text: 'شرائح' },
            audio:   { cls: 'mode-audio',   icon: 'fa-podcast',        text: 'صوت فقط' },
            channel: { cls: 'mode-channel', icon: 'fa-bullhorn',       text: 'قناة' },
        };
        const cfg = modeConfig[mode] || modeConfig.video;

        if (label)    { label.className = `float-bar-mode-label ${cfg.cls}`; label.innerHTML = `<i class="fas ${cfg.icon}"></i>`; }
        if (modeText) modeText.textContent = cfg.text;

        const micBtn  = document.getElementById('float-btn-mic');
        const camBtn  = document.getElementById('float-btn-cam');
        const stopBtn = document.getElementById('float-btn-stop');

        if (micBtn)  micBtn.style.display  = 'none';
        if (camBtn)  camBtn.style.display  = 'none';
        if (stopBtn) stopBtn.style.display = 'none';

        if (mode === 'live') {
            if (micBtn)  micBtn.style.display  = 'inline-flex';
            if (camBtn)  camBtn.style.display  = 'inline-flex';
            if (stopBtn) stopBtn.style.display = 'inline-flex';
        } else if (mode === 'audio') {
            if (micBtn)  micBtn.style.display  = 'inline-flex';
            if (stopBtn) stopBtn.style.display = 'inline-flex';
        }
    }

    _wireFloatBar() {
        const floatMicBtn  = document.getElementById('float-btn-mic');
        const floatCamBtn  = document.getElementById('float-btn-cam');
        const floatStopBtn = document.getElementById('float-btn-stop');

        if (floatMicBtn)  floatMicBtn.addEventListener('click',  () => window.InstructorAPI.toggleAgoraMic());
        if (floatCamBtn)  floatCamBtn.addEventListener('click',  () => window.InstructorAPI.switchAgoraCamera());
        if (floatStopBtn) {
            floatStopBtn.addEventListener('click', async () => {
                const mode = document.getElementById('float-mode-text')?.textContent;
                if (mode === 'بث حي')       window.InstructorAPI.stopAgoraLiveDedicated();
                else if (mode === 'صوت فقط')   window.InstructorAPI.stopAudioOnly();
                else if (mode === 'شرائح')  window.InstructorAPI.stopSlidesAudio();
            });
        }
    }
}

export const InstructorUI = new InstructorUIClass();
