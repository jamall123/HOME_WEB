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
});
