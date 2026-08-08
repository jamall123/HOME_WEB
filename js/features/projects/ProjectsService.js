import { Logger } from '../../core/Logger.js';
import { ProjectsRepository } from '../../repositories/ProjectsRepository.js';

class ProjectsServiceClass {
    async getProjects() {
        try {
            return await ProjectsRepository.getProjects();
        } catch (e) {
            Logger.error('ProjectsService: Error loading projects', e);
            throw e;
        }
    }
}

export const ProjectsService = new ProjectsServiceClass();
