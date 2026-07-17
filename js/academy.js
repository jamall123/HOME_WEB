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
                <button class="btn btn-secondary" style="flex: 1;" onclick="openEnrollment('${data.title}', true)">الاشتراك والدفع <i class="fas fa-credit-card" style="margin-right: 8px;"></i></button>
                <a href="course-room.html?type=paid&id=${data.id}" class="btn btn-primary" style="flex: 1; text-align: center;">دخول المشتركين <i class="fas fa-sign-in-alt" style="margin-right: 8px;"></i></a>
                `;
            } else {
                actionButtons = `
                <a href="course-room.html?id=${data.id}" class="btn btn-primary" style="flex: 1; text-align: center;">الدخول للدورة مباشرة <i class="fas fa-play" style="margin-right: 8px;"></i></a>
                <button class="btn btn-secondary" style="flex: 1;" onclick="openEnrollment('${data.title} (تسجيل مجاني للشهادة)', false)">تسجيل مجاني للشهادة <i class="fas fa-certificate" style="margin-right: 8px;"></i></button>
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
            const file = receiptUpload.files[0];
            if(!file) {
                alert('الرجاء رفع الإيصال أولاً');
                return;
            }

            const fullName = document.getElementById('reg-fullname').value;
            const phone = document.getElementById('reg-phone').value;
            const edu = document.getElementById('reg-education').value;
            const spec = document.getElementById('reg-specialization').value;
            const city = document.getElementById('reg-city').value;
            const reason = document.getElementById('reg-reason').value;
            const courseTitle = courseTitleDisplay ? courseTitleDisplay.textContent : 'Unknown Course';

            try {
                submitFinalBtn.disabled = true;
                submitFinalBtn.innerHTML = 'جاري الرفع... <i class="fas fa-spinner fa-spin"></i>';

                const storageRef = firebase.storage().ref();
                const fileName = `receipts/${Date.now()}_${file.name}`;
                const fileRef = storageRef.child(fileName);
                
                const snapshot = await fileRef.put(file);
                const downloadURL = await snapshot.ref.getDownloadURL();

                const db = firebase.firestore();
                await db.collection('enrollmentRequests').add({
                    fullName,
                    phone,
                    education: edu,
                    specialization: spec,
                    city,
                    reason,
                    courseTitle,
                    receiptUrl: downloadURL,
                    status: 'pending',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                alert('تم إرسال طلبك بنجاح! سيتم مراجعته وإرسال بيانات الدخول إليك.');
                closeEnrollmentModal();
            } catch (err) {
                console.error('Error uploading receipt', err);
                alert('حدث خطأ أثناء رفع البيانات. الرجاء المحاولة مجدداً.');
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

    window.enterRoom = function(role) {
        if(role === 'instructor') {
            // Verify mock credentials (in real app, this goes to Firebase Auth)
            const email = document.getElementById('instructor-email').value;
            const pass = document.getElementById('instructor-pass').value;
            if(!email || !pass) {
                alert('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
                return;
            }
            if(instructorTabBtn) {
                instructorTabBtn.style.display = 'block'; // Show Instructor Tools
            }
        }
        
        // Hide Gate, unlock scrolling
        if(roomEntryGate) {
            roomEntryGate.style.opacity = '0';
            setTimeout(() => {
                roomEntryGate.style.display = 'none';
                document.body.style.overflow = 'auto'; // allow inner scrolling if needed
            }, 400);
        }
    };
    window.enterRoomUnified = async function() {
        const usernameInput = document.getElementById('unified-username').value.trim().toLowerCase();
        const passwordInput = document.getElementById('unified-pass').value.trim();

        if(!usernameInput || !passwordInput) {
            alert('الرجاء إدخال اسم المستخدم وكلمة المرور');
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const currentCourseId = urlParams.get('id') || 'mock-course-id';

        try {
            const snap = await firebase.firestore().collection('users')
                .where('username', '==', usernameInput)
                .where('password', '==', passwordInput)
                .where('courseId', '==', currentCourseId)
                .get();

            if (!snap.empty) {
                const user = snap.docs[0].data();
                
                // Update current user globally for chat
                window.currentUser = { name: user.fullname || user.username, role: user.role };
                
                // Login Success
                if(user.role === 'instructor' && instructorTabBtn) {
                    instructorTabBtn.style.display = 'block';
                }
                
                // Hide Gate
                if(roomEntryGate) {
                    roomEntryGate.style.opacity = '0';
                    setTimeout(() => {
                        roomEntryGate.style.display = 'none';
                        document.body.style.overflow = 'auto'; 
                    }, 400);
                }
            } else {
                alert('بيانات الدخول غير صحيحة، أو ليس لديك صلاحية لهذه الدورة.');
            }
        } catch (e) {
            console.error(e);
            alert('حدث خطأ أثناء الاتصال بقاعدة البيانات.');
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

});

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
            await initAgoraClient();
            await rtc.client.join(options.appId, options.channel, options.token, options.uid);
            rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
            
            const videoContainer = document.getElementById("main-video-container");
            videoContainer.innerHTML = '';
            
            await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);
            
            const localPlayerContainer = document.createElement("div");
            localPlayerContainer.id = options.uid || "local-uid";
            localPlayerContainer.style.width = "100%";
            localPlayerContainer.style.height = "100%";
            videoContainer.append(localPlayerContainer);
            rtc.localVideoTrack.play(localPlayerContainer.id);

            document.getElementById('start-live-btn').style.display = 'none';
            document.getElementById('leave-live-btn').style.display = 'block';

            // Simulate notifying students (In real app, update Firestore document `isLive: true`)
            const courseId = new URLSearchParams(window.location.search).get('id') || 'mock-course-id';
            firebase.firestore().collection('courses').doc(courseId).update({ isLive: true }).catch(console.warn);

            alert('تم بدء البث المباشر بنجاح!');
        } catch (err) {
            console.error('Error starting live stream', err);
            alert('حدث خطأ أثناء بدء البث. تأكد من صلاحيات الكاميرا والمايكروفون.');
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
    
    // Default user if not logged in
    window.currentUser = { name: 'زائر', role: 'student' }; 

    if (chatForm && chatContainer) {
        // Listen to new messages
        firebase.firestore().collection('courses').doc(currentCourseId).collection('chat')
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
                await firebase.firestore().collection('courses').doc(currentCourseId).collection('chat').add({
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
