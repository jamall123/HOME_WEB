export class ProviderFactory {
    providers = new Map();
    registerProvider(provider) {
        this.providers.set(provider.name, provider);
    }
    getProvider(name) {
        const provider = this.providers.get(name);
        if (!provider) {
            throw new Error(`AI Provider ${name} is not registered.`);
        }
        return provider;
    }
}
//# sourceMappingURL=gateway.js.map