import { DI } from '../di.js';
export class FeatureManager {
    db;
    flags = new Map();
    lastFetchTime = 0;
    CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes
    constructor(db) {
        this.db = db;
    }
    async isEnabled(key, context) {
        await this.ensureCache();
        const flag = this.flags.get(key);
        if (!flag) {
            DI.logger.warn(`Feature flag '${key}' not found, defaulting to false.`);
            return false;
        }
        if (!flag.enabled) {
            return false;
        }
        // Tenant override
        if (context?.tenantId && flag.allowedTenants && flag.allowedTenants.length > 0) {
            if (flag.allowedTenants.includes(context.tenantId)) {
                return true;
            }
        }
        // User override
        if (context?.userId && flag.allowedUsers && flag.allowedUsers.length > 0) {
            if (flag.allowedUsers.includes(context.userId)) {
                return true;
            }
        }
        // Percentage rollout
        if (flag.percentageRollout !== undefined && context?.userId) {
            const hash = this.hashString(`${key}:${context.userId}`);
            if ((hash % 100) < flag.percentageRollout) {
                return true;
            }
            return false; // Not in the rollout group
        }
        return true; // Globally enabled
    }
    async ensureCache() {
        const now = Date.now();
        if (now - this.lastFetchTime < this.CACHE_TTL_MS) {
            return;
        }
        try {
            // Assuming a global settings collection
            const snapshot = await this.db.collection('system_config').doc('features').get();
            if (snapshot.exists) {
                const data = snapshot.data();
                if (data && data.flags) {
                    this.flags.clear();
                    for (const flag of data.flags) {
                        this.flags.set(flag.key, flag);
                    }
                }
            }
            this.lastFetchTime = Date.now();
            DI.logger.debug('Refreshed feature flags from remote config.');
        }
        catch (error) {
            DI.logger.error('Failed to fetch feature flags from remote config', { error });
        }
    }
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }
}
//# sourceMappingURL=FeatureManager.js.map