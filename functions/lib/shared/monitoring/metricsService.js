export class MetricsService {
    metricsBuffer = [];
    recordMetric(name, value, tags) {
        this.metricsBuffer.push({
            metricName: name,
            value,
            tags,
            timestamp: new Date().toISOString()
        });
    }
    async flush() {
        if (this.metricsBuffer.length === 0)
            return;
        // In production, this would flush to Google Cloud Monitoring, Datadog, etc.
        const toFlush = [...this.metricsBuffer];
        this.metricsBuffer = [];
        console.log(`[METRICS FLUSH] ${toFlush.length} metrics recorded.`);
    }
    async trackExecutionTime(name, fn, tags) {
        const start = Date.now();
        try {
            return await fn();
        }
        finally {
            const duration = Date.now() - start;
            this.recordMetric(`${name}_execution_time`, duration, tags);
        }
    }
}
//# sourceMappingURL=metricsService.js.map