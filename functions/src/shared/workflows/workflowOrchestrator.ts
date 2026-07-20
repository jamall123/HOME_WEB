import { WorkflowError, ErrorCategory } from '../errors/AppError.js';
import { QueueService, TaskPayload } from './queueService.js';

export type WorkflowStep = (data: any) => Promise<any>;

export interface WorkflowContext {
  retryCount: number;
  correlationId: string;
}

export class WorkflowOrchestrator {
  constructor(private queueService: QueueService) {}

  async executeWithRetry(step: WorkflowStep, data: any, context: WorkflowContext, maxRetries = 3): Promise<any> {
    try {
      return await step(data);
    } catch (error: any) {
      if (context.retryCount < maxRetries && error.retryable !== false) {
        // Exponential backoff mock
        const backoffMs = Math.pow(2, context.retryCount) * 1000;
        console.warn(`[Orchestrator] Step failed. Retrying in ${backoffMs}ms... (Attempt ${context.retryCount + 1}/${maxRetries})`);
        
        await new Promise(res => setTimeout(res, backoffMs));
        return this.executeWithRetry(step, data, { ...context, retryCount: context.retryCount + 1 }, maxRetries);
      } else {
        // Dead Letter Queue routing
        await this.routeToDLQ(data, error, context);
        throw new WorkflowError(`Workflow step failed permanently after ${context.retryCount} retries`, false, { originalError: error.message });
      }
    }
  }

  private async routeToDLQ(data: any, error: any, context: WorkflowContext) {
    console.error(`[DLQ] Routing failed task to Dead Letter Queue`, { data, error, correlationId: context.correlationId });
    // Save to Firestore DLQ collection
  }

  async dispatch(workflowName: string, data: any) {
    const payload: TaskPayload = { workflowName, data };
    await this.queueService.enqueue('default-queue', payload);
  }
}
