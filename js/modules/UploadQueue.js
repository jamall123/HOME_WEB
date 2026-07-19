import { OfflineQueueDb } from './OfflineQueueDb.js';

export class UploadQueueClass {
    constructor() {
        this.queue = [];
        this.subscribers = [];
        this.courseId = null;
    }

    async init(courseId) {
        this.courseId = courseId;
        await OfflineQueueDb.init();
        await this.restoreState();
    }

    subscribe(callback) {
        this.subscribers.push(callback);
    }

    notify() {
        this.subscribers.forEach(cb => cb(this.queue));
        this.saveState();
    }

    addUpload(fileMeta) {
        this.queue.push({
            id: fileMeta.id,
            name: fileMeta.name,
            size: fileMeta.size,
            progress: 0,
            status: 'Pending',
            file: fileMeta.file // Not saved to DB
        });
        this.notify();
    }

    updateProgress(id, progress) {
        const item = this.queue.find(q => q.id === id);
        if (item) {
            item.progress = progress;
            item.status = progress === 100 ? 'Completed' : 'Uploading';
            this.notify();
        }
    }

    setStatus(id, status) {
        const item = this.queue.find(q => q.id === id);
        if (item) {
            item.status = status;
            this.notify();
        }
    }

    removeUpload(id) {
        this.queue = this.queue.filter(q => q.id !== id);
        this.notify();
    }

    async saveState() {
        if (!this.courseId) return;
        const serialized = this.queue.map(q => ({
            id: q.id,
            courseId: this.courseId, // Used as key conceptually, but we store individual items
            name: q.name,
            size: q.size,
            progress: q.progress,
            status: q.status
        }));
        
        for (const item of serialized) {
            await OfflineQueueDb.put('upload_queue', item);
        }
    }

    async restoreState() {
        if (!this.courseId) return;
        try {
            const allItems = await OfflineQueueDb.getAll('upload_queue');
            const courseItems = allItems.filter(i => i.courseId === this.courseId);
            
            this.queue = courseItems.map(q => {
                if (q.status === 'Uploading') q.status = 'Paused'; 
                q.file = null; 
                return q;
            });
            this.notify();
        } catch(e) {
            console.error("Failed to restore upload queue", e);
        }
    }
}

export const UploadQueue = new UploadQueueClass();
