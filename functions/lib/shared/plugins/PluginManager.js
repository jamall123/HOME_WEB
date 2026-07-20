import { DI } from '../di.js';
export class PluginManager {
    container;
    plugins = new Map();
    initialized = false;
    started = false;
    constructor(container) {
        this.container = container;
    }
    register(plugin) {
        if (this.plugins.has(plugin.name)) {
            throw new Error(`Plugin ${plugin.name} is already registered.`);
        }
        this.plugins.set(plugin.name, plugin);
        DI.logger.info(`Registered plugin: ${plugin.name} (v${plugin.version})`);
    }
    async initializeAll() {
        if (this.initialized)
            return;
        // TODO: Topological sort based on plugin.dependencies to determine initialization order.
        for (const plugin of this.plugins.values()) {
            try {
                DI.logger.info(`Initializing plugin: ${plugin.name}`);
                await plugin.initialize(this.container);
            }
            catch (error) {
                DI.logger.error(`Failed to initialize plugin: ${plugin.name}`, { error });
                throw error;
            }
        }
        this.initialized = true;
        DI.logger.info('All plugins initialized.');
    }
    async startAll() {
        if (!this.initialized) {
            throw new Error('Plugins must be initialized before they can be started.');
        }
        if (this.started)
            return;
        for (const plugin of this.plugins.values()) {
            try {
                DI.logger.info(`Starting plugin: ${plugin.name}`);
                await plugin.start();
            }
            catch (error) {
                DI.logger.error(`Failed to start plugin: ${plugin.name}`, { error });
                throw error;
            }
        }
        this.started = true;
        DI.logger.info('All plugins started successfully.');
    }
    async stopAll() {
        if (!this.started)
            return;
        for (const plugin of this.plugins.values()) {
            try {
                DI.logger.info(`Stopping plugin: ${plugin.name}`);
                await plugin.stop();
            }
            catch (error) {
                DI.logger.error(`Failed to gracefully stop plugin: ${plugin.name}`, { error });
            }
        }
        this.started = false;
        this.initialized = false;
        DI.logger.info('All plugins stopped.');
    }
    getPlugin(name) {
        const plugin = this.plugins.get(name);
        if (!plugin) {
            throw new Error(`Plugin ${name} not found.`);
        }
        return plugin;
    }
}
//# sourceMappingURL=PluginManager.js.map