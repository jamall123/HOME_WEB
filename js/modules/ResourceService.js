import { StorageValidator } from './StorageValidator.js';
import { CompressionEngine } from './CompressionEngine.js';
import { UploadQueue } from './UploadQueue.js';
import { HashEngine } from './HashEngine.js';
import { AIProcessingEngine } from './AIProcessingEngine.js';
import { OfflineSyncEngine } from './OfflineSyncEngine.js';
import { StateStore } from './StateStore.js';

export class ResourceServiceClass {
    constructor() {
        this.db = firebase.firestore();
        this.storage = firebase.storage();
        this.activeUploadTasks = new Map();
    }

    async uploadFile(courseId, lessonId, file, onStateChange) {
        // 1. Validation
        const validation = StorageValidator.validate(file);
        if (!validation.valid) {
            throw new Error(validation.reason);
        }

        const resourceId = this.db.collection('lessonResources').doc().id;
        
        // 2. Add to Queue
        UploadQueue.addUpload({ id: resourceId, name: file.name, size: file.size, file: file });

        try {
            // 3. Duplicate Detection (SHA-256)
            const fileHash = await HashEngine.generateSHA256(file);
            const duplicateCheck = await this.db.collection('lessonResources')
                .where('courseId', '==', courseId)
                .where('fileHash', '==', fileHash)
                .where('status', '==', 'active')
                .get();

            let finalFile = file;
            let downloadUrl = null;
            let storagePath = null;
            let isDuplicate = !duplicateCheck.empty;

            if (isDuplicate) {
                // Duplicate found! Skip storage upload.
                // console.log(`[ResourceService] Duplicate detected for ${file.name}. Using existing file.`);
                const existing = duplicateCheck.docs[0].data();
                downloadUrl = existing.downloadUrl;
                storagePath = existing.storagePath;
                UploadQueue.updateProgress(resourceId, 100);
            } else {
                // 4. Compression
                finalFile = await CompressionEngine.compress(file);

                // 5. Storage Upload (Resumable)
                storagePath = `courses/${courseId}/resources/${lessonId}/${resourceId}_${finalFile.name}`;
                const storageRef = this.storage.ref(storagePath);
                const uploadTask = storageRef.put(finalFile);

                this.activeUploadTasks.set(resourceId, uploadTask);

                // Await upload completion
                await new Promise((resolve, reject) => {
                    uploadTask.on('state_changed', 
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            UploadQueue.updateProgress(resourceId, progress);
                            if (onStateChange) onStateChange(resourceId, snapshot.state, progress);

                            if (snapshot.state === firebase.storage.TaskState.PAUSED) {
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

                downloadUrl = await this.storage.ref(storagePath).getDownloadURL();
            }

            // 6. Save to Firestore (via OfflineSyncEngine)
            const resourceDoc = {
                resourceId: resourceId,
                courseId: courseId,
                lessonId: lessonId || 'global',
                fileName: finalFile.name,
                originalFileName: file.name,
                mimeType: finalFile.type,
                size: finalFile.size,
                originalSize: file.size,
                fileHash: fileHash, // Save hash for future deduplication
                downloadUrl: downloadUrl,
                storagePath: storagePath,
                uploadedBy: StateStore.getState('user')?.uid || firebase.auth().currentUser?.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
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

    async getResources(courseId) {
        const snap = await this.db.collection('lessonResources')
            .where('courseId', '==', courseId)
            .where('status', '==', 'active')
            .orderBy('createdAt', 'desc')
            .get();
        return snap.docs.map(d => d.data());
    }

    async deleteResource(resourceId) {
        const docRef = this.db.collection('lessonResources').doc(resourceId);
        const doc = await docRef.get();
        if (doc.exists) {
            const data = doc.data();
            // Delete from storage
            if (data.storagePath) {
                await this.storage.ref(data.storagePath).delete().catch(e => Logger.warn("Storage deletion failed", e));
            }
            // Soft delete in Firestore
            await docRef.update({ status: 'deleted', updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        }
    }
}
export const ResourceService = new ResourceServiceClass();
