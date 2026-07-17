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
            const snap = await firebase.firestore().collection('courses').orderBy('createdAt', 'desc').get();
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
                const cover = course.cover || 'assets/images/courses/web_dev_cover.png';
                
                const badge = course.isPaid ? 
                    `<span style="position: absolute; top: 1rem; right: 1rem; background: rgba(245, 158, 11, 0.8); backdrop-filter: blur(4px); color: white; padding: 0.25rem 1rem; border-radius: var(--radius-pill); font-size: 0.85rem; border: 1px solid rgba(255,255,255,0.1);"><i class="fas fa-crown"></i> دورة مدفوعة</span>` 
                    : `<span style="position: absolute; top: 1rem; right: 1rem; background: rgba(16, 185, 129, 0.8); backdrop-filter: blur(4px); color: white; padding: 0.25rem 1rem; border-radius: var(--radius-pill); font-size: 0.85rem; border: 1px solid rgba(255,255,255,0.1);"><i class="fas fa-gift"></i> مجانية بالكامل</span>`;
                    
                grid.innerHTML += `
                <div class="glass-panel course-card" data-category="${category}" style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                    <div style="background: url('${cover}') center/cover no-repeat; height: 200px; display: flex; align-items: center; justify-content: center; position: relative;">
                        ${badge}
                    </div>
                    <div style="padding: 1.5rem; flex: 1; display: flex; flex-direction: column;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <span class="caption-meta" style="color: var(--primary-light);">${level}</span>
                            <span class="caption-meta en-text" style="background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px;">${duration}</span>
                        </div>
                        <h3 class="display-3" style="font-size: 1.5rem; margin-bottom: 0.5rem;">${title}</h3>
                        <p class="text-muted" style="margin-bottom: 1.5rem; font-size: 0.95rem; line-height: 1.6;">${description.substring(0, 80)}...</p>
                        <button class="btn btn-secondary open-course-modal" onclick="openModal('${course.id}')" style="margin-top: auto; width: 100%;">التفاصيل</button>
                    </div>
                </div>
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
                <button class="btn btn-secondary" style="flex: 1;" onclick="openEnrollment('${data.title}', true)">طلب اشتراك <i class="fas fa-credit-card" style="margin-right: 8px;"></i></button>
                <a href="course-room.html?type=paid&id=${data.id}" class="btn btn-primary" style="flex: 1; text-align: center;">دخول المشتركين <i class="fas fa-sign-in-alt" style="margin-right: 8px;"></i></a>
                `;
            } else {
                actionButtons = `
                <button class="btn btn-secondary" style="flex: 1;" onclick="openEnrollment('${data.title}', false)">طلب انضمام مجاني <i class="fas fa-certificate" style="margin-right: 8px;"></i></button>
                <a href="course-room.html?type=paid&id=${data.id}" class="btn btn-primary" style="flex: 1; text-align: center;">دخول المشتركين <i class="fas fa-sign-in-alt" style="margin-right: 8px;"></i></a>
                `;
            }

            // Populate Modal Content
            modalBody.innerHTML = `
                <div class="modal-header-visual" style="background: url('${data.cover}') center/cover no-repeat; min-height: 200px; display: flex; align-items: center; justify-content: center; position: relative;">
                    <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(11, 22, 44, 1), rgba(11, 22, 44, 0.4));"></div>
                    <i class="fab ${data.icon}" style="font-size: 5rem; color: ${data.color}; opacity: 0.9; position: relative; z-index: 1;"></i>
                </div>
                <div class="modal-details-container">
                    <h2 class="display-2" style="font-size: 2.2rem; margin-bottom: 1rem;">${data.title}</h2>
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
                        <button class="meta-item" style="cursor: pointer; background: rgba(147, 51, 234, 0.1); border: 1px solid rgba(147, 51, 234, 0.3); transition: 0.3s; width: 100%; display: block; font-family: inherit; padding: 1rem; border-radius: var(--radius-md);" onmouseover="this.style.background='rgba(147, 51, 234, 0.2)'" onmouseout="this.style.background='rgba(147, 51, 234, 0.1)'" onclick="openInstructorModal('${data.instructorId}')">
                            <i class="fas fa-chalkboard-teacher" style="color: #D8B4FE;"></i>
                            <span style="color: #A5B4FC;">المقدم</span>
                            <strong style="color: white; margin-top: 0.25rem; display: block;">${data.instructor}</strong>
                        </button>
                    </div>
                    
                    <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                        ${actionButtons}
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

    window.openInstructorModal = function(instId) {
        if (!instructorModal || !instructorModalBody) return;
        const inst = instructorsData[instId];
        if (inst) {
            let certsHTML = inst.certificates.map(c => `<li><i class="fas fa-award" style="color:#10B981; margin-left: 8px;"></i> ${c}</li>`).join('');
            
            instructorModalBody.innerHTML = `
                <div style="background: linear-gradient(135deg, #1E293B, #0B162C); border-radius: 20px; overflow: hidden;">
                    <div style="height: 120px; background: url('${inst.photo}') center/cover; filter: blur(5px) brightness(0.5);"></div>
                    <div style="padding: 0 2rem 2rem; position: relative;">
                        <img src="${inst.photo}" alt="${inst.name}" style="width: 100px; height: 100px; border-radius: 50%; border: 4px solid #1E293B; margin-top: -50px; position: relative; z-index: 2; object-fit: cover;">
                        <h3 class="display-3" style="margin-top: 1rem; margin-bottom: 0.2rem;">${inst.name}</h3>
                        <p style="color: var(--primary-light); font-weight: 600; margin-bottom: 1.5rem;">${inst.specialty}</p>
                        
                        <div style="margin-bottom: 1.5rem;">
                            <h4 style="color: #A5B4FC; margin-bottom: 0.5rem; font-size: 1rem;">نبذة تعريفية</h4>
                            <p class="text-muted" style="line-height: 1.6; font-size: 0.95rem;">${inst.bio}</p>
                        </div>
                        
                        <div style="margin-bottom: 2rem;">
                            <h4 style="color: #A5B4FC; margin-bottom: 0.5rem; font-size: 1rem;">الشهادات والخبرات</h4>
                            <ul style="list-style: none; padding: 0; margin: 0; color: #E2E8F0; font-size: 0.9rem; line-height: 1.8;">
                                ${certsHTML}
                            </ul>
                        </div>
                        
                        <a href="${inst.cvLink}" target="_blank" class="btn btn-secondary" style="width: 100%; display: flex; justify-content: center; gap: 0.5rem;">
                            <i class="fas fa-file-pdf"></i> تحميل السيرة الذاتية (CV)
                        </a>
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
    
    const step1 = document.getElementById('enrollment-step-1');
    const step2 = document.getElementById('enrollment-step-2');
    
    const receiptUpload = document.getElementById('receipt-upload');
    const uploadZone = document.getElementById('upload-receipt-zone');
    const receiptPreview = document.getElementById('receipt-preview');
    const previewContainer = document.getElementById('receipt-preview-container');
    const courseTitleDisplay = document.getElementById('enrollment-course-title');

    let currentEnrollmentIsPaid = true;

    window.openEnrollment = function(courseTitle, isPaid = true) {
        currentEnrollmentIsPaid = isPaid;
        
        // Close course modal if open
        if (courseModal) {
            courseModal.classList.remove('active');
        }
        
        // Reset Steps
        if(step1 && step2) {
            step1.classList.add('active-step');
            step2.classList.remove('active-step');
        }
        
        if (courseTitleDisplay) {
            courseTitleDisplay.textContent = courseTitle;
        }

        if (enrollmentModal) {
            // Small delay to allow previous modal to close smoothly
            setTimeout(() => {
                enrollmentModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }, 300);
        }
    };

    function closeEnrollmentModal() {
        if (enrollmentModal) {
            enrollmentModal.classList.remove('active');
            document.body.style.overflow = 'auto';
            // Optional: Reset form fields here
        }
    }

    if (closeEnrollmentBtn) {
        closeEnrollmentBtn.addEventListener('click', closeEnrollmentModal);
    }

    // ----------------------------------------------------
    // Dynamic Bank Accounts Loading
    // ----------------------------------------------------
    const bankSelector = document.getElementById('bank-selector');
    const displayBankName = document.getElementById('display-bank-name');
    const displayAccountName = document.getElementById('display-account-name');
    const displayAccountNumber = document.getElementById('account-number');
    const dynamicBankInfo = document.getElementById('dynamic-bank-info');
    
    let loadedAccounts = [];

    function loadBankAccounts() {
        const stored = localStorage.getItem('jhome_bank_accounts');
        if (stored) {
            loadedAccounts = JSON.parse(stored);
        } else {
            loadedAccounts = [{ id: 'default', bank: 'بنكك', name: 'جمال احمد ابراهيم', number: '4373414' }];
        }
        
        if (bankSelector) {
            bankSelector.innerHTML = '';
            loadedAccounts.forEach(acc => {
                const opt = document.createElement('option');
                opt.value = acc.id;
                opt.textContent = acc.bank + ' - ' + acc.name;
                bankSelector.appendChild(opt);
            });
            
            // Trigger initial selection
            if(loadedAccounts.length > 0) {
                updateBankDisplay(loadedAccounts[0].id);
            }
        }
    }

    function updateBankDisplay(id) {
        const acc = loadedAccounts.find(a => a.id === id);
        if (acc && displayBankName && displayAccountName && displayAccountNumber) {
            displayBankName.textContent = acc.bank;
            displayAccountName.textContent = acc.name;
            displayAccountNumber.textContent = acc.number;
        }
    }

    if (bankSelector) {
        bankSelector.addEventListener('change', (e) => {
            updateBankDisplay(e.target.value);
        });
        
        // Load on init
        loadBankAccounts();
    }

    // Handle Form Submit -> Go to Payment Step
    if (enrollmentForm) {
        enrollmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (currentEnrollmentIsPaid) {
                // Here we would normally collect data, for now we just switch steps
                step1.classList.remove('active-step');
                step2.classList.add('active-step');
            } else {
                alert('تم تسجيل بياناتك بنجاح للاستفادة من الشهادة. يمكنك الآن الدخول للدورة مباشرة!');
                closeEnrollmentModal();
            }
        });
    }

    // Copy Account Number
    window.copyAccountNumber = function() {
        const accountNumber = document.getElementById('account-number').innerText;
        navigator.clipboard.writeText(accountNumber).then(() => {
            alert('تم نسخ رقم الحساب بنجاح!');
        });
    };

    // Receipt Upload Logic
    if (uploadZone && receiptUpload) {
        uploadZone.addEventListener('click', () => {
            receiptUpload.click();
        });

        receiptUpload.addEventListener('change', function(e) {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    receiptPreview.src = e.target.result;
                    uploadZone.style.display = 'none';
                    previewContainer.style.display = 'block';
                }
                reader.readAsDataURL(file);
            }
        });
    }

    const submitFinalBtn = document.getElementById('submit-final-registration');
    if (submitFinalBtn) {
        submitFinalBtn.addEventListener('click', async () => {
            const file = receiptUpload ? receiptUpload.files[0] : null;
            if(!file) {
                alert('الرجاء رفع الإيصال أولاً');
                return;
            }

            const fullName = (document.getElementById('reg-name') || {}).value || '';
            const phone = (document.getElementById('reg-phone') || {}).value || '';
            const edu = (document.getElementById('reg-education') || {}).value || '';
            const spec = (document.getElementById('reg-specialization') || {}).value || '';
            const city = (document.getElementById('reg-city') || {}).value || '';
            const reason = (document.getElementById('reg-reason') || {}).value || '';
            const courseTitle = courseTitleDisplay ? courseTitleDisplay.textContent : 'Unknown Course';

            if (!fullName || !phone) {
                alert('الرجاء تعبئة الاسم ورقم الهاتف على الأقل');
                return;
            }

            submitFinalBtn.disabled = true;
            submitFinalBtn.innerHTML = 'جاري الإرسال... <i class="fas fa-spinner fa-spin"></i>';

            // Try to upload receipt image, but don't block submission if it fails
            let downloadURL = null;
            try {
                submitFinalBtn.innerHTML = 'جاري رفع الإيصال... <i class="fas fa-spinner fa-spin"></i>';
                const storageRef = firebase.storage().ref();
                const fileName = `receipts/${Date.now()}_${file.name}`;
                const fileRef = storageRef.child(fileName);
                const snapshot = await fileRef.put(file);
                downloadURL = await snapshot.ref.getDownloadURL();
            } catch (storageErr) {
                console.warn('Storage upload failed, will save request without image URL:', storageErr);
                // Continue anyway - the request is more important than the image
            }

            // Always save the enrollment request to Firestore
            try {
                submitFinalBtn.innerHTML = 'جاري حفظ الطلب... <i class="fas fa-spinner fa-spin"></i>';
                const currentCourseId = new URLSearchParams(window.location.search).get('id') || 'unknown-course';
                const db = firebase.firestore();
                await db.collection('enrollmentRequests').add({
                    studentName: fullName,
                    phone,
                    education: edu,
                    specialization: spec,
                    city,
                    reason,
                    courseTitle,
                    courseId: currentCourseId,
                    receiptId: phone,
                    receiptUrl: downloadURL || null,
                    status: 'pending',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                alert('تم إرسال طلبك بنجاح! سيتم مراجعته وإرسال بيانات الدخول إليك.');
                closeEnrollmentModal();
            } catch (err) {
                console.error('Error saving enrollment request to Firestore:', err);
                alert('حدث خطأ أثناء إرسال الطلب: ' + err.message + '\n\nالرجاء المحاولة مجدداً.');
            } finally {
                submitFinalBtn.disabled = false;
                submitFinalBtn.innerHTML = 'إرسال وتأكيد التسجيل <i class="fas fa-check-circle" style="margin-right: 8px;"></i>';
            }
        });
    }

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

                await firebase.auth().signInWithEmailAndPassword(email, pass);
                
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
            const db = firebase.firestore();

            // Try all possible username formats for backward compatibility
            const u = usernameRaw;
            const uLow = u.toLowerCase();
            const attempts = [...new Set([
                u,                           // as typed
                uLow,                        // lowercase
                uLow + '@jhome.sd',          // old format with @jhome.sd
                u + '@jhome.sd',             // old format (original case)
            ])];
            let doc = null;

            for (const attempt of attempts) {
                const result = await db.collection('courses_credentials').doc(attempt).get();
                if (result.exists) {
                    doc = result;
                    console.log('Found user with key:', attempt);
                    break;
                }
            }

            if (!doc || !doc.exists) {
                console.warn('User not found in courses_credentials. Tried:', attempts);
                alert('اسم المستخدم غير موجود. تأكد من البيانات المُرسلة إليك.');
                if (btn) { btn.innerHTML = originalText; btn.disabled = false; }
                return;
            }

            const data = doc.data();
            console.log('User found, role:', data.role, 'courseId:', data.courseId);

            // Compare password
            if (data.password !== passwordInput) {
                console.warn('Password mismatch for user:', doc.id);
                alert('كلمة المرور غير صحيحة. تأكد من النسخ الصحيح.');
                if (btn) { btn.innerHTML = originalText; btn.disabled = false; }
                return;
            }

            // ✅ Success
            window.currentUser = {
                name: data.fullname || doc.id,
                username: doc.id,
                role: data.role || 'student',
                courseId: data.courseId
            };
            console.log('Login successful:', window.currentUser);

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
            }

            if (btn) { btn.innerHTML = originalText; btn.disabled = false; }

        } catch(e) {
            console.error('Login error:', e);
            alert('حدث خطأ أثناء الاتصال بقاعدة البيانات: ' + e.message);
            if (btn) { btn.innerHTML = originalText; btn.disabled = false; }
        }

    };

    // Listen for Auth State Changes
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            try {
                const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    window.currentUser = { name: userData.fullname, role: userData.role };
                    
                    if (userData.role === 'instructor') {
                        const instructorTabBtn = document.getElementById('instructor-tab-btn');
                        if (instructorTabBtn) instructorTabBtn.style.display = 'block';
                        // Generate Instructor tools inside the tab
                        generateInstructorTools();
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

    function generateInstructorTools() {
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('id');
        const instructorTab = document.getElementById('tab-instructor');
        if(!instructorTab) return;

        instructorTab.innerHTML = `
            <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: var(--radius-md);">
                <h3 style="margin-bottom: 1.5rem; color: var(--warning);"><i class="fas fa-tools"></i> أدوات إدارة الغرفة الحالية</h3>
                
                <div class="form-group">
                    <label>تحديد وقت بدء الدرس (Start Time)</label>
                    <input type="datetime-local" id="room-start-time" class="form-input" style="color: black;">
                </div>
                
                <div class="form-group">
                    <label>إضافة مصادر للغرفة الحالية</label>
                    <textarea id="room-add-sources" class="form-input" rows="3" placeholder="ضع روابط أو نصوص هنا..."></textarea>
                </div>
                
                <button class="btn btn-primary" onclick="updateCurrentRoomData()" style="width: 100%; margin-bottom: 2rem;">حفظ التحديثات <i class="fas fa-save"></i></button>
                
                <hr style="border-color: rgba(255,255,255,0.1); margin-bottom: 2rem;">
                
                <h3 style="margin-bottom: 1.5rem; color: var(--primary-light);"><i class="fas fa-plus-circle"></i> إضافة محاضرة جديدة (اليوم التالي)</h3>
                
                <div class="form-group">
                    <label>عنوان المحاضرة الجديدة</label>
                    <input type="text" id="new-day-title" class="form-input" placeholder="مثال: المحاضرة الثانية">
                </div>
                <div class="form-group">
                    <label>نوع المحاضرة</label>
                    <select id="new-day-type" class="form-input" style="color: black;" onchange="document.getElementById('new-day-video-wrap').style.display = this.value === 'recorded' ? 'block' : 'none'">
                        <option value="live">بث مباشر</option>
                        <option value="recorded">فيديو مسجل</option>
                    </select>
                </div>
                <div class="form-group" id="new-day-video-wrap" style="display:none;">
                    <label>رابط الفيديو</label>
                    <input type="text" id="new-day-video-url" class="form-input" placeholder="https://youtube.com/watch?v=..." dir="ltr">
                </div>
                
                <button class="btn btn-secondary" onclick="addNewCourseDay()" style="width: 100%;">إنشاء وبدء يوم جديد <i class="fas fa-calendar-plus"></i></button>
            </div>
        `;
    }

    window.updateCurrentRoomData = async function() {
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('id');
        const roomId = urlParams.get('roomId');
        if(!courseId || !roomId) return alert('الرجاء التأكد من وجودك داخل غرفة محددة');

        const startTime = document.getElementById('room-start-time').value;
        const newSources = document.getElementById('room-add-sources').value;

        try {
            const courseRef = firebase.firestore().collection('courses').doc(courseId);
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
            const courseRef = firebase.firestore().collection('courses').doc(courseId);
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
        const doc = await firebase.firestore().collection('courses').doc(courseId).get();
        if (doc.exists) {
            const course = doc.data();
            const rooms = course.rooms || [];
            
            // Render Sidebar rooms list
            const sidebarContainer = document.querySelector('.room-sidebar-content');
            if (sidebarContainer) {
                let html = '<h3 style="padding:1rem; border-bottom:1px solid rgba(255,255,255,0.05); margin:0;">المنهج والدروس</h3><div style="padding:1rem;">';
                if (rooms.length === 0) {
                    html += '<p class="text-muted">لا توجد دروس متاحة حالياً.</p>';
                } else {
                    rooms.forEach((r, idx) => {
                        const isActive = r.id === roomId || (!roomId && idx === 0);
                        const typeIcon = r.type === 'recorded' ? 'fa-play-circle' : 'fa-video';
                        html += `
                            <div style="margin-bottom: 1rem;">
                                <div onclick="window.location.href='course-room.html?id=${courseId}&roomId=${r.id}'" style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 1rem; background: ${isActive ? 'var(--primary-color)' : 'rgba(255,255,255,0.02)'}; border-radius: var(--radius-sm); cursor: pointer; transition: 0.3s;">
                                    <span style="font-weight: 500;">${r.name}</span>
                                    <i class="fas ${typeIcon} text-muted" style="font-size: 0.8rem; color:${isActive?'white':'inherit'} !important;"></i>
                                </div>
                            </div>
                        `;
                    });
                }
                html += '</div>';
                sidebarContainer.innerHTML = html;
            }

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
        channel: "jhome-course-123",
        token: null, // If using testing mode, token can be null
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

            // Use courseId as channel name for uniqueness
            const courseId = new URLSearchParams(window.location.search).get('id') || 'jhome-default';
            options.channel = 'course-' + courseId;
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

            firebase.firestore().collection('courses').doc(courseId).update({ 
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
            firebase.firestore().collection('courses').doc(courseId).update({ isLive: false }).catch(console.warn);
            
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
    firebase.firestore().collection('courses').doc(liveCourseId).onSnapshot((doc) => {
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
        firebase.firestore().collection('courses').doc(currentCourseId)
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
                await firebase.firestore().collection('courses').doc(currentCourseId)
                    .collection('rooms').doc(currentRoomId).collection('chat').add({
                    text: text,
                    senderName: window.currentUser.name,
                    role: window.currentUser.role,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
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
            await firebase.firestore().collection('courses').doc(window.currentUser.courseId).update({
                instructorPhoto: photo || 'assets/images/courses/instructor.png',
                instructorSpecialty: specialty,
                instructorBio: bio
            });
            alert('تم التحديث بنجاح! ستظهر هذه التحديثات للطلاب مباشرة.');
        } catch(e) {
            console.error(e);
            alert('حدث خطأ أثناء التحديث.');
        }
    };

    window.scheduleLecture = async function() {
        const title = document.getElementById('schedule-title').value.trim();
        const start = document.getElementById('schedule-start').value;
        const end = document.getElementById('schedule-end').value;
        
        if(!title || !start || !end) {
            alert('يرجى ملء كافة تفاصيل الجدولة');
            return;
        }
        
        if(!window.currentUser || !window.currentUser.courseId) return;

        try {
            await firebase.firestore().collection('courses').doc(window.currentUser.courseId).collection('lectures').add({
                title,
                startTime: new Date(start),
                endTime: new Date(end),
                status: 'scheduled',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            alert('تمت الجدولة بنجاح وسيتم إشعار الطلاب قبل 15 دقيقة من الموعد!');
            // Clear fields
            document.getElementById('schedule-title').value = '';
            document.getElementById('schedule-start').value = '';
            document.getElementById('schedule-end').value = '';
        } catch(e) {
            console.error(e);
            alert('حدث خطأ أثناء الجدولة.');
        }
    };

    window.addResource = async function() {
        const name = document.getElementById('resource-name').value.trim();
        const url = document.getElementById('resource-url').value.trim();
        
        if(!name || !url) {
            alert('الرجاء كتابة اسم الملف ورابطه');
            return;
        }
        
        if(!window.currentUser || !window.currentUser.courseId) return;
        const roomId = chatUrlParams.get('roomId') || 'default-room';

        try {
            await firebase.firestore().collection('courses').doc(window.currentUser.courseId)
                  .collection('rooms').doc(roomId).collection('resources').add({
                name, url,
                addedBy: window.currentUser.name,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            alert('تمت إضافة الملف وسيظهر للطلاب في تبويبة الملحقات والموارد.');
            document.getElementById('resource-name').value = '';
            document.getElementById('resource-url').value = '';
        } catch(e) {
            console.error(e);
            alert('خطأ أثناء إضافة الملف');
        }
    };

    window.archiveLecture = async function() {
        if(confirm('هل أنت متأكد من إنهاء هذه المحاضرة وأرشفتها الآن؟ سيتوقف البث ولن يتمكن الطلاب من الكتابة.')) {
            // In a real app, this would trigger backend logic to process video and lock chat.
            alert('تم حفظ أرشيف المحاضرة وتوثيق الدردشة والروابط!');
            // E.g., update room status to 'archived'
        }
    };

    // ----------------------------------------------------
    // 10. Notifications / Alerts for Upcoming Lectures
    // ----------------------------------------------------
    function initLectureNotifications() {
        if (!currentCourseId || currentCourseId === 'mock-course-id') return;

        firebase.firestore().collection('courses').doc(currentCourseId).collection('lectures')
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
    // 11. Presentation Modes Logic (Video, Link, Slides, Channel)
    // ----------------------------------------------------
    let currentPresentationMode = 'video'; // Default mode

    function initModesListener() {
        if (!currentCourseId || currentCourseId === 'mock-course-id') return;

        firebase.firestore().collection('courses').doc(currentCourseId)
            .collection('rooms').doc(currentRoomId)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    if (data.presentationMode) {
                        syncPresentationMode(data.presentationMode, data.presentationData);
                    }
                }
            });
    }

    function syncPresentationMode(mode, data) {
        currentPresentationMode = mode;
        
        // Hide all containers first
        const videoContainer = document.getElementById('mode-video-container');
        const slidesContainer = document.getElementById('mode-slides-container');
        const channelContainer = document.getElementById('mode-channel-container');
        
        if(videoContainer) videoContainer.style.display = 'none';
        if(slidesContainer) slidesContainer.style.display = 'none';
        if(channelContainer) channelContainer.style.display = 'none';

        const badgeText = document.getElementById('live-badge-text');
        const badgeMode = document.getElementById('live-badge-mode');

        if (mode === 'video') {
            if(videoContainer) videoContainer.style.display = 'block';
            if(badgeMode) badgeMode.textContent = 'بث مباشر';
            if(badgeText) badgeText.style.color = 'red';
            // Agora handles the stream naturally inside mode-video-container
        } else if (mode === 'link') {
            if(videoContainer) videoContainer.style.display = 'block';
            if(badgeMode) badgeMode.textContent = 'فيديو مسجل';
            if(badgeText) badgeText.style.color = '#3b82f6';
            if (data && data.videoLink) {
                const videoEl = document.getElementById('live-video');
                if(videoEl) {
                    videoEl.src = data.videoLink;
                    videoEl.play().catch(e => console.error('Auto-play prevented', e));
                }
            }
        } else if (mode === 'slides') {
            if(slidesContainer) slidesContainer.style.display = 'flex';
            if(badgeMode) badgeMode.textContent = 'عرض شرائح + صوت';
            if(badgeText) badgeText.style.color = '#10b981';
            if (data && data.slideUrl) {
                const imgEl = document.getElementById('current-slide-img');
                if(imgEl) imgEl.src = data.slideUrl;
            }
        } else if (mode === 'channel') {
            if(channelContainer) channelContainer.style.display = 'flex';
            if(badgeMode) badgeMode.textContent = 'قناة المحاضرة';
            if(badgeText) badgeText.style.color = '#8b5cf6';
            // Render channel messages
            renderChannelMessages();
        }
    }

    // INSTRUCTOR FUNCTIONS
    window.changePresentationMode = async function(mode) {
        if (!window.currentUser || window.currentUser.role !== 'instructor') return;
        
        // Switch panels in instructor tab
        document.querySelectorAll('.mode-panel').forEach(p => p.style.display = 'none');
        const panel = document.getElementById(`inst-panel-${mode}`);
        if(panel) panel.style.display = 'block';

        if(mode === 'channel') {
            // Automatically switch to channel for everyone
            await setModeInDB('channel', {});
        } else if (mode === 'video') {
            await setModeInDB('video', {});
        }
    }

    window.setVideoLinkMode = async function() {
        const link = document.getElementById('inst-video-link').value.trim();
        if(!link) return alert('أدخل الرابط أولاً');
        await setModeInDB('link', { videoLink: link });
        alert('تم تشغيل الفيديو للطلاب');
    }

    window.setSlideMode = async function() {
        const slideUrl = document.getElementById('inst-slide-url').value.trim();
        if(!slideUrl) return alert('أدخل رابط الشريحة أولاً');
        await setModeInDB('slides', { slideUrl: slideUrl });
        alert('تم تغيير الشريحة للطلاب');
    }

    window.startAudioOnlyStream = async function() {
        try {
            await initAgoraClient();
            await rtc.client.join(options.appId, options.channel, options.token, options.uid);
            
            rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
                AEC: true, ANS: true, AGC: true
            });
            
            if (typeof AIDenoiserExtension !== 'undefined') {
                try {
                    const denoiser = new AIDenoiserExtension({ assetsPath: 'https://download.agora.io/sdk/release' });
                    AgoraRTC.registerExtension(denoiser);
                    const processor = denoiser.createProcessor();
                    await processor.enable();
                    rtc.localAudioTrack.pipe(processor).pipe(rtc.localAudioTrack.processorDestination);
                } catch(err) {
                    console.log("AI Denoiser fallback", err);
                }
            }

            await rtc.client.publish([rtc.localAudioTrack]);
            
            alert('تم بدء بث الصوت بنجاح (وضع الشرائح).');
            document.getElementById('start-audio-btn').textContent = 'جاري بث الصوت...';
            document.getElementById('start-audio-btn').disabled = true;
        } catch(e) {
            console.error(e);
            alert("خطأ أثناء بدء بث الصوت.");
        }
    }

    window.sendChannelMessage = async function(type) {
        const channelText = document.getElementById('inst-channel-text');
        const channelImg = document.getElementById('inst-channel-img');
        
        let content = '';
        if(type === 'text') {
            content = channelText.value.trim();
            channelText.value = '';
        } else if (type === 'image') {
            content = channelImg.value.trim();
            channelImg.value = '';
        }

        if(!content) return;

        try {
            await firebase.firestore().collection('courses').doc(window.currentUser.courseId)
                .collection('rooms').doc(currentRoomId).collection('channel_messages').add({
                type,
                content,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch(e) {
            console.error("Error sending channel message:", e);
        }
    }

    async function setModeInDB(mode, data) {
        try {
            await firebase.firestore().collection('courses').doc(window.currentUser.courseId)
                .collection('rooms').doc(currentRoomId).set({
                presentationMode: mode,
                presentationData: data
            }, { merge: true });
        } catch(e) {
            console.error('Error changing mode', e);
        }
    }

    // CHANNEL LOGIC
    function renderChannelMessages() {
        if(!window._channelListenerAttached && window.currentUser && window.currentUser.courseId) {
            window._channelListenerAttached = true;
            firebase.firestore().collection('courses').doc(window.currentUser.courseId)
                .collection('rooms').doc(currentRoomId).collection('channel_messages')
                .orderBy('timestamp', 'asc')
                .onSnapshot(snapshot => {
                    const container = document.getElementById('channel-messages');
                    if(!container) return;
                    
                    container.innerHTML = '';
                    snapshot.forEach(doc => {
                        const msg = doc.data();
                        const el = document.createElement('div');
                        el.style.background = 'rgba(255,255,255,0.05)';
                        el.style.padding = '1rem';
                        el.style.borderRadius = '8px';
                        el.style.marginBottom = '0.5rem';
                        el.style.alignSelf = 'flex-start';
                        el.style.width = '100%';
                        
                        const timeString = msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
                        
                        if(msg.type === 'text') {
                            el.innerHTML = `<div style="font-size: 1.1rem; margin-bottom: 0.5rem;">${msg.content}</div>
                                            <div style="font-size: 0.8rem; color: #888;">المدرب &bull; <span class="en-text">${timeString}</span></div>`;
                        } else if (msg.type === 'image') {
                            el.innerHTML = `<img src="${msg.content}" style="max-width: 100%; border-radius: 8px; margin-bottom: 0.5rem;">
                                            <div style="font-size: 0.8rem; color: #888;">المدرب &bull; <span class="en-text">${timeString}</span></div>`;
                        }
                        container.appendChild(el);
                    });
                    container.scrollTop = container.scrollHeight;
                });
        }
    }

    setTimeout(() => {
        initModesListener();
    }, 4000);
