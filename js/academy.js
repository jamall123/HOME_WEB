/**
 * Jhome Academy - LMS Frontend Logic
 * Handles filtering, interactive modals, and the "Room" UI state.
 */

document.addEventListener('DOMContentLoaded', () => {

    // 0. Initialize Registration Engine
    if (window.RegistrationEngine) {
        window.RegistrationEngine.init();
    }

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

    // We'll store fetched courses here for modal usage
    let coursesData = {};

    const instructorsData = {
        'eng-jamal': {
            name: 'م. جمال أحمد',
            specialty: 'مهندس برمجيات وخبير تواصل',
            photo: 'assets/images/courses/instructor.png',
            bio: 'مهندس برمجيات ذو خبرة تمتد لأكثر من 8 سنوات في تطوير تطبيقات الويب وإدارة المنتجات التقنية. مهتم بتبسيط المفاهيم المعقدة ونقل المعرفة.',
            certificates: [
                'بكالوريوس هندسة برمجيات - جامعة الخرطوم',
                'شهادة احترافية في تطوير الويب (Full Stack) من Udacity',
                'ممارس معتمد في القيادة والإلقاء من Toastmasters'
            ],
            cvLink: '#'
        }
    };

    async function renderCourses() {
        const grid = document.getElementById('courses-grid');
        if(!grid) return;
        
        grid.innerHTML = '<div style="text-align:center; padding: 3rem; color: var(--text-muted); grid-column: 1 / -1;"><i class="fas fa-spinner fa-spin fa-2x"></i><p style="margin-top: 1rem;">جاري تحميل الدورات...</p></div>';
        
        try {
            const snap = await window.firebase.firestore().collection('courses').orderBy('createdAt', 'desc').get();
            grid.innerHTML = '';
            coursesData = {}; // Clear old data
            
            if (snap.empty) {
                grid.innerHTML = '<div style="text-align:center; padding: 3rem; color: var(--text-muted); grid-column: 1 / -1;"><p>لا توجد دورات متاحة حالياً.</p></div>';
                return;
            }

            snap.docs.forEach(doc => {
                const course = doc.data();
                course.id = doc.id;
                coursesData[course.id] = course;
                
                // Fallbacks for UI if missing in DB
                const category = course.category || 'all';
                const level = course.level || 'عام';
                const duration = course.duration ? `${course.duration} يوم` : 'غير محدد';
                const title = course.title || 'دورة بدون عنوان';
                const description = course.description || 'لا يوجد وصف متاح.';
                const rawCover = course.cover || course.coverImage || course.image || course.thumbnail || course.photo;
                const cover = rawCover && rawCover.trim() !== '' ? rawCover : null;
                const isLive = !!course.isLive;
                const badge = course.isPaid ? 
                    `<span class="course-card__badge course-card__badge--paid"><i class="fas fa-crown"></i> دورة مدفوعة</span>` 
                    : `<span class="course-card__badge course-card__badge--free"><i class="fas fa-gift"></i> مجانية بالكامل</span>`;
                const livePill = isLive ? `<span class="course-card__pill course-card__pill--live"><i class="fas fa-circle"></i> مباشر الآن</span>` : '';

                grid.innerHTML += `
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
                        <div class="course-card__actions">
                            <button class="btn btn-secondary open-course-modal" onclick="openModal('${course.id}')">التفاصيل</button>
                            <a href="course-room.html?type=paid&id=${course.id}" class="btn btn-primary">الدخول إلى الغرفة</a>
                        </div>
                    </div>
                </article>
                `;
            });
        } catch(e) {
            console.error(e);
            grid.innerHTML = '<div style="text-align:center; padding: 3rem; color: var(--danger); grid-column: 1 / -1;"><p>حدث خطأ أثناء جلب الدورات.</p></div>';
        }
    }

    // Call render on load
    renderCourses();

    window.openModal = function(courseId) {
        if (!courseModal || !modalBody) return;

        const data = coursesData[courseId];
        
        if (data) {
            let actionButtons = '';
            
            if (data.isPaid) {
                actionButtons = `
                <button class="btn btn-secondary" style="flex: 1;" onclick="openEnrollment('${data.title}', true, '${data.id}')">طلب اشتراك <i class="fas fa-credit-card" style="margin-right: 8px;"></i></button>
                <a href="course-room.html?type=paid&id=${data.id}" class="btn btn-primary" style="flex: 1; text-align: center;">دخول المشتركين <i class="fas fa-sign-in-alt" style="margin-right: 8px;"></i></a>
                `;
            } else {
                actionButtons = `
                <button class="btn btn-secondary" style="flex: 1;" onclick="openEnrollment('${data.title}', false, '${data.id}')">طلب انضمام مجاني <i class="fas fa-certificate" style="margin-right: 8px;"></i></button>
                <a href="course-room.html?type=paid&id=${data.id}" class="btn btn-primary" style="flex: 1; text-align: center;">دخول المشتركين <i class="fas fa-sign-in-alt" style="margin-right: 8px;"></i></a>
                `;
            }

            const heroImage = data.cover || 'assets/images/courses/placeholder.jpg';
            const heroBadge = data.isPaid ? 'دورة مدفوعة' : 'دورة مجانية';
            const heroSubtitle = data.isLive ? 'الجلسة مفتوحة الآن' : 'محتوى عملي ومتابعة مستمرة';

            modalBody.innerHTML = `
                <div class="course-modal-shell">
                    <div class="modal-hero">
                        <img class="modal-hero__image" src="${heroImage}" alt="${data.title}">
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
                            <button class="meta-item" style="cursor: pointer; background: rgba(147, 51, 234, 0.1); border: 1px solid rgba(147, 51, 234, 0.3); transition: 0.3s; width: 100%; display: block; font-family: inherit; padding: 1rem; border-radius: var(--radius-md);" onmouseover="this.style.background='rgba(147, 51, 234, 0.2)'" onmouseout="this.style.background='rgba(147, 51, 234, 0.1)'" onclick="openInstructorModal('${data.id}')">
                                <i class="fas fa-chalkboard-teacher" style="color: #D8B4FE;"></i>
                                <span style="color: #A5B4FC;">المقدم</span>
                                <strong style="color: white; margin-top: 0.25rem; display: block;">${data.instructor}</strong>
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

    // Instructor Modal Engine
    const instructorModal = document.getElementById('instructor-modal');
    const closeInstModalBtn = document.querySelector('.close-instructor-modal');
    const instructorModalBody = document.getElementById('instructor-modal-body');

    window.openInstructorModal = function(courseId) {
        if (!instructorModal || !instructorModalBody) return;
        const course = coursesData[courseId];
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
    };

    function closeInstructorModal() {
        if(instructorModal) instructorModal.classList.remove('active');
    }

    if (closeInstModalBtn) {
        closeInstModalBtn.addEventListener('click', closeInstructorModal);
    }
    
    if (instructorModal) {
        instructorModal.addEventListener('click', (e) => {
            if (e.target === instructorModal) closeInstructorModal();
        });
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
    const floatingTabBtns = document.querySelectorAll('.floating-tab-btn');
    const roomContents = document.querySelectorAll('.room-tab-content');
    const bottomSheet = document.getElementById('bottom-sheet');

    if (floatingTabBtns.length > 0) {
        floatingTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active from all tabs and contents
                floatingTabBtns.forEach(t => {
                    t.classList.remove('btn-primary');
                    t.classList.add('btn-secondary');
                    t.style.boxShadow = 'none';
                });
                roomContents.forEach(c => {
                    c.classList.remove('active');
                    c.style.display = 'none';
                });

                // Add active styling to clicked button
                btn.classList.remove('btn-secondary');
                btn.classList.add('btn-primary');
                btn.style.boxShadow = '0 4px 15px rgba(79, 70, 229, 0.4)';

                // Show target content
                const targetId = btn.getAttribute('data-target');
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    targetEl.classList.add('active');
                    targetEl.style.display = 'block';
                }

                // Slide up bottom sheet
                if (bottomSheet) {
                    bottomSheet.style.bottom = '0';
                }
            });
        });
    }

    // Function to close bottom sheet
    window.closeBottomSheet = function() {
        if (bottomSheet) {
            bottomSheet.style.bottom = '-100%';
            // Reset tab buttons visually
            floatingTabBtns.forEach(t => {
                t.classList.remove('btn-primary');
                t.classList.add('btn-secondary');
                t.style.boxShadow = 'none';
            });
        }
    };

    // ----------------------------------------------------
    // 4. Mobile Toggles (Sidebar & Chat)
    const roomLayout = document.querySelector('.room-layout');
    const roomSidebar = document.querySelector('.room-sidebar');
    const roomChat = document.querySelector('.room-chat');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    const toggleChatBtn = document.getElementById('toggle-chat');

    // Sidebar Toggle
    if (toggleSidebarBtn && roomLayout) {
        toggleSidebarBtn.addEventListener('click', () => {
            roomLayout.classList.toggle('sidebar-toggled');
            // If chat is open on mobile (or generally), we might want to close it to avoid overlap, 
            // but since they are distinct columns on desktop, we just let them act independently.
            // However, on mobile, if opening sidebar, maybe close chat? 
            if(window.innerWidth <= 1024 && roomLayout.classList.contains('sidebar-toggled')) {
                roomLayout.classList.remove('chat-toggled');
            }
        });
    }

    // Chat Toggle
    if (toggleChatBtn && roomLayout) {
        toggleChatBtn.addEventListener('click', () => {
            roomLayout.classList.toggle('chat-toggled');
            if(window.innerWidth <= 1024 && roomLayout.classList.contains('chat-toggled')) {
                roomLayout.classList.remove('sidebar-toggled');
            }
        });
    }

    // 4.5 Fullscreen Button
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const videoContainer = document.getElementById('main-video-container');

    if (fullscreenBtn && videoContainer) {
        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                if (videoContainer.requestFullscreen) {
                    videoContainer.requestFullscreen();
                } else if (videoContainer.webkitRequestFullscreen) {
                    videoContainer.webkitRequestFullscreen();
                } else if (videoContainer.msRequestFullscreen) {
                    videoContainer.msRequestFullscreen();
                }
                
                // Try to lock orientation to landscape on mobile
                if (screen.orientation && screen.orientation.lock) {
                    screen.orientation.lock('landscape').catch(() => {
                        console.log('Orientation lock not supported');
                    });
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        });

        document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement) {
                fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i> تصغير';
            } else {
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i> تكبير الشاشة';
                if (screen.orientation && screen.orientation.unlock) {
                    screen.orientation.unlock();
                }
            }
        });
    }

    // ----------------------------------------------------
    // 5. Enrollment & Payment Flow
    // ----------------------------------------------------
    const enrollmentModal = document.getElementById('enrollment-modal');
    const closeEnrollmentBtn = document.querySelector('.close-enrollment-modal');
    const enrollmentForm = document.getElementById('enrollment-form');
    
    // 5. Enrollment & Payment Flow (Delegated to RegistrationEngine)
    // ----------------------------------------------------
    window.openEnrollment = function(courseTitle, isPaid = true, courseId = null) {
        if (window.RegistrationEngine) {
            window.RegistrationEngine.openRegistration(courseId, courseTitle, isPaid);
        } else {
            console.error("RegistrationEngine not loaded.");
            alert("حدث خطأ في تحميل نظام التسجيل. الرجاء تحديث الصفحة.");
        }
    };

    // ----------------------------------------------------
    // 6. Room Entry Gate (Bouncer)
    // ----------------------------------------------------
    const roomEntryGate = document.getElementById('room-entry-gate');
    const entrySelection = document.getElementById('entry-selection');
    const studentForm = document.getElementById('student-entry-form');
    const instructorForm = document.getElementById('instructor-entry-form');
    const instructorTabBtn = document.getElementById('instructor-tab-btn');

    window.showStudentEntry = function() {
        if(entrySelection && studentForm) {
            entrySelection.style.display = 'none';
            studentForm.style.display = 'block';
        }
    };

    window.showInstructorEntry = function() {
        if(entrySelection && instructorForm) {
            entrySelection.style.display = 'none';
            instructorForm.style.display = 'block';
        }
    };

    window.backToSelection = function() {
        if(entrySelection && studentForm && instructorForm) {
            studentForm.style.display = 'none';
            instructorForm.style.display = 'none';
            entrySelection.style.display = 'flex';
        }
    };

    window.enterRoom = async function(role) {
        if(role === 'instructor') {
            const email = document.getElementById('instructor-email').value.trim();
            const pass = document.getElementById('instructor-pass').value.trim();
            
            if(!email || !pass) {
                alert('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
                return;
            }

            try {
                const btn = event.target;
                const originalText = btn.innerHTML;
                btn.innerHTML = 'جاري تسجيل الدخول...';
                btn.disabled = true;

                await window.firebase.auth().signInWithEmailAndPassword(email, pass);
                
                // onAuthStateChanged will handle UI changes
            } catch(e) {
                console.error(e);
                alert('فشل تسجيل الدخول. تأكد من البريد وكلمة المرور.');
                const btn = event.target;
                btn.innerHTML = 'تسجيل الدخول الإداري <i class="fas fa-lock"></i>';
                btn.disabled = false;
            }
        } else {
            // Guest Student (Free courses)
            const guestName = document.getElementById('guest-name').value.trim() || 'ضيف';
            window.currentUser = { name: guestName, role: 'student' };
            if(roomEntryGate) {
                roomEntryGate.style.opacity = '0';
                setTimeout(() => {
                    roomEntryGate.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }, 400);
            }
        }
    };

    window.enterRoomUnified = async function(event) {
        const usernameRaw = document.getElementById('unified-username').value.trim();
        const passwordInput = document.getElementById('unified-pass').value.trim();

        if(!usernameRaw || !passwordInput) {
            alert('الرجاء إدخال اسم المستخدم وكلمة المرور');
            return;
        }

        const btn = event ? event.target : document.querySelector('#unified-entry-form button');
        const originalText = btn ? btn.innerHTML : '';
        if (btn) { btn.innerHTML = 'جاري تسجيل الدخول... <i class="fas fa-spinner fa-spin"></i>'; btn.disabled = true; }

        try {
            // Credential verification now happens server-side via the
            // api_v1_academy_login Cloud Function (Admin SDK) instead of
            // reading/comparing the plaintext password in the browser.
            const { backendGateway } = await import('./core/BackendGateway.js');
            const result = await backendGateway.execute({
                domain: 'academy_login',
                action: 'login',
                payload: { username: usernameRaw, password: passwordInput }
            });

            const { token, role, courseId, displayName, username } = result.data;

            // Complete sign-in through the real Firebase Auth flow.
            await window.firebase.auth().signInWithCustomToken(token);

            // ✅ Success
            window.currentUser = {
                name: displayName,
                username: username,
                role: role || 'student',
                courseId: courseId
            };
            console.log('Login successful:', window.currentUser);

            // Add to connected users
            if (window.currentRoomCourseId) {
                try {
                    await window.firebase.firestore().collection('courses').doc(window.currentRoomCourseId).collection('connected_users').doc(window.currentUser.username).set({
                        name: window.currentUser.name,
                        username: window.currentUser.username,
                        role: window.currentUser.role,
                        joinedAt: window.firebase.firestore.FieldValue.serverTimestamp()
                    });
                } catch(err) {
                    console.error("Error adding to connected_users", err);
                }
            }

            // Hide entry gate
            const roomEntryGate = document.getElementById('room-entry-gate');
            if(roomEntryGate) {
                roomEntryGate.style.opacity = '0';
                setTimeout(() => {
                    roomEntryGate.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }, 400);
            }

            // Show instructor tools tab if instructor
            if (window.currentUser.role === 'instructor') {
                const instBtn = document.getElementById('instructor-tab-btn');
                if (instBtn) instBtn.style.display = 'block';
                if (typeof window.renderSyllabusUI === 'function') window.renderSyllabusUI();
                
                // Pre-fill datetime fields
                const schedStart = document.getElementById('schedule-start');
                const schedEnd = document.getElementById('schedule-end');
                if(schedStart && schedEnd) {
                    const now = new Date();
                    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                    schedStart.value = now.toISOString().slice(0,16);
                    now.setHours(now.getHours() + 1);
                    schedEnd.value = now.toISOString().slice(0,16);
                }

                // Show modal if no rooms
                if (window.currentCourseRooms && window.currentCourseRooms.length === 0) {
                    setTimeout(() => {
                        if (typeof window.openSyllabusModal === 'function') {
                            window.openSyllabusModal();
                        }
                    }, 500);
                }
            }

            if (btn) { btn.innerHTML = originalText; btn.disabled = false; }

        } catch(e) {
            console.error('Login error:', e);
            const message = e.errorCode === 'invalid-credentials'
                ? e.message
                : 'حدث خطأ أثناء الاتصال بالخادم: ' + e.message;
            alert(message);
            if (btn) { btn.innerHTML = originalText; btn.disabled = false; }
        }

    };

    // Listen for Auth State Changes
    window.firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            try {
                const userDoc = await window.firebase.firestore().collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    window.currentUser = { name: userData.fullname, role: userData.role };
                    
                    if (userData.role === 'instructor') {
                        const instructorTabBtn = document.getElementById('instructor-tab-btn');
                        if (instructorTabBtn) instructorTabBtn.style.display = 'block';
                        if (typeof window.renderSyllabusUI === 'function') window.renderSyllabusUI();
                    }
                    
                    if (roomEntryGate) {
                        roomEntryGate.style.opacity = '0';
                        setTimeout(() => {
                            roomEntryGate.style.display = 'none';
                            document.body.style.overflow = 'auto';
                        }, 400);
                    }
                }
            } catch(e) {
                console.error('Error fetching user role:', e);
            }
        }
    });



    window.updateCurrentRoomData = async function() {
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('id');
        const roomId = urlParams.get('roomId');
        if(!courseId || !roomId) return alert('الرجاء التأكد من وجودك داخل غرفة محددة');

        const startTime = document.getElementById('room-start-time').value;
        const newSources = document.getElementById('room-add-sources').value;

        try {
            const courseRef = window.firebase.firestore().collection('courses').doc(courseId);
            const doc = await courseRef.get();
            if(doc.exists) {
                const course = doc.data();
                const rooms = course.rooms || [];
                const rIndex = rooms.findIndex(r => r.id === roomId);
                if(rIndex > -1) {
                    if(startTime) rooms[rIndex].startTime = startTime;
                    if(newSources) rooms[rIndex].sources = (rooms[rIndex].sources ? rooms[rIndex].sources + '\n\n' : '') + newSources;
                    
                    await courseRef.update({ rooms });
                    alert('تم حفظ التحديثات بنجاح!');
                    location.reload(); // reload to reflect changes
                }
            }
        } catch(e) {
            console.error(e);
            alert('حدث خطأ أثناء الحفظ');
        }
    };

    window.addNewCourseDay = async function() {
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('id');
        if(!courseId) return;

        const title = document.getElementById('new-day-title').value.trim();
        const type = document.getElementById('new-day-type').value;
        const videoUrl = document.getElementById('new-day-video-url').value.trim();

        if(!title) return alert('الرجاء كتابة عنوان المحاضرة');

        const newRoomId = 'room-' + Date.now();
        const newRoom = {
            id: newRoomId,
            name: title,
            type: type,
            videoUrl: type === 'recorded' ? videoUrl : '',
            sources: ''
        };

        try {
            const courseRef = window.firebase.firestore().collection('courses').doc(courseId);
            const doc = await courseRef.get();
            if(doc.exists) {
                const course = doc.data();
                const rooms = course.rooms || [];
                rooms.push(newRoom);
                await courseRef.update({ rooms });
                alert('تم إنشاء الغرفة الجديدة بنجاح! سيتم تحويلك إليها الآن.');
                window.location.href = `course-room.html?id=${courseId}&roomId=${newRoomId}`;
            }
        } catch(e) {
            console.error(e);
            alert('حدث خطأ أثناء إضافة المحاضرة');
        }
    };

    // ----------------------------------------------------
    // 7. Check URL for Course Type (Free vs Paid)
    // ----------------------------------------------------
    const urlParams = new URLSearchParams(window.location.search);
    const courseType = urlParams.get('type');
    const unifiedForm = document.getElementById('unified-entry-form');

    if(courseType === 'paid') {
        // It's a paid course, force unified login
        if(entrySelection) entrySelection.style.display = 'none';
        if(studentForm) studentForm.style.display = 'none';
        if(instructorForm) instructorForm.style.display = 'none';
        if(unifiedForm) unifiedForm.style.display = 'block';
    }

    if (window.location.pathname.includes('course-room.html')) {
        loadCourseRoomData();
    }
});

async function loadCourseRoomData() {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');
    const roomId = urlParams.get('roomId');
    
    if (!courseId) return;

    try {
        const doc = await window.firebase.firestore().collection('courses').doc(courseId).get();
        if (doc.exists) {
            const course = doc.data();
            const rooms = course.rooms || [];
            window.currentCourseRooms = rooms;
            window.currentCourseId = courseId;
            window.currentRoomId = roomId;
            
            // Render Sidebar rooms list
            renderSyllabusUI();

            // Set global course ID for current room (for connected users tracking)
            window.currentRoomCourseId = courseId;

            // Listen to connected users
            const db = window.firebase.firestore();
            db.collection('courses').doc(courseId).collection('connected_users').onSnapshot((snapshot) => {
                const listEl = document.getElementById('connected-students-list');
                const countEl = document.getElementById('connected-count');
                if (listEl && countEl) {
                    countEl.innerText = snapshot.size;
                    if (snapshot.empty) {
                        listEl.innerHTML = '<li style="color: var(--text-muted); font-size: 0.9rem;">لا يوجد طلاب متصلين حالياً.</li>';
                    } else {
                        let html = '';
                        snapshot.forEach(doc => {
                            const data = doc.data();
                            html += `
                                <li style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.05);">
                                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                                        <div style="width: 30px; height: 30px; border-radius: 50%; background: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.9rem;">
                                            ${data.name ? data.name.charAt(0) : 'U'}
                                        </div>
                                        <div>
                                            <span style="font-size: 0.95rem; display: block;">${data.name || data.username}</span>
                                            <span style="font-size: 0.75rem; color: var(--text-muted);">@${data.username}</span>
                                        </div>
                                    </div>
                                    <span style="width: 8px; height: 8px; border-radius: 50%; background: #10B981; box-shadow: 0 0 5px #10B981;"></span>
                                </li>
                            `;
                        });
                        listEl.innerHTML = html;
                    }
                }
            });

            // Handle page unload to remove user from connected list
            window.addEventListener('beforeunload', () => {
                if (window.currentUser && window.currentRoomCourseId) {
                    window.firebase.firestore().collection('courses').doc(window.currentRoomCourseId)
                        .collection('connected_users').doc(window.currentUser.username).delete();
                }
            });

            // Load active room details
            let activeRoom = rooms.find(r => r.id === roomId);
            if (!activeRoom && rooms.length > 0) activeRoom = rooms[0];

            if (activeRoom) {
                document.querySelector('#tab-desc h2').innerText = activeRoom.name;
                
                // Update Sources Tab
                const resTab = document.getElementById('tab-resources');
                if (resTab) {
                    resTab.innerHTML = `
                        <h3 style="margin-bottom: 1rem;">المصادر والمرفقات</h3>
                        <p style="white-space: pre-wrap; line-height: 1.6;">${activeRoom.sources || 'لا توجد مصادر مرفقة مع هذا الدرس.'}</p>
                    `;
                }

                // Handle Video vs Live
                if (activeRoom.type === 'recorded') {
                    // Hide live tools
                    const liveBtns = document.getElementById('instructor-tab-btn');
                    if(liveBtns) liveBtns.style.display = 'none';
                    
                    const videoContainer = document.getElementById('main-video-container');
                    let embedUrl = activeRoom.videoUrl;
                    
                    if (embedUrl && (embedUrl.includes('youtube.com/') || embedUrl.includes('youtu.be/'))) {
                        if (embedUrl.includes('watch?v=')) {
                            embedUrl = embedUrl.replace('watch?v=', 'embed/');
                        }
                        if (embedUrl.includes('youtu.be/')) {
                            embedUrl = embedUrl.replace('youtu.be/', 'youtube.com/embed/');
                        }
                        videoContainer.innerHTML = `
                            <iframe width="100%" height="100%" src="${embedUrl || ''}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top:0; left:0; width:100%; height:100%;"></iframe>
                        `;
                    } else {
                        // Assume it's an MP4 or direct video link (like from Firebase Storage)
                        videoContainer.innerHTML = `
                            <video controls style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit: contain; background: black;">
                                <source src="${embedUrl || ''}" type="video/mp4">
                                متصفحك لا يدعم تشغيل الفيديو.
                            </video>
                        `;
                    }
                } else {
                    // It's a live room, keep Agora UI
                    const liveBtns = document.getElementById('instructor-tab-btn');
                    // Instructors will see this tab when they login via enterRoom
                    
                    const videoContainer = document.getElementById('main-video-container');
                    
                    if (activeRoom.startTime) {
                        const startTimeMs = new Date(activeRoom.startTime).getTime();
                        const nowMs = new Date().getTime();
                        
                        if (startTimeMs > nowMs) {
                            // Show Countdown Overlay
                            videoContainer.innerHTML = `
                                <div id="countdown-overlay" style="position: absolute; top:0; left:0; width:100%; height:100%; background: var(--bg-dark); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10;">
                                    <i class="fas fa-clock" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
                                    <h2 style="margin-bottom: 0.5rem;">تبدأ المحاضرة خلال</h2>
                                    <div id="countdown-timer" style="font-size: 2.5rem; font-family: monospace; font-weight: bold; color: var(--warning); direction: ltr;">--:--:--</div>
                                    <p class="text-muted" style="margin-top: 1rem;">يرجى الانتظار، سيتم فتح البث تلقائياً في الموعد المحدد.</p>
                                </div>
                                <div id="actual-live-container" style="display: none; position: absolute; top:0; left:0; width:100%; height:100%;"></div>
                            `;
                            
                            const timerEl = document.getElementById('countdown-timer');
                            const overlay = document.getElementById('countdown-overlay');
                            const actualContainer = document.getElementById('actual-live-container');
                            
                            const interval = setInterval(() => {
                                const currentMs = new Date().getTime();
                                const diff = startTimeMs - currentMs;
                                
                                if (diff <= 0) {
                                    clearInterval(interval);
                                    overlay.style.display = 'none';
                                    actualContainer.style.display = 'block';
                                    // Move Agora video wrappers inside the actual container if needed,
                                    // or just hide the overlay so the normal #main-video-container behind it shows up.
                                    // In this case, we'll just clear the video container and let the instructor start stream.
                                    videoContainer.innerHTML = '';
                                    showToast('حان موعد المحاضرة! يمكنك الانضمام الآن.', 'info');
                                    return;
                                }
                                
                                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                                
                                timerEl.innerText = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                            }, 1000);
                        }
                    }
                }
            }
        }
    } catch(err) {
        console.error('Error fetching course data', err);
    }
}

    // ----------------------------------------------------
    // 8. Agora Live Stream Integration (Mock UI + SDK logic)
    // ----------------------------------------------------
    let rtc = {
        localAudioTrack: null,
        localVideoTrack: null,
        client: null
    };

    const options = {
        appId: "4400dcdb72bf4dc1bcdcb2fe37fac0ef", 
        channel: "course-test",
        token: "007eJxTYJDYp/me9f6jww3Pb/OYSu+teDr3sOSSb7ttdJP8uFw/rF6vwGBiYmCQkpySZG6UlGaSkmyYlJySnGSUlmpsnpaYbJCa9nRWVFZDICPD7Rt3WBgZIBDE52ZIzi8tKk7VLUktLmFgAAARFiYj",
        uid: null
    };

    async function initAgoraClient() {
        if (!rtc.client && typeof AgoraRTC !== 'undefined') {
            rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
            
            rtc.client.on("user-published", async (user, mediaType) => {
                await rtc.client.subscribe(user, mediaType);
                if (mediaType === "video") {
                    const remoteVideoTrack = user.videoTrack;
                    const videoContainer = document.getElementById("main-video-container");
                    // Clear placeholder video
                    videoContainer.innerHTML = '';
                    const playerDiv = document.createElement("div");
                    playerDiv.id = user.uid.toString();
                    playerDiv.style.width = "100%";
                    playerDiv.style.height = "100%";
                    videoContainer.append(playerDiv);
                    remoteVideoTrack.play(playerDiv.id);
                }
                if (mediaType === "audio") {
                    const remoteAudioTrack = user.audioTrack;
                    remoteAudioTrack.play();
                }
            });

            rtc.client.on("user-unpublished", user => {
                const playerContainer = document.getElementById(user.uid.toString());
                if (playerContainer) {
                    playerContainer.remove();
                }
            });
        }
    }

    window.startLiveStream = async function() {
        try {
            // Get the mode from the dropdown
            const modeSelect = document.getElementById('lecture-mode-select');
            const selectedMode = modeSelect ? modeSelect.value : 'camera';

            await initAgoraClient();

            // channel is set in options and bound to the token
            const courseId = new URLSearchParams(window.location.search).get('id') || 'jhome-default';
            options.uid = Math.floor(Math.random() * 100000);

            console.log('Joining Agora channel:', options.channel, 'appId:', options.appId);

            await rtc.client.join(options.appId, options.channel, options.token, options.uid);

            if (selectedMode === 'screen') {
                // Screen share mode
                rtc.localVideoTrack = await AgoraRTC.createScreenVideoTrack();
                rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            } else {
                // Camera mode
                rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
                rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
            }
            
            const videoContainer = document.getElementById("main-video-container");
            if (videoContainer) videoContainer.innerHTML = '';
            
            await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);
            
            const localPlayerContainer = document.createElement("div");
            localPlayerContainer.id = 'local-' + options.uid;
            localPlayerContainer.style.width = "100%";
            localPlayerContainer.style.height = "100%";
            if (videoContainer) {
                videoContainer.append(localPlayerContainer);
                rtc.localVideoTrack.play(localPlayerContainer.id);
            }

            const startBtn = document.getElementById('start-live-btn');
            const leaveBtn = document.getElementById('leave-live-btn');
            if (startBtn) startBtn.style.display = 'none';
            if (leaveBtn) leaveBtn.style.display = 'block';

            window.firebase.firestore().collection('courses').doc(courseId).update({ 
                isLive: true,
                liveChannel: options.channel
            }).catch(console.warn);

            alert('✅ تم بدء البث المباشر بنجاح!');
        } catch (err) {
            console.error('Error starting live stream:', err.code, err.message, err);
            let msg = 'حدث خطأ أثناء بدء البث.\n\n';
            if (err.code === 'PERMISSION_DENIED' || err.name === 'NotAllowedError') {
                msg += 'السبب: لم تُسمح صلاحيات الكاميرا أو المايكروفون.\nالرجاء السماح للمتصفح باستخدام الكاميرا والمايكروفون.';
            } else if (err.code === 'INVALID_OPERATION') {
                msg += 'السبب: خطأ في إعداد Agora (INVALID_OPERATION).\nتأكد من أن التطبيق في وضع Testing (No Token) في Agora Console.';
            } else {
                msg += 'الخطأ: ' + (err.message || err.code || 'غير معروف');
            }
            alert(msg);
        }
    };

    window.leaveLiveStream = async function() {
        try {
            if (rtc.localAudioTrack) {
                rtc.localAudioTrack.close();
            }
            if (rtc.localVideoTrack) {
                rtc.localVideoTrack.close();
            }
            if (rtc.client) {
                await rtc.client.leave();
            }
            document.getElementById('start-live-btn').style.display = 'block';
            document.getElementById('leave-live-btn').style.display = 'none';
            document.getElementById("main-video-container").innerHTML = '<div style="color:white; display:flex; align-items:center; justify-content:center; height:100%;">تم إنهاء البث</div>';
            
            const courseId = new URLSearchParams(window.location.search).get('id') || 'mock-course-id';
            window.firebase.firestore().collection('courses').doc(courseId).update({ isLive: false }).catch(console.warn);
            
            alert('تم إنهاء البث المباشر.');
        } catch (err) {
            console.error('Error leaving live stream', err);
        }
    };

    window.joinLiveStream = async function() {
        try {
            await initAgoraClient();
            await rtc.client.join(options.appId, options.channel, options.token, options.uid);
            document.getElementById('student-join-overlay').style.display = 'none';
            alert('أنت الآن تشاهد البث المباشر.');
        } catch (err) {
            console.error('Error joining stream', err);
            alert('حدث خطأ أثناء الانضمام للبث.');
        }
    };

    // Real-time listener for Live status for students
    const liveCourseId = new URLSearchParams(window.location.search).get('id') || 'mock-course-id';
    window.firebase.firestore().collection('courses').doc(liveCourseId).onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            const overlay = document.getElementById('student-join-overlay');
            if (overlay) {
                // If the stream is active, and the current user is a student (not instructor who started it)
                if (data.isLive) {
                    overlay.style.display = 'block';
                } else {
                    overlay.style.display = 'none';
                }
            }
        }
    });

    // ----------------------------------------------------
    // 9. Realtime Chat Integration (Firestore)
    // ----------------------------------------------------
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatContainer = document.getElementById('chat-messages-container');
    const chatUrlParams = new URLSearchParams(window.location.search);
    const currentCourseId = chatUrlParams.get('id') || 'mock-course-id';
    const currentRoomId = chatUrlParams.get('roomId') || 'mock-room-id';
    
    // Default user if not logged in
    window.currentUser = { name: 'زائر', role: 'student' }; 

    if (chatForm && chatContainer) {
        // Listen to new messages
        window.firebase.firestore().collection('courses').doc(currentCourseId)
            .collection('rooms').doc(currentRoomId).collection('chat')
            .orderBy('timestamp', 'asc')
            .onSnapshot((snapshot) => {
                chatContainer.innerHTML = '';
                snapshot.forEach((doc) => {
                    const msg = doc.data();
                    const isMe = msg.senderName === window.currentUser.name;
                    
                    const timeString = msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
                    
                    const wrapper = document.createElement('div');
                    wrapper.style.display = 'flex';
                    wrapper.style.flexDirection = 'column';
                    wrapper.style.gap = '0.25rem';
                    
                    if (isMe) {
                        wrapper.style.alignItems = 'flex-end';
                        wrapper.innerHTML = `
                            <span style="font-size: 0.8rem; color: var(--text-secondary);">أنت <span class="en-text">${timeString}</span></span>
                            <div style="background: var(--primary-color); color: white; padding: 0.8rem; border-radius: 8px 8px 8px 0; font-size: 0.9rem;">
                                ${msg.text}
                            </div>
                        `;
                    } else {
                        wrapper.style.alignItems = 'flex-start';
                        wrapper.innerHTML = `
                            <span style="font-size: 0.8rem; color: var(--text-secondary);">${msg.senderName} <span class="en-text">${timeString}</span></span>
                            <div style="background: rgba(255,255,255,0.05); padding: 0.8rem; border-radius: 8px 8px 0 8px; font-size: 0.9rem;">
                                ${msg.text}
                            </div>
                        `;
                    }
                    
                    chatContainer.appendChild(wrapper);
                });
                
                // Scroll to bottom
                chatContainer.scrollTop = chatContainer.scrollHeight;
            });

        // Send message
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            if (!text) return;
            
            chatInput.value = ''; // clear immediately for UX
            
            try {
                await window.firebase.firestore().collection('courses').doc(currentCourseId)
                    .collection('rooms').doc(currentRoomId).collection('chat').add({
                    text: text,
                    senderName: window.currentUser.name,
                    role: window.currentUser.role,
                    timestamp: window.firebase.firestore.FieldValue.serverTimestamp()
                });
            } catch(err) {
                console.error("Error sending message", err);
                alert("حدث خطأ أثناء إرسال الرسالة.");
            }
        });
    }

    // --- Instructor Tools Logic ---
    window.updateInstructorProfile = async function() {
        const photo = document.getElementById('inst-update-photo').value.trim();
        const specialty = document.getElementById('inst-update-specialty').value.trim();
        const bio = document.getElementById('inst-update-bio').value.trim();
        
        if(!window.currentUser || !window.currentUser.courseId) return;
        
        try {
            await window.firebase.firestore().collection('courses').doc(window.currentUser.courseId).update({
                instructorPhoto: photo || 'https://ui-avatars.com/api/?name=Instructor&background=1E293B&color=A5B4FC',
                instructorSpecialty: specialty,
                instructorBio: bio
            });
            alert('تم التحديث بنجاح! ستظهر هذه التحديثات للطلاب مباشرة.');
        } catch(e) {
            console.error(e);
            alert('حدث خطأ أثناء التحديث.');
        }
    };

    // addResource and archiveLecture logic moved to RoomEngine.js

    // ----------------------------------------------------
    // 10. Notifications / Alerts for Upcoming Lectures
    // ----------------------------------------------------
    function initLectureNotifications() {
        if (!currentCourseId || currentCourseId === 'mock-course-id') return;

        window.firebase.firestore().collection('courses').doc(currentCourseId).collection('lectures')
            .where('status', '==', 'scheduled')
            .onSnapshot((snapshot) => {
                const now = new Date().getTime();
                
                snapshot.docs.forEach(doc => {
                    const lecture = doc.data();
                    if (!lecture.startTime) return;
                    
                    const lectureTime = lecture.startTime.toDate().getTime();
                    const timeDiff = lectureTime - now;
                    const fifteenMins = 15 * 60 * 1000;

                    // If lecture is within the next 15 minutes
                    if (timeDiff > 0 && timeDiff <= fifteenMins) {
                        showLectureAlert(lecture.title, Math.ceil(timeDiff / 60000));
                    }
                });
            });
    }

    function showLectureAlert(title, minsLeft) {
        // Prevent showing multiple alerts for the same lecture at the exact time
        const alertId = `alert-${title}-${minsLeft}`;
        if (sessionStorage.getItem(alertId)) return;
        sessionStorage.setItem(alertId, 'true');

        const banner = document.createElement('div');
        banner.style.position = 'fixed';
        banner.style.top = '20px';
        banner.style.left = '50%';
        banner.style.transform = 'translateX(-50%)';
        banner.style.background = 'var(--warning)';
        banner.style.color = '#fff';
        banner.style.padding = '1rem 2rem';
        banner.style.borderRadius = 'var(--radius-md)';
        banner.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
        banner.style.zIndex = '999999';
        banner.style.fontFamily = 'var(--font-ar)';
        banner.style.fontWeight = 'bold';
        banner.style.textAlign = 'center';
        banner.innerHTML = `<i class="fas fa-bell"></i> تذكير: المحاضرة "${title}" ستبدأ بعد ${minsLeft} دقيقة!`;

        document.body.appendChild(banner);

        // Auto remove after 30 seconds
        setTimeout(() => {
            if(banner.parentNode) banner.parentNode.removeChild(banner);
        }, 30000);
    }

    // Call it after a short delay to ensure DB is ready
    setTimeout(initLectureNotifications, 3000);

    // ----------------------------------------------------
    // Note: Presentation Modes and Room logic have been migrated to RoomEngine.js
    // ----------------------------------------------------

    // Syllabus Management
    window.renderSyllabusUI = function() {
        const sidebarContainer = document.querySelector('.room-sidebar-content');
        if (!sidebarContainer) return;

        const rooms = window.currentCourseRooms || [];
        const courseId = window.currentCourseId;
        const roomId = window.currentRoomId;
        const isInstructor = window.currentUser && window.currentUser.role === 'instructor';

        let html = '<h3 style="padding:1rem; border-bottom:1px solid rgba(255,255,255,0.05); margin:0;">المنهج والدروس</h3><div style="padding:1rem; display: flex; flex-direction: column; gap: 1rem; position: relative;">';
        
        if (rooms.length === 0) {
            html += '<p class="text-muted text-center" style="margin-top:1rem;">لا توجد دروس متاحة حالياً.</p>';
        } else {
            rooms.forEach((r, idx) => {
                const isActive = r.id === roomId || (!roomId && idx === 0);
                const typeIcon = r.type === 'recorded' ? 'fa-play-circle' : 'fa-video';
                
                html += `
                    <div style="position: relative; display: flex; flex-direction: column;">
                        ${idx !== rooms.length - 1 ? '<div style="position: absolute; left: 1rem; top: 2.5rem; bottom: -1rem; width: 2px; background: rgba(255,255,255,0.1); z-index: 1;"></div>' : ''}
                        
                        <div onclick="window.location.href='course-room.html?id=${courseId}&roomId=${r.id}'" style="position: relative; z-index: 2; display: flex; align-items: center; gap: 1rem; padding: 0.8rem 1rem; background: ${isActive ? 'var(--primary-color)' : 'rgba(255,255,255,0.02)'}; border-radius: var(--radius-sm); cursor: pointer; transition: 0.3s; border: 1px solid ${isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'};">
                            <div style="width: 32px; height: 32px; border-radius: 50%; background: ${isActive ? 'rgba(255,255,255,0.2)' : 'rgba(16, 185, 129, 0.2)'}; color: ${isActive ? '#fff' : '#10B981'}; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">
                                ${idx + 1}
                            </div>
                            <div style="flex: 1;">
                                <div style="font-weight: 500; font-size: 0.95rem;">${r.name}</div>
                                <div style="font-size: 0.8rem; color: ${isActive ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)'}; margin-top: 0.2rem;"><i class="fas ${typeIcon}"></i> ${r.type === 'recorded' ? 'مسجل' : 'مباشر'}</div>
                            </div>
                            
                            ${isInstructor ? `
                            <div style="display: flex; gap: 0.5rem;" onclick="event.stopPropagation()">
                                <button class="btn btn-icon" style="padding: 0.3rem; background: rgba(245, 158, 11, 0.2); color: var(--warning); border: none; font-size: 0.8rem;" onclick="openSyllabusModal('${r.id}')"><i class="fas fa-edit"></i></button>
                                <button class="btn btn-icon" style="padding: 0.3rem; background: rgba(239, 68, 68, 0.2); color: var(--danger); border: none; font-size: 0.8rem;" onclick="deleteSyllabusRoom('${r.id}')"><i class="fas fa-trash"></i></button>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
        }
        html += '</div>';
        
        if (isInstructor) {
            html += `
            <div style="padding: 1rem; margin-top: auto; border-top: 1px solid rgba(255,255,255,0.05);">
                <button class="btn btn-primary" style="width: 100%; border-style: dashed; background: transparent; border-color: var(--primary-color); color: var(--primary-light);" onclick="openSyllabusModal()"><i class="fas fa-plus"></i> إضافة درس للقام</button>
            </div>
            `;
        }

        sidebarContainer.innerHTML = html;
    };

    window.openSyllabusModal = function(roomId = null) {
        document.getElementById('syllabus-room-modal').style.display = 'flex';
        
        if (roomId) {
            document.getElementById('syllabus-modal-title').innerText = 'تعديل الدرس';
            const room = window.currentCourseRooms.find(r => r.id === roomId);
            if(room) {
                document.getElementById('syl-room-id').value = room.id;
                document.getElementById('syl-room-name').value = room.name;
                document.getElementById('syl-room-type').value = room.type || 'live';
                document.getElementById('syl-room-video-url').value = room.videoUrl || '';
                document.getElementById('syl-room-sources').value = room.sources || '';
                document.getElementById('syl-video-container').style.display = (room.type === 'recorded') ? 'block' : 'none';
            }
        } else {
            document.getElementById('syllabus-modal-title').innerText = 'إضافة درس جديد';
            document.getElementById('syl-room-id').value = '';
            document.getElementById('syl-room-name').value = '';
            document.getElementById('syl-room-type').value = 'live';
            document.getElementById('syl-room-video-url').value = '';
            document.getElementById('syl-room-sources').value = '';
            document.getElementById('syl-video-container').style.display = 'none';
        }
    };

    window.closeSyllabusModal = function() {
        document.getElementById('syllabus-room-modal').style.display = 'none';
    };

    window.saveSyllabusRoom = async function() {
        const id = document.getElementById('syl-room-id').value;
        const name = document.getElementById('syl-room-name').value.trim();
        const type = document.getElementById('syl-room-type').value;
        const videoUrl = document.getElementById('syl-room-video-url').value.trim();
        const sources = document.getElementById('syl-room-sources').value.trim();

        if (!name) return alert("الرجاء كتابة اسم الدرس");
        if (type === 'recorded' && !videoUrl) return alert("الرجاء وضع رابط الفيديو");

        const courseId = window.currentCourseId;
        if (!courseId) return;

        try {
            const courseRef = window.firebase.firestore().collection('courses').doc(courseId);
            const doc = await courseRef.get();
            let rooms = doc.data().rooms || [];

            if (id) {
                const idx = rooms.findIndex(r => r.id === id);
                if (idx > -1) {
                    rooms[idx].name = name;
                    rooms[idx].type = type;
                    rooms[idx].videoUrl = videoUrl;
                    rooms[idx].sources = sources;
                }
            } else {
                rooms.push({
                    id: Date.now().toString(),
                    name, type, videoUrl, sources,
                    startTime: '',
                    instructorName: window.currentUser ? window.currentUser.name || window.currentUser.username : ''
                });
            }

            await courseRef.update({ rooms });
            window.currentCourseRooms = rooms;
            renderSyllabusUI();
            closeSyllabusModal();
            alert("تم الحفظ بنجاح!");
            
            // If we just added the very first room, reload page to load it
            if (!id && rooms.length === 1) {
                window.location.reload();
            }

        } catch (e) {
            console.error(e);
            alert("حدث خطأ أثناء الحفظ");
        }
    };

    window.deleteSyllabusRoom = async function(roomId) {
        if (!confirm("هل أنت متأكد من حذف هذا الدرس؟ سيتم فقدان كل محتوياته!")) return;
        
        const courseId = window.currentCourseId;
        try {
            const courseRef = window.firebase.firestore().collection('courses').doc(courseId);
            const doc = await courseRef.get();
            let rooms = doc.data().rooms || [];
            rooms = rooms.filter(r => r.id !== roomId);
            
            await courseRef.update({ rooms });
            window.currentCourseRooms = rooms;
            renderSyllabusUI();
            
            if (window.currentRoomId === roomId) {
                window.location.href = `course-room.html?id=${courseId}`;
            }
        } catch(e) {
            console.error(e);
            alert("حدث خطأ أثناء الحذف");
        }
    };

    // Instructor Profile Updater
    window.updateInstructorProfile = async function() {
        const courseId = window.currentCourseId;
        if (!courseId) return;

        const imgUrl = document.getElementById('prof-img-url').value.trim();
        const name = document.getElementById('prof-name').value.trim();
        const spec = document.getElementById('prof-spec').value.trim();
        const bio = document.getElementById('prof-bio').value.trim();
        const cvUrl = document.getElementById('prof-cv-url').value.trim();

        if (!name || !spec) return alert("الاسم والتخصص مطلوبان!");

        try {
            await window.firebase.firestore().collection('courses').doc(courseId).update({
                instructor: {
                    name,
                    specialty: spec,
                    bio,
                    image: imgUrl || 'assets/images/default-avatar.png',
                    cvUrl: cvUrl || ''
                }
            });
            alert("تم تحديث بياناتك بنجاح! سيراها الطلاب عند الدخول.");
            
            // Update the display for the instructor themselves
            updateInstructorDisplay({name, specialty: spec, bio, image: imgUrl, cvUrl});
        } catch(e) {
            console.error(e);
            alert("حدث خطأ أثناء حفظ البيانات");
        }
    };

    function updateInstructorDisplay(instructor) {
        const instSection = document.getElementById('tab-overview');
        if(!instSection) return;
        
        let instHtml = `
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; border-radius: var(--radius-md); margin-top: 2rem;">
                <h3 style="margin-bottom: 1rem;"><i class="fas fa-chalkboard-teacher"></i> مقدم الدورة</h3>
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <img src="${instructor.image || 'assets/images/default-avatar.png'}" alt="Instructor" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-color);">
                    <div>
                        <h4 style="font-size: 1.2rem; margin-bottom: 0.2rem;">${instructor.name || 'مدرب'}</h4>
                        <p style="color: var(--primary-light); font-size: 0.9rem; margin-bottom: 0.5rem;">${instructor.specialty || 'تخصص غير محدد'}</p>
                        <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5;">${instructor.bio || ''}</p>
                        ${instructor.cvUrl ? `<a href="${instructor.cvUrl}" target="_blank" style="color: #60A5FA; font-size: 0.85rem; text-decoration: none;"><i class="fas fa-external-link-alt"></i> مصدر المهارات</a>` : ''}
                    </div>
                </div>
            </div>
        `;
        
        // Find existing instructor div and replace, or append
        const existingInst = instSection.querySelector('.instructor-info');
        if (existingInst) {
            existingInst.innerHTML = instHtml;
        } else {
            const div = document.createElement('div');
            div.className = 'instructor-info';
            div.innerHTML = instHtml;
            instSection.appendChild(div);
        }
    }
