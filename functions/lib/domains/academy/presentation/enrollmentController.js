import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { DI } from '../../../shared/di.js';
import { Validator, enrollmentRequestSchema } from '../../../shared/validators/schema.js';
import { enrollmentWorkflow } from '../application/enrollmentWorkflow.js';
export const onEnrollmentRequestUpdated = onDocumentUpdated({ document: 'enrollmentRequests/{requestId}', region: 'europe-west1' }, async (event) => {
    const newValue = event.data?.after.data();
    const previousValue = event.data?.before.data();
    const requestId = event.params.requestId;
    if (!newValue || !previousValue)
        return;
    // Check if the status was changed to 'approved'
    if (newValue.status === 'approved' && previousValue.status !== 'approved') {
        try {
            DI.logger.info(`Enrollment request ${requestId} approved, initiating workflow.`);
            // Input Validation
            const validatedRequest = Validator.validateSchema(enrollmentRequestSchema, {
                userId: newValue.userId,
                courseId: newValue.courseId,
                status: newValue.status,
                email: newValue.email,
                name: newValue.name
            });
            // Execute Pipeline
            await enrollmentWorkflow.execute(requestId, validatedRequest);
        }
        catch (error) {
            DI.logger.error(`Error in onEnrollmentRequestUpdated for ${requestId}`, { error });
        }
    }
});
//# sourceMappingURL=enrollmentController.js.map