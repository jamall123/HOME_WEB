/**
 * LessonRegistry.js
 * Dynamic plugin registry for all lesson types.
 * Prevents hardcoded switch statements in the renderer.
 */

class LessonRegistryClass {
    constructor() {
        this.handlers = {};
    }

    /**
     * Registers a new lesson handler.
     * @param {string} type 
     * @param {Object} handler { render: function(data), icon: string }
     */
    register(type, handler) {
        if (this.handlers[type]) {
            // console.warn(`[LessonRegistry] Overwriting existing handler for type: ${type}`);
        }
        this.handlers[type] = handler;
    }

    getHandler(type) {
        return this.handlers[type] || this.handlers['default'];
    }
}

export const LessonRegistry = new LessonRegistryClass();

// Register Default Handlers
LessonRegistry.register('default', {
    icon: 'fa-file',
    render: (data) => `<div class="lesson-default">Unsupported lesson type: ${data.type}</div>`
});

LessonRegistry.register('video', {
    icon: 'fa-play-circle',
    render: (data) => `<div class="lesson-video" data-url="${data.videoUrl}">Video Lesson Placeholder</div>`
});

LessonRegistry.register('pdf', {
    icon: 'fa-file-pdf',
    render: (data) => `<div class="lesson-pdf" data-url="${data.resourceUrl}">PDF Lesson Placeholder</div>`
});

// Future plugins (e.g., Whiteboard, AI) can just call LessonRegistry.register(...)
