import { FirebaseManager } from '../core/FirebaseManager.js';
import { Constants } from '../core/Constants.js';
export const AdminRepository = {
    get db() { return FirebaseManager.getFirestore(); },
    get storage() { return FirebaseManager.getStorage(); },

    async _read(collection, orderField = null, limitCount = 100) {
        if (!this.db) return [];
        let q = this.db.collection(collection);
        if (orderField) q = q.orderBy(orderField, 'desc');
        q = q.limit(limitCount);
        const snap = await q.get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    async _readPaginated(collection, limitCount = 50, startAfterDoc = null, orderField = 'createdAt') {
        if (!this.db) return { data: [], lastVisible: null };
        let q = this.db.collection(collection).orderBy(orderField, 'desc').limit(limitCount);
        if (startAfterDoc) q = q.startAfter(startAfterDoc);
        const snap = await q.get();
        return {
            data: snap.docs.map(d => ({ id: d.id, ...d.data() })),
            lastVisible: snap.docs[snap.docs.length - 1] || null
        };
    },

    async _readDoc(collection, id) {
        if (!this.db) return null;
        const doc = await this.db.collection(collection).doc(id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    },

    async getBankAccounts() { return this._read('bank_accounts'); },
    async addBankAccount(data) { return this.db.collection(Constants.COLLECTIONS.BANK_ACCOUNTS).add(data); },
    async deleteBankAccount(id) { return this.db.collection(Constants.COLLECTIONS.BANK_ACCOUNTS).doc(id).delete(); },
    
    async getAuditLogs(limitCount = 30) {
        const snap = await this.db.collection(Constants.COLLECTIONS.AUDIT_LOGS).orderBy('timestamp', 'desc').limit(limitCount).get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    async logAuditAction(action, details, userStr) {
        await this.db.collection(Constants.COLLECTIONS.AUDIT_LOGS).add({
            action,
            details,
            admin: userStr,
            timestamp: FirebaseManager.getFirestoreFieldValue().serverTimestamp()
        });
    },

    async getSettingsDoc(docId) {
        const doc = await this.db.collection(Constants.COLLECTIONS.SETTINGS).doc(docId).get();
        return doc.exists ? doc.data() : null;
    },

    async setSettingsDoc(docId, payload) {
        await this.db.collection(Constants.COLLECTIONS.SETTINGS).doc(docId).set(payload, { merge: true });
    },

    async getMediaLibrary(url) {
        const querySnapshot = await this.db.collection(Constants.COLLECTIONS.MEDIA_LIBRARY).where('url', '==', url).limit(1).get();
        return !querySnapshot.empty ? { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } : null;
    },

    async addMediaLibraryRecord(payload) {
        await this.db.collection(Constants.COLLECTIONS.MEDIA_LIBRARY).add({
            ...payload,
            createdAt: FirebaseManager.getFirestoreFieldValue().serverTimestamp()
        });
    },

    async deleteMediaLibraryRecord(id) {
        await this.db.collection(Constants.COLLECTIONS.MEDIA_LIBRARY).doc(id).delete();
    },
    
    uploadMedia(file, folder, progressCallback = null) {
        return new Promise((resolve, reject) => {
            const fileRef = this.storage.ref().child(`${folder}/${Date.now()}_${file.name}`);
            const task = fileRef.put(file);

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
                    resolve({ url, path: fileRef.fullPath });
                }
            );
        });
    },
    
    async deleteMediaFile(path) {
        await this.storage.ref().child(path).delete();
    },

    async updateMediaUsage(docId, location) {
        await this.db.collection(Constants.COLLECTIONS.MEDIA_LIBRARY).doc(docId).update({
            usageCount: FirebaseManager.getFirestoreFieldValue().increment(1),
            lastUsed: FirebaseManager.getFirestoreFieldValue().serverTimestamp(),
            tags: FirebaseManager.getFirestoreFieldValue().arrayUnion(location)
        });
    },

    async executeGateway(domain, action, entity, payload) {
        const { backendGateway } = await import('../core/BackendGateway.js');
        return backendGateway.execute({ domain, action, entity, payload });
    }
};
