/**
 * Jhome Global Animations Module
 * Vanilla JS Intersection Observer for scroll-triggered animations.
 * No external dependencies - pure performance.
 */

(function () {
    'use strict';

    const ANIMATION_CLASSES = ['.animate-fade-up', '.animate-fade-in', '.animate-slide-in'];
    const DELAY_MAP = {
        'delay-100': '100ms',
        'delay-200': '200ms',
        'delay-300': '300ms',
        'delay-400': '400ms',
        'delay-500': '500ms',
    };

    function initAnimations() {
        const elements = document.querySelectorAll(ANIMATION_CLASSES.join(', '));
        if (!elements.length) return;

        // Apply initial hidden state
        elements.forEach(el => {
            if (el.classList.contains('animate-fade-up')) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(28px)';
            } else if (el.classList.contains('animate-fade-in')) {
                el.style.opacity = '0';
            } else if (el.classList.contains('animate-slide-in')) {
                el.style.opacity = '0';
                el.style.transform = 'translateX(20px)';
            }

            // Apply transition
            let delay = '0ms';
            for (const [cls, val] of Object.entries(DELAY_MAP)) {
                if (el.classList.contains(cls)) { delay = val; break; }
            }
            el.style.transition = `opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${delay}, transform 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${delay}`;
        });

        // Observe and reveal
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0) translateX(0)';
                    observer.unobserve(el);
                }
            });
        }, {
            threshold: 0.08,
            rootMargin: '0px 0px -40px 0px'
        });

        elements.forEach(el => observer.observe(el));
    }

    // Counter animation for statistics
    function initCounters() {
        const counters = document.querySelectorAll('.counter-value');
        if (!counters.length) return;

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.target || '0', 10);
                    if (!target) return;

                    let current = 0;
                    const duration = 2000;
                    const step = target / (duration / 16);

                    const timer = setInterval(() => {
                        current += step;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        el.textContent = Math.floor(current).toLocaleString('en');
                    }, 16);

                    counterObserver.unobserve(el);
                }
            });
        }, { threshold: 0.3 });

        counters.forEach(el => counterObserver.observe(el));
    }

    // Reading progress bar for post pages
    function initReadingProgress() {
        const progressBar = document.getElementById('reading-progress');
        if (!progressBar) return;

        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = Math.min(progress, 100) + '%';
        }, { passive: true });
    }

    // Init everything on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initAnimations();
            initCounters();
            initReadingProgress();
        });
    } else {
        initAnimations();
        initCounters();
        initReadingProgress();
    }
})();
