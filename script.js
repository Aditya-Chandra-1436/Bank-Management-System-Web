// --- DATABASE (using browser's localStorage) ---
function loadAccounts() {
    const accounts = localStorage.getItem('bankAccounts');
    return accounts ? JSON.parse(accounts) : [];
}

function saveAccounts(accounts) {
    localStorage.setItem('bankAccounts', JSON.stringify(accounts));
    updateDashboard(); // Update dashboard whenever accounts change
}

// --- UI NAVIGATION & MESSAGING ---
let notificationTimeout;

function showView(viewId, clickedButton) {
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active-view'));
    document.getElementById(viewId).classList.add('active-view');

    document.querySelectorAll('.menu-button').forEach(button => button.classList.remove('active'));
    if (clickedButton) {
        clickedButton.classList.add('active');
        // Update header title
        document.getElementById('view-title').textContent = clickedButton.textContent.trim();
        const subtitles = {
            'dashboard-view': 'Welcome back, Admin!',
            'create-account-view': 'Fill in the details for the new account.',
            'transaction-view': 'Deposit or withdraw funds.',
            'enquiry-view': 'Check an account\'s balance.',
            'all-accounts-view': 'List of all active accounts.',
            'modify-account-view': 'Update account holder information.',
            'close-account-view': 'Permanently remove an account.'
        };
        document.getElementById('view-subtitle').textContent = subtitles[viewId] || '';
    }
    
    // *** FIX: Refresh dashboard data every time it's viewed ***
    if (viewId === 'dashboard-view') {
        updateDashboard();
    }
    
    // Hide forms when switching views
    document.getElementById('modifyAccountForm').classList.add('hidden');
    document.getElementById('accountDetails').classList.add('hidden');
}

function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    const messageP = document.getElementById('notification-message');
    
    clearTimeout(notificationTimeout);
    
    messageP.textContent = message;
    notification.className = `fixed bottom-5 right-5 w-80 p-4 rounded-lg shadow-lg text-white ${isError ? 'bg-red-500' : 'bg-green-500'}`;
    
    notification.classList.add('show');
    
    notificationTimeout = setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// --- DASHBOARD (Simplified) ---
function updateDashboard() {
    const accounts = loadAccounts();
    // Stats
    document.getElementById('total-accounts-stat').textContent = accounts.length;
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.deposit, 0);
    document.getElementById('total-balance-stat').textContent = `₹${totalBalance.toLocaleString('en-IN')}`;
}

// --- CORE BANKING FUNCTIONS ---

// Create New Account
document.getElementById('createAccountForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const acno = parseInt(document.getElementById('acno').value);
    const name = document.getElementById('name').value;
    const type = document.getElementById('type').value.toUpperCase();
    const deposit = parseInt(document.getElementById('deposit').value);

    if ((type === 'S' && deposit < 500) || (type === 'C' && deposit < 1000)) {
        showNotification('Min. deposit: 500 (Savings) / 1000 (Current).', true);
        return;
    }

    let accounts = loadAccounts();
    if (accounts.find(acc => acc.acno === acno)) {
        showNotification(`Account number ${acno} already exists.`, true);
        return;
    }

    accounts.push({ acno, name, type, deposit });
    saveAccounts(accounts);
    showNotification('Account Created Successfully!');
    e.target.reset();
});

// Display All Accounts
function displayAllAccounts() {
    const accounts = loadAccounts();
    const tableBody = document.getElementById('accountsTableBody');
    tableBody.innerHTML = '';
    if (accounts.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-white/70">No accounts found.</td></tr>';
        return;
    }
    accounts.forEach(acc => {
        const row = `
            <tr class="hover:bg-white/10 transition-colors">
                <td class="p-4">${acc.acno}</td>
                <td class="p-4">${acc.name}</td>
                <td class="p-4">${acc.type === 'S' ? 'Savings' : 'Current'}</td>
                <td class="p-4 text-right font-medium">₹${acc.deposit.toLocaleString('en-IN')}</td>
            </tr>`;
        tableBody.innerHTML += row;
    });
}

// Deposit & Withdraw
function performTransaction(transactionType) {
    const acnoInput = document.getElementById('trans-acno');
    const amountInput = document.getElementById('trans-amount');
    if (!acnoInput.value || !amountInput.value) {
        showNotification('Please fill in all fields.', true);
        return;
    }
    const acno = parseInt(acnoInput.value);
    const amount = parseInt(amountInput.value);

    let accounts = loadAccounts();
    const accountIndex = accounts.findIndex(acc => acc.acno === acno);

    if (accountIndex === -1) {
        showNotification('Account Not Found.', true);
        return;
    }

    const account = accounts[accountIndex];
    if (transactionType === 'deposit') {
        account.deposit += amount;
    } else if (transactionType === 'withdraw') {
        const minBalance = account.type === 'S' ? 500 : 1000;
        if (account.deposit - amount < minBalance) {
            showNotification('Insufficient balance for this withdrawal.', true);
            return;
        }
        account.deposit -= amount;
    }

    saveAccounts(accounts);
    showNotification(`Transaction successful! New Balance: ₹${account.deposit.toLocaleString('en-IN')}`);
    document.getElementById('transactionForm').reset();
}

// Balance Enquiry
document.getElementById('enquiryForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const acno = parseInt(document.getElementById('enquiry-acno').value);
    const account = loadAccounts().find(acc => acc.acno === acno);
    const detailsDiv = document.getElementById('accountDetails');

    if (account) {
        detailsDiv.innerHTML = `
            <h4 class="text-lg font-semibold mb-2">Account Details</h4>
            <p><strong>Account No:</strong> ${account.acno}</p>
            <p><strong>Holder Name:</strong> ${account.name}</p>
            <p><strong>Account Type:</strong> ${account.type === 'S' ? 'Savings' : 'Current'}</p>
            <p class="mt-2 text-2xl font-bold">Balance: ₹${account.deposit.toLocaleString('en-IN')}</p>
        `;
        detailsDiv.classList.remove('hidden');
    } else {
        showNotification('Account number does not exist.', true);
        detailsDiv.classList.add('hidden');
    }
});

// Close an Account
document.getElementById('deleteAccountForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const acno = parseInt(document.getElementById('delete-acno').value);
    if (!acno) return;

    if (!confirm(`Are you sure you want to delete account #${acno}? This action is permanent.`)) return;

    let accounts = loadAccounts();
    const initialLength = accounts.length;
    accounts = accounts.filter(acc => acc.acno !== acno);

    if (accounts.length === initialLength) {
        showNotification('Account Not Found.', true);
    } else {
        saveAccounts(accounts);
        showNotification('Account Deleted Successfully!');
    }
    e.target.reset();
});

// Modify an Account
document.getElementById('findModifyAccountForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const acno = parseInt(document.getElementById('modify-search-acno').value);
    const account = loadAccounts().find(acc => acc.acno === acno);
    const modifyForm = document.getElementById('modifyAccountForm');

    if (account) {
        document.getElementById('editing-acno').textContent = account.acno;
        document.getElementById('modify-name').value = account.name;
        document.getElementById('modify-type').value = account.type;
        document.getElementById('modify-deposit').value = account.deposit;
        modifyForm.classList.remove('hidden');
    } else {
        showNotification('Account Not Found.', true);
        modifyForm.classList.add('hidden');
    }
});

document.getElementById('modifyAccountForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const acno = parseInt(document.getElementById('editing-acno').textContent);
    const updatedName = document.getElementById('modify-name').value;
    const updatedType = document.getElementById('modify-type').value.toUpperCase();
    const updatedDeposit = parseInt(document.getElementById('modify-deposit').value);

    let accounts = loadAccounts();
    const accountIndex = accounts.findIndex(acc => acc.acno === acno);

    if (accountIndex !== -1) {
        accounts[accountIndex] = { acno, name: updatedName, type: updatedType, deposit: updatedDeposit };
        saveAccounts(accounts);
        showNotification('Account Updated Successfully!');
        e.target.classList.add('hidden');
        document.getElementById('findModifyAccountForm').reset();
    }
});

// --- APP INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Font Awesome Kit
    const faScript = document.createElement('script');
    faScript.src = 'https://kit.fontawesome.com/a076d05399.js'; // Using a generic kit, replace if you have a specific one
    faScript.crossOrigin = 'anonymous';
    document.head.appendChild(faScript);

    // Set initial view
    const firstMenuButton = document.querySelector('.menu-button');
    showView('dashboard-view', firstMenuButton);
    
    // Initial data load for dashboard
    updateDashboard();
});
