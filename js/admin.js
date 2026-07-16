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
    // Tab Switching Logic
    // ----------------------------------------------------
    window.switchAdminTab = function(tabName) {
        const secPayments = document.getElementById('section-payments');
        const secUsers = document.getElementById('section-users');
        const navPayments = document.getElementById('nav-payments');
        const navUsers = document.getElementById('nav-users');
        const pageTitle = document.getElementById('admin-page-title');
        const pageSubtitle = document.getElementById('admin-page-subtitle');

        if (tabName === 'payments') {
            secPayments.style.display = 'block';
            secUsers.style.display = 'none';
            navPayments.classList.add('active');
            navUsers.classList.remove('active');
            pageTitle.textContent = 'إدارة حسابات الدفع';
            pageSubtitle.textContent = 'تحكم في الحسابات البنكية التي تظهر للطلاب في شاشة الدفع';
        } else if (tabName === 'users') {
            secPayments.style.display = 'none';
            secUsers.style.display = 'block';
            navUsers.classList.add('active');
            navPayments.classList.remove('active');
            pageTitle.textContent = 'إدارة المستخدمين';
            pageSubtitle.textContent = 'إنشاء وإدارة صلاحيات دخول المستخدمين للدورات المدفوعة';
        }
    };
});
