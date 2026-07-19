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
            bottomWorkspace: document.getElementById('bottom-workspace'),
            
            navToggleCurriculum: document.getElementById('nav-toggle-curriculum'),
            navToggleChat: document.getElementById('nav-toggle-chat'),
            closeBottomSheet: document.getElementById('close-bottom-sheet'),
            
            tabs: document.querySelectorAll('.room-tab'),
            tabContents: document.querySelectorAll('.room-tab-content')
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

        if(this.elements.closeBottomSheet) {
            this.elements.closeBottomSheet.addEventListener('click', () => {
                this.engine.updateState({ layout: { bottomSheetOpen: false } });
            });
        }

        // Tabs Logic
        this.elements.tabs.forEach(tab => {
            // Set ARIA roles initially
            tab.setAttribute('role', 'tab');
            tab.setAttribute('tabindex', '0');
            tab.setAttribute('aria-selected', tab.classList.contains('active') ? 'true' : 'false');

            const handleTabSelect = (e) => {
                const target = e.target.getAttribute('data-tab');
                const isMobile = window.innerWidth <= 1024;
                
                this.engine.updateState({ 
                    layout: { 
                        activeTab: target,
                        bottomSheetOpen: isMobile ? true : this.engine.state.layout.bottomSheetOpen
                    } 
                });
            };

            tab.addEventListener('click', handleTabSelect);
            tab.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTabSelect(e);
                }
            });
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

        // 2. Handle Bottom Sheet
        if (this.elements.bottomWorkspace) {
            if (layoutState.bottomSheetOpen) {
                this.elements.bottomWorkspace.classList.add('active-mobile');
            } else {
                this.elements.bottomWorkspace.classList.remove('active-mobile');
            }
        }

        // 3. Handle Active Tab
        if (layoutState.activeTab) {
            this.elements.tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            this.elements.tabContents.forEach(c => {
                c.classList.remove('active');
                c.setAttribute('role', 'tabpanel');
                c.setAttribute('aria-hidden', 'true');
            });

            const selectedTab = document.querySelector(`.room-tab[data-tab="${layoutState.activeTab}"]`);
            const selectedContent = document.getElementById(`tab-content-${layoutState.activeTab}`);

            if (selectedTab) {
                selectedTab.classList.add('active');
                selectedTab.setAttribute('aria-selected', 'true');
            }
            if (selectedContent) {
                selectedContent.classList.add('active');
                selectedContent.setAttribute('aria-hidden', 'false');
            }
        }
    }
};
