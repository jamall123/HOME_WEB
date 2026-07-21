/**
 * InstructorService.js
 * Handles all database and storage transactions for the Instructor Control Center.
 * Strict MVC: UI and Controller do not talk to Firebase directly.
 */

export class InstructorServiceClass {
    constructor() {
        this.db = firebase.firestore();
        this.storage = firebase.storage();
    }

    /**
     * Updates the instructor's global profile in the users collection.
     */
    async updateProfile(uid, profileData) {
        if (!uid) throw new Error("No UID provided");
        await this.db.collection('users').doc(uid).set(profileData, { merge: true });
    }

    /**
     * Uploads media to Firebase Storage and returns the download URL.
     * Supports resumable uploads and progress callbacks.
     */
    uploadMedia(file, path, progressCallback = null) {
        return new Promise((resolve, reject) => {
            const ref = this.storage.ref().child(`${path}/${Date.now()}_${file.name}`);
            const task = ref.put(file);

            task.on('state_changed', 
                (snapshot) => {
                    if (progressCallback) {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        progressCallback(progress);
                    }
                }, 
                (error) => reject(error), 
                async () => {
                    const url = await task.snapshot.ref.getDownloadURL();
                    resolve(url);
                }
            );
        });
    }

    /**
     * Updates the active teaching mode in active_sessions collection.
     */
    async updateTeachingMode(courseId, modePayload) {
        const payload = {
            ...modePayload,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        await this.db.collection('active_sessions').doc(courseId).set(payload, { merge: true });
    }

    /**
     * Updates classroom locks/permissions.
     */
    async updateClassroomState(courseId, statePayload) {
        await this.db.collection('active_sessions').doc(courseId).set({
            permissions: statePayload,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    }

    /**
     * Fetches all resources for the course.
     */
    async getResources(courseId) {
        const snap = await this.db.collection('lessonResources')
            .where('courseId', '==', courseId)
            .get();
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    /**
     * Posts a new announcement to the course.
     */
    async postAnnouncement(courseId, data) {
        await (await import('../core/CommandBus.js')).commandBus.dispatch({ domain: 'generic', action: 'add', payload: { collection: 'lessonAnnouncements', data: {
            courseId,
            ...data,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        } } });
    }
}

export const InstructorService = new InstructorServiceClass();
