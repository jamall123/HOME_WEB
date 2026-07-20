import { DI } from '../../../shared/di.js';
import { EventType } from '../../../shared/events/eventBus.js';
import { notificationService } from '../infrastructure/notificationService.js';

export class NotificationWorkflow {
  constructor() {
    this.registerListeners();
  }

  private registerListeners() {
    DI.eventBus.subscribe(EventType.USER_APPROVED, async (payload: any) => {
      DI.logger.info(`NotificationWorkflow received USER_APPROVED event for user ${payload.userId}`);
      
      try {
        await notificationService.sendEmail(
          payload.email,
          'Welcome to your new Jhome Course!',
          `Hello ${payload.name}, your enrollment in course ${payload.courseId} has been approved.`
        );

        await notificationService.sendSystemNotification(
          payload.userId,
          'Enrollment Approved',
          `You have been granted access to course ${payload.courseId}.`
        );
      } catch (error) {
        DI.logger.error(`Failed to process USER_APPROVED event in NotificationWorkflow`, { error, payload });
      }
    });

    DI.logger.info('NotificationWorkflow: Registered event listeners');
  }
}

export const notificationWorkflow = new NotificationWorkflow();
