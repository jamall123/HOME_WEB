/**
 * @file CurriculumRepository.js
 * @purpose Enterprise Data Layer for Curriculum and Lessons.
 * @responsibilities
 *  - Manage read/write operations for Curriculum hierarchy.
 * @collectionsUsed curriculum, curriculumLessons, curriculumAnalytics, curriculumAuditLogs, curriculumVersions
 */

import { FirebaseManager } from '../core/FirebaseManager.js';
import { Constants } from '../core/Constants.js';
import { ErrorHandler, AppError, ErrorCategory } from '../core/ErrorHandler.js';

export class CurriculumRepositoryClass {
    _handleError(error, method) {
        const enhancedError = new AppError(error.message, ErrorCategory.FIREBASE, error);
        ErrorHandler.handleError(enhancedError, `CurriculumRepository.${method}`);
        throw enhancedError;
    }

    async getSections(courseId) {
        try {
            const db = FirebaseManager.getFirestore();
            const snapshot = await db.collection(Constants.COLLECTIONS.CURRICULUM)
                .where('courseId', '==', courseId)
                .get();
            
            let docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            docs = docs.filter(doc => doc.status !== 'Deleted');
            docs.sort((a, b) => (a.order || 0) - (b.order || 0));
            return docs;
        } catch (error) {
            this._handleError(error, 'getSections');
        }
    }

    async getLessons(sectionId) {
        try {
            const db = FirebaseManager.getFirestore();
            const snapshot = await db.collection(Constants.COLLECTIONS.CURRICULUM_LESSONS)
                .where('sectionId', '==', sectionId)
                .get();
            
            let docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            docs = docs.filter(doc => doc.status !== 'Deleted');
            docs.sort((a, b) => (a.order || 0) - (b.order || 0));
            return docs;
        } catch (error) {
            this._handleError(error, 'getLessons');
        }
    }

    subscribeToSections(courseId, callback) {
        try {
            const db = FirebaseManager.getFirestore();
            return db.collection(Constants.COLLECTIONS.CURRICULUM)
                .where('courseId', '==', courseId)
                .onSnapshot(snapshot => {
                    let docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    docs = docs.filter(doc => doc.status !== 'Deleted');
                    docs.sort((a, b) => (a.order || 0) - (b.order || 0));
                    callback(docs);
                }, error => {
                    this._handleError(error, 'subscribeToSections');
                });
        } catch (error) {
            this._handleError(error, 'subscribeToSections');
        }
    }

    subscribeToLessons(sectionId, callback) {
        try {
            const db = FirebaseManager.getFirestore();
            return db.collection(Constants.COLLECTIONS.CURRICULUM_LESSONS)
                .where('sectionId', '==', sectionId)
                .onSnapshot(snapshot => {
                    let docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    docs = docs.filter(doc => doc.status !== 'Deleted');
                    docs.sort((a, b) => (a.order || 0) - (b.order || 0));
                    callback(docs);
                }, error => {
                    this._handleError(error, 'subscribeToLessons');
                });
        } catch (error) {
            this._handleError(error, 'subscribeToLessons');
        }
    }

    async reorderItems(items, collectionName) {
        if (!items || items.length === 0) return;
        try {
            const db = FirebaseManager.getFirestore();
            const batch = db.batch();
            const collectionRef = db.collection(collectionName);

            items.forEach(item => {
                const docRef = collectionRef.doc(item.id);
                batch.update(docRef, { 
                    order: item.order,
                    updatedAt: FirebaseManager.getServerTimestamp()
                });
            });
            await batch.commit();
        } catch (error) {
            this._handleError(error, 'reorderItems');
        }
    }

    async addSection(courseId, title, order) {
        try {
            const db = FirebaseManager.getFirestore();
            const data = {
                courseId: courseId,
                title: title,
                order: order,
                status: 'Draft',
                createdAt: FirebaseManager.getServerTimestamp(),
                updatedAt: FirebaseManager.getServerTimestamp()
            };
            const docRef = await db.collection(Constants.COLLECTIONS.CURRICULUM).add(data);
            return docRef;
        } catch (error) {
            this._handleError(error, 'addSection');
        }
    }

    async addLesson(sectionId, lessonData) {
        try {
            const db = FirebaseManager.getFirestore();
            const data = {
                sectionId: sectionId,
                ...lessonData,
                createdAt: FirebaseManager.getServerTimestamp(),
                updatedAt: FirebaseManager.getServerTimestamp()
            };
            const docRef = await db.collection(Constants.COLLECTIONS.CURRICULUM_LESSONS).add(data);
            return docRef;
        } catch (error) {
            this._handleError(error, 'addLesson');
        }
    }

    async updateLesson(lessonId, updates) {
        try {
            const db = FirebaseManager.getFirestore();
            updates.updatedAt = FirebaseManager.getServerTimestamp();
            await db.collection(Constants.COLLECTIONS.CURRICULUM_LESSONS).doc(lessonId).update(updates);
        } catch (error) {
            this._handleError(error, 'updateLesson');
        }
    }

    async updateLessonStatus(lessonId, status) {
        try {
            const db = FirebaseManager.getFirestore();
            await db.collection(Constants.COLLECTIONS.CURRICULUM_LESSONS).doc(lessonId).update({
                status: status,
                updatedAt: FirebaseManager.getServerTimestamp()
            });
        } catch (error) {
            this._handleError(error, 'updateLessonStatus');
        }
    }

    async softDelete(collectionName, documentId, userId) {
        try {
            const db = FirebaseManager.getFirestore();
            const docRef = db.collection(collectionName).doc(documentId);
            await docRef.update({
                status: 'Deleted',
                updatedAt: FirebaseManager.getServerTimestamp(),
                deletedBy: userId,
                deletedAt: FirebaseManager.getServerTimestamp()
            });
        } catch (error) {
            this._handleError(error, 'softDelete');
        }
    }

    async getCourseSettings(courseId) {
        try {
            const db = FirebaseManager.getFirestore();
            const doc = await db.collection(Constants.COLLECTIONS.COURSES).doc(courseId).get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            this._handleError(error, 'getCourseSettings');
        }
    }

    async logAnalyticsEvent(eventName, eventData) {
        try {
            const db = FirebaseManager.getFirestore();
            await db.collection(Constants.COLLECTIONS.CURRICULUM_ANALYTICS).add({
                event: eventName,
                data: eventData,
                timestamp: FirebaseManager.getServerTimestamp()
            });
        } catch (error) {
            console.warn("[CurriculumRepository] Failed to log analytics.", error);
        }
    }

    async logAuditAction(action, entityId, entityType, oldData, newData, userId) {
        try {
            const db = FirebaseManager.getFirestore();
            const batch = db.batch();
            
            const auditRef = db.collection(Constants.COLLECTIONS.CURRICULUM_AUDIT_LOGS).doc();
            batch.set(auditRef, {
                action: action,
                entityId: entityId,
                entityType: entityType,
                userId: userId,
                timestamp: FirebaseManager.getServerTimestamp()
            });

            if (oldData && newData) {
                const versionRef = db.collection(Constants.COLLECTIONS.CURRICULUM_VERSIONS).doc();
                batch.set(versionRef, {
                    entityId: entityId,
                    entityType: entityType,
                    versionData: newData,
                    previousData: oldData,
                    timestamp: FirebaseManager.getServerTimestamp(),
                    userId: userId
                });
            }

            await batch.commit();
        } catch (error) {
            console.warn("[CurriculumRepository] Failed to log audit.", error);
        }
    }
}

export const CurriculumRepository = new CurriculumRepositoryClass();
