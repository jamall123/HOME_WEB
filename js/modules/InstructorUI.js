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
            <div class="instructor-workspace" style="display: flex; flex-direction: column; gap: 1rem;">
                <!-- Internal Navigation for Instructor Tools -->
                <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <button class="btn btn-sm btn-primary inst-nav" data-view="dashboard"><i class="fas fa-chart-pie"></i> لوحة القيادة</button>
                    <button class="btn btn-sm btn-dark inst-nav" data-view="teaching"><i class="fas fa-chalkboard-teacher"></i> التدريس</button>
                    <button class="btn btn-sm btn-dark inst-nav" data-view="students"><i class="fas fa-users"></i> الطلاب</button>
                    <button class="btn btn-sm btn-dark inst-nav" data-view="resources"><i class="fas fa-folder-open"></i> الموارد</button>
                    <button class="btn btn-sm btn-dark inst-nav" data-view="classroom"><i class="fas fa-cogs"></i> إدارة الغرفة</button>
                    <button class="btn btn-sm btn-dark inst-nav" data-view="profile"><i class="fas fa-user-tie"></i> الملف الشخصي</button>
                </div>

                <!-- Content Area -->
                <div id="inst-view-dashboard" class="inst-view" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <!-- Realtime stats injected by InstructorAnalytics -->
                    <div class="stat-card" style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px;">
                        <h4 style="margin: 0 0 0.5rem 0; color: var(--text-secondary);">متصل الآن</h4>
                        <span id="inst-stat-online" style="font-size: 1.5rem; font-weight: bold; color: var(--success);">0</span>
                    </div>
                </div>

                <div id="inst-view-teaching" class="inst-view" style="display: none;">
                    <h3>أوضاع التدريس</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <button class="btn btn-dark" onclick="window.InstructorAPI.setMode('video')"><i class="fas fa-video"></i> فيديو مباشر</button>
                        <button class="btn btn-dark" onclick="window.InstructorAPI.setMode('slides')"><i class="fas fa-images"></i> شرائح عرض</button>
                        <button class="btn btn-dark" onclick="window.InstructorAPI.setMode('audio_only')"><i class="fas fa-podcast"></i> صوت فقط</button>
                        <button class="btn btn-dark" onclick="window.InstructorAPI.setMode('channel')"><i class="fas fa-bullhorn"></i> نمط القناة</button>
                    </div>
                </div>

                <div id="inst-view-students" class="inst-view" style="display: none;">
                    <h3>إدارة الطلاب</h3>
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 1rem;">
                        <table style="width: 100%; text-align: right; border-collapse: collapse;">
                            <thead>
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                                    <th style="padding: 0.5rem;">الاسم</th>
                                    <th style="padding: 0.5rem;">الحالة</th>
                                    <th style="padding: 0.5rem;">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="instructor-student-list">
                                <!-- Populated by StudentManager -->
                                <tr><td colspan="3" style="text-align: center; padding: 1rem;">جاري التحميل...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div id="inst-view-resources" class="inst-view" style="display: none;">
                    <h3>إدارة الموارد</h3>
                    <!-- Resource upload form -->
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                        <input type="file" id="inst-new-resource-file" class="form-input" style="flex: 1;">
                        <button class="btn btn-primary"><i class="fas fa-upload"></i> رفع</button>
                    </div>
                    <div id="inst-resource-list"></div>
                </div>

                <div id="inst-view-classroom" class="inst-view" style="display: none;">
                    <h3>إدارة الغرفة</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="stat-card" style="padding: 1rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <span><i class="fas fa-comment-slash"></i> إغلاق الدردشة</span>
                            <label class="switch"><input type="checkbox" id="inst-toggle-chat"><span class="slider"></span></label>
                        </div>
                        <div class="stat-card" style="padding: 1rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <span><i class="fas fa-lock"></i> إغلاق الموارد</span>
                            <label class="switch"><input type="checkbox" id="inst-toggle-resources"><span class="slider"></span></label>
                        </div>
                        <div class="stat-card" style="padding: 1rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; display: flex; justify-content: space-between; align-items: center; grid-column: 1 / -1;">
                            <div>
                                <h4 style="margin: 0 0 0.5rem 0;"><i class="fas fa-flag-checkered"></i> إنهاء الدرس الحالي</h4>
                                <span style="font-size: 0.85rem; color: var(--text-secondary);">سيتم حفظ جميع الموارد والمحادثات تحت هذا الدرس، وبدء درس جديد فارغ.</span>
                            </div>
                            <button class="btn btn-danger" onclick="window.InstructorAPI.endCurrentLesson()">إنهاء وبدء جديد</button>
                        </div>
                    </div>
                </div>

                <div id="inst-view-profile" class="inst-view" style="display: none;">
                    <h3>الملف الشخصي (عام)</h3>
                    <form id="inst-profile-form" style="display: grid; gap: 1rem;">
                        <input type="text" id="inst-prof-name" class="form-input" placeholder="الاسم الكامل">
                        <input type="text" id="inst-prof-spec" class="form-input" placeholder="التخصص الدقيق">
                        <textarea id="inst-prof-bio" class="form-input" placeholder="نبذة تعريفية" rows="3"></textarea>
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <label style="flex: 1;">صورة شخصية: <input type="file" class="form-input" accept="image/*"></label>
                            <label style="flex: 1;">السيرة الذاتية (CV): <input type="file" class="form-input" accept=".pdf"></label>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;"><i class="fas fa-save"></i> حفظ البيانات</button>
                    </form>
                </div>
            </div>
        `;
    }

    attachListeners() {
        if (!this.mountPoint) return;
        
        // Expose a safe global for inline onclicks in the template above
        window.InstructorAPI = {
            setMode: (mode) => this.controller.setTeachingMode(mode),
            endCurrentLesson: () => {
                if (confirm('هل أنت متأكد من إنهاء الدرس الحالي وبدء دورة درس جديدة؟')) {
                    import('./CurriculumController.js').then(({CurriculumController}) => CurriculumController.endCurrentLesson());
                }
            }
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
    }
}

export const InstructorUI = new InstructorUIClass();
