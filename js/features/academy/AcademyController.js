import { EnrollmentController } from '../enrollment/index.js';
import { academyService } from './AcademyService.js';
import { CourseRepository } from '../../repositories/CourseRepository.js';

export class AcademyController {
    constructor() {
        this.coursesData = {};
    }

    async init() {
        await this.renderCourses();
        this.setupFiltering();
        this._setupModalCloseHandlers();
    }

    _setupModalCloseHandlers() {
        // Course modal — X button
        const courseModal = document.getElementById('course-modal');
        if (courseModal) {
            const closeBtn = courseModal.querySelector('.close-modal');
            if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());
            // Click outside modal content to close
            courseModal.addEventListener('click', (e) => {
                if (e.target === courseModal) this.closeModal();
            });
        }

        // Instructor modal — X button
        const instructorModal = document.getElementById('instructor-modal');
        if (instructorModal) {
            const closeBtn = instructorModal.querySelector('.close-instructor-modal');
            if (closeBtn) closeBtn.addEventListener('click', () => this.closeInstructorModal());
            instructorModal.addEventListener('click', (e) => {
                if (e.target === instructorModal) this.closeInstructorModal();
            });
        }

        // Enrollment modal — X button + close-enrollment-modal buttons
        const enrollmentModal = document.getElementById('enrollment-modal');
        if (enrollmentModal) {
            const closeEnrollmentBtn = enrollmentModal.querySelector('.close-enrollment-modal');
            if (closeEnrollmentBtn) {
                closeEnrollmentBtn.addEventListener('click', () => {
                    enrollmentModal.classList.remove('active');
                    document.body.style.overflow = 'auto';
                });
            }
            // All .close-enrollment-modal buttons (success/error states)
            enrollmentModal.querySelectorAll('.close-enrollment-modal').forEach(btn => {
                btn.addEventListener('click', () => {
                    enrollmentModal.classList.remove('active');
                    document.body.style.overflow = 'auto';
                });
            });
        }

        // ESC key closes any open modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeInstructorModal();
                const em = document.getElementById('enrollment-modal');
                if (em) { em.classList.remove('active'); document.body.style.overflow = 'auto'; }
            }
        });
    }

    async renderCourses() {
        const grid = document.getElementById('courses-grid');
        if (!grid) return;
        
        grid.innerHTML = '<div style="text-align:center; padding: 3rem; color: var(--text-muted); grid-column: 1 / -1;"><i class="fas fa-spinner fa-spin fa-2x"></i><p style="margin-top: 1rem;">جاري تحميل الدورات...</p></div>';
        
        try {
            const courses = await academyService.fetchAllCourses();
            grid.innerHTML = '';
            this.coursesData = {}; // Clear old data
            
            if (!courses || courses.length === 0) {
                grid.innerHTML = '<div style="text-align:center; padding: 3rem; color: var(--text-muted); grid-column: 1 / -1;"><p>لا توجد دورات متاحة حالياً.</p></div>';
                return;
            }

            const coursesCountEl = document.getElementById('courses-count');
            if (coursesCountEl) {
                coursesCountEl.innerText = courses.length;
            }

            courses.forEach(course => {
                this.coursesData[course.id] = course;
                grid.innerHTML += this.generateCourseCardHtml(course);
            });
            
            // Re-attach event listeners for dynamic content if we want to remove inline onclicks, 
            // but for safety in Stage 4, we'll keep the UI intact and wire it up globally.
        } catch(e) {
            console.error('[AcademyController]', e);
            grid.innerHTML = '<div style="text-align:center; padding: 3rem; color: var(--danger); grid-column: 1 / -1;"><p>حدث خطأ أثناء جلب الدورات.</p></div>';
        }
    }

    generateCourseCardHtml(course) {
        // Fallbacks for UI if missing in DB
        const category = course.category || 'all';
        const level = course.level || 'عام';
        const duration = course.duration ? `${course.duration} يوم` : 'غير محدد';
        const title = course.title || 'دورة بدون عنوان';
        const description = course.description || 'لا يوجد وصف متاح.';
        const rawCover = course.cover || course.coverImage || course.image || course.thumbnail || course.photo;
        const cover = rawCover && rawCover.trim() !== '' ? rawCover : null;
        const isLive = !!course.isLive;
        const price = course.price && course.price > 0 ? course.price : 0;
        const badge = course.isPaid ? 
            `<span class="course-card__badge course-card__badge--paid"><i class="fas fa-crown"></i> دورة مدفوعة</span>` 
            : `<span class="course-card__badge course-card__badge--free"><i class="fas fa-gift"></i> مجانية بالكامل</span>`;
        const livePill = isLive ? `<span class="course-card__pill course-card__pill--live"><i class="fas fa-circle"></i> مباشر الآن</span>` : '';
        const priceTag = price > 0
            ? `<span class="course-price-tag course-price-tag--paid"><i class="fas fa-tag"></i> ${price.toLocaleString('ar-EG')} SDG</span>`
            : `<span class="course-price-tag course-price-tag--free"><i class="fas fa-check-circle"></i> مجاني</span>`;

        return `
        <article class="course-card" data-category="${category}" style="display: flex; flex-direction: column; background: transparent; border: none; box-shadow: none; overflow: visible;">
            <div class="course-card__media">
                ${cover ? `<img src="${cover}" alt="${title}" loading="lazy" decoding="async" onerror="this.style.display='none';">` : `<div class="fallback-cover-logo"><span>J</span><span>home</span></div>`}
                ${badge}
                ${livePill}
            </div>
            <div class="course-card__content glass-panel" style="margin-top: -30px; position: relative; z-index: 2; border-radius: 24px; border: 1px solid rgba(255,255,255,0.08);">
                <div class="course-card__meta">
                    <span class="caption-meta" style="color: var(--primary-light);">${level}</span>
                    <span class="caption-meta en-text" style="background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px;">${duration}</span>
                </div>
                <h3 class="course-card__title">${title}</h3>
                <p class="course-card__description">${description.substring(0, 95)}${description.length > 95 ? '...' : ''}</p>
                <div class="course-card__footer">
                    ${priceTag}
                </div>
                <div class="course-card__actions">
                    <button class="btn btn-secondary open-course-modal" onclick="openModal('${course.id}')">التفاصيل</button>
                    <a href="course-room.html?type=paid&id=${course.id}" class="btn btn-primary">الدخول إلى الغرفة</a>
                </div>
            </div>
        </article>
        `;
    }

    setupFiltering() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        if (filterBtns.length > 0) {
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Remove active class from all buttons
                    filterBtns.forEach(b => b.classList.remove('active'));
                    // Add active class to clicked button
                    btn.classList.add('active');

                    const targetFilter = btn.getAttribute('data-filter');
                    const courseCards = document.querySelectorAll('.course-card');

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
    }

    // Modal UI logic
    openModal(courseId) {
        const courseModal = document.getElementById('course-modal');
        const modalBody = document.getElementById('course-modal-body');
        if (!courseModal || !modalBody) return;

        const data = this.coursesData[courseId];
        if (data) {
            let actionButtons = '';
            
            if (data.isPaid) {
                actionButtons = `
                <button class="btn btn-secondary" style="flex: 1;" onclick="window.academyController.openEnrollment('${data.title}', true, '${data.id}')">طلب اشتراك <i class="fas fa-credit-card" style="margin-right: 8px;"></i></button>
                <a href="course-room.html?type=paid&id=${data.id}" class="btn btn-primary" style="flex: 1; text-align: center;">دخول المشتركين <i class="fas fa-sign-in-alt" style="margin-right: 8px;"></i></a>
                `;
            } else {
                actionButtons = `
                <button class="btn btn-secondary" style="flex: 1;" onclick="window.academyController.openEnrollment('${data.title}', false, '${data.id}')">طلب انضمام مجاني <i class="fas fa-certificate" style="margin-right: 8px;"></i></button>
                <a href="course-room.html?type=paid&id=${data.id}" class="btn btn-primary" style="flex: 1; text-align: center;">دخول المشتركين <i class="fas fa-sign-in-alt" style="margin-right: 8px;"></i></a>
                `;
            }

            const rawCover = data.cover || data.coverImage || data.image || data.thumbnail || data.photo;
            const heroImage = (rawCover && rawCover.trim() !== '') ? rawCover : 'assets/images/courses/placeholder.jpg';
            const heroBadge = data.isPaid ? 'دورة مدفوعة' : 'دورة مجانية';
            const heroSubtitle = data.isLive ? 'الجلسة مفتوحة الآن' : 'محتوى عملي ومتابعة مستمرة';
            
            const levelStr = data.level || 'عام';
            const durationStr = data.duration ? `${data.duration} يوم` : 'غير محدد';
            const studentsStr = data.students || data.studentsCount || 0;
            const instructorNameStr = data.instructorName || data.instructor || 'مقدم الدورة';
            const price = data.price && data.price > 0 ? data.price : 0;
            const priceStr = price > 0 ? `${price.toLocaleString('ar-EG')} SDG` : 'مجاني';
            const priceColor = price > 0 ? '#34d399' : '#60a5fa';
            const priceIcon = price > 0 ? 'fa-tag' : 'fa-gift';

            modalBody.innerHTML = `
                <div class="course-modal-shell">
                    <div class="modal-hero">
                        <img class="modal-hero__image" src="${heroImage}" alt="${data.title}" onerror="this.style.display='none';">
                        <div class="modal-hero__content">
                            <span class="modal-badge"><i class="fas fa-play-circle"></i> ${heroBadge}</span>
                            <h2>${data.title}</h2>
                            <p class="body-large" style="margin:0; max-width:560px; color: rgba(255,255,255,0.8);">${heroSubtitle}</p>
                            <div class="modal-cta-stack">
                                ${actionButtons}
                            </div>
                        </div>
                    </div>
                    <div class="modal-details-container">
                        <p class="body-large text-muted">${data.description || 'لا يوجد وصف متاح.'}</p>
                        
                        <div class="course-meta-grid">
                            <div class="meta-item">
                                <i class="fas fa-clock"></i>
                                <span>المدة</span>
                                <strong>${durationStr}</strong>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-signal"></i>
                                <span>المستوى</span>
                                <strong>${levelStr}</strong>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-users"></i>
                                <span>المشتركين</span>
                                <strong>${studentsStr} طالب</strong>
                            </div>
                            <div class="meta-item" style="background: rgba(52,211,153,0.08); border-color: rgba(52,211,153,0.2);">
                                <i class="fas ${priceIcon}" style="color: ${priceColor};"></i>
                                <span style="color: ${priceColor};">رسوم الدورة</span>
                                <strong style="color: ${priceColor}; font-size: 1.1rem;">${priceStr}</strong>
                            </div>
                            <button class="meta-item" style="cursor: pointer; background: rgba(147, 51, 234, 0.1); border: 1px solid rgba(147, 51, 234, 0.3); transition: 0.3s; width: 100%; display: block; font-family: inherit; padding: 1rem; border-radius: var(--radius-md);" onmouseover="this.style.background='rgba(147, 51, 234, 0.2)'" onmouseout="this.style.background='rgba(147, 51, 234, 0.1)'" onclick="window.academyController.openInstructorModal('${data.id}')">
                                <i class="fas fa-chalkboard-teacher" style="color: #D8B4FE;"></i>
                                <span style="color: #A5B4FC;">المقدم</span>
                                <strong style="color: white; margin-top: 0.25rem; display: block;">${instructorNameStr}</strong>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            modalBody.innerHTML = '<div style="padding: 3rem; text-align: center;">لا توجد تفاصيل لهذه الدورة حالياً.</div>';
        }

        courseModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const courseModal = document.getElementById('course-modal');
        const modalBody = document.getElementById('course-modal-body');
        if (!courseModal) return;
        courseModal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scrolling
        
        // Clear content after animation
        setTimeout(() => {
            if(modalBody) modalBody.innerHTML = '';
        }, 400);
    }

    openInstructorModal(courseId) {
        const instructorModal = document.getElementById('instructor-modal');
        const instructorModalBody = document.getElementById('instructor-modal-body');
        if (!instructorModal || !instructorModalBody) return;
        
        const course = this.coursesData[courseId];
        if (course) {
            let instObj = course.instructor;
            const name = (typeof instObj === 'object' && instObj !== null) ? (instObj.name || 'مقدم الدورة') : (instObj || 'مقدم الدورة');
            let photo = (typeof instObj === 'object' && instObj !== null && instObj.photo) ? instObj.photo : course.instructorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1E293B&color=A5B4FC`;
            if (photo && typeof photo === 'string' && photo.includes('instructor.png')) photo = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1E293B&color=A5B4FC`;
            
            let specialty = (typeof instObj === 'object' && instObj !== null && instObj.specialty) ? instObj.specialty : course.instructorSpecialty || 'غير محدد';
            if (specialty && typeof specialty === 'string' && specialty.includes("مبرمج تطبيقات")) specialty = 'غير محدد';
            
            let bio = (typeof instObj === 'object' && instObj !== null && instObj.bio) ? instObj.bio : course.instructorBio || 'لا توجد نبذة تعريفية متوفرة عن مقدم هذه الدورة.';
            if (bio && typeof bio === 'string' && (bio.includes("جمال مؤسس jhome") || bio.includes("مهندس برمجيات ذو خبرة"))) bio = 'لا توجد نبذة تعريفية متوفرة عن مقدم هذه الدورة.';
            
            instructorModalBody.innerHTML = `
                <div style="background: linear-gradient(135deg, #1E293B, #0B162C); border-radius: 20px; overflow: hidden;">
                    <div style="height: 120px; background: url('${photo}') center/cover; filter: blur(5px) brightness(0.5);"></div>
                    <div style="padding: 0 2rem 2rem; position: relative;">
                        <img src="${photo}" alt="${name}" style="width: 100px; height: 100px; border-radius: 50%; border: 4px solid #1E293B; margin-top: -50px; position: relative; z-index: 2; object-fit: cover;">
                        <h3 class="display-3" style="margin-top: 1rem; margin-bottom: 0.2rem;">${name}</h3>
                        <p style="color: var(--primary-light); font-weight: 600; margin-bottom: 1.5rem;">${specialty}</p>
                        
                        <div style="margin-bottom: 1.5rem;">
                            <h4 style="color: #A5B4FC; margin-bottom: 0.5rem; font-size: 1rem;">نبذة تعريفية</h4>
                            <p class="text-muted" style="line-height: 1.6; font-size: 0.95rem;">${bio}</p>
                        </div>
                    </div>
                </div>
            `;
            instructorModal.classList.add('active');
        }
    }

    closeInstructorModal() {
        const instructorModal = document.getElementById('instructor-modal');
        if(instructorModal) instructorModal.classList.remove('active');
    }

    openEnrollment(courseTitle, isPaid = true, courseId = null) {
        if (EnrollmentController) {
            EnrollmentController.openEnrollment(courseTitle, isPaid, courseId);
        }
    }

}

export const academyController = new AcademyController();
window.academyController = academyController; // Expose globally for inline onclick handlers temporarily
window.openModal = academyController.openModal.bind(academyController); // Required for inline onclick="openModal('...')" in course cards
