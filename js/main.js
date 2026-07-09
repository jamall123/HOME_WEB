document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------------------
    // 1. Motion Design System
    // ----------------------------------------------------
    
    // Header Scroll Effect
    const header = document.querySelector('.glass-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Scroll Reveal Observer (Fade In Up)
    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, revealOptions);

    const animateElements = document.querySelectorAll('.animate-fade-up');
    animateElements.forEach(el => revealObserver.observe(el));


    // ----------------------------------------------------
    // 2. Data Integrity & Dynamic Loading
    // ----------------------------------------------------

    async function loadDynamicData() {
        try {
            const response = await fetch('data/config.json');
            if (!response.ok) throw new Error('Failed to load config');
            const data = await response.json();

            // Populate Statistics Counters
            const locCounter = document.getElementById('stat-loc');
            if (locCounter) locCounter.setAttribute('data-target', data.metrics.lines_of_code);
            
            const projectsCounter = document.getElementById('stat-projects');
            if (projectsCounter) projectsCounter.setAttribute('data-target', data.metrics.projects_completed);
            
            const usersCounter = document.getElementById('stat-users');
            if (usersCounter) usersCounter.setAttribute('data-target', data.metrics.active_users_target);
            
            const uptimeCounter = document.getElementById('stat-uptime');
            if (uptimeCounter) uptimeCounter.setAttribute('data-target', data.metrics.system_uptime);

            initCounters(); // Initialize after data is set
            
            // Note: Roadmap and product versions can be injected here similarly
            // if we add specific IDs to the HTML structure.

        } catch (error) {
            console.error('Error loading dynamic data:', error);
            // On failure, hide the statistics block entirely
            const statsSection = document.querySelector('.statistics-section');
            if (statsSection) {
                statsSection.style.display = 'none';
            }
        }
    }

    // Dynamic Number Counters
    function initCounters() {
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counters = entry.target.querySelectorAll('.counter-value');
                    counters.forEach(counter => {
                        const target = parseFloat(counter.getAttribute('data-target'));
                        if (isNaN(target)) return;
                        
                        const isDecimal = target % 1 !== 0;
                        const duration = 2000; // ms
                        const step = target / (duration / 16); // 60fps
                        
                        let current = 0;
                        const updateCounter = () => {
                            current += step;
                            if (current < target) {
                                counter.innerText = isDecimal ? current.toFixed(1) : Math.ceil(current);
                                requestAnimationFrame(updateCounter);
                            } else {
                                counter.innerText = isDecimal ? target.toFixed(1) : target;
                            }
                        };
                        updateCounter();
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        const statsSection = document.querySelector('.statistics-section');
        if (statsSection) {
            counterObserver.observe(statsSection);
        }
    }

    // Execute Data Loading
    loadDynamicData();

    // ----------------------------------------------------
    // 3. Navigation Components (Mobile Menu)
    // ----------------------------------------------------
    
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const navOverlay = document.querySelector('.nav-overlay');
    const closeBtn = document.querySelector('.close-btn');
    const navLinks = document.querySelectorAll('.nav-link');

    function toggleMenu() {
        if (!navOverlay) return;
        const isActive = navOverlay.classList.contains('active');
        
        if (isActive) {
            navOverlay.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            navOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleMenu);
    if (closeBtn) closeBtn.addEventListener('click', toggleMenu);
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navOverlay && navOverlay.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // ----------------------------------------------------
    // 4. Page Loader Exit Animation
    // ----------------------------------------------------
    
    const loader = document.querySelector('.page-loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 100);
    }

});
