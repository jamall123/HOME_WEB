/**
 * SessionExporter.js
 * Aggregates all data for an active session to prepare it for archiving.
 */

export class SessionExporterClass {
    constructor() {
        this.db = firebase.firestore();
    }

    async exportSession(courseId) {
        // console.log(`[SessionExporter] Gathering data for course: ${courseId}`);

        // 1. Get Chat Messages
        const chatSnap = await this.db.collection('course_chats')
            .where('courseId', '==', courseId)
            .get();
        const chatMessages = chatSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // 2. Get Resources
        const resSnap = await this.db.collection('lessonResources')
            .where('courseId', '==', courseId)
            .where('status', '==', 'active')
            .get();
        const resources = resSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // 3. Get Active Session Metadata
        const sessionDoc = await this.db.collection('active_sessions').doc(courseId).get();
        const sessionData = sessionDoc.exists ? sessionDoc.data() : {};

        // 4. Get Connected Users / Attendance Stats
        // In a real scenario, this might sum up studentProgress. 
        // For now, we take a snapshot of whoever is connected, or query attendance history.
        const attendanceSnap = await this.db.collection('courses').doc(courseId).collection('connected_users').get();
        const attendanceList = attendanceSnap.docs.map(d => d.data());
        const totalMinutes = attendanceList.reduce((acc, user) => acc + (user.sessionDurationMinutes || 0), 0);

        return {
            courseId: courseId,
            startedAt: sessionData.createdAt || null,
            endedAt: firebase.firestore.FieldValue.serverTimestamp(),
            teachingMode: sessionData.mode || 'video',
            attendanceCount: attendanceSnap.size,
            attendanceMinutes: totalMinutes,
            resources: resources,
            chatMessages: chatMessages,
            statistics: {
                totalMessages: chatMessages.length,
                totalResources: resources.length
            }
        };
    }
}
export const SessionExporter = new SessionExporterClass();
