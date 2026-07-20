export class ConfigService {
    config;
    constructor() {
        this.config = this.loadConfig();
    }
    loadConfig() {
        const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';
        const env = isEmulator ? 'development' : 'production';
        // Abstracting raw process.env accesses
        return {
            projectId: process.env.GCLOUD_PROJECT || 'jhome-dev',
            environment: env,
            ai: {
                defaultProvider: process.env.DEFAULT_AI_PROVIDER || 'gemini',
                geminiApiKey: process.env.GEMINI_API_KEY
            },
            collections: {
                systemLogs: 'system_logs',
                events: 'events',
                users: 'users',
                coursesCredentials: 'courses_credentials',
                mediaLibrary: 'media_library'
            },
            queue: {
                adapter: env === 'production' ? 'cloud_tasks' : 'memory',
                location: process.env.QUEUE_LOCATION || 'us-central1'
            }
        };
    }
    get(key) {
        return this.config[key];
    }
    getRaw() {
        return this.config;
    }
}
export const configService = new ConfigService();
//# sourceMappingURL=env.js.map