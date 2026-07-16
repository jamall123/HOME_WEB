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
            id: 'web-dev',
            category: 'engineering',
            title: 'تطوير تطبيقات الويب الحديثة',
            duration: '12 أسبوع',
            level: 'متوسط إلى متقدم',
            students: 120,
            instructorId: 'eng-jamal',
            instructor: 'م. جمال - مهندس برمجيات',
            description: 'معسكر تدريبي مكثف يعلمك بناء تطبيقات ويب سريعة وقابلة للتوسع باستخدام React و Node.js. ستتخرج وأنت تمتلك تطبيقك الحقيقي الأول.',
            icon: 'fa-react',
            color: '#61DAFB',
            cover: 'assets/images/courses/web_dev_cover.png',
            isPaid: false
        },
        'public-speaking': {
            id: 'public-speaking',
            category: 'design',
            title: 'تعلم طريقة الإلقاء والوقوف أمام الجماهير',
            duration: '4 أسابيع',
            level: 'مبتدئ إلى متوسط',
            students: 45,
            instructorId: 'eng-jamal',
            instructor: 'م. جمال - خبير تواصل وإلقاء',
            description: 'دورة احترافية مخصصة لتطوير مهارات التحدث أمام الجمهور، التخلص من التوتر، وبناء الثقة بالنفس للتأثير في المستمعين باحترافية.',
            icon: 'fa-microphone-alt',
            color: '#D8B4FE',
            cover: 'assets/images/courses/public_speaking_cover.png',
            isPaid: true
        }
    };

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

    function renderCourses() {
        const grid = document.getElementById('courses-grid');
        if(!grid) return;
        
        grid.innerHTML = '';
        Object.values(coursesData).forEach(course => {
            const badge = course.isPaid ? 
                `<span style="position: absolute; top: 1rem; right: 1rem; background: rgba(245, 158, 11, 0.8); backdrop-filter: blur(4px); color: white; padding: 0.25rem 1rem; border-radius: var(--radius-pill); font-size: 0.85rem; border: 1px solid rgba(255,255,255,0.1);"><i class="fas fa-crown"></i> دورة مدفوعة</span>` 
                : `<span style="position: absolute; top: 1rem; right: 1rem; background: rgba(16, 185, 129, 0.8); backdrop-filter: blur(4px); color: white; padding: 0.25rem 1rem; border-radius: var(--radius-pill); font-size: 0.85rem; border: 1px solid rgba(255,255,255,0.1);"><i class="fas fa-gift"></i> مجانية بالكامل</span>`;
                
            grid.innerHTML += `
            <div class="glass-panel course-card" data-category="${course.category}" style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                <div style="background: url('${course.cover}') center/cover no-repeat; height: 200px; display: flex; align-items: center; justify-content: center; position: relative;">
                    ${badge}
                </div>
                <div style="padding: 1.5rem; flex: 1; display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <span class="caption-meta" style="color: var(--primary-light);">${course.level}</span>
                        <span class="caption-meta en-text" style="background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px;">${course.duration}</span>
                    </div>
                    <h3 class="display-3" style="font-size: 1.5rem; margin-bottom: 0.5rem;">${course.title}</h3>
                    <p class="text-muted" style="margin-bottom: 1.5rem; font-size: 0.95rem; line-height: 1.6;">${course.description.substring(0, 80)}...</p>
                    <button class="btn btn-secondary open-course-modal" onclick="openModal('${course.id}')" style="margin-top: auto; width: 100%;">التفاصيل</button>
                </div>
            </div>
            `;
        });
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
                <a href="course-room.html?type=paid" class="btn btn-primary" style="flex: 1; text-align: center;">دخول المشتركين <i class="fas fa-sign-in-alt" style="margin-right: 8px;"></i></a>
                `;
            } else {
                actionButtons = `
                <a href="course-room.html" class="btn btn-primary" style="flex: 1; text-align: center;">الدخول للدورة مباشرة <i class="fas fa-play" style="margin-right: 8px;"></i></a>
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
                        <div class="meta-item" style="cursor: pointer; background: rgba(147, 51, 234, 0.1); border: 1px solid rgba(147, 51, 234, 0.3); transition: 0.3s;" onmouseover="this.style.background='rgba(147, 51, 234, 0.2)'" onmouseout="this.style.background='rgba(147, 51, 234, 0.1)'" onclick="openInstructorModal('${data.instructorId}')">
                            <i class="fas fa-chalkboard-teacher" style="color: #D8B4FE;"></i>
                            <span style="color: #A5B4FC;">المقدم (اضغط للتفاصيل)</span>
                            <strong style="color: white;">${data.instructor}</strong>
                        </div>
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
    if (toggleSidebarBtn && roomSidebar) {
        toggleSidebarBtn.addEventListener('click', () => {
            roomSidebar.classList.toggle('open');
            if(roomLayout && roomLayout.classList.contains('chat-active')) {
                roomLayout.classList.remove('chat-active');
            }
        });
    }

    // Chat Toggle (Shrink video, open on left side)
    if (toggleChatBtn && roomLayout) {
        toggleChatBtn.addEventListener('click', () => {
            roomLayout.classList.toggle('chat-active');
            if(roomSidebar && roomSidebar.classList.contains('open')) {
                roomSidebar.classList.remove('open');
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
        submitFinalBtn.addEventListener('click', () => {
            alert('جاري إرسال البيانات وتأكيد التسجيل (محاكاة)... سنقوم بربطها بقاعدة البيانات لاحقاً.');
            closeEnrollmentModal();
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
    window.enterRoomUnified = function() {
        const usernameInput = document.getElementById('unified-username').value.trim().toLowerCase();
        const passwordInput = document.getElementById('unified-pass').value.trim();

        if(!usernameInput || !passwordInput) {
            alert('الرجاء إدخال اسم المستخدم وكلمة المرور');
            return;
        }

        const storedUsers = localStorage.getItem('jhome_users');
        if(storedUsers) {
            const users = JSON.parse(storedUsers);
            const user = users.find(u => u.username === usernameInput && u.password === passwordInput);
            
            if(user) {
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
        } else {
            alert('لم يتم العثور على أي مستخدمين في النظام.');
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
