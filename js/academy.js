/**
 * Jhome Academy - LMS Frontend Logic
 * Handles filtering, interactive modals, and the "Room" UI state.
 */

document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------
    // 1. Academy Filtering Logic
    // ----------------------------------------------------
    const filterBtns = document.querySelectorAll('.filter-btn');
    const courseCards = document.querySelectorAll('.course-card');

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');

                const targetFilter = btn.getAttribute('data-filter');

                courseCards.forEach(card => {
                    if (targetFilter === 'all' || card.getAttribute('data-category') === targetFilter) {
                        card.style.display = 'flex';
                        // Small timeout to allow display:flex to apply before changing opacity
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 10);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(10px)';
                        // Wait for transition before hiding
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }

    // ----------------------------------------------------
    // 2. Interactive Modal Engine
    // ----------------------------------------------------
    const courseModal = document.getElementById('course-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const openModalBtns = document.querySelectorAll('.open-course-modal');
    const modalBody = document.getElementById('course-modal-body');

    // Mock Data for Courses (In a real scenario, fetch this from Firestore)
    const coursesData = {
        'web-dev': {
            title: 'تطوير تطبيقات الويب الحديثة',
            duration: '12 أسبوع',
            level: 'متوسط إلى متقدم',
            students: 120,
            instructor: 'م. جمال - مهندس برمجيات',
            description: 'معسكر تدريبي مكثف يعلمك بناء تطبيقات ويب سريعة وقابلة للتوسع باستخدام React و Node.js. ستتخرج وأنت تمتلك تطبيقك الحقيقي الأول.',
            icon: 'fa-react',
            color: '#61DAFB'
        }
        // Add more courses here
    };

    function openModal(courseId) {
        if (!courseModal || !modalBody) return;

        const data = coursesData[courseId];
        
        if (data) {
            // Populate Modal Content
            modalBody.innerHTML = `
                <div class="modal-header-visual" style="background: linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(30, 41, 59, 0.8));">
                    <i class="fab ${data.icon}" style="font-size: 6rem; color: ${data.color}; opacity: 0.9;"></i>
                </div>
                <div class="modal-details-container">
                    <h2 class="display-2" style="font-size: 2.5rem; margin-bottom: 1rem;">${data.title}</h2>
                    <p class="body-large text-muted">${data.description}</p>
                    
                    <div class="course-meta-grid">
                        <div class="meta-item">
                            <i class="fas fa-clock"></i>
                            <span>المدة</span>
                            <strong>${data.duration}</strong>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-signal"></i>
                            <span>المستوى</span>
                            <strong>${data.level}</strong>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-users"></i>
                            <span>المشتركين</span>
                            <strong>${data.students} طالب</strong>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-chalkboard-teacher"></i>
                            <span>المقدم</span>
                            <strong>${data.instructor}</strong>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                        <a href="course-room.html" class="btn btn-primary" style="flex: 1; text-align: center;">تسجيل الدخول للدورة <i class="fas fa-sign-in-alt" style="margin-right: 8px;"></i></a>
                        <button class="btn btn-secondary" style="flex: 1;" onclick="alert('سيتم فتح نافذة دفع / تسجيل هنا قريباً')">الاشتراك والدفع <i class="fas fa-credit-card" style="margin-right: 8px;"></i></button>
                    </div>
                </div>
            `;
        } else {
            modalBody.innerHTML = '<div style="padding: 3rem; text-align: center;">لا توجد تفاصيل لهذه الدورة حالياً.</div>';
        }

        courseModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling on main page
    }

    function closeModal() {
        if (!courseModal) return;
        courseModal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scrolling
        
        // Clear content after animation
        setTimeout(() => {
            if(modalBody) modalBody.innerHTML = '';
        }, 400);
    }

    if (openModalBtns) {
        openModalBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const courseId = e.target.closest('.open-course-modal').getAttribute('data-course-id');
                openModal(courseId);
            });
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    // Close on overlay click
    if (courseModal) {
        courseModal.addEventListener('click', (e) => {
            if (e.target === courseModal) {
                closeModal();
            }
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && courseModal && courseModal.classList.contains('active')) {
            closeModal();
        }
    });


    // ----------------------------------------------------
    // 3. Course Room (Virtual Classroom) UI Logic
    // ----------------------------------------------------
    const roomTabs = document.querySelectorAll('.room-tab');
    const roomContents = document.querySelectorAll('.room-tab-content');

    if (roomTabs.length > 0) {
        roomTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active from all tabs
                roomTabs.forEach(t => t.classList.remove('active'));
                roomContents.forEach(c => c.classList.remove('active'));

                // Add active to clicked
                tab.classList.add('active');
                const targetId = tab.getAttribute('data-target');
                document.getElementById(targetId).classList.add('active');
            });
        });
    }

});
