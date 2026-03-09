// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return null;
    }
    return token;
}

const token = checkAuth();

// Load account data on page load
window.addEventListener('load', () => {
    loadAccountData();
    loadTransactions();
    updateGreeting();
});

function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Good Morning';
    if (hour >= 12) greeting = 'Good Afternoon';
    if (hour >= 18) greeting = 'Good Evening';

    const account = JSON.parse(localStorage.getItem('account'));
    document.getElementById('greetingText').textContent = `${greeting}, ${account.name}!`;
    document.getElementById('greetingDate').textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Set user avatar
    const initials = account.name.split(' ').map(n => n[0]).join('').toUpperCase();
    document.getElementById('userAvatar').textContent = initials;
    document.getElementById('userNameDisplay').textContent = account.name;
}

async function loadAccountData() {
    try {
        const response = await fetch(`/api/account/${token}`);
        const data = await response.json();

        if (response.ok) {
            document.getElementById('balanceDisplay').textContent = '$' + data.balance.toFixed(2);
            document.getElementById('accountDisplay').textContent = data.accountNumber;
            document.getElementById('holderDisplay').textContent = data.name;
            document.getElementById('memberDisplay').textContent = new Date(data.createdAt).toLocaleDateString();

            // Update localStorage
            const account = JSON.parse(localStorage.getItem('account'));
            account.balance = data.balance;
            localStorage.setItem('account', JSON.stringify(account));
        }
    } catch (error) {
        showAlert('Error loading account data: ' + error.message, 'error');
    }
}

async function loadTransactions() {
    try {
        const response = await fetch(`/api/transactions/${token}`);
        const data = await response.json();

        if (response.ok) {
            displayRecentTransactions(data.transactions.slice(0, 5));
            displayAllTransactions(data.transactions);
        }
    } catch (error) {
        showAlert('Error loading transactions: ' + error.message, 'error');
    }
}

function displayRecentTransactions(transactions) {
    const container = document.getElementById('recentTransactions');

    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No transactions yet</p>
            </div>
        `;
        return;
    }

    container.innerHTML = transactions.map(trans => createTransactionHTML(trans)).join('');
}

function displayAllTransactions(transactions) {
    const container = document.getElementById('transactionsList');

    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No transactions yet</p>
            </div>
        `;
        return;
    }

    container.innerHTML = transactions.map(trans => createTransactionHTML(trans)).join('');
}

function createTransactionHTML(trans) {
    let icon = 'fas fa-exchange-alt';
    let iconClass = 'transfer';
    let amountClass = '';

    if (trans.type === 'DEPOSIT') {
        icon = 'fas fa-plus-circle';
        iconClass = 'deposit';
        amountClass = 'positive';
        amountText = '+$' + trans.amount.toFixed(2);
    } else if (trans.type === 'WITHDRAW') {
        icon = 'fas fa-minus-circle';
        iconClass = 'withdraw';
        amountClass = 'negative';
        amountText = '-$' + trans.amount.toFixed(2);
    } else {
        if (trans.description.includes('Transfer to')) {
            amountClass = 'negative';
            amountText = '-$' + trans.amount.toFixed(2);
        } else {
            amountClass = 'positive';
            amountText = '+$' + trans.amount.toFixed(2);
        }
    }

    const date = new Date(trans.timestamp);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-type">
                    <i class="${icon} ${iconClass}"></i>
                    ${trans.type}
                </div>
                <div class="transaction-desc">${trans.description}</div>
            </div>
            <div class="transaction-amount">
                <div class="transaction-money ${amountClass}">${amountText}</div>
                <div class="transaction-time">${dateStr} ${timeStr}</div>
            </div>
        </div>
    `;
}

// Section Navigation
function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    const menuItems = document.querySelectorAll('.menu-item');

    sections.forEach(section => section.classList.remove('active'));
    menuItems.forEach(item => item.classList.remove('active'));

    document.getElementById(sectionId).classList.add('active');
    event.target.closest('.menu-item').classList.add('active');

    if (sectionId === 'dashboard') {
        loadAccountData();
        loadTransactions();
    } else if (sectionId === 'transactions') {
        loadTransactions();
    }

    window.scrollTo(0, 0);
}

// Show Alert
function showAlert(message, type) {
    const alertBox = document.getElementById('alertBox');
    alertBox.textContent = message;
    alertBox.className = `alert-msg alert-${type}`;
    alertBox.style.display = 'block';

    if (type === 'success') {
        setTimeout(() => {
            alertBox.style.display = 'none';
        }, 3000);
    }
}

// Deposit Form
document.getElementById('depositForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('depositAmount').value);

    try {
        const response = await fetch('/api/deposit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, amount })
        });

        const data = await response.json();

        if (!response.ok) {
            showAlert(data.error, 'error');
            return;
        }

        showAlert(`Deposit successful! New balance: $${data.newBalance.toFixed(2)}`, 'success');
        document.getElementById('depositForm').reset();
        loadAccountData();
        loadTransactions();
        setTimeout(() => showSection('dashboard'), 2000);
    } catch (error) {
        showAlert('Error: ' + error.message, 'error');
    }
});

// Withdraw Form
document.getElementById('withdrawForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('withdrawAmount').value);

    try {
        const response = await fetch('/api/withdraw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, amount })
        });

        const data = await response.json();

        if (!response.ok) {
            showAlert(data.error, 'error');
            return;
        }

        showAlert(`Withdrawal successful! New balance: $${data.newBalance.toFixed(2)}`, 'success');
        document.getElementById('withdrawForm').reset();
        loadAccountData();
        loadTransactions();
        setTimeout(() => showSection('dashboard'), 2000);
    } catch (error) {
        showAlert('Error: ' + error.message, 'error');
    }
});

// Transfer Form
document.getElementById('transferForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const toAccount = document.getElementById('transferTo').value;
    const amount = parseFloat(document.getElementById('transferAmount').value);

    try {
        const response = await fetch('/api/transfer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, toAccount, amount })
        });

        const data = await response.json();

        if (!response.ok) {
            showAlert(data.error, 'error');
            return;
        }

        showAlert(`Transfer to ${data.recipientName} successful! New balance: $${data.newBalance.toFixed(2)}`, 'success');
        document.getElementById('transferForm').reset();
        loadAccountData();
        loadTransactions();
        setTimeout(() => showSection('dashboard'), 2000);
    } catch (error) {
        showAlert('Error: ' + error.message, 'error');
    }
});

// Settings Form
document.getElementById('settingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const oldPin = document.getElementById('oldPin').value;
    const newPin = document.getElementById('newPin').value;
    const confirmPin = document.getElementById('confirmNewPin').value;

    if (newPin !== confirmPin) {
        showAlert('New PINs do not match!', 'error');
        return;
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
        showAlert('PIN must be exactly 4 digits!', 'error');
        return;
    }

    try {
        const response = await fetch('/api/change-pin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, oldPin, newPin })
        });

        const data = await response.json();

        if (!response.ok) {
            showAlert(data.error, 'error');
            return;
        }

        showAlert('PIN changed successfully!', 'success');
        document.getElementById('settingsForm').reset();
        setTimeout(() => showSection('dashboard'), 2000);
    } catch (error) {
        showAlert('Error: ' + error.message, 'error');
    }
});

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        fetch('/api/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        }).then(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('account');
            window.location.href = 'index.html';
        });
    }
}
