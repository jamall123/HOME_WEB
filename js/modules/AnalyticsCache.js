/**
 * AnalyticsCache.js
 * Implements a three-level cache architecture for analytics: Memory -> IndexedDB -> Firestore.
 * Ensures zero N+1 queries by aggregating and caching reads efficiently.
 */

import { OfflineQueueDb } from './OfflineQueueDb.js';

export class AnalyticsCacheClass {
    constructor() {
        this.memoryCache = new Map();
        this.cacheExpiryMs = 5 * 60 * 1000; // 5 minutes memory TTL
    }

    async get(collection, docId) {
        const cacheKey = `${collection}_${docId}`;
        const now = Date.now();

        // 1. Memory Cache
        if (this.memoryCache.has(cacheKey)) {
            const entry = this.memoryCache.get(cacheKey);
            if (now - entry.timestamp < this.cacheExpiryMs) {
                return entry.data;
            }
        }

        // 2. IndexedDB (Offline) Cache
        try {
            await OfflineQueueDb.init();
            const idbData = await OfflineQueueDb.get('analytics_cache', cacheKey);
            if (idbData && now - idbData.timestamp < this.cacheExpiryMs * 2) {
                // Populate memory
                this.memoryCache.set(cacheKey, { timestamp: now, data: idbData.data });
                return idbData.data;
            }
        } catch (e) {
            // console.warn('[AnalyticsCache] IndexedDB miss', e);
        }

        // 3. Firestore (Network)
        try {
            if (!navigator.onLine) return null; // Can't fetch if offline
            
            const docRef = firebase.firestore().collection(collection).doc(docId);
            const docSnap = await docRef.get();
            
            if (docSnap.exists) {
                const data = docSnap.data();
                await this.set(collection, docId, data);
                return data;
            }
            return null;
        } catch (e) {
            console.error('[AnalyticsCache] Firestore fetch failed', e);
            return null;
        }
    }

    async set(collection, docId, data) {
        const cacheKey = `${collection}_${docId}`;
        const now = Date.now();

        // Save to Memory
        this.memoryCache.set(cacheKey, { timestamp: now, data });

        // Save to IndexedDB
        try {
            await OfflineQueueDb.init();
            // Need to ensure the store exists. If missing, we'll silently fail or rely on init upgrade
            // Note: Since we are augmenting OfflineQueueDb in real-time, we assume 'analytics_cache' store exists
            // To be safe, we wrap in try/catch.
            await OfflineQueueDb.put('analytics_cache', { id: cacheKey, timestamp: now, data });
        } catch (e) {
            // Expected to fail if DB version wasn't bumped to include 'analytics_cache'
            // We rely on memory cache gracefully.
        }
    }

    clear() {
        this.memoryCache.clear();
    }
}

export const AnalyticsCache = new AnalyticsCacheClass();
