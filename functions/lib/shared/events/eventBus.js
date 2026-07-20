export var EventType;
(function (EventType) {
    EventType["USER_CREATED"] = "USER_CREATED";
    EventType["USER_APPROVED"] = "USER_APPROVED";
    EventType["COURSE_CREATED"] = "COURSE_CREATED";
    EventType["COURSE_UPDATED"] = "COURSE_UPDATED";
    EventType["MEDIA_UPLOADED"] = "MEDIA_UPLOADED";
    EventType["MEDIA_DELETED"] = "MEDIA_DELETED";
    EventType["POST_PUBLISHED"] = "POST_PUBLISHED";
    EventType["PROJECT_UPDATED"] = "PROJECT_UPDATED";
    EventType["ORDER_CREATED"] = "ORDER_CREATED";
    EventType["NOTIFICATION_SENT"] = "NOTIFICATION_SENT";
})(EventType || (EventType = {}));
export class EventBus {
    logger;
    handlers = new Map();
    constructor(logger) {
        this.logger = logger;
    }
    subscribe(eventType, handler) {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, []);
        }
        this.handlers.get(eventType).push(handler);
        this.logger.debug(`Subscribed handler to event: ${eventType}`);
    }
    async publish(event) {
        this.logger.info(`Publishing event: ${event.type}`, { payload: event.payload });
        const eventHandlers = this.handlers.get(event.type) || [];
        const promises = eventHandlers.map(async (handler) => {
            try {
                await handler(event);
            }
            catch (error) {
                this.logger.error(`Error handling event ${event.type}`, { error, payload: event.payload });
            }
        });
        await Promise.allSettled(promises);
    }
}
//# sourceMappingURL=eventBus.js.map