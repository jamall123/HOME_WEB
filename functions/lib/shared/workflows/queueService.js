export class MemoryQueueAdapter {
    queues = new Map();
    async enqueue(queueName, payload, options) {
        if (!this.queues.has(queueName)) {
            this.queues.set(queueName, []);
        }
        this.queues.get(queueName).push({ payload, options, retries: 0 });
        console.log(`[MemoryQueue] Enqueued task for ${payload.workflowName} on ${queueName}`);
    }
    async processNext(queueName) {
        // In memory mock execution logic
        const queue = this.queues.get(queueName);
        if (!queue || queue.length === 0)
            return;
        const task = queue.shift();
        console.log(`[MemoryQueue] Processing task ${task?.payload.workflowName}`);
    }
}
export class CloudTasksAdapter {
    async enqueue(queueName, payload, options) {
        // Implementation for Google Cloud Tasks via @google-cloud/tasks SDK
        console.log(`[CloudTasks] Enqueuing task for ${payload.workflowName} on ${queueName}`);
        // await client.createTask({ ... })
    }
    async processNext(queueName) {
        throw new Error('Cloud Tasks are pushed to HTTPS endpoints automatically. Manual processing is not supported.');
    }
}
//# sourceMappingURL=queueService.js.map