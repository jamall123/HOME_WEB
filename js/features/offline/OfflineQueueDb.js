/**
 * OfflineQueueDb.js
 * IndexedDB Wrapper for Offline Synchronization Pipeline
 */

export class OfflineQueueDbClass {
    constructor() {
        this.dbName = 'JhomeOfflineDB';
        this.dbVersion = 3; // Bump version for DLQ
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('upload_queue')) {
                    db.createObjectStore('upload_queue', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('metadata_sync')) {
                    db.createObjectStore('metadata_sync', { keyPath: 'syncId' });
                }
                if (!db.objectStoreNames.contains('search_index')) {
                    db.createObjectStore('search_index', { keyPath: 'resourceId' });
                }
                if (!db.objectStoreNames.contains('analytics_cache')) {
                    db.createObjectStore('analytics_cache', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('offline_dlq')) {
                    db.createObjectStore('offline_dlq', { keyPath: 'syncId' });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(true);
            };

            request.onerror = (event) => {
                console.error('[OfflineQueueDb] IndexedDB error:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async put(storeName, data) {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject('DB not initialized');
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(true);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async get(storeName, key) {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject('DB not initialized');
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject('DB not initialized');
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async delete(storeName, key) {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject('DB not initialized');
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve(true);
            request.onerror = (event) => reject(event.target.error);
        });
    }
}
export const OfflineQueueDb = new OfflineQueueDbClass();
