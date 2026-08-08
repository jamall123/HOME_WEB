import { FirebaseManager } from '../core/FirebaseManager.js';
import { Constants } from '../core/Constants.js';

export const InstructorRepository = {
    get db() { return FirebaseManager.getFirestore(); },
    get storage() { return FirebaseManager.getStorage(); },

    async updateProfile(uid, profileData) {
        if (!uid) throw new Error("No UID provided");
        await this.db.collection(Constants.COLLECTIONS.USERS).doc(uid).set(profileData, { merge: true });
    },

    async updateCourseProfile(courseId, profileData) {
        if (!courseId) throw new Error("No courseId provided");
        await this.db.collection(Constants.COLLECTIONS.COURSES).doc(courseId).set({
            instructor: profileData.name || null,
            instructorSpecialty: profileData.specialty || null,
            instructorBio: profileData.bio || null,
            instructorPhoto: profileData.photo || null
        }, { merge: true });
    },

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
    },

    async updateTeachingMode(courseId, modePayload) {
        const payload = {
            updatedAt: FirebaseManager.getFirestoreFieldValue().serverTimestamp()
        };
        
        for (const [key, value] of Object.entries(modePayload)) {
            if (key === 'metadata' && typeof value === 'object') {
                for (const [metaKey, metaValue] of Object.entries(value)) {
                    payload[`metadata.${metaKey}`] = metaValue;
                }
            } else {
                payload[key] = value;
            }
        }
        
        try {
            await this.db.collection(Constants.COLLECTIONS.ACTIVE_SESSIONS).doc(courseId).update(payload);
        } catch (e) {
            const initialPayload = {
                ...modePayload,
                updatedAt: FirebaseManager.getFirestoreFieldValue().serverTimestamp()
            };
            await this.db.collection(Constants.COLLECTIONS.ACTIVE_SESSIONS).doc(courseId).set(initialPayload, { merge: true });
        }
    },

    async addChannelMessage(courseId, message) {
        if (!courseId) throw new Error("No courseId provided");
        await this.db.collection(Constants.COLLECTIONS.COURSES).doc(courseId).collection(Constants.COLLECTIONS.CHANNEL_MESSAGES).add(message);
    },

    async updateClassroomState(courseId, statePayload) {
        await this.db.collection(Constants.COLLECTIONS.ACTIVE_SESSIONS).doc(courseId).set({
            permissions: statePayload,
            updatedAt: FirebaseManager.getFirestoreFieldValue().serverTimestamp()
        }, { merge: true });
    },

    async getResources(courseId) {
        const snap = await this.db.collection(Constants.COLLECTIONS.LESSON_RESOURCES)
            .where('courseId', '==', courseId)
            .get();
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    
    async dispatchCommand(command) {
        const { commandBus } = await import('../core/CommandBus.js');
        return commandBus.dispatch(command);
    },

    async postAnnouncement(courseId, data) {
        await this.db.collection(Constants.COLLECTIONS.LESSON_ANNOUNCEMENTS).add({
            courseId,
            ...data,
            timestamp: FirebaseManager.getFirestoreFieldValue().serverTimestamp()
        });
    }
};
