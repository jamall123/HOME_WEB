import { PresenceController } from '../presence/PresenceController.js';

export class StudentManagerClass {
    constructor() {
        this.controller = null;
        this.unsubscribe = null;
    }

    init(controller) {
        this.controller = controller;
        this.startListening();
    }

    startListening() {
        this.activeStudentsMap = new Map();
        this.unsubscribe = PresenceController.listenToActiveUsers(this.controller.engine.courseId, (users) => {
            const tbody = document.getElementById('instructor-student-list');
            if (!tbody) return;

            // Filter to only recent heartbeats (within 90 seconds)
            const now = Date.now();
            const activeStudents = [];
            this.activeStudentsMap.clear();
            
            users.forEach(data => {
                if (data.lastSeen) {
                    const ms = data.lastSeen.toMillis ? data.lastSeen.toMillis() : now;
                    if ((now - ms) < 90000) {
                        activeStudents.push(data);
                        if (data.userId) this.activeStudentsMap.set(data.userId, data);
                    }
                } else {
                    activeStudents.push(data);
                    if (data.userId) this.activeStudentsMap.set(data.userId, data);
                }
            });

            if (activeStudents.length === 0) {
                tbody.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary); background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px;">لا يوجد طلاب متصلين حالياً.</div>';
                return;
            }

            // Batch DOM updates
            const fragment = document.createDocumentFragment();

            activeStudents.forEach(student => {
                const card = document.createElement('div');
                card.style.cssText = 'display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; padding: 1rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px;';
                
                card.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 0.2rem; flex: 1 1 150px; min-width: 0;">
                        <div style="font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${student.name || student.userName || 'طالب مجهول'}</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">${student.device || 'غير معروف'}</div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.2rem; flex: 1 1 100px; min-width: 0;">
                        <span style="color: var(--success); font-size: 0.85rem;"><i class="fas fa-circle"></i> متصل</span>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">${student.sessionDurationMinutes || 0} دقيقة</div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; flex-shrink: 0;">
                        <button class="btn btn-sm btn-info btn-student-details" data-uid="${student.userId || ''}" title="التفاصيل"><i class="fas fa-info-circle"></i></button>
                        <button class="btn btn-sm btn-success btn-student-unmute" data-uid="${student.userId || ''}" title="إعطاء المايك (Unmute)"><i class="fas fa-microphone"></i></button>
                        <button class="btn btn-sm btn-dark btn-student-mute" data-uid="${student.userId || ''}" title="كتم (Mute)"><i class="fas fa-microphone-slash"></i></button>
                        <button class="btn btn-sm btn-dark btn-student-kick" data-uid="${student.userId || ''}" title="إزالة (Kick)" style="color: var(--danger);"><i class="fas fa-sign-out-alt"></i></button>
                    </div>
                `;
                fragment.appendChild(card);
            });

            tbody.innerHTML = '';
            tbody.appendChild(fragment);
            
            if (!this.delegationAdded) {
                tbody.addEventListener('click', (e) => {
                    const detailsBtn = e.target.closest('.btn-student-details');
                    if (detailsBtn) {
                        const uid = detailsBtn.getAttribute('data-uid');
                        const studentData = this.activeStudentsMap.get(uid);
                        if (studentData) this.showDetailsModal(studentData);
                        return;
                    }

                    const unmuteBtn = e.target.closest('.btn-student-unmute');
                    if (unmuteBtn) {
                        const uid = unmuteBtn.getAttribute('data-uid');
                        const studentData = this.activeStudentsMap.get(uid);
                        if (confirm('هل تريد السماح لهذا الطالب بالتحدث وإعطائه المايك؟')) {
                            this.controller.allowStudentMic(uid, studentData ? studentData.name : 'الطالب');
                        }
                        return;
                    }

                    const muteBtn = e.target.closest('.btn-student-mute');
                    if (muteBtn) {
                        const uid = muteBtn.getAttribute('data-uid');
                        if (confirm('هل أنت متأكد من سحب صلاحية الميكروفون من هذا الطالب؟')) {
                            this.controller.revokeStudentMic(uid);
                        }
                        return;
                    }

                    const kickBtn = e.target.closest('.btn-student-kick');
                    if (kickBtn) {
                        const uid = kickBtn.getAttribute('data-uid');
                        if (confirm('هل أنت متأكد من طرد هذا الطالب من الغرفة؟')) {
                            this.controller.kickStudent(uid);
                        }
                        return;
                    }
                });
                this.delegationAdded = true;
            }
        });
    }

    showDetailsModal(student) {
        let modal = document.getElementById('inst-student-details-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'inst-student-details-modal';
            modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:99999; display:flex; align-items:center; justify-content:center;';
            modal.innerHTML = `
                <div class="glass-panel" style="width: 400px; padding: 2rem; border-radius: 12px; position: relative;">
                    <button id="inst-student-close-btn" style="position:absolute; top:1rem; left:1rem; background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;"><i class="fas fa-times"></i></button>
                    <h3 style="margin-top:0; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:1rem; margin-bottom:1rem;">تفاصيل الطالب</h3>
                    <div id="inst-student-details-content"></div>
                </div>
            `;
            document.body.appendChild(modal);
            document.getElementById('inst-student-close-btn').addEventListener('click', () => {
                modal.style.display = 'none';
            });
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.style.display = 'none';
            });
        }
        
        const content = document.getElementById('inst-student-details-content');
        content.innerHTML = `
            <div style="margin-bottom: 0.8rem;"><strong>الاسم:</strong> ${student.userName || 'غير متوفر'}</div>
            <div style="margin-bottom: 0.8rem;"><strong>الحالة:</strong> متصل</div>
            <div style="margin-bottom: 0.8rem;"><strong>المدة:</strong> ${student.sessionDurationMinutes || 0} دقيقة</div>
            <div style="margin-bottom: 0.8rem;"><strong>الجهاز:</strong> ${student.device || 'غير معروف'}</div>
            <div style="margin-bottom: 0.8rem;"><strong>الدرس الحالي:</strong> ${student.currentLessonId || 'غير محدد'}</div>
        `;
        modal.style.display = 'flex';
    }

    destroy() {
        if (this.unsubscribe) this.unsubscribe();
        const modal = document.getElementById('inst-student-details-modal');
        if (modal) modal.remove();
    }
}
export const StudentManager = new StudentManagerClass();
