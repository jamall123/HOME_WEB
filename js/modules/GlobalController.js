import { NavigationUI } from './NavigationUI.js';
import { ThemeManager } from './ThemeManager.js';
import { Logger } from './Logger.js';

class GlobalControllerClass {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            ThemeManager.init();
            NavigationUI.init();
            
            this.initMotionDesign();
            this.loadDynamicData();
            this.loadSettings();
            this.initPageLoaderExit();
        });
    }

    initMotionDesign() {
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
    }

    async loadDynamicData() {
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

            this.initCounters(); // Initialize after data is set
            
            // Also load CMS Page Content (formerly dynamic-content.js)
            let pageKey = window.location.pathname.split('/').pop().replace('.html', '');
            if (!pageKey || pageKey === 'index' || pageKey === '') {
                pageKey = 'home';
            }
            
            const db = window.firebase ? window.firebase.firestore() : null;
            if (db) {
                const pageDoc = await db.collection('pageContent').doc(pageKey).get();
                if (pageDoc.exists) {
                    const pageData = pageDoc.data();
                    if (pageData && pageData.sections) {
                        Object.keys(pageData.sections).forEach(key => {
                            const elements = document.querySelectorAll(`[data-dynamic="${key}"]`);
                            elements.forEach(el => {
                                const value = pageData.sections[key];
                                if (el.tagName === 'IMG') {
                                    el.src = value;
                                } else if (el.tagName === 'A' && el.hasAttribute('data-dynamic-href')) {
                                    el.href = value;
                                } else {
                                    el.innerHTML = value;
                                }
                            });
                        });
                    }
                }
            }
            
        } catch (error) {
            Logger.error('GlobalController', 'Error loading dynamic data: ' + (error.message || error), error.stack || '');
            // On failure, hide the statistics block entirely
            const statsSection = document.querySelector('.statistics-section');
            if (statsSection) {
                statsSection.style.display = 'none';
            }
        }
    }

    async loadSettings() {
        try {
            const db = window.firebase ? window.firebase.firestore() : null;
            if (!db) return;
            const doc = await db.collection('settings').doc('global').get();
            if (doc.exists) {
                const data = doc.data();

                // Populate index.html elements
                const heroText = document.getElementById('dy-hero-text');
                if(heroText && data.heroText) heroText.textContent = data.heroText;

                // Populate about.html elements
                const vision = document.getElementById('dy-vision');
                if(vision && data.vision) vision.textContent = data.vision;

                const mission = document.getElementById('dy-mission');
                if(mission && data.mission) mission.textContent = data.mission;

                const values = document.getElementById('dy-values');
                if(values && data.values) values.textContent = data.values;

                const founderName = document.getElementById('dy-founder-name');
                if(founderName && data.founderName) founderName.textContent = data.founderName;

                const founderBio1 = document.getElementById('dy-founder-bio1');
                if(founderBio1 && data.founderBio1) founderBio1.textContent = data.founderBio1;

                const founderBio2 = document.getElementById('dy-founder-bio2');
                if(founderBio2 && data.founderBio2) founderBio2.textContent = data.founderBio2;
            }
        } catch(error) {
            Logger.error('GlobalController', 'Error loading settings: ' + (error.message || error), error.stack || '');
        }
    }

    initCounters() {
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

    initPageLoaderExit() {
        const loader = document.querySelector('.page-loader');
        if (loader) {
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 100);
        }
    }
}

export const GlobalController = new GlobalControllerClass();
