import { StorageValidator } from '../offline/StorageValidator.js';
import { CompressionEngine } from '../media/CompressionEngine.js';
import { UploadQueue } from '../room/UploadQueue.js';
import { HashEngine } from '../../core/HashEngine.js';
import { AIProcessingEngine } from '../ai/AIProcessingEngine.js';
import { OfflineSyncEngine } from '../offline/OfflineSyncEngine.js';
import { stateStore } from '../../core/StateStore.js';
import { MediaRepository } from '../../repositories/MediaRepository.js';

export class ResourceServiceClass {
    constructor() {
        this.activeUploadTasks = new Map();
    }

    async uploadFile(courseId, lessonId, lessonTitle, file, onStateChange) {
        // 1. Validation
        const validation = StorageValidator.validate(file);
        if (!validation.valid) {
            throw new Error(validation.reason);
        }

        const resourceId = MediaRepository.generateResourceId();
        
        // 2. Add to Queue
        UploadQueue.addUpload({ id: resourceId, name: file.name, size: file.size, file: file });

        try {
            // 3. Duplicate Detection (SHA-256)
            const fileHash = await HashEngine.generateSHA256(file);
            const duplicateCheck = await MediaRepository.findDuplicateResource(courseId, fileHash);

            let finalFile = file;
            let downloadUrl = null;
            let storagePath = null;
            let isDuplicate = duplicateCheck !== null;

            if (isDuplicate) {
                // Duplicate found! Skip storage upload.
                // console.log(`[ResourceService] Duplicate detected for ${file.name}. Using existing file.`);
                downloadUrl = duplicateCheck.downloadUrl;
                storagePath = duplicateCheck.storagePath;
                UploadQueue.updateProgress(resourceId, 100);
            } else {
                // 4. Compression
                finalFile = await CompressionEngine.compress(file);

                // 5. Storage Upload (Resumable)
                storagePath = `courses/${courseId}/resources/${lessonId}/${resourceId}_${finalFile.name}`;
                const uploadTask = MediaRepository.uploadMedia(storagePath, finalFile);

                this.activeUploadTasks.set(resourceId, uploadTask);

                // Await upload completion
                const finalSnapshot = await new Promise((resolve, reject) => {
                    uploadTask.on('state_changed', 
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            UploadQueue.updateProgress(resourceId, progress);
                            if (onStateChange) onStateChange(resourceId, snapshot.state, progress);

                            if (snapshot.state === 'paused') {
                                UploadQueue.setStatus(resourceId, 'Paused');
                            }
                        }, 
                        (error) => {
                            reject(error);
                        }, 
                        () => {
                            resolve(uploadTask.snapshot);
                        }
                    );
                });

                downloadUrl = await finalSnapshot.ref.getDownloadURL();
            }

            // 6. Save to Firestore (via OfflineSyncEngine)
            const resourceDoc = {
                resourceId: resourceId,
                courseId: courseId,
                lessonId: lessonId || 'global',
                lessonTitle: lessonTitle || '',
                fileName: finalFile.name,
                originalFileName: file.name,
                mimeType: finalFile.type,
                size: finalFile.size,
                originalSize: file.size,
                fileHash: fileHash, // Save hash for future deduplication
                downloadUrl: downloadUrl,
                storagePath: storagePath,
                uploadedBy: stateStore.getState('user')?.uid,
                createdAt: '$SERVER_TIMESTAMP',
                updatedAt: '$SERVER_TIMESTAMP',
                visibility: 'public',
                downloads: 0,
                status: 'active'
            };

            await OfflineSyncEngine.queueOperation('lessonResources', resourceId, 'set', resourceDoc);

            UploadQueue.setStatus(resourceId, 'Completed');
            this.activeUploadTasks.delete(resourceId);
            if (onStateChange) onStateChange(resourceId, 'success', 100);

            // 7. Trigger AI Processing Engine asynchronously
            setTimeout(() => {
                AIProcessingEngine.processResource(resourceDoc, file);
            }, 500);

            return resourceId;
        } catch (error) {
            console.error("Upload failed", error);
            UploadQueue.setStatus(resourceId, 'Failed');
            if (this.activeUploadTasks.has(resourceId)) {
                this.activeUploadTasks.delete(resourceId);
            }
            if (onStateChange) onStateChange(resourceId, 'error', error);
            throw error;
        }
    }

    pauseUpload(resourceId) {
        const task = this.activeUploadTasks.get(resourceId);
        if (task) {
            task.pause();
            UploadQueue.setStatus(resourceId, 'Paused');
        }
    }

    resumeUpload(resourceId) {
        const task = this.activeUploadTasks.get(resourceId);
        if (task) {
            task.resume();
            UploadQueue.setStatus(resourceId, 'Uploading');
        }
    }

    cancelUpload(resourceId) {
        const task = this.activeUploadTasks.get(resourceId);
        if (task) {
            task.cancel();
            this.activeUploadTasks.delete(resourceId);
            UploadQueue.setStatus(resourceId, 'Cancelled');
        }
    }

    async getResources(courseId, lessonId = null) {
        try {
            return await MediaRepository.getResourcesByCourse(courseId, lessonId);
        } catch (error) {
            console.error("[ResourceService] Failed to get resources:", error);
            return [];
        }
    }

    subscribeToResources(courseId, lessonId, callback) {
        try {
            return MediaRepository.subscribeToResources(courseId, lessonId, callback);
        } catch (error) {
            console.error("[ResourceService] Failed to subscribe to resources:", error);
            return () => {};
        }
    }

    async deleteResource(resourceId) {
        await MediaRepository.softDeleteResource(resourceId);
    }
}
export const ResourceService = new ResourceServiceClass();
