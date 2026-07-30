/**
 * InstructorUI.js
 * Renders the 6-tab control center in the DOM and binds event listeners.
 * Strictly separates DOM manipulation from business logic.
 */

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
                
                // Toggle video controls visibility based on mode
                const videoControls = document.getElementById('inst-video-controls');
                if (videoControls) {
                    videoControls.style.display = (mode === 'video') ? 'block' : 'none';
                }
                
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
            },
            endCurrentLesson: () => {
                if (confirm('هل أنت متأكد من إنهاء الدرس الحالي وبدء دورة درس جديدة؟')) {
                    import('./CurriculumController.js').then(({CurriculumController}) => CurriculumController.endCurrentLesson());
                }
            },
            toggleVideoTab: (tab) => this.toggleVideoTabUI(tab),
            promptVideoUpload: () => this.controller.promptVideoUpload(),
            playVideo: () => this.controller.playVideo(),
            pauseVideo: () => this.controller.pauseVideo(),
            startAgoraLive: () => this.controller.startAgoraLive(),
            stopAgoraLive: () => this.controller.stopAgoraLive(),
            toggleAgoraMic: () => this.controller.toggleAgoraMic(),
            switchAgoraCamera: () => this.controller.switchAgoraCamera()
        };

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
                    alert('حدث خطأ أثناء حفظ البيانات');
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            });
        }
    }
}

export const InstructorUI = new InstructorUIClass();
