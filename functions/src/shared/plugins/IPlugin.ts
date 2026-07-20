import { DIContainer } from '../di.js';

export interface IPlugin {
  readonly name: string;
  readonly version: string;
  readonly dependencies?: string[];

  /**
   * Called during the initialization phase.
   * Plugins should register their dependencies, routes, or event listeners here.
   */
  initialize(container: DIContainer): Promise<void>;

  /**
   * Called after all plugins are initialized.
   * Plugins can safely interact with other plugins here.
   */
  start(): Promise<void>;

  /**
   * Called during graceful shutdown.
   */
  stop(): Promise<void>;
}
