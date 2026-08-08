import { PresenceController } from '../presence/PresenceController.js';

export class InstructorAnalyticsClass {
    constructor() {
        this.controller = null;
        this.unsubscribePresence = null;
        this.onlineCount = 0;
    }

    init(controller) {
        this.controller = controller;
        this.startListening();
    }

    startListening() {
        const courseId = this.controller.engine.courseId;

        // Listen for online students - filter by recent heartbeat (last 90s)
        this.unsubscribePresence = PresenceController.listenToActiveUsers(courseId, users => {
            const now = Date.now();
            let activeCount = 0;
            users.forEach(data => {
                if (data.lastSeen) {
                    const ms = data.lastSeen.toMillis ? data.lastSeen.toMillis() : now;
                    if ((now - ms) < 90000) activeCount++;
                } else {
                    activeCount++;
                }
            });
            this.onlineCount = activeCount;
            this.updateUI();
        });
    }

    updateUI() {
        const el = document.getElementById('inst-stat-online');
        if (el) el.innerText = this.onlineCount;
    }

    destroy() {
        if (this.unsubscribePresence) this.unsubscribePresence();
    }
}
export const InstructorAnalytics = new InstructorAnalyticsClass();
