import { DI } from '../shared/di.js';
export class NotificationService {
    async sendEmail(to, subject, body) {
        // In a real environment, this would integrate with SendGrid, Mailgun, or Firebase Extensions
        DI.logger.info(`Sending email to ${to}: ${subject}`);
        // Simulated async send
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    async sendSystemNotification(userId, title, message) {
        DI.logger.info(`Sending system notification to user ${userId}: ${title}`);
        await DI.db.collection('notifications').add({
            userId,
            title,
            message,
            read: false,
            createdAt: new Date().toISOString()
        });
    }
}
DI.logger.info('Notification Service Registered');
export const notificationService = new NotificationService();
//# sourceMappingURL=notificationService.js.map