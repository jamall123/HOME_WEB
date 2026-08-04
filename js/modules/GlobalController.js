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
        this.loadLiveStats();

        try {
            // Load CMS Page Content (formerly dynamic-content.js)
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
                                // Don't let an empty/unfilled admin field blank out the static fallback copy.
                                if (!value) return;
                                if (el.tagName === 'IMG') {
                                    el.src = value;
                                } else if (el.tagName === 'A' && el.hasAttribute('data-dynamic-mailto')) {
                                    el.textContent = value;
                                    el.href = 'mailto:' + value;
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
            Logger.error('GlobalController', 'Error loading dynamic page content: ' + (error.message || error), error.stack || '');
        }
    }

    // Real, live counts from Firestore — no static/vanity numbers. All three
    // collections queried here have `allow read: if true` in firestore.rules,
    // so an anonymous count().get() aggregate query (cheap, no document
    // downloads) is both safe and accurate. `stat-products` stays a static
    // "2" in the HTML since it's a verifiable fact (SudanFree + Academy),
    // not something that needs a database round-trip.
    async loadLiveStats() {
        const statsSection = document.querySelector('.statistics-section');
        const db = window.firebase ? window.firebase.firestore() : null;
        if (!db) {
            if (statsSection) statsSection.style.display = 'none';
            return;
        }

        try {
            const [coursesSnap, postsSnap, storiesSnap] = await Promise.all([
                db.collection('courses').count().get(),
                db.collection('posts').where('status', '==', 'published').count().get(),
                db.collection('successStories').where('isPublished', '==', true).count().get()
            ]);

            const coursesCounter = document.getElementById('stat-courses');
            if (coursesCounter) coursesCounter.setAttribute('data-target', coursesSnap.data().count);

            const postsCounter = document.getElementById('stat-posts');
            if (postsCounter) postsCounter.setAttribute('data-target', postsSnap.data().count);

            const storiesCounter = document.getElementById('stat-stories');
            if (storiesCounter) storiesCounter.setAttribute('data-target', storiesSnap.data().count);

            this.initCounters();
        } catch (error) {
            Logger.error('GlobalController', 'Error loading live stats: ' + (error.message || error), error.stack || '');
            if (statsSection) statsSection.style.display = 'none';
        }
    }

    // NOTE: a `loadSettings()` reading `settings/global` used to live here,
    // but firestore.rules has `match /settings/{docId} { allow write: if false; }`
    // — no client can ever write that doc, so it was permanently dead code.
    // These fields (hero text, vision/mission/values, founder bio) are now
    // served through the same `pageContent` + `[data-dynamic]` pipeline as
    // everything else in loadDynamicData(), which the admin panel can
    // actually write to (`pageContent/{home,about,...}`, admin-gated by rules).

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
