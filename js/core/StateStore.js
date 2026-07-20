import { eventBus } from './EventBus.js';

export class StateStore {
    constructor() {
        this.state = {
            user: null,
            theme: 'dark',
            sidebarCollapsed: false,
            currentRoute: null,
            permissions: []
        };
    }

    get(key) {
        return this.state[key];
    }

    set(key, value) {
        this.state[key] = value;
        eventBus.emit(`state:${key}`, value);
    }

    update(key, partialValue) {
        if (typeof this.state[key] === 'object' && this.state[key] !== null) {
            this.state[key] = { ...this.state[key], ...partialValue };
        } else {
            this.state[key] = partialValue;
        }
        eventBus.emit(`state:${key}`, this.state[key]);
    }
}

export const stateStore = new StateStore();
