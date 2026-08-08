import { InstructorService } from './InstructorService.js';

export class ClassroomManagerClass {
    constructor() {
        this.controller = null;
    }

    init(controller) {
        this.controller = controller;
        this.attachListeners();
    }

    attachListeners() {
        const toggleChat = document.getElementById('inst-toggle-chat');
        const toggleRes = document.getElementById('inst-toggle-resources');

        if (toggleChat) {
            toggleChat.addEventListener('change', async (e) => {
                const isLocked = e.target.checked;
                await InstructorService.updateClassroomState(this.controller.engine.courseId, { chatLocked: isLocked });
                // Note: The UI for the switch handles itself, but we can also sync it with live state later
            });
        }

        if (toggleRes) {
            toggleRes.addEventListener('change', async (e) => {
                const isLocked = e.target.checked;
                await InstructorService.updateClassroomState(this.controller.engine.courseId, { resourcesLocked: isLocked });
            });
        }
    }
}
export const ClassroomManager = new ClassroomManagerClass();
