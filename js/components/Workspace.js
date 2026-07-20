import { eventBus } from '../core/EventBus.js';

export class Workspace {
    constructor(container) {
        this.container = container;
        this.currentModuleId = null;
        this.legacyPool = document.getElementById('legacy-modules-pool');
    }

    mount() {
        this.container.innerHTML = `
            <div class="workspace-content fade-enter">
                <!-- Modules will be mounted here -->
            </div>
        `;
        this.contentArea = this.container.querySelector('.workspace-content');
        this.bindEvents();
    }

    bindEvents() {
        eventBus.on('route:changed', (route) => {
            this.loadModule(route);
        });
    }

    loadModule(route) {
        // Find the legacy section
        const sectionId = `section-${route}`;
        const targetSection = document.getElementById(sectionId) || this.legacyPool?.querySelector(`#${sectionId}`);
        
        if (!targetSection) {
            console.warn(`Module section ${sectionId} not found.`);
            this.contentArea.innerHTML = `
                <div class="empty-state">
                    <h3>الصفحة غير موجودة</h3>
                    <p class="text-muted">لم يتم العثور على الوحدة البرمجية لهذا المسار.</p>
                </div>
            `;
            return;
        }

        // Animation exit
        this.contentArea.classList.remove('fade-enter-active');
        
        setTimeout(() => {
            // Reparent current module back to pool if needed
            if (this.currentModuleId) {
                const currentSection = document.getElementById(this.currentModuleId);
                if (currentSection && this.legacyPool) {
                    currentSection.style.display = 'none';
                    this.legacyPool.appendChild(currentSection);
                }
            }

            // Mount new module
            this.contentArea.innerHTML = ''; // clear error states if any
            targetSection.style.display = 'block';
            this.contentArea.appendChild(targetSection);
            this.currentModuleId = sectionId;

            // Trigger legacy load functions if they exist in AdminController
            // For now, emit event so AdminController can listen
            eventBus.emit('workspace:module_loaded', route);

            // Animation enter
            requestAnimationFrame(() => {
                this.contentArea.classList.add('fade-enter-active');
            });
        }, 150); // wait for exit transition
    }
}
