/**
 * Jhome Admin - Logic for Bank Accounts Management
 */

document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'jhome_bank_accounts';
    const form = document.getElementById('add-bank-form');
    const tableBody = document.getElementById('bank-accounts-list');

    // Default accounts if none exist
    const defaultAccounts = [
        { id: Date.now().toString(), bank: 'بنكك', name: 'جمال احمد ابراهيم', number: '4373414' }
    ];

    function getAccounts() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultAccounts));
            return defaultAccounts;
        }
        return JSON.parse(stored);
    }

    function saveAccounts(accounts) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    }

    function renderAccounts() {
        if (!tableBody) return;
        const accounts = getAccounts();
        tableBody.innerHTML = '';

        if(accounts.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">لا توجد حسابات مضافة</td></tr>';
            return;
        }

        accounts.forEach(acc => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${acc.bank}</td>
                <td>${acc.name}</td>
                <td style="font-family: monospace;">${acc.number}</td>
                <td>
                    <button class="action-btn delete-btn" data-id="${acc.id}" title="حذف">
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
    }

    function deleteAccount(id) {
        if(confirm('هل أنت متأكد من حذف هذا الحساب؟')) {
            let accounts = getAccounts();
            accounts = accounts.filter(acc => acc.id !== id);
            saveAccounts(accounts);
            renderAccounts();
        }
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const bankInput = document.getElementById('new-bank-name');
            const nameInput = document.getElementById('new-account-name');
            const numInput = document.getElementById('new-account-number');

            const newAcc = {
                id: Date.now().toString(),
                bank: bankInput.value,
                name: nameInput.value,
                number: numInput.value
            };

            const accounts = getAccounts();
            accounts.push(newAcc);
            saveAccounts(accounts);
            
            form.reset();
            renderAccounts();
        });
    }

    // Initial render
    renderAccounts();

    // ----------------------------------------------------
    // User Management Logic
    // ----------------------------------------------------
    const USERS_KEY = 'jhome_users';
    const addUserForm = document.getElementById('add-user-form');
    const usersTableBody = document.getElementById('users-list');

    const defaultUsers = [
        { id: 'admin-1', fullname: 'جمال أحمد', username: 'jamalahmed', password: 'jamalahmed', role: 'instructor' }
    ];

    function getUsers() {
        const stored = localStorage.getItem(USERS_KEY);
        if (!stored) {
            localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
            return defaultUsers;
        }
        return JSON.parse(stored);
    }

    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function generateCredentials(fullname) {
        // Simple logic: lowercase, remove spaces, english chars if possible (here we just remove spaces for arabic or english)
        // Note: For Arabic names, using the actual arabic string without spaces works as a password, but usually usernames are english.
        // We will just use the exact name string without spaces for both for simplicity in this demo.
        const base = fullname.replace(/\s+/g, '').toLowerCase();
        return {
            username: base,
            password: base
        };
    }

    function renderUsers() {
        if (!usersTableBody) return;
        const users = getUsers();
        usersTableBody.innerHTML = '';

        if(users.length === 0) {
            usersTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">لا يوجد مستخدمين</td></tr>';
            return;
        }

        users.forEach(user => {
            const tr = document.createElement('tr');
            const roleBadge = user.role === 'instructor' 
                ? '<span style="background: var(--warning); color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">مدرب / مشرف</span>'
                : '<span style="background: var(--primary-color); color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">طالب</span>';
            
            tr.innerHTML = `
                <td>${user.fullname}</td>
                <td style="font-family: monospace; color: var(--primary-color);">${user.username}</td>
                <td style="font-family: monospace;">${user.password}</td>
                <td>${roleBadge}</td>
                <td>
                    <button class="action-btn delete-user-btn" data-id="${user.id}" title="حذف">
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
    }

    function deleteUser(id) {
        if(confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
            let users = getUsers();
            users = users.filter(u => u.id !== id);
            saveUsers(users);
            renderUsers();
        }
    }

    if (addUserForm) {
        addUserForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fullnameInput = document.getElementById('new-user-fullname');
            const roleInput = document.getElementById('new-user-role');
            
            const creds = generateCredentials(fullnameInput.value);

            const newUser = {
                id: Date.now().toString(),
                fullname: fullnameInput.value,
                username: creds.username,
                password: creds.password,
                role: roleInput.value
            };

            const users = getUsers();
            users.push(newUser);
            saveUsers(users);
            
            addUserForm.reset();
            renderUsers();
        });
    }

    renderUsers();

    // ----------------------------------------------------
    window.switchAdminTab = function(tabName) {
        const secPayments = document.getElementById('section-payments');
        const secUsers = document.getElementById('section-users');
        const secRequests = document.getElementById('section-requests');
        const navPayments = document.getElementById('nav-payments');
        const navUsers = document.getElementById('nav-users');
        const navRequests = document.getElementById('nav-requests');
        const pageTitle = document.getElementById('admin-page-title');
        const pageSubtitle = document.getElementById('admin-page-subtitle');

        secPayments.style.display = 'none';
        secUsers.style.display = 'none';
        secRequests.style.display = 'none';
        navPayments.classList.remove('active');
        navUsers.classList.remove('active');
        navRequests.classList.remove('active');

        if (tabName === 'payments') {
            secPayments.style.display = 'block';
            navPayments.classList.add('active');
            pageTitle.textContent = 'إدارة حسابات الدفع';
            pageSubtitle.textContent = 'تحكم في الحسابات البنكية التي تظهر للطلاب في شاشة الدفع';
        } else if (tabName === 'users') {
            secUsers.style.display = 'block';
            navUsers.classList.add('active');
            pageTitle.textContent = 'إدارة المستخدمين';
            pageSubtitle.textContent = 'إنشاء وإدارة صلاحيات دخول المستخدمين للدورات المدفوعة';
        } else if (tabName === 'requests') {
            secRequests.style.display = 'block';
            navRequests.classList.add('active');
            pageTitle.textContent = 'طلبات التسجيل';
            pageSubtitle.textContent = 'مراجعة طلبات التسجيل وإيصالات الدفع';
            loadEnrollmentRequests();
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
                        ${req.status === 'pending' ? `<button class="action-btn" style="color: var(--primary-color);" onclick="approveRequest('${doc.id}', '${req.fullName}')" title="موافقة وإنشاء حساب"><i class="fas fa-check-circle"></i></button>` : ''}
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

    window.approveRequest = async function(id, fullName) {
        if (confirm(`هل أنت متأكد من الموافقة على طلب: ${fullName}؟ سيطلب منك النظام إنشاء حساب له الآن.`)) {
            try {
                await firebase.firestore().collection('enrollmentRequests').doc(id).update({ status: 'approved' });
                // Switch to users tab and fill name
                switchAdminTab('users');
                const nameInput = document.getElementById('new-user-fullname');
                if (nameInput) {
                    nameInput.value = fullName;
                    nameInput.focus();
                }
            } catch (err) {
                console.error(err);
                alert('فشل التحديث!');
            }
        }
    };
});
