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
        
        // Sync initial state
        if (this.engine && this.engine.state && this.engine.state.layout) {
            this.updateLayout(this.engine.state.layout);
        }
    },

    attachListeners() {
        // Desktop / Mobile panel toggles trigger state updates, NOT direct DOM changes
        if(this.elements.navToggleCurriculum) {
            this.elements.navToggleCurriculum.addEventListener('click', () => {
                const current = this.engine.state.layout.sidebarOpen;
                this.engine.updateState({ layout: { sidebarOpen: !current, chatOpen: false } });
            });
        }

        if(this.elements.navToggleChat) {
            this.elements.navToggleChat.addEventListener('click', () => {
                const current = this.engine.state.layout.chatOpen;
                this.engine.updateState({ layout: { chatOpen: !current, sidebarOpen: false } });
            });
        }

        // Tabs Logic is now handled via inline script in course-room.html for .side-tabs

        // Mobile: Close panels when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth > 1024) return; // Only apply on mobile/tablet

            const isClickInsideCurriculum = this.elements.panelCurriculum && this.elements.panelCurriculum.contains(e.target);
            const isClickInsideChat = this.elements.panelChat && this.elements.panelChat.contains(e.target);
            const isClickOnToggleCurriculum = this.elements.navToggleCurriculum && this.elements.navToggleCurriculum.contains(e.target);
            const isClickOnToggleChat = this.elements.navToggleChat && this.elements.navToggleChat.contains(e.target);

            // If we clicked outside both panels AND their toggle buttons
            if (!isClickInsideCurriculum && !isClickInsideChat && !isClickOnToggleCurriculum && !isClickOnToggleChat) {
                if (this.engine && this.engine.state && this.engine.state.layout) {
                    if (this.engine.state.layout.sidebarOpen || this.engine.state.layout.chatOpen) {
                        this.engine.updateState({ layout: { sidebarOpen: false, chatOpen: false } });
                    }
                }
            }
        });
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
                if (this.elements.workspace) this.elements.workspace.classList.remove('hide-curriculum');
            } else {
                this.elements.panelCurriculum.classList.remove('active-mobile');
                if (this.elements.workspace) this.elements.workspace.classList.add('hide-curriculum');
            }
        }

        if (this.elements.panelChat) {
            if (layoutState.chatOpen) {
                this.elements.panelChat.classList.add('active-mobile');
                if (this.elements.workspace) this.elements.workspace.classList.remove('hide-chat');
            } else {
                this.elements.panelChat.classList.remove('active-mobile');
                if (this.elements.workspace) this.elements.workspace.classList.add('hide-chat');
            }
        }

        // No more bottom sheet or room-tabs logic here
    }
};
