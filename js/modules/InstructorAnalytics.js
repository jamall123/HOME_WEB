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
        const db = firebase.firestore();
        const courseId = this.controller.engine.courseId;

        // Listen for online students
        this.unsubscribePresence = db.collection('courses').doc(courseId)
            .collection('connected_users')
            .onSnapshot(snapshot => {
                this.onlineCount = snapshot.size;
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
