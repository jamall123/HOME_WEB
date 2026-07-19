/**
 * ArchiveService.js
 * Handles saving and retrieving archived sessions.
 */

export class ArchiveServiceClass {
    constructor() {
        this.db = firebase.firestore();
    }

    async saveArchive(archiveData) {
        const sessionId = this.db.collection('archived_sessions').doc().id;
        const payload = {
            sessionId: sessionId,
            ...archiveData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await this.db.collection('archived_sessions').doc(sessionId).set(payload);
        return sessionId;
    }

    async getArchive(sessionId) {
        const doc = await this.db.collection('archived_sessions').doc(sessionId).get();
        if (!doc.exists) throw new Error("Archive not found");
        return doc.data();
    }

    async listArchives(courseId) {
        const snap = await this.db.collection('archived_sessions')
            .where('courseId', '==', courseId)
            .orderBy('createdAt', 'desc')
            .get();
        return snap.docs.map(d => d.data());
    }
}
export const ArchiveService = new ArchiveServiceClass();
