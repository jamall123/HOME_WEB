import { ProjectsService } from './ProjectsService.js';
import { ProjectsUI } from './ProjectsUI.js';
import { Logger } from '../../core/Logger.js';

class ProjectsControllerClass {
    async init() {
        try {
            const projects = await ProjectsService.getProjects();
            
            if (projects.length === 0) {
                ProjectsUI.renderEmpty();
            } else {
                ProjectsUI.renderProjects(projects);
            }
        } catch (e) {
            Logger.error('ProjectsController: Initialization failed', e);
            ProjectsUI.renderError();
        }
    }
}

export const ProjectsController = new ProjectsControllerClass();
