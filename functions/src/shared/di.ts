export enum Lifetime {
  SINGLETON,
  TRANSIENT,
  SCOPED
}

export interface Provider<T> {
  lifetime: Lifetime;
  factory: (container: DIContainer) => T;
  instance?: T;
}

export class DIContainer {
  private providers = new Map<string, Provider<any>>();
  private scopedInstances = new Map<string, any>();

  register<T>(token: string, factory: (c: DIContainer) => T, lifetime: Lifetime = Lifetime.SINGLETON) {
    this.providers.set(token, { lifetime, factory });
  }

  resolve<T>(token: string): T {
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

  createScope(): DIContainer {
    const scopedContainer = new DIContainer();
    scopedContainer.providers = this.providers; // Share providers
    scopedContainer.scopedInstances = new Map(); // Fresh scoped instances
    return scopedContainer;
  }
}

export const globalContainer = new DIContainer();

// Facade for easier access
export const DI = {
  get db() { return globalContainer.resolve<any>('db'); },
  get auth() { return globalContainer.resolve<any>('auth'); },
  get storage() { return globalContainer.resolve<any>('storage'); },
  get logger() { return globalContainer.resolve<any>('logger'); },
  get eventBus() { return globalContainer.resolve<any>('eventBus'); },
  get config() { return globalContainer.resolve<any>('config'); },
  get plugins() { return globalContainer.resolve<any>('plugins'); },
  get features() { return globalContainer.resolve<any>('features'); },
  get scheduler() { return globalContainer.resolve<any>('scheduler'); },
  get search() { return globalContainer.resolve<any>('search'); }
};
