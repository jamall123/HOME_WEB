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
                        <button class="btn btn-secondary" style="flex: 1;" onclick="openEnrollment('${data.title}')">الاشتراك والدفع <i class="fas fa-credit-card" style="margin-right: 8px;"></i></button>
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

    // ----------------------------------------------------
    // 4. Mobile Toggles (Sidebar & Chat)
    // ----------------------------------------------------
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    const toggleChatBtn = document.getElementById('toggle-chat');
    const roomSidebar = document.querySelector('.room-sidebar');
    const roomChat = document.querySelector('.room-chat');

    if (toggleSidebarBtn && roomSidebar) {
        toggleSidebarBtn.addEventListener('click', () => {
            roomSidebar.classList.toggle('open');
            // If opening sidebar, close chat to avoid overlap
            if(roomSidebar.classList.contains('open') && roomChat) {
                roomChat.classList.remove('open');
            }
        });
    }

    if (toggleChatBtn && roomChat) {
        toggleChatBtn.addEventListener('click', () => {
            roomChat.classList.toggle('open');
            // If opening chat, close sidebar to avoid overlap
            if(roomChat.classList.contains('open') && roomSidebar) {
                roomSidebar.classList.remove('open');
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

    window.openEnrollment = function(courseTitle) {
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
            
            // Here we would normally collect data, for now we just switch steps
            step1.classList.remove('active-step');
            step2.classList.add('active-step');
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
