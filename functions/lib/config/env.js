export const config = {
    projectId: process.env.GCLOUD_PROJECT || process.env.FIREBASE_CONFIG ? JSON.parse(process.env.FIREBASE_CONFIG).projectId : 'jhome-dev',
    environment: process.env.FUNCTIONS_EMULATOR === 'true' ? 'development' : 'production',
    ai: {
        defaultProvider: process.env.DEFAULT_AI_PROVIDER || 'gemini',
    },
    collections: {
        systemLogs: 'system_logs',
        events: 'events',
        users: 'users',
        coursesCredentials: 'courses_credentials',
        mediaLibrary: 'media_library'
    }
};
//# sourceMappingURL=env.js.map