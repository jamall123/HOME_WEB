import * as admin from 'firebase-admin';
import { AppError, ErrorCategory } from '../errors/AppError.js';

export class CacheService {
  private memoryCache = new Map<string, { value: any, expiry: number }>();

  constructor(private db: admin.firestore.Firestore) {}

  async get<T>(key: string): Promise<T | null> {
    // 1. Check Memory Cache
    const memItem = this.memoryCache.get(key);
    if (memItem && memItem.expiry > Date.now()) {
      return memItem.value as T;
    }

    // 2. Check Firestore Cache
    try {
      const doc = await this.db.collection('system_cache').doc(key).get();
      if (doc.exists) {
        const data = doc.data();
        if (data && data.expiry > Date.now()) {
          // Re-populate Memory Cache
          this.memoryCache.set(key, { value: data.value, expiry: data.expiry });
          return data.value as T;
        } else {
          // Expired
          await doc.ref.delete();
        }
      }
    } catch (error: any) {
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

  async set(key: string, value: any, ttlSeconds: number): Promise<void> {
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
    } catch (error: any) {
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
