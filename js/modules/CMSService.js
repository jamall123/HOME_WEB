import { Logger } from './Logger.js';

class CMSServiceClass {
    constructor() {
        this.db = window.firebase ? window.firebase.firestore() : null;
    }

    // ------------------------------------------------
    // Bank Accounts
    // ------------------------------------------------
    async getBankAccounts() {
        if (!this.db) return [];
        const snap = await this.db.collection('bank_accounts').get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    async addBankAccount(data) {
        return this.db.collection('bank_accounts').add(data);
    }
    async deleteBankAccount(id) {
        return this.db.collection('bank_accounts').doc(id).delete();
    }

    // ------------------------------------------------
    // Users (Courses Credentials)
    // ------------------------------------------------
    async getUsers() {
        if (!this.db) return [];
        const snap = await this.db.collection('courses_credentials').get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    async addUser(id, data) {
        return this.db.collection('courses_credentials').doc(id).set(data);
    }
    async deleteUser(id) {
        return this.db.collection('courses_credentials').doc(id).delete();
    }

    // ------------------------------------------------
    // Enrollment Requests
    // ------------------------------------------------
    async getEnrollmentRequests() {
        if (!this.db) return [];
        const snap = await this.db.collection('enrollmentRequests').orderBy('createdAt', 'desc').get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    async updateRequestStatus(id, status) {
        return this.db.collection('enrollmentRequests').doc(id).update({ status });
    }
    async deleteRequest(id) {
        return this.db.collection('enrollmentRequests').doc(id).delete();
    }

    // ------------------------------------------------
    // Contact Messages
    // ------------------------------------------------
    async getContactMessages() {
        if (!this.db) return [];
        const snap = await this.db.collection('contactMessages').orderBy('createdAt', 'desc').get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    async markMessageRead(id) {
        return this.db.collection('contactMessages').doc(id).update({ read: true });
    }
    async deleteContactMessage(id) {
        return this.db.collection('contactMessages').doc(id).delete();
    }

    // ------------------------------------------------
    // Courses
    // ------------------------------------------------
    async getCourses() {
        if (!this.db) return [];
        const snap = await this.db.collection('courses').get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    async getCourseById(id) {
        const doc = await this.db.collection('courses').doc(id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    }
    async saveCourse(id, data) {
        data.updatedAt = window.firebase.firestore.FieldValue.serverTimestamp();
        if (id) {
            return this.db.collection('courses').doc(id).update(data);
        } else {
            data.createdAt = window.firebase.firestore.FieldValue.serverTimestamp();
            return this.db.collection('courses').add(data);
        }
    }
    async deleteCourse(id) {
        return this.db.collection('courses').doc(id).delete();
    }

    // ------------------------------------------------
    // Posts
    // ------------------------------------------------
    async getPosts() {
        if (!this.db) return [];
        try {
            const snap = await this.db.collection('posts').orderBy('publishedAt', 'desc').get();
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (e) {
            // fallback
            const snap = await this.db.collection('posts').get();
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
    }
    async getPostById(id) {
        const doc = await this.db.collection('posts').doc(id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    }
    async savePost(id, data) {
        if (id) {
            return this.db.collection('posts').doc(id).update(data);
        } else {
            data.publishedAt = window.firebase.firestore.FieldValue.serverTimestamp();
            data.createdAt = window.firebase.firestore.FieldValue.serverTimestamp();
            data.views = 0;
            return this.db.collection('posts').add(data);
        }
    }
    async deletePost(id) {
        return this.db.collection('posts').doc(id).delete();
    }

    // ------------------------------------------------
    // Success Stories
    // ------------------------------------------------
    async getStories() {
        if (!this.db) return [];
        const snap = await this.db.collection('successStories').orderBy('createdAt', 'desc').get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    async getStoryById(id) {
        const doc = await this.db.collection('successStories').doc(id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    }
    async saveStory(id, data) {
        if (id) {
            return this.db.collection('successStories').doc(id).update(data);
        } else {
            data.createdAt = window.firebase.firestore.FieldValue.serverTimestamp();
            return this.db.collection('successStories').add(data);
        }
    }
    async deleteStory(id) {
        return this.db.collection('successStories').doc(id).delete();
    }

    // ------------------------------------------------
    // Projects
    // ------------------------------------------------
    async getProjects() {
        if (!this.db) return [];
        const snap = await this.db.collection('projects').get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    async getProjectById(id) {
        const doc = await this.db.collection('projects').doc(id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    }
    async saveProject(id, data) {
        if (id) {
            return this.db.collection('projects').doc(id).update(data);
        } else {
            return this.db.collection('projects').add(data);
        }
    }
    async deleteProject(id) {
        return this.db.collection('projects').doc(id).delete();
    }

    // ------------------------------------------------
    // Settings
    // ------------------------------------------------
    async getSettings() {
        if (!this.db) return null;
        const doc = await this.db.collection('settings').doc('global').get();
        return doc.exists ? doc.data() : null;
    }
    async saveSettings(data) {
        return this.db.collection('settings').doc('global').set(data, { merge: true });
    }
}

export const CMSService = new CMSServiceClass();
