document.addEventListener('DOMContentLoaded', () => {
    console.log("Portfolio initialized");

    const header = document.querySelector('.glass-header');

    // Header Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.padding = '0.8rem 2rem';
            header.style.background = 'rgba(15, 23, 42, 0.9)';
            header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.2)';
        } else {
            header.style.padding = '1.2rem 2rem';
            header.style.background = 'transparent';
            header.style.boxShadow = 'none';
        }
    });

    // Intersection Observer for Fade-on-Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-on-scroll');
    fadeElements.forEach(el => observer.observe(el));

    // Hamburger Menu Logic
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const navOverlay = document.querySelector('.nav-overlay');
    const closeBtn = document.querySelector('.close-btn');
    const navLinks = document.querySelectorAll('.nav-link');

    function toggleMenu() {
        navOverlay.classList.toggle('active');
        document.body.style.overflow = navOverlay.classList.contains('active') ? 'hidden' : ''; // Prevent scrolling when menu is open
    }

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', toggleMenu);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', toggleMenu);
    }

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', toggleMenu);
    });
});
