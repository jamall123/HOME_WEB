export interface MetricRecord {
  metricName: string;
  value: number;
  tags?: Record<string, string>;
  timestamp: string;
}

export class MetricsService {
  private metricsBuffer: MetricRecord[] = [];

  recordMetric(name: string, value: number, tags?: Record<string, string>) {
    this.metricsBuffer.push({
      metricName: name,
      value,
      tags,
      timestamp: new Date().toISOString()
    });
  }

  async flush(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;
    
    // In production, this would flush to Google Cloud Monitoring, Datadog, etc.
    const toFlush = [...this.metricsBuffer];
    this.metricsBuffer = [];

    console.log(`[METRICS FLUSH] ${toFlush.length} metrics recorded.`);
  }

  async trackExecutionTime<T>(name: string, fn: () => Promise<T>, tags?: Record<string, string>): Promise<T> {
    const start = Date.now();
    try {
      return await fn();
    } finally {
      const duration = Date.now() - start;
      this.recordMetric(`${name}_execution_time`, duration, tags);
    }
  }
}
