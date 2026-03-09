const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'accounts.json');

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize data file
function initializeData() {
    if (!fs.existsSync(DATA_FILE)) {
        const initialData = {
            accounts: {},
            sessions: {}
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    }
}

// Load accounts from file
function loadAccounts() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        return { accounts: {}, sessions: {} };
    }
}

// Save accounts to file
function saveAccounts(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Generate unique session token
function generateToken() {
    return uuidv4();
}

// Verify session
function verifySession(token) {
    const data = loadAccounts();
    return data.sessions[token];
}

// ==================== ROUTES ====================

// Register Account
app.post('/api/register', (req, res) => {
    const { accountNumber, name, email, pin } = req.body;

    if (!accountNumber || !name || !email || !pin || pin.length !== 4) {
        return res.status(400).json({ error: 'Invalid input. PIN must be 4 digits.' });
    }

    const data = loadAccounts();

    if (data.accounts[accountNumber]) {
        return res.status(400).json({ error: 'Account already exists.' });
    }

    data.accounts[accountNumber] = {
        accountNumber,
        name,
        email,
        pin,
        balance: 0,
        createdAt: new Date().toISOString(),
        transactions: []
    };

    saveAccounts(data);
    res.status(201).json({ message: 'Account created successfully!' });
});

// Login
app.post('/api/login', (req, res) => {
    const { accountNumber, pin } = req.body;

    if (!accountNumber || !pin) {
        return res.status(400).json({ error: 'Account number and PIN required.' });
    }

    const data = loadAccounts();
    const account = data.accounts[accountNumber];

    if (!account || account.pin !== pin) {
        return res.status(401).json({ error: 'Invalid account number or PIN.' });
    }

    const token = generateToken();
    data.sessions[token] = { accountNumber, loginTime: new Date().toISOString() };
    saveAccounts(data);

    res.json({
        token,
        account: {
            accountNumber: account.accountNumber,
            name: account.name,
            email: account.email,
            balance: account.balance
        }
    });
});

// Logout
app.post('/api/logout', (req, res) => {
    const { token } = req.body;
    const data = loadAccounts();
    delete data.sessions[token];
    saveAccounts(data);
    res.json({ message: 'Logged out successfully.' });
});

// Get Account Details
app.get('/api/account/:token', (req, res) => {
    const { token } = req.params;
    const accountNumber = verifySession(token);

    if (!accountNumber) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const data = loadAccounts();
    const account = data.accounts[accountNumber.accountNumber];

    if (!account) {
        return res.status(404).json({ error: 'Account not found.' });
    }

    res.json({
        accountNumber: account.accountNumber,
        name: account.name,
        email: account.email,
        balance: account.balance,
        createdAt: account.createdAt
    });
});

// Deposit
app.post('/api/deposit', (req, res) => {
    const { token, amount } = req.body;
    const sessionData = verifySession(token);

    if (!sessionData) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (amount <= 0) {
        return res.status(400).json({ error: 'Amount must be greater than 0.' });
    }

    const data = loadAccounts();
    const account = data.accounts[sessionData.accountNumber];

    account.balance += amount;
    account.transactions.push({
        type: 'DEPOSIT',
        amount,
        timestamp: new Date().toISOString(),
        description: 'Cash deposit',
        balanceAfter: account.balance
    });

    saveAccounts(data);
    res.json({
        message: 'Deposit successful!',
        newBalance: account.balance
    });
});

// Withdraw
app.post('/api/withdraw', (req, res) => {
    const { token, amount } = req.body;
    const sessionData = verifySession(token);

    if (!sessionData) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (amount <= 0) {
        return res.status(400).json({ error: 'Amount must be greater than 0.' });
    }

    const data = loadAccounts();
    const account = data.accounts[sessionData.accountNumber];

    if (amount > account.balance) {
        return res.status(400).json({ error: 'Insufficient balance.' });
    }

    account.balance -= amount;
    account.transactions.push({
        type: 'WITHDRAW',
        amount,
        timestamp: new Date().toISOString(),
        description: 'Cash withdrawal',
        balanceAfter: account.balance
    });

    saveAccounts(data);
    res.json({
        message: 'Withdrawal successful!',
        newBalance: account.balance
    });
});

// Transfer
app.post('/api/transfer', (req, res) => {
    const { token, toAccount, amount } = req.body;
    const sessionData = verifySession(token);

    if (!sessionData) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (amount <= 0) {
        return res.status(400).json({ error: 'Amount must be greater than 0.' });
    }

    const data = loadAccounts();
    const fromAccount = data.accounts[sessionData.accountNumber];
    const recipient = data.accounts[toAccount];

    if (!recipient) {
        return res.status(404).json({ error: 'Recipient account not found.' });
    }

    if (amount > fromAccount.balance) {
        return res.status(400).json({ error: 'Insufficient balance.' });
    }

    fromAccount.balance -= amount;
    recipient.balance += amount;

    fromAccount.transactions.push({
        type: 'TRANSFER',
        amount,
        timestamp: new Date().toISOString(),
        description: `Transfer to ${recipient.name} (${toAccount})`,
        balanceAfter: fromAccount.balance
    });

    recipient.transactions.push({
        type: 'TRANSFER',
        amount,
        timestamp: new Date().toISOString(),
        description: `Transfer from ${fromAccount.name} (${sessionData.accountNumber})`,
        balanceAfter: recipient.balance
    });

    saveAccounts(data);
    res.json({
        message: 'Transfer successful!',
        newBalance: fromAccount.balance,
        recipientName: recipient.name
    });
});

// Get Transaction History
app.get('/api/transactions/:token', (req, res) => {
    const { token } = req.params;
    const sessionData = verifySession(token);

    if (!sessionData) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const data = loadAccounts();
    const account = data.accounts[sessionData.accountNumber];
    const transactions = account.transactions.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );

    res.json({ transactions });
});

// Change PIN
app.post('/api/change-pin', (req, res) => {
    const { token, oldPin, newPin } = req.body;
    const sessionData = verifySession(token);

    if (!sessionData) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (newPin.length !== 4) {
        return res.status(400).json({ error: 'New PIN must be 4 digits.' });
    }

    const data = loadAccounts();
    const account = data.accounts[sessionData.accountNumber];

    if (account.pin !== oldPin) {
        return res.status(401).json({ error: 'Old PIN is incorrect.' });
    }

    account.pin = newPin;
    saveAccounts(data);
    res.json({ message: 'PIN changed successfully!' });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Banking system is running' });
});

// Initialize and start server
initializeData();
app.listen(PORT, () => {
    console.log(`🏦 Banking System Server running on http://localhost:${PORT}`);
    console.log(`📂 Data file: ${DATA_FILE}`);
});
