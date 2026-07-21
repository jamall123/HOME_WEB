/**
 * CurriculumService.js
 * Sole Firestore Gateway for Curriculum Engine.
 * Handles fetching, batching, soft-deleting, and local caching.
 */

class CurriculumServiceClass {
    constructor() {
        this.db = firebase.firestore();
    }

    /**
     * Fetches the curriculum sections for a specific course.
     */
    async getSections(courseId) {
        try {
            const snapshot = await this.db.collection('curriculum')
                .where('courseId', '==', courseId)
                .where('status', '!=', 'Deleted')
                .orderBy('status') // To satisfy inequality requirements
                .orderBy('order')
                .get();

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("[CurriculumService] Failed to fetch sections:", error);
            throw new Error('NetworkError');
        }
    }

    /**
     * Fetches lessons for a specific section.
     */
    async getLessons(sectionId) {
        try {
            const snapshot = await this.db.collection('curriculumLessons')
                .where('sectionId', '==', sectionId)
                .where('status', '!=', 'Deleted')
                .orderBy('status')
                .orderBy('order')
                .get();

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("[CurriculumService] Failed to fetch lessons:", error);
            throw new Error('NetworkError');
        }
    }

    /**
     * Batch update ordering for sections or lessons.
     * @param {Array} items Array of {id, order} objects
     * @param {String} collectionName 'curriculum' or 'curriculumLessons'
     */
    async reorderItems(items, collectionName) {
        if (!items || items.length === 0) return;
        
        const batch = this.db.batch();
        const collectionRef = this.db.collection(collectionName);

        items.forEach(item => {
            const docRef = collectionRef.doc(item.id);
            batch.update(docRef, { 
                order: item.order,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });

        try {
            await batch.commit();
        } catch (error) {
            console.error(`[CurriculumService] Failed to reorder ${collectionName}:`, error);
            throw new Error('SyncError');
        }
    }

    /**
     * Create a new section
     */
    async addSection(courseId, title, order) {
        try {
            const docRef = await (await import('../core/CommandBus.js')).commandBus.dispatch({ domain: 'generic', action: 'add', payload: { collection: 'curriculum', data: {
                courseId: courseId,
                title: title,
                order: order,
                status: 'Draft',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            } } });
            return docRef;
        } catch (error) {
            console.error(`[CurriculumService] Failed to add section:`, error);
            throw new Error('SyncError');
        }
    }

    /**
     * Soft delete a curriculum entity.
     */
    async softDelete(collectionName, documentId, userId) {
        const docRef = this.db.collection(collectionName).doc(documentId);
        try {
            await docRef.update({
                status: 'Deleted',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                deletedBy: userId,
                deletedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error(`[CurriculumService] Failed to soft delete:`, error);
            throw new Error('SyncError');
        }
    }

    // Additional CRUD operations will be added as required.
}

export const CurriculumService = new CurriculumServiceClass();
