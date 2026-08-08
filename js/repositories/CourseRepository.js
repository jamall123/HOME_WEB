/**
 * @file CourseRepository.js
 * @purpose Enterprise Data Layer for Courses.
 * @responsibilities
 *  - Perform raw Firestore operations on the COURSES collection.
 *  - Catch and route all errors through ErrorHandler.
 * @collectionsUsed Constants.COLLECTIONS.COURSES
 * @cloudFunctionsUsed None
 * @snapshotListeners onCourseSnapshot, onAllCoursesSnapshot
 * @transactions None
 * @publicAPI getCourse, getActiveCourses, onCourseSnapshot, onAllCoursesSnapshot
 * @futureMigrationPlan Modules should replace direct db.collection(Constants.COLLECTIONS.COURSES) with CourseRepository.
 */

import { FirebaseManager } from '../core/FirebaseManager.js';
import { ErrorHandler, AppError, ErrorCategory } from '../core/ErrorHandler.js';
import { Constants } from '../core/Constants.js';

export class CourseRepositoryClass {
    _handleError(error, method) {
        const enhancedError = new AppError(error.message, ErrorCategory.FIREBASE, error);
        ErrorHandler.handleError(enhancedError, `CourseRepository.${method}`);
        throw enhancedError;
    }

    _getCollection() {
        return FirebaseManager.getFirestore().collection(Constants.COLLECTIONS.COURSES);
    }

    async getCourse(courseId) {
        try {
            const doc = await this._getCollection().doc(courseId).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } catch (error) {
            this._handleError(error, 'getCourse');
        }
    }

    async getCoursesCount() {
        try {
            return await this._getCollection().count().get();
        } catch (error) {
            this._handleError(error, 'getCoursesCount');
        }
    }

    async getActiveCourses() {
        try {
            const snapshot = await this._getCollection().where('status', '==', Constants.STATUS.ACTIVE).get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            this._handleError(error, 'getActiveCourses');
        }
    }

    async getAllCourses() {
        try {
            const snapshot = await this._getCollection().orderBy('createdAt', 'desc').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            this._handleError(error, 'getAllCourses');
        }
    }

    async updateCourse(courseId, data) {
        try {
            await this._getCollection().doc(courseId).update(data);
        } catch (error) {
            this._handleError(error, 'updateCourse');
        }
    }

    onCourseSnapshot(courseId, callback) {
        try {
            return this._getCollection().doc(courseId).onSnapshot(doc => {
                callback(doc.exists ? { id: doc.id, ...doc.data() } : null);
            }, error => {
                this._handleError(error, 'onCourseSnapshot');
            });
        } catch (error) {
            this._handleError(error, 'onCourseSnapshot');
        }
    }

    onAllCoursesSnapshot(callback) {
        try {
            return this._getCollection().where('status', '==', Constants.STATUS.ACTIVE).onSnapshot(snapshot => {
                callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }, error => {
                this._handleError(error, 'onAllCoursesSnapshot');
            });
        } catch (error) {
            this._handleError(error, 'onAllCoursesSnapshot');
        }
    }

    /**
     * Clears the activeVideoUrl field from a course document.
     * @param {string} courseId
     */
    async clearActiveVideo(courseId) {
        try {
            await this._getCollection().doc(courseId).update({
                activeVideoUrl: FirebaseManager.getFirestoreFieldValue().delete()
            });
        } catch (error) {
            this._handleError(error, 'clearActiveVideo');
        }
    }

    /**
     * Adds slide image URLs to a course's slidesGallery array.
     * @param {string} courseId
     * @param {string[]} urls
     */
    async addSlidesToGallery(courseId, urls) {
        try {
            await this._getCollection().doc(courseId).update({
                slidesGallery: FirebaseManager.getFirestoreFieldValue().arrayUnion(...urls)
            });
        } catch (error) {
            this._handleError(error, 'addSlidesToGallery');
        }
    }
}

export const CourseRepository = new CourseRepositoryClass();
