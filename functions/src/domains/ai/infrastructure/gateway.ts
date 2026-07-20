export interface AIProvider {
  name: string;
  generateText(prompt: string): Promise<string>;
  generateJSON<T>(prompt: string, schema: any): Promise<T>;
  translate(text: string, targetLanguage: string): Promise<string>;
}

export class ProviderFactory {
  private providers: Map<string, AIProvider> = new Map();

  registerProvider(provider: AIProvider) {
    this.providers.set(provider.name, provider);
  }

  getProvider(name: string): AIProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`AI Provider ${name} is not registered.`);
    }
    return provider;
  }
}
