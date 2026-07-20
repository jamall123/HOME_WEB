export interface DomainEvent {
  eventName: string;
  timestamp: string;
  correlationId?: string;
}

export class UserApprovedEvent implements DomainEvent {
  eventName = 'UserApprovedEvent';
  timestamp = new Date().toISOString();
  constructor(public userId: string, public courseId: string, public correlationId?: string) {}
}

export class MediaDeletedEvent implements DomainEvent {
  eventName = 'MediaDeletedEvent';
  timestamp = new Date().toISOString();
  constructor(public mediaId: string, public path: string, public correlationId?: string) {}
}

export type DomainEventHandler<T extends DomainEvent> = (event: T) => Promise<void>;

export class DomainEventBus {
  private handlers = new Map<string, DomainEventHandler<any>[]>();

  subscribe<T extends DomainEvent>(eventName: string, handler: DomainEventHandler<T>) {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
  }

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const eventHandlers = this.handlers.get(event.eventName) || [];
    const promises = eventHandlers.map(handler => handler(event).catch(error => {
      console.error(`Error handling event ${event.eventName}:`, error);
    }));
    await Promise.allSettled(promises);
  }
}
