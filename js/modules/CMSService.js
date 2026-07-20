import { Logger } from './Logger.js';

// Helper: dispatch via the new unified BackendGateway
async function gateway(domain, action, entity, payload) {
    const { backendGateway } = await import('../core/BackendGateway.js');
    return backendGateway.execute({ domain, action, entity, payload });
}

class CMSServiceClass {
    constructor() {
        this.db = window.firebase ? window.firebase.firestore() : null;
    }

    // ─── READ helpers (Firestore direct — reads are cheap & real-time) ────────

    async _read(collection, orderField = null, limitCount = 100) {
        if (!this.db) return [];
        let q = this.db.collection(collection);
        if (orderField) q = q.orderBy(orderField, 'desc');
        q = q.limit(limitCount);
        const snap = await q.get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    async _readPaginated(collection, limitCount = 50, startAfterDoc = null, orderField = 'createdAt') {
        if (!this.db) return { data: [], lastVisible: null };
        let q = this.db.collection(collection).orderBy(orderField, 'desc').limit(limitCount);
        if (startAfterDoc) q = q.startAfter(startAfterDoc);
        const snap = await q.get();
        return {
            data: snap.docs.map(d => ({ id: d.id, ...d.data() })),
            lastVisible: snap.docs[snap.docs.length - 1] || null
        };
    }

    async _readDoc(collection, id) {
        if (!this.db) return null;
        const doc = await this.db.collection(collection).doc(id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    }

    // ─── BANK ACCOUNTS ────────────────────────────────────────────────────────
    async getBankAccounts() { return this._read('bank_accounts'); }
    // (not yet migrated — keep as-is until bank_accounts function is created)
    async addBankAccount(data) { return this.db.collection('bank_accounts').add(data); }
    async deleteBankAccount(id) { return this.db.collection('bank_accounts').doc(id).delete(); }

    // ─── USERS (Credentials / Profiles) ──────────────────────────────────────
    async getUsers(limitCount = 50, startAfterDoc = null) {
        return this._readPaginated('courses_credentials', limitCount, startAfterDoc);
    }
    async createUser(data) {
        return gateway('users', 'create', null, data);
    }
    async updateUser(uid, data) {
        return gateway('users', 'update', null, { uid, ...data });
    }
    async changeUserRole(uid, role) {
        return gateway('users', 'changeRole', null, { uid, role });
    }
    async disableUser(uid) {
        return gateway('users', 'disable', null, { uid });
    }
    async enableUser(uid) {
        return gateway('users', 'enable', null, { uid });
    }
    async resetUserPassword(email) {
        return gateway('users', 'resetPassword', null, { email });
    }
    async resendUserVerification(email) {
        return gateway('users', 'resendVerification', null, { email });
    }
    async deleteUser(uid) {
        return gateway('users', 'delete', null, { uid });
    }

    // ─── ENROLLMENT REQUESTS ──────────────────────────────────────────────────
    async getEnrollmentRequests(limitCount = 50, startAfterDoc = null) {
        return this._readPaginated('enrollmentRequests', limitCount, startAfterDoc);
    }
    async updateRequestStatus(id, status) {
        return gateway('academy_enrollments', 'updateStatus', null, { id, status });
    }
    async approveEnrollment(id, requestData) {
        return gateway('academy_enrollments', 'approve', null, { id, requestData });
    }
    async rejectEnrollment(id) {
        return gateway('academy_enrollments', 'reject', null, { id });
    }
    async deleteRequest(id) {
        return gateway('academy_enrollments', 'delete', null, { id });
    }

    // ─── COURSES ──────────────────────────────────────────────────────────────
    async getCourses() { return this._read('courses'); }
    async getCourseById(id) { return this._readDoc('courses', id); }
    async saveCourse(id, data) {
        return gateway('academy_courses', 'save', 'course', { id, courseData: data });
    }
    async publishCourse(id) {
        return gateway('academy_courses', 'publish', 'course', { id });
    }
    async archiveCourse(id) {
        return gateway('academy_courses', 'archive', 'course', { id });
    }
    async deleteCourse(id) {
        return gateway('academy_courses', 'delete', 'course', { id });
    }

    // ─── POSTS ────────────────────────────────────────────────────────────────
    async getPosts() { return this._read('posts', 'publishedAt'); }
    async getPostById(id) { return this._readDoc('posts', id); }
    async savePost(id, data) {
        return gateway('cms_content', 'save', 'post', { id: id || null, data });
    }
    async publishPost(id) {
        return gateway('cms_content', 'publish', 'post', { id });
    }
    async deletePost(id) {
        return gateway('cms_content', 'delete', 'post', { id });
    }

    // ─── SUCCESS STORIES ──────────────────────────────────────────────────────
    async getStories() { return this._read('stories', 'createdAt'); }
    async getStoryById(id) { return this._readDoc('stories', id); }
    async saveStory(id, data) {
        return gateway('cms_content', 'save', 'story', { id: id || null, data });
    }
    async deleteStory(id) {
        return gateway('cms_content', 'delete', 'story', { id });
    }

    // ─── PROJECTS ─────────────────────────────────────────────────────────────
    async getProjects() { return this._read('projects'); }
    async getProjectById(id) { return this._readDoc('projects', id); }
    async saveProject(id, data) {
        return gateway('cms_content', 'save', 'project', { id: id || null, data });
    }
    async deleteProject(id) {
        return gateway('cms_content', 'delete', 'project', { id });
    }

    // ─── CONTACT MESSAGES ────────────────────────────────────────────────────
    async getContactMessages() { return this._read('messages', 'createdAt'); }
    async markMessageRead(id) {
        return gateway('contact', 'markRead', null, { id });
    }
    async replyToMessage(id, replyMessage) {
        return gateway('contact', 'reply', null, { id, replyMessage });
    }
    async deleteContactMessage(id) {
        return gateway('contact', 'delete', null, { id });
    }

    // ─── SETTINGS ────────────────────────────────────────────────────────────
    async getSettings(section = 'global') {
        const result = await gateway('cms_settings', 'get', null, { section });
        return result?.data?.data ?? null;
    }
    async saveSettings(section = 'global', data) {
        return gateway('cms_settings', 'save', null, { section, data });
    }
}

export const CMSService = new CMSServiceClass();
