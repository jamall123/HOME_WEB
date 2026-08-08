/**
 * @file ContentRepository.js
 * @purpose Enterprise Data Layer for Blog Posts and Success Stories.
 * @responsibilities
 *  - Fetch blog posts and success stories.
 *  - Handle queries like getting a single post by id, or querying by category.
 * @collectionsUsed 'posts', 'successStories'
 */

import { FirebaseManager } from '../core/FirebaseManager.js';
import { Constants } from '../core/Constants.js';
import { ErrorHandler, AppError, ErrorCategory } from '../core/ErrorHandler.js';

export class ContentRepositoryClass {
    _handleError(error, method) {
        const enhancedError = new AppError(error.message, ErrorCategory.FIREBASE, error);
        ErrorHandler.handleError(enhancedError, `ContentRepository.${method}`);
        throw enhancedError;
    }

    // --- Page Content ---
    async getPageContent(pageKey) {
        try {
            return await FirebaseManager.getFirestore().collection(Constants.COLLECTIONS.PAGE_CONTENT).doc(pageKey).get();
        } catch (error) {
            this._handleError(error, 'getPageContent');
        }
    }

    // --- Posts ---
    _getPostsCollection() {
        return FirebaseManager.getFirestore().collection(Constants.COLLECTIONS.POSTS);
    }

    async getPostBySlug(slug) {
        try {
            const snap = await this._getPostsCollection()
                .where('slug', '==', slug)
                .where('status', '==', 'published')
                .limit(1)
                .get();
            return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
        } catch (error) {
            this._handleError(error, 'getPostBySlug');
        }
    }

    async getRelatedPosts(category, excludeId) {
        try {
            const snap = await this._getPostsCollection()
                .where('status', '==', 'published')
                .where('category', '==', category)
                .orderBy('publishedAt', 'desc')
                .limit(4)
                .get();
            return snap.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(p => p.id !== excludeId)
                .slice(0, 3);
        } catch (error) {
            this._handleError(error, 'getRelatedPosts');
        }
    }

    async incrementPostViews(postId) {
        try {
            await this._getPostsCollection().doc(postId).update({
                views: FirebaseManager.getFirestoreFieldValue().increment(1)
            });
        } catch (error) {
            this._handleError(error, 'incrementPostViews');
        }
    }

    async getPublishedPostsCount() {
        try {
            return await this._getPostsCollection().where('status', '==', 'published').count().get();
        } catch (error) {
            this._handleError(error, 'getPublishedPostsCount');
        }
    }

    // --- Success Stories ---
    _getStoriesCollection() {
        return FirebaseManager.getFirestore().collection(Constants.COLLECTIONS.SUCCESS_STORIES);
    }

    async getStories(category = 'all', limitCount = 50) {
        try {
            let q = this._getStoriesCollection().where('isPublished', '==', true);
            if (category !== 'all') {
                q = q.where('category', '==', category);
            }
            q = q.orderBy('createdAt', 'desc').limit(limitCount);

            const snap = await q.get();
            return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            this._handleError(error, 'getStories');
        }
    }

    async getStoryBySlug(slug) {
        try {
            const snap = await this._getStoriesCollection()
                .where('slug', '==', slug)
                .where('isPublished', '==', true)
                .limit(1)
                .get();
            return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
        } catch (error) {
            this._handleError(error, 'getStoryBySlug');
        }
    }

    async incrementStoryViews(storyId) {
        try {
            await this._getStoriesCollection().doc(storyId).update({
                views: FirebaseManager.getFirestoreFieldValue().increment(1)
            });
        } catch (error) {
            this._handleError(error, 'incrementStoryViews');
        }
    }

    async getPublishedStoriesCount() {
        try {
            return await this._getStoriesCollection().where('isPublished', '==', true).count().get();
        } catch (error) {
            this._handleError(error, 'getPublishedStoriesCount');
        }
    }

    // --- Combined Feed (Blog / Media) ---
    async getRecentMediaContent(limitCount) {
        try {
            const [postsSnap, storiesSnap] = await Promise.all([
                this._getPostsCollection()
                    .where('status', '==', 'published')
                    .orderBy('publishedAt', 'desc')
                    .limit(limitCount)
                    .get(),
                this._getStoriesCollection()
                    .where('isPublished', '==', true)
                    .orderBy('createdAt', 'desc')
                    .limit(limitCount)
                    .get()
            ]);

            const allContent = [];

            postsSnap.forEach(doc => {
                const data = doc.data();
                const dateObj = data.publishedAt?.toDate ? data.publishedAt.toDate() : new Date(0);
                allContent.push({ type: 'post', id: doc.id, date: dateObj, data });
            });

            storiesSnap.forEach(doc => {
                const data = doc.data();
                const dateObj = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(0);
                allContent.push({ type: 'story', id: doc.id, date: dateObj, data });
            });

            return allContent.sort((a, b) => b.date - a.date);
        } catch (error) {
            this._handleError(error, 'getRecentMediaContent');
        }
    }
}

export const ContentRepository = new ContentRepositoryClass();
