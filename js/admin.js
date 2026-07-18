/**
 * Jhome Admin - Logic for Bank Accounts Management
 */

document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'jhome_bank_accounts';
    const form = document.getElementById('add-bank-form');
    const tableBody = document.getElementById('bank-accounts-list');

    async function renderAccounts() {
        if (!tableBody) return;
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">جاري التحميل...</td></tr>';
        
        try {
            const snap = await firebase.firestore().collection('bank_accounts').get();
            tableBody.innerHTML = '';

            if (snap.empty) {
                tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">لا توجد حسابات مضافة</td></tr>';
                return;
            }

            snap.forEach(doc => {
                const acc = doc.data();
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${acc.bank}</td>
                    <td>${acc.name}</td>
                    <td style="font-family: monospace;">${acc.number}</td>
                    <td>
                        <button class="action-btn delete-btn" data-id="${doc.id}" title="حذف">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            // Attach delete listeners
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    deleteAccount(id);
                });
            });
        } catch (error) {
            console.error(error);
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">فشل تحميل الحسابات</td></tr>';
        }
    }

    async function deleteAccount(id) {
        if(confirm('هل أنت متأكد من حذف هذا الحساب؟')) {
            try {
                await firebase.firestore().collection('bank_accounts').doc(id).delete();
                renderAccounts();
            } catch (error) {
                console.error(error);
                alert("حدث خطأ أثناء الحذف");
            }
        }
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const bankInput = document.getElementById('new-bank-name');
            const nameInput = document.getElementById('new-account-name');
            const numInput = document.getElementById('new-account-number');

            const newAcc = {
                bank: bankInput.value,
                name: nameInput.value,
                number: numInput.value
            };

            try {
                await firebase.firestore().collection('bank_accounts').add(newAcc);
                form.reset();
                renderAccounts();
            } catch (error) {
                console.error(error);
                alert("حدث خطأ أثناء إضافة الحساب");
            }
        });
    }

    // Initial render (delayed slightly to wait for firebase auth/init)
    setTimeout(renderAccounts, 1000);

    // ----------------------------------------------------
    // User Management Logic (Sync with Firestore)
    // ----------------------------------------------------
    const addUserForm = document.getElementById('add-user-form');
    const usersTableBody = document.getElementById('users-list');

    function generateCredentials(fullname) {
        // Create a simple username from fullname
        const base = fullname.replace(/\s+/g, '').toLowerCase();
        // Add random digits to ensure uniqueness
        const unique = Math.floor(Math.random() * 10000).toString();
        return {
            username: base + unique,
            password: base + unique
        };
    }

    async function renderUsers() {
        if (!usersTableBody) return;
        usersTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">جاري التحميل...</td></tr>';
        
        try {
            const snap = await firebase.firestore().collection('courses_credentials').get();
            usersTableBody.innerHTML = '';
            
            if(snap.empty) {
                usersTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">لا يوجد مستخدمين</td></tr>';
                return;
            }

            snap.forEach(doc => {
                const user = doc.data();
                const tr = document.createElement('tr');
                const roleBadge = user.role === 'instructor' 
                    ? '<span style="background: var(--warning); color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">مدرب / مشرف</span>'
                    : '<span style="background: var(--primary-color); color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">طالب</span>';
                
                tr.innerHTML = `
                    <td>${user.fullname || '-'}</td>
                    <td style="font-family: monospace; color: var(--primary-color);">${doc.id}</td>
                    <td style="font-family: monospace;">${user.password}</td>
                    <td>${roleBadge}</td>
                    <td>${user.courseId || 'عام (كل الدورات)'}</td>
                    <td>
                        <button class="action-btn delete-user-btn" data-id="${doc.id}" title="حذف">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `;
                usersTableBody.appendChild(tr);
            });

            document.querySelectorAll('.delete-user-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    deleteUser(id);
                });
            });
        } catch(e) {
            console.error(e);
            usersTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">فشل في تحميل المستخدمين</td></tr>';
        }
    }

    async function deleteUser(id) {
        if(confirm('هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.')) {
            try {
                await firebase.firestore().collection('courses_credentials').doc(id).delete();
                renderUsers();
            } catch(e) {
                console.error(e);
                alert("حدث خطأ أثناء الحذف");
            }
        }
    }

    if (addUserForm) {
        addUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fullnameInput = document.getElementById('new-user-fullname');
            const roleInput = document.getElementById('new-user-role');
            const courseInput = document.getElementById('new-user-course');
            
            const creds = generateCredentials(fullnameInput.value);

            const newUser = {
                fullname: fullnameInput.value,
                password: creds.password,
                role: roleInput.value,
                courseId: courseInput.value.trim() || null
            };

            try {
                await firebase.firestore().collection('courses_credentials').doc(creds.username).set(newUser);
                alert("تم إنشاء المستخدم بنجاح!");
                addUserForm.reset();
                renderUsers();
            } catch(e) {
                console.error(e);
                alert("حدث خطأ أثناء إنشاء الحساب.");
            }
        });
    }

    // Call it after auth ready (or just run it if firestore is accessible)
    setTimeout(renderUsers, 1500);

    // ----------------------------------------------------
    window.switchAdminTab = function(tabName) {
        const sections = ['payments', 'users', 'requests', 'courses', 'media', 'projects', 'settings'];
        const pageTitle = document.getElementById('admin-page-title');
        const pageSubtitle = document.getElementById('admin-page-subtitle');

        sections.forEach(sec => {
            const el = document.getElementById(`section-${sec}`);
            const nav = document.getElementById(`nav-${sec}`);
            if(el) el.style.display = 'none';
            if(nav) nav.classList.remove('active');
        });

        const activeSec = document.getElementById(`section-${tabName}`);
        const activeNav = document.getElementById(`nav-${tabName}`);
        
        if (activeSec) activeSec.style.display = 'block';
        if (activeNav) activeNav.classList.add('active');

        if (tabName === 'payments') {
            pageTitle.textContent = 'إدارة حسابات الدفع';
            pageSubtitle.textContent = 'تحكم في الحسابات البنكية التي تظهر للطلاب في شاشة الدفع';
        } else if (tabName === 'users') {
            pageTitle.textContent = 'إدارة المستخدمين';
            pageSubtitle.textContent = 'إنشاء وإدارة صلاحيات دخول المستخدمين للدورات المدفوعة';
        } else if (tabName === 'requests') {
            pageTitle.textContent = 'طلبات التسجيل';
            pageSubtitle.textContent = 'مراجعة طلبات التسجيل وإيصالات الدفع';
            if(typeof loadEnrollmentRequests === 'function') loadEnrollmentRequests();
        } else if (tabName === 'courses') {
            pageTitle.textContent = 'إدارة الأكاديمية';
            pageSubtitle.textContent = 'إضافة وتعديل وحذف الدورات التعليمية';
            if(typeof loadCMSCourses === 'function') loadCMSCourses();
        } else if (tabName === 'media') {
            pageTitle.textContent = 'المركز الإعلامي';
            pageSubtitle.textContent = 'إدارة المقالات التقنية وقصص النجاح';
            if(typeof loadCMSMedia === 'function') loadCMSMedia();
        } else if (tabName === 'projects') {
            pageTitle.textContent = 'إدارة المنتجات';
            pageSubtitle.textContent = 'التحكم في عرض المنتجات والمشاريع وحالتها';
            if(typeof loadCMSProjects === 'function') loadCMSProjects();
        } else if (tabName === 'settings') {
            pageTitle.textContent = 'إعدادات الموقع';
            pageSubtitle.textContent = 'التحكم في بيانات الشركة ونصوص الصفحة الرئيسية';
            if(typeof loadCMSSettings === 'function') loadCMSSettings();
        }
    };

    // ----------------------------------------------------
    // Load Enrollment Requests from Firestore
    // ----------------------------------------------------
    async function loadEnrollmentRequests() {
        const requestsList = document.getElementById('requests-list');
        if (!requestsList) return;

        requestsList.innerHTML = '<tr><td colspan="6" style="text-align: center;">جاري تحميل الطلبات... <i class="fas fa-spinner fa-spin"></i></td></tr>';

        try {
            const db = firebase.firestore();
            const snap = await db.collection('enrollmentRequests').orderBy('createdAt', 'desc').get();
            
            requestsList.innerHTML = '';
            if (snap.empty) {
                requestsList.innerHTML = '<tr><td colspan="6" style="text-align: center;">لا توجد طلبات تسجيل حالياً</td></tr>';
                return;
            }

            snap.forEach(doc => {
                const req = doc.data();
                const tr = document.createElement('tr');
                const statusBadge = req.status === 'pending' ? 
                    '<span style="background: var(--warning); color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">قيد الانتظار</span>' :
                    '<span style="background: var(--primary-color); color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">مكتمل</span>';

                tr.innerHTML = `
                    <td>${req.fullName || '-'}</td>
                    <td dir="ltr" style="text-align: right;">${req.phone || '-'}</td>
                    <td>${req.courseTitle || '-'}</td>
                    <td><a href="${req.receiptUrl}" target="_blank" class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;"><i class="fas fa-eye"></i> عرض</a></td>
                    <td>${statusBadge}</td>
                    <td>
                        ${req.status === 'pending' ? `<button class="action-btn" style="color: var(--primary-color);" onclick="approveRequest('${doc.id}', '${req.fullName}', '${req.courseId || ''}')" title="موافقة وإنشاء حساب"><i class="fas fa-check-circle"></i></button>` : ''}
                        <button class="action-btn delete-req-btn" onclick="deleteRequest('${doc.id}')" title="حذف"><i class="fas fa-trash-alt"></i></button>
                    </td>
                `;
                requestsList.appendChild(tr);
            });
        } catch (err) {
            console.error(err);
            requestsList.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">حدث خطأ في تحميل الطلبات</td></tr>';
        }
    }

    window.deleteRequest = async function(id) {
        if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
            try {
                await firebase.firestore().collection('enrollmentRequests').doc(id).delete();
                loadEnrollmentRequests();
            } catch (err) {
                console.error(err);
                alert('فشل الحذف!');
            }
        }
    };

    window.approveRequest = async function(id, fullName, courseId) {
        if (confirm(`هل أنت متأكد من الموافقة على طلب: ${fullName}؟ سيطلب منك النظام إنشاء حساب له الآن.`)) {
            try {
                await firebase.firestore().collection('enrollmentRequests').doc(id).update({ status: 'approved' });
                // Switch to users tab and fill name
                switchAdminTab('users');
                const nameInput = document.getElementById('new-user-fullname');
                const courseInput = document.getElementById('new-user-course');
                if (nameInput) {
                    nameInput.value = fullName;
                    if(courseInput && courseId && courseId !== 'undefined') {
                        courseInput.value = courseId;
                    }
                    nameInput.focus();
                }
            } catch (err) {
                console.error(err);
                alert('فشل التحديث!');
            }
        }
    };
});
