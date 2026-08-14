/**
 * @file MediaRepository.js
 * @purpose Enterprise Data Layer for Media and File Storage.
 * @responsibilities
 *  - Retrieve and upload media to Firebase Storage.
 *  - Manage media metadata in Firestore.
 *  - Gateway for Agora Token Cloud Function.
 * @collectionsUsed Constants.COLLECTIONS.MEDIA_LIBRARY, Constants.COLLECTIONS.LESSON_RESOURCES
 * @cloudFunctionsUsed api_v1_media_agora
 * @snapshotListeners None
 * @transactions None
 * @publicAPI generateAgoraToken, uploadMedia, getMediaMetadata
 * @futureMigrationPlan Replace MediaManager and ResourceService Firebase calls with MediaRepository.
 */

import { FirebaseManager } from '../core/FirebaseManager.js';
import { ErrorHandler, AppError, ErrorCategory } from '../core/ErrorHandler.js';
import { Constants } from '../core/Constants.js';

export class MediaRepositoryClass {
    _handleError(error, method) {
        // Distinguish between Function errors and Storage errors based on the error code or context
        const category = error.code && error.code.startsWith('functions/') ? ErrorCategory.NETWORK : ErrorCategory.FIREBASE;
        const enhancedError = new AppError(error.message, category, error);
        ErrorHandler.handleError(enhancedError, `MediaRepository.${method}`);
        throw enhancedError;
    }

    /**
     * Executes the Agora Token Cloud Function.
     * @param {Object} payload { channelName, uid, role }
     */
    async generateAgoraToken(payload) {
        try {
            const functions = FirebaseManager.getFunctions();
            const generateToken = functions.httpsCallable('api_v1_media_agora');
            const result = await generateToken(payload);
            return result.data;
        } catch (error) {
            this._handleError(error, 'generateAgoraToken');
        }
    }

    async getMediaMetadata(courseId) {
        try {
            const db = FirebaseManager.getFirestore();
            const snapshot = await db.collection(Constants.COLLECTIONS.MEDIA_LIBRARY).where('courseId', '==', courseId).get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            this._handleError(error, 'getMediaMetadata');
        }
    }

    async getLessonResources(lessonId) {
        try {
            const db = FirebaseManager.getFirestore();
            const snapshot = await db.collection(Constants.COLLECTIONS.LESSON_RESOURCES).where('lessonId', '==', lessonId).get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            this._handleError(error, 'getLessonResources');
        }
    }

    async getActiveCourseResources(courseId) {
        try {
            const db = FirebaseManager.getFirestore();
            const snapshot = await db.collection(Constants.COLLECTIONS.LESSON_RESOURCES)
                .where('courseId', '==', courseId)
                .where('status', '==', 'active')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            this._handleError(error, 'getActiveCourseResources');
        }
    }

    /** Generates a new unique Firestore document ID for lessonResources. */
    generateResourceId() {
        return FirebaseManager.getFirestore().collection(Constants.COLLECTIONS.LESSON_RESOURCES).doc().id;
    }

    async findDuplicateResource(courseId, fileHash) {
        try {
            const db = FirebaseManager.getFirestore();
            const snap = await db.collection(Constants.COLLECTIONS.LESSON_RESOURCES)
                .where('courseId', '==', courseId)
                .where('fileHash', '==', fileHash)
                .where('status', '==', 'active')
                .get();
            return snap.empty ? null : snap.docs[0].data();
        } catch (error) {
            this._handleError(error, 'findDuplicateResource');
        }
    }

    async getResourcesByCourse(courseId, lessonId = null) {
        try {
            const db = FirebaseManager.getFirestore();
            let query = db.collection(Constants.COLLECTIONS.LESSON_RESOURCES)
                .where('courseId', '==', courseId)
                .where('status', '==', 'active');
            if (lessonId) query = query.where('lessonId', '==', lessonId);
            const snap = await query.orderBy('createdAt', 'desc').get();
            return snap.docs.map(d => d.data());
        } catch (error) {
            this._handleError(error, 'getResourcesByCourse');
        }
    }

    subscribeToResources(courseId, lessonId, callback) {
        try {
            const db = FirebaseManager.getFirestore();
            let query = db.collection(Constants.COLLECTIONS.LESSON_RESOURCES)
                .where('courseId', '==', courseId)
                .where('status', '==', 'active');
            
            // Note: We don't filter by lessonId here because we need backward compatibility
            // where resources without lessonId ('global') are shown.
            // Client-side filtering will handle this, similar to getResources().

            return query.orderBy('createdAt', 'desc').onSnapshot((snap) => {
                const resources = snap.docs.map(d => d.data());
                if (callback) callback(resources);
            }, (error) => {
                console.error("[MediaRepository] subscribeToResources error:", error);
            });
        } catch (error) {
            this._handleError(error, 'subscribeToResources');
        }
    }

    async softDeleteResource(resourceId) {
        try {
            const db = FirebaseManager.getFirestore();
            const docRef = db.collection(Constants.COLLECTIONS.LESSON_RESOURCES).doc(resourceId);
            const doc = await docRef.get();
            if (doc.exists) {
                const data = doc.data();
                if (data.storagePath) {
                    try { await FirebaseManager.getStorage().ref(data.storagePath).delete(); }
                    catch (e) { console.warn('[MediaRepository] Storage deletion failed', e); }
                }
                await docRef.update({
                    status: 'deleted',
                    updatedAt: FirebaseManager.getFirestoreFieldValue().serverTimestamp()
                });
            }
        } catch (error) {
            this._handleError(error, 'softDeleteResource');
        }
    }

    uploadMedia(filePath, file) {
        try {
            const storage = FirebaseManager.getStorage();
            return storage.ref(filePath).put(file);
        } catch (error) {
            this._handleError(error, 'uploadMedia');
        }
    }

    async uploadRecording(courseId, lessonId, timestamp, recordingBlob) {
        try {
            const fileName = `recordings/${courseId}/${lessonId || 'unlisted'}/recording_${timestamp}.webm`;
            const storageRef = FirebaseManager.getStorage().ref(fileName);
            await storageRef.put(recordingBlob, { contentType: 'video/webm' });
            return await storageRef.getDownloadURL();
        } catch (error) {
            this._handleError(error, 'uploadRecording');
        }
    }

    /**
     * Delete a storage object by its download URL.
     * @param {string} url
     */
    async deleteStorageObjectByUrl(url) {
        try {
            const storageRef = FirebaseManager.getStorage().refFromURL(url);
            await storageRef.delete();
        } catch (error) {
            this._handleError(error, 'deleteStorageObjectByUrl');
        }
    }

    async setMediaDeletedStatus(docId, isDeleted) {
        try {
            const db = FirebaseManager.getFirestore();
            if (isDeleted) {
                await db.collection(Constants.COLLECTIONS.MEDIA_LIBRARY).doc(docId).update({
                    deleted: true,
                    deletedAt: new Date().toISOString()
                });
            } else {
                await db.collection(Constants.COLLECTIONS.MEDIA_LIBRARY).doc(docId).update({
                    deleted: false,
                    deletedAt: null,
                    restoredAt: new Date().toISOString()
                });
            }
        } catch(error) {
            this._handleError(error, 'setMediaDeletedStatus');
        }
    }

    async hardDeleteMedia(docId) {
        try {
            const db = FirebaseManager.getFirestore();
            await db.collection(Constants.COLLECTIONS.MEDIA_LIBRARY).doc(docId).delete();
        } catch (error) {
            this._handleError(error, 'hardDeleteMedia');
        }
    }

    async getMediaDoc(docId) {
        try {
            const db = FirebaseManager.getFirestore();
            const doc = await db.collection(Constants.COLLECTIONS.MEDIA_LIBRARY).doc(docId).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } catch(error) {
            this._handleError(error, 'getMediaDoc');
        }
    }

    async setCourseLiveStatus(courseId, isLive, liveChannel) {
        try {
            const db = FirebaseManager.getFirestore();
            await db.collection(Constants.COLLECTIONS.COURSES).doc(courseId).update({
                isLive,
                liveChannel
            });
        } catch (error) {
            this._handleError(error, 'setCourseLiveStatus');
        }
    }
    
    async attachRecordingToLesson(lessonId, downloadUrl, timestamp) {
        try {
            const db = FirebaseManager.getFirestore();
            await db.collection(Constants.COLLECTIONS.CURRICULUM_LESSONS).doc(lessonId).update({
                recordings: FirebaseManager.getFirestoreFieldValue().arrayUnion({
                    url: downloadUrl,
                    timestamp: timestamp,
                    label: `تسجيل ${new Date(timestamp).toLocaleDateString('ar-SA')}`
                }),
                updatedAt: FirebaseManager.getFirestoreFieldValue().serverTimestamp()
            });
        } catch (error) {
            this._handleError(error, 'attachRecordingToLesson');
        }
    }

    /**
     * Reads the courses/{courseId}/resources subcollection used for analytics charting.
     * @param {string} courseId
     * @returns {Promise<Array>}
     */
    async getCourseResourceSubcollection(courseId) {
        try {
            const db = FirebaseManager.getFirestore();
            const snap = await db.collection(Constants.COLLECTIONS.COURSES).doc(courseId)
                .collection(Constants.SUBCOLLECTIONS.RESOURCES).get();
            return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            this._handleError(error, 'getCourseResourceSubcollection');
        }
    }
}

export const MediaRepository = new MediaRepositoryClass();
