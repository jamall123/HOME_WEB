import { backendGateway } from './BackendGateway.js';

export class CommandBus {
  constructor() {
    this.gateway = backendGateway;
    this.middlewares = [];
    
    // Register default middlewares
    this.use(this.loggingMiddleware.bind(this));
    this.use(this.validationMiddleware.bind(this));
  }

  use(middleware) {
    this.middlewares.push(middleware);
  }

  async dispatch(command) {
    // Expected command format: { domain: 'academy', action: 'enroll', payload: {} }
    if (!command.domain || !command.action) {
      throw new Error('Invalid Command: Must specify domain and action.');
    }

    // Execute middleware chain
    let index = -1;
    const runner = async (i) => {
      if (i <= index) throw new Error('next() called multiple times');
      index = i;
      
      if (i === this.middlewares.length) {
        // End of chain, send to gateway
        return await this.gateway.execute(command);
      }
      
      const middleware = this.middlewares[i];
      return await middleware(command, () => runner(i + 1));
    };

    return await runner(0);
  }

  // Built-in Middlewares
  async loggingMiddleware(command, next) {
    console.group(`[CommandBus] ${command.domain}/${command.action}`);
    const start = performance.now();
    try {
      const result = await next();
      const duration = performance.now() - start;
      console.log(`[Success] (${duration.toFixed(2)}ms)`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`[Failed] (${duration.toFixed(2)}ms)`, error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  async validationMiddleware(command, next) {
    // Basic structural validation, deep validation happens on Backend
    if (command.payload === undefined) {
      command.payload = {};
    }
    return await next();
  }
}

export const commandBus = new CommandBus();
