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
        this.unsubscribe = PresenceController.listenToActiveUsers(this.controller.engine.courseId, (users) => {
            const tbody = document.getElementById('instructor-student-list');
            if (!tbody) return;

            // Filter to only recent heartbeats (within 90 seconds)
            const now = Date.now();
            const activeStudents = [];
            users.forEach(data => {
                if (data.lastSeen) {
                    const ms = data.lastSeen.toMillis ? data.lastSeen.toMillis() : now;
                    if ((now - ms) < 90000) activeStudents.push(data);
                } else {
                    activeStudents.push(data);
                }
            });

                if (activeStudents.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 1rem;">لا يوجد طلاب متصلين حالياً.</td></tr>';
                    return;
                }

                // Batch DOM updates
                const fragment = document.createDocumentFragment();

                activeStudents.forEach(student => {
                    const tr = document.createElement('tr');
                    tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
                    tr.innerHTML = `
                        <td style="padding: 0.5rem;">
                            <div style="font-weight: bold;">${student.userName || 'طالب مجهول'}</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">${student.device || 'غير معروف'}</div>
                        </td>
                        <td style="padding: 0.5rem;">
                            <span style="color: var(--success); font-size: 0.85rem;"><i class="fas fa-circle"></i> متصل</span>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">${student.sessionDurationMinutes || 0} دقيقة</div>
                        </td>
                        <td style="padding: 0.5rem; display: flex; gap: 0.5rem;">
                            <button class="btn btn-sm btn-dark" title="كتم (Mute)"><i class="fas fa-microphone-slash"></i></button>
                            <button class="btn btn-sm btn-dark" title="إزالة (Kick)" style="color: var(--danger);"><i class="fas fa-sign-out-alt"></i></button>
                        </td>
                    `;
                    fragment.appendChild(tr);
                });

                tbody.innerHTML = '';
                tbody.appendChild(fragment);
            });
    }

    destroy() {
        if (this.unsubscribe) this.unsubscribe();
    }
}
export const StudentManager = new StudentManagerClass();
