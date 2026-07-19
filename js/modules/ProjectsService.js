import { Logger } from './Logger.js';

class ProjectsServiceClass {
    constructor() {
        this.db = window.firebase ? window.firebase.firestore() : null;
    }

    async getProjects() {
        if (!this.db) {
            Logger.error('ProjectsService: Firebase not initialized.');
            return [];
        }

        try {
            const snap = await this.db.collection('projects').get();
            return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            Logger.error('ProjectsService: Error loading projects', e);
            throw e;
        }
    }
}

export const ProjectsService = new ProjectsServiceClass();
