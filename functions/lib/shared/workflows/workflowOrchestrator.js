import { WorkflowError } from '../errors/AppError.js';
export class WorkflowOrchestrator {
    queueService;
    constructor(queueService) {
        this.queueService = queueService;
    }
    async executeWithRetry(step, data, context, maxRetries = 3) {
        try {
            return await step(data);
        }
        catch (error) {
            if (context.retryCount < maxRetries && error.retryable !== false) {
                // Exponential backoff mock
                const backoffMs = Math.pow(2, context.retryCount) * 1000;
                console.warn(`[Orchestrator] Step failed. Retrying in ${backoffMs}ms... (Attempt ${context.retryCount + 1}/${maxRetries})`);
                await new Promise(res => setTimeout(res, backoffMs));
                return this.executeWithRetry(step, data, { ...context, retryCount: context.retryCount + 1 }, maxRetries);
            }
            else {
                // Dead Letter Queue routing
                await this.routeToDLQ(data, error, context);
                throw new WorkflowError(`Workflow step failed permanently after ${context.retryCount} retries`, false, { originalError: error.message });
            }
        }
    }
    async routeToDLQ(data, error, context) {
        console.error(`[DLQ] Routing failed task to Dead Letter Queue`, { data, error, correlationId: context.correlationId });
        // Save to Firestore DLQ collection
    }
    async dispatch(workflowName, data) {
        const payload = { workflowName, data };
        await this.queueService.enqueue('default-queue', payload);
    }
}
//# sourceMappingURL=workflowOrchestrator.js.map