import * as functions from 'firebase-functions';
import { DI } from '../di.js';
export class SchedulerManager {
    tasks = [];
    registerTask(task) {
        this.tasks.push(task);
        DI.logger.info(`Registered scheduled task: ${task.name} with schedule ${task.schedule}`);
    }
    // Returns Firebase Cloud Function triggers
    exportTriggers() {
        const exports = {};
        for (const task of this.tasks) {
            // Create safe function name
            const functionName = `cron_${task.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
            exports[functionName] = functions.pubsub.schedule(task.schedule).onRun(async (context) => {
                DI.logger.info(`Executing scheduled task: ${task.name}`);
                try {
                    await task.handler(context);
                    DI.logger.info(`Successfully completed scheduled task: ${task.name}`);
                }
                catch (error) {
                    DI.logger.error(`Failed to execute scheduled task: ${task.name}`, { error });
                    throw error;
                }
            });
        }
        return exports;
    }
}
//# sourceMappingURL=SchedulerManager.js.map