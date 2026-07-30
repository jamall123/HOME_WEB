/**
 * TeachingModes.js
 * Manages the specific state mutations for teaching layouts (Video, Slides, Channel, etc).
 */

import { InstructorService } from './InstructorService.js';

export class TeachingModesClass {
    init(controller) {
        this.controller = controller;
    }

    /**
     * Pushes the new teaching mode to active_sessions.
     * RoomEngine will reactively update UI for all users.
     */
    async setMode(modeName, metadata = {}) {
        const payload = {
            mode: modeName, // 'video', 'slides', 'audio', 'channel'
            metadata: metadata
        };
        await InstructorService.updateTeachingMode(this.controller.engine.courseId, payload);
    }
}

export const TeachingModes = new TeachingModesClass();
