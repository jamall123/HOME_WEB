/**
 * founder.js
 * Logic for the founder page components
 */

document.addEventListener('DOMContentLoaded', () => {
    // Number counter animation for Stats Bar
    const stats = document.querySelectorAll('.stat-num');
    let hasAnimated = false;

    const animateStats = () => {
        stats.forEach(stat => {
            const target = +stat.getAttribute('data-target');
            const duration = 2000; // ms
            const increment = target / (duration / 16); // 60fps

            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    stat.innerText = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.innerText = target;
                }
            };

            updateCounter();
        });
    };

    // Intersection Observer to trigger stats animation when visible
    const statsSection = document.querySelector('.stats-bar-section');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasAnimated) {
                animateStats();
                hasAnimated = true;
            }
        }, { threshold: 0.5 });

        observer.observe(statsSection);
    }
});
