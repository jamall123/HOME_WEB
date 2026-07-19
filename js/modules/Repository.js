/**
 * Repository.js
 * Centralized Data Access Object (DAO) that abstracts Firestore interactions.
 * Features built-in caching via StateStore/IndexedDB.
 */

import { jhomeDb } from './FirebaseAdapter.js';
import { StateStore } from './StateStore.js';

export const Repository = {
    
    /**
     * Fetch a course by ID with caching
     */
    async getCourse(courseId, forceRefresh = false) {
        const cacheKey = `course_${courseId}`;
        const cached = StateStore.getState(cacheKey);
        
        if (cached && !forceRefresh) {
            return cached;
        }

        try {
            const doc = await jhomeDb.collection('courses').doc(courseId).get();
            if (doc.exists) {
                const data = { id: doc.id, ...doc.data() };
                StateStore.setState(cacheKey, data, true); // Persist to LocalStorage
                return data;
            }
            return null;
        } catch (error) {
            console.error('[Repository] Failed to fetch course:', error);
            throw error;
        }
    },

    /**
     * Get user enrollment status for a specific course
     */
    async getEnrollment(userId, courseId) {
        try {
            const snap = await jhomeDb.collection('enrollments')
                .where('userId', '==', userId)
                .where('courseId', '==', courseId)
                .limit(1)
                .get();

            if (!snap.empty) {
                return { id: snap.docs[0].id, ...snap.docs[0].data() };
            }
            return null;
        } catch (error) {
            console.error('[Repository] Failed to fetch enrollment:', error);
            throw error;
        }
    },

    /**
     * Fetch all courses with pagination support
     */
    async getCourses(limit = 10, lastDoc = null) {
        try {
            let query = jhomeDb.collection('courses').limit(limit);
            if (lastDoc) {
                query = query.startAfter(lastDoc);
            }
            
            const snap = await query.get();
            const courses = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            return {
                courses,
                lastDoc: snap.docs[snap.docs.length - 1]
            };
        } catch (error) {
            console.error('[Repository] Failed to fetch courses:', error);
            throw error;
        }
    }

};
