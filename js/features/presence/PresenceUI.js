/**
 * @file PresenceUI.js
 * @purpose UI bindings for User Presence (Connected students list).
 */
import { PresenceController } from './PresenceController.js';
import { stateStore } from '../../core/StateStore.js';
export class PresenceUIClass {
    init(courseId) {
        if (!courseId) return;

        // Start listening to active users
        this.unsubscribe = PresenceController.listenToActiveUsers(courseId, (users) => {
            const listEl = document.getElementById('connected-students-list');
            const countEl = document.getElementById('connected-count');
            
            if (listEl && countEl) {
                countEl.innerText = users.length;
                if (users.length === 0) {
                    listEl.innerHTML = '<li style="color: var(--text-muted); font-size: 0.9rem;">لا يوجد طلاب متصلين حالياً.</li>';
                } else {
                    let html = '';
                    users.forEach(data => {
                        html += `
                            <li style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.05);">
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <div style="width: 30px; height: 30px; border-radius: 50%; background: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.9rem;">
                                        ${data.name ? data.name.charAt(0) : 'U'}
                                    </div>
                                    <div>
                                        <span style="font-size: 0.95rem; display: block;">${data.name || data.username}</span>
                                        <span style="font-size: 0.75rem; color: var(--text-muted);">@${data.username}</span>
                                    </div>
                                </div>
                                <span style="width: 8px; height: 8px; border-radius: 50%; background: #10B981; box-shadow: 0 0 5px #10B981;"></span>
                            </li>
                        `;
                    });
                    listEl.innerHTML = html;
                }
            }
        });

        // Setup unload hook
        window.addEventListener('beforeunload', () => {
            const currentUser = stateStore.getState('currentUserData');
            if (currentUser && currentUser.username) {
                PresenceController.stopPresenceSession(courseId, currentUser.username);
            }
        });
    }

    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}
export const PresenceUI = new PresenceUIClass();
