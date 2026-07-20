import { AppError, ErrorCategory } from '../errors/AppError.js';
export class CacheService {
    db;
    memoryCache = new Map();
    constructor(db) {
        this.db = db;
    }
    async get(key) {
        // 1. Check Memory Cache
        const memItem = this.memoryCache.get(key);
        if (memItem && memItem.expiry > Date.now()) {
            return memItem.value;
        }
        // 2. Check Firestore Cache
        try {
            const doc = await this.db.collection('system_cache').doc(key).get();
            if (doc.exists) {
                const data = doc.data();
                if (data && data.expiry > Date.now()) {
                    // Re-populate Memory Cache
                    this.memoryCache.set(key, { value: data.value, expiry: data.expiry });
                    return data.value;
                }
                else {
                    // Expired
                    await doc.ref.delete();
                }
            }
        }
        catch (error) {
            throw new AppError({
                message: `Cache error on GET: ${key}`,
                errorCode: 'CACHE_001',
                httpStatus: 500,
                category: ErrorCategory.INTERNAL,
                cause: error
            });
        }
        return null;
    }
    async set(key, value, ttlSeconds) {
        const expiry = Date.now() + (ttlSeconds * 1000);
        // 1. Set Memory Cache
        this.memoryCache.set(key, { value, expiry });
        // 2. Set Firestore Cache
        try {
            await this.db.collection('system_cache').doc(key).set({
                value,
                expiry,
                updatedAt: new Date().toISOString()
            });
        }
        catch (error) {
            throw new AppError({
                message: `Cache error on SET: ${key}`,
                errorCode: 'CACHE_002',
                httpStatus: 500,
                category: ErrorCategory.INTERNAL,
                cause: error
            });
        }
    }
}
//# sourceMappingURL=cacheService.js.map