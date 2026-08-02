import * as admin from 'firebase-admin';
import { DI } from '../../../shared/di.js';
import { EventType } from '../../../shared/events/eventBus.js';
export class EnrollmentWorkflow {
    async execute(requestId, requestData) {
        DI.logger.info(`Starting Enrollment Workflow for request ${requestId}`, { email: requestData.email });
        if (requestData.status !== 'approved') {
            DI.logger.info(`Enrollment request ${requestId} is not approved. Aborting workflow.`);
            return;
        }
        try {
            // 1. Create or update user permissions (Custom Claims or DB)
            const credentialRef = DI.db.collection('courses_credentials').doc(requestData.userId);
            await credentialRef.set({
                email: requestData.email,
                name: requestData.name,
                courses: admin.firestore.FieldValue.arrayUnion(requestData.courseId),
                updatedAt: new Date().toISOString()
            }, { merge: true });
            // 2. Set Custom Claims (Firebase Auth)
            // Assuming we look up the auth user by email or userId
            try {
                const userRecord = await DI.auth.getUser(requestData.userId);
                const currentClaims = userRecord.customClaims || {};
                const enrolledCourses = currentClaims.courses || [];
                if (!enrolledCourses.includes(requestData.courseId)) {
                    await DI.auth.setCustomUserClaims(requestData.userId, {
                        ...currentClaims,
                        role: currentClaims.role || 'STUDENT',
                        courses: [...enrolledCourses, requestData.courseId]
                    });
                }
            }
            catch (authErr) {
                DI.logger.warn(`Could not update custom claims for ${requestData.userId}`, { error: authErr });
            }
            // 3. Emit Event - Let other domains (like notifications) handle email/system notifications
            await DI.eventBus.publish({
                type: EventType.USER_APPROVED,
                payload: { userId: requestData.userId, courseId: requestData.courseId, requestId, email: requestData.email, name: requestData.name },
                timestamp: new Date().toISOString()
            });
            DI.logger.info(`Enrollment Workflow completed successfully for request ${requestId}`);
        }
        catch (error) {
            DI.logger.error(`Enrollment Workflow failed for request ${requestId}`, { error });
            throw error;
        }
    }
}
export const enrollmentWorkflow = new EnrollmentWorkflow();
//# sourceMappingURL=enrollmentWorkflow.js.map