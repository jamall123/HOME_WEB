/**
 * WorkspaceUI.js
 * Manages the layout states, tabs, and mobile panels.
 * Operates strictly via updateLayout(state) called by RoomEngine.
 */

export const WorkspaceUI = {
    elements: {},
    engine: null,

    init(engine) {
        this.engine = engine;
        this.elements = {
            workspace: document.getElementById('workspace'),
            panelCurriculum: document.getElementById('panel-curriculum'),
            panelChat: document.getElementById('panel-chat'),
            
            navToggleCurriculum: document.getElementById('nav-toggle-curriculum'),
            navToggleChat: document.getElementById('nav-toggle-chat')
        };

        this.attachListeners();
    },

    attachListeners() {
        // Desktop / Mobile panel toggles trigger state updates, NOT direct DOM changes
        if(this.elements.navToggleCurriculum) {
            this.elements.navToggleCurriculum.addEventListener('click', () => {
                const current = this.engine.state.layout.sidebarOpen;
                this.engine.updateState({ layout: { sidebarOpen: !current } });
            });
        }

        if(this.elements.navToggleChat) {
            this.elements.navToggleChat.addEventListener('click', () => {
                const current = this.engine.state.layout.chatOpen;
                this.engine.updateState({ layout: { chatOpen: !current } });
            });
        }

        // Tabs Logic is now handled via inline script in course-room.html for .side-tabs
    },

    /**
     * Render the UI based on layout state.
     * @param {Object} layoutState 
     */
    updateLayout(layoutState) {
        // 1. Handle Side Panels (Mobile/Tablet sliding logic)
        if (this.elements.panelCurriculum) {
            if (layoutState.sidebarOpen) {
                this.elements.panelCurriculum.classList.add('active-mobile');
            } else {
                this.elements.panelCurriculum.classList.remove('active-mobile');
            }
        }

        if (this.elements.panelChat) {
            if (layoutState.chatOpen) {
                this.elements.panelChat.classList.add('active-mobile');
            } else {
                this.elements.panelChat.classList.remove('active-mobile');
            }
        }

        // No more bottom sheet or room-tabs logic here
    }
};
