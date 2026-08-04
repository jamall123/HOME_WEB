/**
 * InstructorUI.js
 * Renders the 6-tab control center in the DOM and binds event listeners.
 * Strictly separates DOM manipulation from business logic.
 */

/**
 * RoomConfirmDialog
 * Lightweight replacement for window.confirm() / window.alert().
 * Usage: RoomConfirmDialog.show({ icon, title, body, okLabel, danger }) => Promise<boolean>
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

            if (!overlay) { resolve(true); return; } // fallback if DOM not ready

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

export class InstructorUIClass {
    init(controller) {
        this.controller = controller;
        this.cacheDOM();
        this.renderDashboardLayout();
        this.attachListeners();
    }

    cacheDOM() {
        this.mountPoint = document.getElementById('instructor-dashboard-mount');
        // This button exists in course-room.html
        this.tabBtn = document.getElementById('tab-btn-instructor-side'); 
    }

    renderDashboardLayout() {
        if (!this.mountPoint) return;
        
        // Unhide the instructor tab button
        if (this.tabBtn) this.tabBtn.style.display = 'block';

        this.mountPoint.innerHTML = `
            <div class="instructor-workspace" style="display: flex; flex-direction: column; gap: 1.5rem;">
                <!-- Internal Navigation for Instructor Tools -->
                <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); scrollbar-width: none;">
                    <button class="btn btn-sm btn-primary inst-nav" data-view="dashboard" style="border-radius: 20px; padding: 0.4rem 1rem;"><i class="fas fa-sliders-h"></i> مركز التحكم</button>
                    <button class="btn btn-sm btn-dark inst-nav" data-view="students" style="border-radius: 20px; padding: 0.4rem 1rem;"><i class="fas fa-users"></i> الطلاب</button>
                    <button class="btn btn-sm btn-dark inst-nav" data-view="resources" style="border-radius: 20px; padding: 0.4rem 1rem;"><i class="fas fa-folder-open"></i> الموارد</button>
                    <button class="btn btn-sm btn-dark inst-nav" data-view="profile" style="border-radius: 20px; padding: 0.4rem 1rem;"><i class="fas fa-user-tie"></i> الملف الشخصي</button>
                </div>

                <!-- 1. Control Center (Dashboard + Teaching + Classroom) -->
                <div id="inst-view-dashboard" class="inst-view" style="display: flex; flex-direction: column; gap: 1.5rem;">
                    
                    <!-- Stats Section -->
                    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 1rem 1.5rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                        <div>
                            <h4 style="margin: 0 0 0.2rem 0; color: var(--text-secondary); font-size: 0.9rem;">متصل الآن بالدرس</h4>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <div style="width: 10px; height: 10px; background: var(--success); border-radius: 50%; box-shadow: 0 0 10px var(--success); animation: pulse 2s infinite;"></div>
                                <span id="inst-stat-online" style="font-size: 1.5rem; font-weight: bold; color: white;">0</span> <span style="color: var(--text-secondary); font-size: 0.9rem;">طالب</span>
                            </div>
                        </div>
                        <button class="btn btn-danger btn-sm" onclick="window.InstructorAPI.endCurrentLesson()" style="border-radius: 8px; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.2);"><i class="fas fa-flag-checkered"></i> إنهاء الدرس الحالي</button>
                    </div>

                    <!-- Teaching Modes -->
                    <div>
                        <h3 style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--text-primary); border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;"><i class="fas fa-chalkboard-teacher" style="color: var(--primary-color);"></i> أوضاع التدريس</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
                            <button class="btn btn-dark inst-mode-btn" data-mode="video" onclick="window.InstructorAPI.setMode('video')" style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1.2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); transition: all 0.3s ease;">
                                <i class="fas fa-video" style="font-size: 1.5rem; color: #60a5fa;"></i> 
                                <span style="font-size: 0.9rem;">فيديو مباشر</span>
                            </button>
                            <button class="btn btn-dark inst-mode-btn" data-mode="slides" onclick="window.InstructorAPI.setMode('slides')" style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1.2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); transition: all 0.3s ease;">
                                <i class="fas fa-images" style="font-size: 1.5rem; color: #34d399;"></i> 
                                <span style="font-size: 0.9rem;">شرائح عرض</span>
                            </button>
                            <button class="btn btn-dark inst-mode-btn" data-mode="audio" onclick="window.InstructorAPI.setMode('audio')" style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1.2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); transition: all 0.3s ease;">
                                <i class="fas fa-podcast" style="font-size: 1.5rem; color: #a78bfa;"></i> 
                                <span style="font-size: 0.9rem;">صوت فقط</span>
                            </button>
                            <button class="btn btn-dark inst-mode-btn" data-mode="channel" onclick="window.InstructorAPI.setMode('channel')" style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1.2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); transition: all 0.3s ease;">
                                <i class="fas fa-bullhorn" style="font-size: 1.5rem; color: #fbbf24;"></i> 
                                <span style="font-size: 0.9rem;">نمط القناة</span>
                            </button>
                        </div>
                        
                        <!-- Video Control Sub-panel -->
                        <div id="inst-video-controls" style="display: none; margin-top: 1rem; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 12px; border: 1px solid rgba(96, 165, 250, 0.2);">
                            <h4 style="color: #60a5fa; margin: 0 0 1rem 0; font-size: 0.95rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;"><i class="fas fa-video"></i> تحكم الفيديو والبث</h4>
                            
                            <!-- Tabs for Video / Live -->
                            <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; padding: 0.2rem; background: rgba(0,0,0,0.3); border-radius: 8px;">
                                <button class="btn btn-sm btn-primary" id="v-tab-recorded" onclick="window.InstructorAPI.toggleVideoTab('recorded')" style="flex: 1; border-radius: 6px;">مسجل</button>
                                <button class="btn btn-sm btn-dark" id="v-tab-live" onclick="window.InstructorAPI.toggleVideoTab('live')" style="flex: 1; border-radius: 6px;">بث حي</button>
                            </div>
                            
                            <!-- Recorded Video Controls -->
                            <div id="v-panel-recorded" style="display: block;">
                                <button class="btn btn-sm btn-dark" onclick="window.InstructorAPI.promptVideoUpload()" style="width: 100%; margin-bottom: 0.5rem; border-radius: 8px;"><i class="fas fa-upload"></i> رفع / اختيار فيديو</button>
                                <div style="display: flex; gap: 0.5rem;">
                                    <button class="btn btn-sm btn-dark" onclick="window.InstructorAPI.playVideo()" style="flex: 1; color: #34d399; border-radius: 8px;"><i class="fas fa-play"></i> تشغيل</button>
                                    <button class="btn btn-sm btn-dark" onclick="window.InstructorAPI.pauseVideo()" style="flex: 1; color: #fbbf24; border-radius: 8px;"><i class="fas fa-pause"></i> إيقاف</button>
                                </div>
                            </div>
                            
                            <!-- Live Stream Controls -->
                            <div id="v-panel-live" style="display: none;">
                                <button class="btn btn-sm btn-primary" id="btn-start-agora" onclick="window.InstructorAPI.startAgoraLive()" style="width: 100%; margin-bottom: 0.5rem; border-radius: 8px;"><i class="fas fa-satellite-dish"></i> بدء البث الحي</button>
                                <button class="btn btn-sm btn-danger" id="btn-stop-agora" onclick="window.InstructorAPI.stopAgoraLive()" style="display: none; width: 100%; margin-bottom: 0.5rem; border-radius: 8px;"><i class="fas fa-stop-circle"></i> إنهاء البث</button>
                                
                                <div style="display: flex; gap: 0.5rem;">
                                    <button class="btn btn-sm btn-dark" id="btn-agora-mic" onclick="window.InstructorAPI.toggleAgoraMic()" style="flex: 1; border-radius: 8px;"><i class="fas fa-microphone"></i> كتم المايك</button>
                                    <button class="btn btn-sm btn-dark" id="btn-agora-cam" onclick="window.InstructorAPI.switchAgoraCamera()" style="flex: 1; border-radius: 8px;"><i class="fas fa-sync-alt"></i> تدوير الكاميرا</button>
                                </div>
                            </div>
                        </div>

                        <!-- Slides Control Sub-panel -->
                        <div id="inst-slides-controls" style="display: none; margin-top: 1rem; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 12px; border: 1px solid rgba(52, 211, 153, 0.2);">
                            <h4 style="color: #34d399; margin: 0 0 1rem 0; font-size: 0.95rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;"><i class="fas fa-images"></i> إدارة الشاشة والشرائح</h4>
                            
                            <button class="btn btn-sm btn-dark" onclick="document.getElementById('inst-slides-upload').click()" style="width: 100%; margin-bottom: 1rem; border-radius: 8px;"><i class="fas fa-upload"></i> إضافة صور للمعرض</button>
                            <input type="file" id="inst-slides-upload" multiple accept="image/*" style="display: none;" onchange="window.InstructorAPI.uploadSlides(event)">
                            
                            <div id="inst-slides-gallery" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 1rem; max-height: 150px; overflow-y: auto;">
                                <!-- Uploaded images will appear here -->
                            </div>
                            
                            <div style="margin-bottom: 1rem;">
                                <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">قالب العرض الشاشة:</label>
                                <select id="inst-slides-layout" class="form-input" style="width: 100%; padding: 0.5rem;" onchange="window.InstructorAPI.handleSlideLayoutChange(event)">
                                    <option value="slides-layout-1">صورة واحدة (Full)</option>
                                    <option value="slides-layout-2">صورتان (1x2)</option>
                                    <option value="slides-layout-3">٣ صور (كبيرة و٢ صغار)</option>
                                    <option value="slides-layout-4">٤ صور (شبكة 2x2)</option>
                                    <option value="slides-layout-5">٥ صور (شبكة 3x2)</option>
                                </select>
                            </div>
                            
                            <button class="btn btn-sm btn-primary" onclick="window.InstructorAPI.presentSelectedSlides()" style="width: 100%; margin-bottom: 0.5rem; border-radius: 8px; background: #34d399; color: black; font-weight: bold;"><i class="fas fa-tv"></i> عرض الصور المحددة</button>
                            
                            <div style="display: flex; gap: 0.5rem;">
                                <button class="btn btn-sm btn-dark" id="btn-slides-mic-start" onclick="window.InstructorAPI.startSlidesAudio()" style="flex: 1; border-radius: 8px; color: #a78bfa;"><i class="fas fa-microphone"></i> بدء الشرح الصوتي</button>
                                <button class="btn btn-sm btn-danger" id="btn-slides-mic-stop" onclick="window.InstructorAPI.stopSlidesAudio()" style="display: none; flex: 1; border-radius: 8px;"><i class="fas fa-microphone-slash"></i> إيقاف الصوت</button>
                            </div>
                        </div>

                        <!-- Audio Control Sub-panel -->
                        <div id="inst-audio-controls" style="display: none; margin-top: 1rem; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 12px; border: 1px solid rgba(167, 139, 250, 0.2);">
                            <h4 style="color: #a78bfa; margin: 0 0 1rem 0; font-size: 0.95rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;"><i class="fas fa-podcast"></i> البث الصوتي</h4>
                            <div style="display: flex; gap: 0.5rem;">
                                <button class="btn btn-sm btn-primary" id="btn-audio-start" onclick="window.InstructorAPI.startAudioOnly()" style="flex: 1; border-radius: 8px; background: #a78bfa; color: black; font-weight: bold;"><i class="fas fa-microphone"></i> بدء البث الصوتي</button>
                                <button class="btn btn-sm btn-danger" id="btn-audio-stop" onclick="window.InstructorAPI.stopAudioOnly()" style="display: none; flex: 1; border-radius: 8px;"><i class="fas fa-stop-circle"></i> إنهاء البث</button>
                            </div>
                        </div>

                        <!-- Channel Control Sub-panel -->
                        <div id="inst-channel-controls" style="display: none; margin-top: 1rem; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 12px; border: 1px solid rgba(251, 191, 36, 0.2);">
                            <h4 style="color: #fbbf24; margin: 0 0 1rem 0; font-size: 0.95rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;"><i class="fas fa-bullhorn"></i> نمط القناة</h4>
                            <div style="margin-bottom: 1rem;">
                                <textarea id="inst-channel-text" class="form-input" style="width: 100%; height: 80px; padding: 0.5rem; resize: none; margin-bottom: 0.5rem;" placeholder="اكتب رسالة نصية..."></textarea>
                                <button class="btn btn-sm btn-primary" onclick="window.InstructorAPI.sendChannelMessage()" style="width: 100%; border-radius: 8px; background: #fbbf24; color: black; font-weight: bold;">
                                    <i class="fas fa-paper-plane"></i> إرسال النص
                                </button>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                                <button class="btn btn-sm btn-dark" onclick="document.getElementById('inst-channel-image').click()" style="border-radius: 8px;"><i class="fas fa-image"></i> إرسال صورة</button>
                                <input type="file" id="inst-channel-image" accept="image/*" style="display: none;" onchange="window.InstructorAPI.sendChannelImage(event)">
                                
                                <button class="btn btn-sm btn-dark" onclick="document.getElementById('inst-channel-video').click()" style="border-radius: 8px;"><i class="fas fa-video"></i> إرسال فيديو</button>
                                <input type="file" id="inst-channel-video" accept="video/*" style="display: none;" onchange="window.InstructorAPI.sendChannelVideo(event)">
                                
                                <button class="btn btn-sm btn-dark" id="btn-channel-voice" onclick="window.InstructorAPI.toggleChannelVoice()" style="border-radius: 8px; grid-column: span 2;"><i class="fas fa-microphone"></i> تسجيل صوتي</button>
                            </div>
                        </div>
                    </div>

                    <!-- Room Management -->
                    <div>
                        <h3 style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--text-primary); border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;"><i class="fas fa-cogs" style="color: var(--primary-color);"></i> إدارة الغرفة</h3>
                        <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                            <div style="background: rgba(255,255,255,0.02); padding: 1rem 1.2rem; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 0.95rem;"><i class="fas fa-comment-slash" style="color: var(--text-secondary); margin-left: 0.5rem;"></i> إغلاق الدردشة للطلاب</span>
                                <label class="switch"><input type="checkbox" id="inst-toggle-chat"><span class="slider"></span></label>
                            </div>
                            <div style="background: rgba(255,255,255,0.02); padding: 1rem 1.2rem; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 0.95rem;"><i class="fas fa-lock" style="color: var(--text-secondary); margin-left: 0.5rem;"></i> منع تحميل الموارد للطلاب</span>
                                <label class="switch"><input type="checkbox" id="inst-toggle-resources"><span class="slider"></span></label>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- 2. Students Area -->
                <div id="inst-view-students" class="inst-view" style="display: none;">
                    <h3 style="font-size: 1.1rem; margin-bottom: 1rem;"><i class="fas fa-users" style="color: var(--primary-color);"></i> إدارة الطلاب</h3>
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; overflow: hidden;">
                        <table style="width: 100%; text-align: right; border-collapse: collapse; font-size: 0.9rem;">
                            <thead style="background: rgba(255,255,255,0.05);">
                                <tr>
                                    <th style="padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);">الاسم</th>
                                    <th style="padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);">الحالة</th>
                                    <th style="padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="instructor-student-list">
                                <tr><td colspan="3" style="text-align: center; padding: 2rem; color: var(--text-secondary);">جاري التحميل...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 3. Resources Area -->
                <div id="inst-view-resources" class="inst-view" style="display: none;">
                    <h3 style="font-size: 1.1rem; margin-bottom: 1rem;"><i class="fas fa-folder-open" style="color: var(--primary-color);"></i> إدارة الموارد</h3>
                    <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; background: rgba(255,255,255,0.02); padding: 1.2rem; border-radius: 12px; border: 1px dashed rgba(255,255,255,0.2);">
                        <label style="font-size: 0.9rem; color: var(--text-secondary); text-align: center;">رفع ملف جديد للدرس الحالي</label>
                        <div style="display: flex; gap: 0.5rem;">
                            <input type="file" id="inst-new-resource-file" class="form-input" style="flex: 1; padding: 0.5rem; background: rgba(0,0,0,0.2);">
                            <button class="btn btn-primary" style="border-radius: 8px;"><i class="fas fa-upload"></i> رفع</button>
                        </div>
                    </div>
                    <div id="inst-resource-list" style="display: flex; flex-direction: column; gap: 0.5rem;"></div>
                </div>

                <!-- 4. Profile Area -->
                <div id="inst-view-profile" class="inst-view" style="display: none;">
                    <h3 style="font-size: 1.1rem; margin-bottom: 1rem;"><i class="fas fa-user-tie" style="color: var(--primary-color);"></i> الملف الشخصي (عام)</h3>
                    <form id="inst-profile-form" style="display: grid; gap: 1.2rem; background: rgba(255,255,255,0.02); padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                        <div>
                            <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.3rem;">الاسم الكامل</label>
                            <input type="text" id="inst-prof-name" class="form-input" placeholder="الاسم الكامل" style="width: 100%;">
                        </div>
                        <div>
                            <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.3rem;">التخصص الدقيق</label>
                            <input type="text" id="inst-prof-spec" class="form-input" placeholder="مثال: أستاذ رياضيات" style="width: 100%;">
                        </div>
                        <div>
                            <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.3rem;">نبذة تعريفية</label>
                            <textarea id="inst-prof-bio" class="form-input" placeholder="تحدث عن خبراتك..." rows="3" style="width: 100%;"></textarea>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div>
                                <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.3rem;">صورة شخصية</label>
                                <input type="file" id="inst-prof-photo" class="form-input" accept="image/*" style="width: 100%; font-size: 0.8rem; padding: 0.5rem;">
                            </div>
                            <div>
                                <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.3rem;">السيرة الذاتية (CV)</label>
                                <input type="file" id="inst-prof-cv" class="form-input" accept=".pdf" style="width: 100%; font-size: 0.8rem; padding: 0.5rem;">
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%; border-radius: 8px; margin-top: 0.5rem;"><i class="fas fa-save"></i> حفظ البيانات</button>
                    </form>
                </div>
            </div>
        `;
    }

    toggleVideoTabUI(tab) {
        // Update tab buttons
        const recordedTab = document.getElementById('v-tab-recorded');
        const liveTab = document.getElementById('v-tab-live');
        if (tab === 'recorded') {
            recordedTab.className = 'btn btn-sm btn-primary';
            liveTab.className = 'btn btn-sm btn-dark';
            document.getElementById('v-panel-recorded').style.display = 'block';
            document.getElementById('v-panel-live').style.display = 'none';
        } else {
            recordedTab.className = 'btn btn-sm btn-dark';
            liveTab.className = 'btn btn-sm btn-primary';
            document.getElementById('v-panel-recorded').style.display = 'none';
            document.getElementById('v-panel-live').style.display = 'block';
        }
    }

    attachListeners() {
        if (!this.mountPoint) return;
        
        // Expose a safe global for inline onclicks in the template above
        window.InstructorAPI = {
            setMode: (mode) => {
                this.controller.setTeachingMode(mode);
                
                // Toggle video and slides controls visibility based on mode
                const videoControls = document.getElementById('inst-video-controls');
                if (videoControls) videoControls.style.display = (mode === 'video') ? 'block' : 'none';
                
                const slidesControls = document.getElementById('inst-slides-controls');
                if (slidesControls) slidesControls.style.display = (mode === 'slides') ? 'block' : 'none';
                
                const audioControls = document.getElementById('inst-audio-controls');
                if (audioControls) audioControls.style.display = (mode === 'audio') ? 'block' : 'none';

                const channelControls = document.getElementById('inst-channel-controls');
                if (channelControls) channelControls.style.display = (mode === 'channel') ? 'block' : 'none';
                
                // Update UI active state visually
                const modeBtns = this.mountPoint.querySelectorAll('.inst-mode-btn');
                modeBtns.forEach(b => {
                    b.style.borderColor = 'rgba(255,255,255,0.05)';
                    b.style.background = '';
                    b.querySelector('i').style.transform = 'scale(1)';
                });
                
                const activeBtn = this.mountPoint.querySelector(`.inst-mode-btn[data-mode="${mode}"]`);
                if (activeBtn) {
                    activeBtn.style.borderColor = 'var(--primary-color)';
                    activeBtn.style.background = 'rgba(99, 102, 241, 0.1)';
                    activeBtn.querySelector('i').style.transform = 'scale(1.2)';
                }

                // Update the floating bar
                this._updateFloatBar(mode);
            },
            endCurrentLesson: async () => {
                const ok = await RoomConfirmDialog.show({
                    icon: '🏁',
                    title: 'إنهاء الدرس الحالي',
                    body: 'هل أنت متأكد من إنهاء الدرس الحالي وبدء دورة درس جديدة؟',
                    okLabel: 'نعم، إنهاء',
                    danger: true
                });
                if (ok) {
                    import('./CurriculumController.js').then(({CurriculumController}) => CurriculumController.endCurrentLesson());
                }
            },
            toggleVideoTab: (tab) => this.toggleVideoTabUI(tab),
            handleSlideLayoutChange: (e) => this.controller.handleSlideLayoutChange(e),
            promptVideoUpload: () => this.controller.promptVideoUpload(),
            playVideo: () => this.controller.playVideo(),
            pauseVideo: () => this.controller.pauseVideo(),
            startAgoraLive: async () => {
                const ok = await RoomConfirmDialog.show({
                    icon: '📡',
                    title: 'بدء البث الحي',
                    body: 'سيتم بدء البث الحي للطلاب. هل أنت جاهز؟',
                    okLabel: 'بدء البث',
                    danger: false
                });
                if (!ok) return;
                this.controller.startAgoraLive().catch(async (err) => {
                    await RoomConfirmDialog.alert({ icon: '❌', title: 'خطأ', body: 'تعذر بدء البث: ' + err.message });
                });
                document.getElementById('btn-start-agora').style.display = 'none';
                document.getElementById('btn-stop-agora').style.display = 'block';
                // Show float bar stop + mic + cam buttons
                const fb = document.getElementById('instructor-float-bar');
                if (fb) {
                    document.getElementById('float-btn-mic').style.display = 'inline-flex';
                    document.getElementById('float-btn-cam').style.display = 'inline-flex';
                    document.getElementById('float-btn-stop').style.display = 'inline-flex';
                }
            },
            stopAgoraLive: async () => {
                const ok = await RoomConfirmDialog.show({
                    icon: '⏹',
                    title: 'إنهاء البث',
                    body: 'هل تريد إنهاء البث الحي الآن؟',
                    okLabel: 'إنهاء البث',
                    danger: true
                });
                if (!ok) return;
                this.controller.stopAgoraLive();
                document.getElementById('btn-start-agora').style.display = 'block';
                document.getElementById('btn-stop-agora').style.display = 'none';
                document.getElementById('float-btn-mic').style.display = 'none';
                document.getElementById('float-btn-cam').style.display = 'none';
                document.getElementById('float-btn-stop').style.display = 'none';
            },
            toggleAgoraMic: async () => {
                const { MediaEngine } = await import('./MediaEngine.js');
                const isMuted = MediaEngine.toggleMic();
                const btn = document.getElementById('btn-agora-mic');
                const floatMicBtn = document.getElementById('float-btn-mic');
                if (isMuted) {
                    if (btn) { btn.innerHTML = '<i class="fas fa-microphone-slash"></i> تم الكتم'; btn.classList.add('btn-danger'); }
                    if (floatMicBtn) { floatMicBtn.innerHTML = '<i class="fas fa-microphone-slash"></i><span class="fb-label"> مكتوم</span>'; floatMicBtn.classList.add('active'); }
                } else {
                    if (btn) { btn.innerHTML = '<i class="fas fa-microphone"></i> كتم المايك'; btn.classList.remove('btn-danger'); }
                    if (floatMicBtn) { floatMicBtn.innerHTML = '<i class="fas fa-microphone"></i><span class="fb-label"> المايك</span>'; floatMicBtn.classList.remove('active'); }
                }
            },
            switchAgoraCamera: async () => {
                const { MediaEngine } = await import('./MediaEngine.js');
                MediaEngine.switchCamera();
            },
            uploadSlides: (e) => this.controller.uploadSlides(e),
            presentSelectedSlides: () => this.controller.presentSelectedSlides(),
            startSlidesAudio: () => {
                this.controller.startSlidesAudio();
                // Show mic stop in float bar
                const floatMicBtn = document.getElementById('float-btn-mic');
                if (floatMicBtn) floatMicBtn.style.display = 'inline-flex';
                const floatStopBtn = document.getElementById('float-btn-stop');
                if (floatStopBtn) floatStopBtn.style.display = 'inline-flex';
            },
            stopSlidesAudio: () => {
                this.controller.stopSlidesAudio();
                const floatMicBtn = document.getElementById('float-btn-mic');
                if (floatMicBtn) floatMicBtn.style.display = 'none';
                const floatStopBtn = document.getElementById('float-btn-stop');
                if (floatStopBtn) floatStopBtn.style.display = 'none';
            },
            
            // Audio mode
            startAudioOnly: () => {
                this.controller.startAudioOnly();
                const floatMicBtn = document.getElementById('float-btn-mic');
                if (floatMicBtn) floatMicBtn.style.display = 'inline-flex';
                const floatStopBtn = document.getElementById('float-btn-stop');
                if (floatStopBtn) floatStopBtn.style.display = 'inline-flex';
            },
            stopAudioOnly: () => {
                this.controller.stopAudioOnly();
                const floatMicBtn = document.getElementById('float-btn-mic');
                if (floatMicBtn) floatMicBtn.style.display = 'none';
                const floatStopBtn = document.getElementById('float-btn-stop');
                if (floatStopBtn) floatStopBtn.style.display = 'none';
            },
            
            // Channel mode — with confirm dialog
            sendChannelMessage: async () => {
                const textInput = document.getElementById('inst-channel-text');
                const msg = textInput ? textInput.value.trim() : '';
                if (!msg) {
                    await RoomConfirmDialog.alert({ icon: '✏️', title: 'الرسالة فارغة', body: 'يرجى كتابة رسالة قبل الإرسال.' });
                    return;
                }
                const ok = await RoomConfirmDialog.show({
                    icon: '📢',
                    title: 'تأكيد إرسال الرسالة',
                    body: msg.length > 120 ? msg.slice(0, 120) + '...' : msg,
                    okLabel: 'إرسال'
                });
                if (ok) this.controller.sendChannelMessage();
            },
            sendChannelImage: async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const ok = await RoomConfirmDialog.show({
                    icon: '🖼️',
                    title: 'إرسال صورة',
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
                    icon: '🎬',
                    title: 'إرسال فيديو',
                    body: `هل تريد إرسال الفيديو "${file.name}" للطلاب؟`,
                    okLabel: 'إرسال الفيديو'
                });
                if (ok) this.controller.sendChannelVideo(e);
                else e.target.value = '';
            },
            toggleChannelVoice: () => this.controller.toggleChannelVoice()
        };

        // Float bar button wiring
        this._wireFloatBar();
        // Show the float bar for instructors by default
        this._updateFloatBar('video');

        const navBtns = this.mountPoint.querySelectorAll('.inst-nav');
        navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.getAttribute('data-view');
                
                // Toggle active classes
                navBtns.forEach(b => {
                    b.classList.remove('btn-primary');
                    b.classList.add('btn-dark');
                });
                e.currentTarget.classList.remove('btn-dark');
                e.currentTarget.classList.add('btn-primary');

                // Toggle views
                this.mountPoint.querySelectorAll('.inst-view').forEach(v => v.style.display = 'none');
                const targetView = this.mountPoint.querySelector(`#inst-view-${view}`);
                if (targetView) targetView.style.display = 'block';
            });
        });

        // Profile Form Submission
        const profileForm = this.mountPoint.querySelector('#inst-profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = profileForm.querySelector('button[type="submit"]');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
                btn.disabled = true;

                const profileData = {
                    name: document.getElementById('inst-prof-name').value.trim(),
                    specialty: document.getElementById('inst-prof-spec').value.trim(),
                    bio: document.getElementById('inst-prof-bio').value.trim()
                };

                const photoFile = document.getElementById('inst-prof-photo').files[0];
                const cvFile = document.getElementById('inst-prof-cv').files[0];

                try {
                    // Lazy load InstructorService for direct media upload
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
                    btn.innerHTML = '<i class="fas fa-check"></i> تم الحفظ';
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                    }, 3000);
                } catch (error) {
                    await RoomConfirmDialog.alert({ icon: '❌', title: 'خطأ', body: 'حدث خطأ أثناء حفظ البيانات: ' + (error.message || '') });
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            });
        }
    }

    // ─── Floating Bar helpers ───────────────────────────────────────────────

    /**
     * Called whenever the teaching mode changes.
     * Updates the mode label and shows/hides relevant float bar controls.
     */
    _updateFloatBar(mode) {
        const bar    = document.getElementById('instructor-float-bar');
        const label  = document.getElementById('float-mode-label');
        const modeText = document.getElementById('float-mode-text');
        if (!bar) return;

        bar.classList.add('visible');

        const modeConfig = {
            video:   { cls: 'mode-video',   icon: 'fa-video',       text: 'فيديو' },
            link:    { cls: 'mode-video',   icon: 'fa-link',        text: 'رابط' },
            slides:  { cls: 'mode-slides',  icon: 'fa-images',      text: 'شرائح' },
            audio:   { cls: 'mode-audio',   icon: 'fa-podcast',     text: 'صوت فقط' },
            channel: { cls: 'mode-channel', icon: 'fa-bullhorn',    text: 'قناة' },
            live:    { cls: 'mode-live',    icon: 'fa-satellite-dish', text: 'بث حي' },
        };
        const cfg = modeConfig[mode] || modeConfig.video;

        // Update label
        label.className = `float-bar-mode-label ${cfg.cls}`;
        label.innerHTML = `<i class="fas ${cfg.icon}"></i>`;
        if (modeText) modeText.textContent = cfg.text;

        // Show/hide action buttons based on mode
        const micBtn  = document.getElementById('float-btn-mic');
        const camBtn  = document.getElementById('float-btn-cam');
        const stopBtn = document.getElementById('float-btn-stop');

        // Reset visibility
        if (micBtn)  micBtn.style.display  = 'none';
        if (camBtn)  camBtn.style.display  = 'none';
        if (stopBtn) stopBtn.style.display = 'none';

        // Mode-specific shows
        if (mode === 'live') {
            if (micBtn)  micBtn.style.display  = 'inline-flex';
            if (camBtn)  camBtn.style.display  = 'inline-flex';
            if (stopBtn) stopBtn.style.display = 'inline-flex';
        } else if (mode === 'audio') {
            if (micBtn)  micBtn.style.display  = 'inline-flex';
            if (stopBtn) stopBtn.style.display = 'inline-flex';
        }
    }

    /**
     * Wires float-bar buttons to InstructorAPI.
     */
    _wireFloatBar() {
        const floatMicBtn  = document.getElementById('float-btn-mic');
        const floatCamBtn  = document.getElementById('float-btn-cam');
        const floatStopBtn = document.getElementById('float-btn-stop');

        if (floatMicBtn) {
            floatMicBtn.addEventListener('click', () => window.InstructorAPI.toggleAgoraMic());
        }
        if (floatCamBtn) {
            floatCamBtn.addEventListener('click', () => window.InstructorAPI.switchAgoraCamera());
        }
        if (floatStopBtn) {
            // Context-aware stop — checks current mode
            floatStopBtn.addEventListener('click', async () => {
                const mode = document.getElementById('float-mode-text')?.textContent;
                if (mode === 'بث حي') {
                    window.InstructorAPI.stopAgoraLive();
                } else if (mode === 'صوت فقط') {
                    window.InstructorAPI.stopAudioOnly();
                } else if (mode === 'شرائح') {
                    window.InstructorAPI.stopSlidesAudio();
                }
            });
        }
    }
}

export const InstructorUI = new InstructorUIClass();
