export var Lifetime;
(function (Lifetime) {
    Lifetime[Lifetime["SINGLETON"] = 0] = "SINGLETON";
    Lifetime[Lifetime["TRANSIENT"] = 1] = "TRANSIENT";
    Lifetime[Lifetime["SCOPED"] = 2] = "SCOPED";
})(Lifetime || (Lifetime = {}));
export class DIContainer {
    providers = new Map();
    scopedInstances = new Map();
    register(token, factory, lifetime = Lifetime.SINGLETON) {
        this.providers.set(token, { lifetime, factory });
    }
    resolve(token) {
        const provider = this.providers.get(token);
        if (!provider) {
            throw new Error(`No provider found for ${token}`);
        }
        if (provider.lifetime === Lifetime.SINGLETON) {
            if (!provider.instance) {
                provider.instance = provider.factory(this);
            }
            return provider.instance;
        }
        if (provider.lifetime === Lifetime.SCOPED) {
            if (!this.scopedInstances.has(token)) {
                this.scopedInstances.set(token, provider.factory(this));
            }
            return this.scopedInstances.get(token);
        }
        // TRANSIENT
        return provider.factory(this);
    }
    createScope() {
        const scopedContainer = new DIContainer();
        scopedContainer.providers = this.providers; // Share providers
        scopedContainer.scopedInstances = new Map(); // Fresh scoped instances
        return scopedContainer;
    }
}
export const globalContainer = new DIContainer();
// Facade for easier access
export const DI = {
    get db() { return globalContainer.resolve('db'); },
    get auth() { return globalContainer.resolve('auth'); },
    get storage() { return globalContainer.resolve('storage'); },
    get logger() { return globalContainer.resolve('logger'); },
    get eventBus() { return globalContainer.resolve('eventBus'); },
    get config() { return globalContainer.resolve('config'); },
    get plugins() { return globalContainer.resolve('plugins'); },
    get features() { return globalContainer.resolve('features'); },
    get scheduler() { return globalContainer.resolve('scheduler'); },
    get search() { return globalContainer.resolve('search'); }
};
//# sourceMappingURL=di.js.map