/**
 * AnalyticsEngine.js
 * Tracks Enterprise Resource & Session Analytics without excessive reads.
 */

import { OfflineSyncEngine } from '../offline/OfflineSyncEngine.js';

export class AnalyticsEngineClass {
    constructor() {
        this.buffer = new Map();
        // Flush buffer to firestore every 30 seconds to save writes
        setInterval(() => this.flush(), 30000);
    }

    trackDownload(resourceId, courseId) {
        this._incrementEvent('downloads', resourceId, courseId);
    }

    trackView(resourceId, courseId) {
        this._incrementEvent('views', resourceId, courseId);
    }

    _incrementEvent(eventType, resourceId, courseId) {
        const key = `${eventType}_${resourceId}`;
        if (!this.buffer.has(key)) {
            this.buffer.set(key, { count: 0, courseId, resourceId, type: eventType });
        }
        this.buffer.get(key).count++;
    }

    async flush() {
        if (this.buffer.size === 0) return;

        const operations = Array.from(this.buffer.values());
        this.buffer.clear(); // Clear memory fast

        try {
            for (const op of operations) {
                // To minimize reads, we can queue an increment via OfflineSyncEngine or Firebase directly
                // Using FieldValue.increment()
                const data = {};
                data[op.type] = { "$INCREMENT": op.count };

                // Update the resource doc directly with the increment
                await OfflineSyncEngine.queueOperation('lessonResources', op.resourceId, 'update', data);
            }
        } catch (e) {
            console.error('[AnalyticsEngine] Failed to flush stats', e);
        }
    }
}
export const AnalyticsEngine = new AnalyticsEngineClass();
