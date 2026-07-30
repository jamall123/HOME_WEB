/**
 * InstructorService.js
 * Handles all database and storage transactions for the Instructor Control Center.
 * Strict MVC: UI and Controller do not talk to Firebase directly.
 */

export class InstructorServiceClass {
    constructor() {
        this.db = window.firebase.firestore();
        this.storage = window.firebase.storage();
    }

    /**
     * Updates the instructor's global profile in the users collection.
     */
    async updateProfile(uid, profileData) {
        if (!uid) throw new Error("No UID provided");
        await this.db.collection('users').doc(uid).set(profileData, { merge: true });
    }

    /**
     * Updates the instructor's profile specifically on the course document.
     */
    async updateCourseProfile(courseId, profileData) {
        if (!courseId) throw new Error("No courseId provided");
        await this.db.collection('courses').doc(courseId).set({
            instructor: profileData.name || null,
            instructorSpecialty: profileData.specialty || null,
            instructorBio: profileData.bio || null,
            instructorPhoto: profileData.photo || null
        }, { merge: true });
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

    async updateTeachingMode(courseId, modePayload) {
        const payload = {
            updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Flatten payload for Firestore to do a true deep merge
        for (const [key, value] of Object.entries(modePayload)) {
            if (key === 'metadata' && typeof value === 'object') {
                for (const [metaKey, metaValue] of Object.entries(value)) {
                    payload[`metadata.${metaKey}`] = metaValue;
                }
            } else {
                payload[key] = value;
            }
        }
        
        await this.db.collection('active_sessions').doc(courseId).update(payload).catch(async (e) => {
             // If doc doesn't exist, create it
             const initialPayload = {
                 ...modePayload,
                 updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
             };
             await this.db.collection('active_sessions').doc(courseId).set(initialPayload, { merge: true });
        });
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
