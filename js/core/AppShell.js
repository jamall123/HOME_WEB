import { eventBus } from './EventBus.js';
import { router } from './Router.js';
import { layoutManager } from './LayoutManager.js';

// Pre-init managers
import './NavigationManager.js';
import './StateStore.js';
import './PermissionManager.js';

// Import UI Components
import { EnterpriseSidebar } from '../components/EnterpriseSidebar.js';
import { EnterpriseHeader } from '../components/EnterpriseHeader.js';
import { Workspace } from '../components/Workspace.js';

// Subsystems
import { CMSManager } from '../modules/CMSManager.js';
import { MediaManager } from '../modules/MediaManager.js';
import { AdminController } from '../modules/AdminController.js';

export class AppShell {
    constructor() {
        this.sidebar = null;
        this.header = null;
        this.workspace = null;
        this.adminController = AdminController;
    }

    async boot() {
        console.log('[AppShell] Booting Enterprise Operating System...');
        
        // 1. Initialize Layout
        layoutManager.init();
        
        // 2. Instantiate Components
        this.sidebar = new EnterpriseSidebar(document.getElementById('shell-sidebar-container'));
        this.header = new EnterpriseHeader(document.getElementById('shell-header-container'));
        this.workspace = new Workspace(document.getElementById('shell-workspace-container'));
        
        // 3. Mount Components
        this.sidebar.mount();
        this.header.mount();
        this.workspace.mount();
        
        // 4. Start Router
        router.init();
        
        // 5. Initialize Subsystems
        CMSManager.init();
        MediaManager.init();
        
        eventBus.emit('app:ready');
    }
}

// Global bootstrap
window.appShell = new AppShell();
window.appShell.boot();
