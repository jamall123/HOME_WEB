import * as functions from 'firebase-functions';
import { DI } from '../shared/di.js';
import { Validator, enrollmentRequestSchema } from '../validators/schema.js';
import { enrollmentWorkflow } from '../workflows/enrollmentWorkflow.js';
export const onEnrollmentRequestUpdated = functions.firestore
    .document('enrollmentRequests/{requestId}')
    .onUpdate(async (change, context) => {
    const newValue = change.after.data();
    const previousValue = change.before.data();
    // Check if the status was changed to 'approved'
    if (newValue.status === 'approved' && previousValue.status !== 'approved') {
        try {
            DI.logger.info(`Enrollment request ${context.params.requestId} approved, initiating workflow.`);
            // Input Validation
            const validatedRequest = Validator.validateSchema(enrollmentRequestSchema, {
                userId: newValue.userId,
                courseId: newValue.courseId,
                status: newValue.status,
                email: newValue.email,
                name: newValue.name
            });
            // Execute Pipeline
            await enrollmentWorkflow.execute(context.params.requestId, validatedRequest);
        }
        catch (error) {
            DI.logger.error(`Error in onEnrollmentRequestUpdated for ${context.params.requestId}`, { error });
        }
    }
});
//# sourceMappingURL=enrollmentController.js.map