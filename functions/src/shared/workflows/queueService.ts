export interface TaskOptions {
  retryLimit?: number;
  timeoutSeconds?: number;
  backoffFactor?: number;
}

export interface TaskPayload {
  workflowName: string;
  data: any;
}

export interface QueueService {
  enqueue(queueName: string, payload: TaskPayload, options?: TaskOptions): Promise<void>;
  processNext(queueName: string): Promise<void>;
}

export class MemoryQueueAdapter implements QueueService {
  private queues = new Map<string, { payload: TaskPayload, options?: TaskOptions, retries: number }[]>();

  async enqueue(queueName: string, payload: TaskPayload, options?: TaskOptions): Promise<void> {
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
    }
    this.queues.get(queueName)!.push({ payload, options, retries: 0 });
    console.log(`[MemoryQueue] Enqueued task for ${payload.workflowName} on ${queueName}`);
  }

  async processNext(queueName: string): Promise<void> {
    // In memory mock execution logic
    const queue = this.queues.get(queueName);
    if (!queue || queue.length === 0) return;
    const task = queue.shift();
    console.log(`[MemoryQueue] Processing task ${task?.payload.workflowName}`);
  }
}

export class CloudTasksAdapter implements QueueService {
  async enqueue(queueName: string, payload: TaskPayload, options?: TaskOptions): Promise<void> {
    // Implementation for Google Cloud Tasks via @google-cloud/tasks SDK
    console.log(`[CloudTasks] Enqueuing task for ${payload.workflowName} on ${queueName}`);
    // await client.createTask({ ... })
  }

  async processNext(queueName: string): Promise<void> {
    throw new Error('Cloud Tasks are pushed to HTTPS endpoints automatically. Manual processing is not supported.');
  }
}
