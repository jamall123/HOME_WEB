import { eventBus } from './EventBus.js';

export class LayoutManager {
    constructor() {
        this.root = document.getElementById('app-root') || document.body;
    }

    init() {
        // Prepare DOM structure for Shell
        this.root.innerHTML = `
            <div class="enterprise-layout">
                <div id="shell-sidebar-container"></div>
                <div class="enterprise-main-wrapper">
                    <div id="shell-header-container"></div>
                    <div id="shell-workspace-container" class="enterprise-workspace"></div>
                </div>
            </div>
            <div id="shell-notification-container"></div>
        `;
        eventBus.emit('layout:ready');
    }
}

export const layoutManager = new LayoutManager();
