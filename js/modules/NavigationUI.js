export const NavigationUI = {
    init() {
        this.hamburgerBtn = document.querySelector('.hamburger-btn');
        this.navOverlay = document.querySelector('.nav-overlay');
        this.closeBtn = document.querySelector('.close-btn');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        this.bindEvents();
    },

    bindEvents() {
        if (this.hamburgerBtn) {
            this.hamburgerBtn.addEventListener('click', () => this.toggleMenu());
        }
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.toggleMenu());
        }
        
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (this.navOverlay && this.navOverlay.classList.contains('active')) {
                    this.toggleMenu();
                }
            });
        });
    },

    toggleMenu() {
        if (!this.navOverlay) return;
        const isActive = this.navOverlay.classList.contains('active');
        
        if (isActive) {
            this.navOverlay.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            this.navOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
};
