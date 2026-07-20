import * as admin from 'firebase-admin';

export interface ConfigOptions {
  projectId: string;
  environment: 'development' | 'production' | 'test';
  ai: {
    defaultProvider: string;
    geminiApiKey?: string;
  };
  collections: {
    systemLogs: string;
    events: string;
    users: string;
    coursesCredentials: string;
    mediaLibrary: string;
  };
  queue: {
    adapter: 'memory' | 'cloud_tasks';
    location: string;
  };
}

export class ConfigService {
  private config: ConfigOptions;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): ConfigOptions {
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

  get<K extends keyof ConfigOptions>(key: K): ConfigOptions[K] {
    return this.config[key];
  }

  getRaw(): ConfigOptions {
    return this.config;
  }
}

export const configService = new ConfigService();
