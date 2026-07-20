import { ProviderFactory } from './gateway.js';
import { GeminiProvider } from './providers/geminiProvider.js';
import { configService } from '../../../shared/config/env.js';
import { DI } from '../../../shared/di.js';
export class AIManager {
    factory;
    constructor() {
        this.factory = new ProviderFactory();
        this.registerDefaultProviders();
    }
    registerDefaultProviders() {
        this.factory.registerProvider(new GeminiProvider());
        // Future: this.factory.registerProvider(new OpenAIProvider());
        DI.logger.info('AIManager: Registered AI Providers');
    }
    getActiveProvider() {
        return this.factory.getProvider(configService.get('ai').defaultProvider);
    }
    async generateSEO(content) {
        const provider = this.getActiveProvider();
        DI.logger.info(`AIManager: Generating SEO using ${provider.name}`);
        // In reality, we'd use provider.generateJSON here
        return {
            title: await provider.generateText(`Generate SEO title for: ${content.substring(0, 50)}...`),
            description: 'Auto-generated description',
            keywords: ['jhome', 'auto-generated']
        };
    }
    async translateContent(content, targetLanguage) {
        const provider = this.getActiveProvider();
        DI.logger.info(`AIManager: Translating content to ${targetLanguage} using ${provider.name}`);
        return provider.translate(content, targetLanguage);
    }
}
export const aiManager = new AIManager();
//# sourceMappingURL=aiManager.js.map