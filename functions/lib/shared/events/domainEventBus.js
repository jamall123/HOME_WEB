export class UserApprovedEvent {
    userId;
    courseId;
    correlationId;
    eventName = 'UserApprovedEvent';
    timestamp = new Date().toISOString();
    constructor(userId, courseId, correlationId) {
        this.userId = userId;
        this.courseId = courseId;
        this.correlationId = correlationId;
    }
}
export class MediaDeletedEvent {
    mediaId;
    path;
    correlationId;
    eventName = 'MediaDeletedEvent';
    timestamp = new Date().toISOString();
    constructor(mediaId, path, correlationId) {
        this.mediaId = mediaId;
        this.path = path;
        this.correlationId = correlationId;
    }
}
export class DomainEventBus {
    handlers = new Map();
    subscribe(eventName, handler) {
        if (!this.handlers.has(eventName)) {
            this.handlers.set(eventName, []);
        }
        this.handlers.get(eventName).push(handler);
    }
    async publish(event) {
        const eventHandlers = this.handlers.get(event.eventName) || [];
        const promises = eventHandlers.map(handler => handler(event).catch(error => {
            console.error(`Error handling event ${event.eventName}:`, error);
        }));
        await Promise.allSettled(promises);
    }
}
//# sourceMappingURL=domainEventBus.js.map