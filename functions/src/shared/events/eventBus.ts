import { Logger } from '../logging/logger.js';

export enum EventType {
  USER_CREATED = 'USER_CREATED',
  USER_APPROVED = 'USER_APPROVED',
  COURSE_CREATED = 'COURSE_CREATED',
  COURSE_UPDATED = 'COURSE_UPDATED',
  MEDIA_UPLOADED = 'MEDIA_UPLOADED',
  MEDIA_DELETED = 'MEDIA_DELETED',
  POST_PUBLISHED = 'POST_PUBLISHED',
  PROJECT_UPDATED = 'PROJECT_UPDATED',
  ORDER_CREATED = 'ORDER_CREATED',
  NOTIFICATION_SENT = 'NOTIFICATION_SENT'
}

export interface DomainEvent {
  type: EventType;
  payload: any;
  timestamp: string;
  correlationId?: string;
}

export type EventHandler = (event: DomainEvent) => Promise<void>;

export class EventBus {
  private handlers: Map<EventType, EventHandler[]> = new Map();

  constructor(private logger: Logger) {}

  subscribe(eventType: EventType, handler: EventHandler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
    this.logger.debug(`Subscribed handler to event: ${eventType}`);
  }

  async publish(event: DomainEvent) {
    this.logger.info(`Publishing event: ${event.type}`, { payload: event.payload });
    
    const eventHandlers = this.handlers.get(event.type) || [];
    
    const promises = eventHandlers.map(async (handler) => {
      try {
        await handler(event);
      } catch (error) {
        this.logger.error(`Error handling event ${event.type}`, { error, payload: event.payload });
      }
    });

    await Promise.allSettled(promises);
  }
}
