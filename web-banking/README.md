# SecureBank - Professional Web Banking System

A modern, fully-featured web-based banking system built with Node.js/Express backend and a beautiful Bootstrap-based frontend.

## Features

### 🔐 Security & Authentication
- User registration with unique account numbers
- PIN-based authentication (4 digits)
- Secure session management with tokens
- PIN change functionality

### 💰 Banking Operations
- **Deposit** - Add funds to your account
- **Withdraw** - Withdraw cash (with balance validation)
- **Transfer** - Send money between accounts
- **View Balance** - Check your current balance anytime
- **Transaction History** - Complete transaction log with timestamps

### 📊 Dashboard
- Professional account dashboard
- Real-time balance display
- Recent transactions overview
- Account information display
- Quick action buttons for common operations

### 📱 User Experience
- Responsive design (works on desktop, tablet, mobile)
- Intuitive navigation
- Real-time updates
- Professional UI with Bootstrap 5
- Smooth animations and transitions

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)
- A modern web browser

### Step 1: Install Dependencies

Navigate to the server directory and install required packages:

```bash
cd server
npm install
```

This will install:
- **express** - Web framework
- **cors** - Cross-Origin Resource Sharing
- **body-parser** - JSON parsing
- **uuid** - Unique ID generation

### Step 2: Start the Server

From the `server` directory, run:

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

You should see:
```
🏦 Banking System Server running on http://localhost:3000
```

### Step 3: Open in Browser

Navigate to: **http://localhost:3000**

## Usage

### Creating an Account
1. Click "Register Now" on the login page
2. Enter your full name
3. Enter your email
4. Choose a unique account number
5. Set a 4-digit PIN
6. Confirm your PIN
7. Click "Create Account"

### Login
1. Enter your account number
2. Enter your 4-digit PIN
3. Click "Login"

### Dashboard Features

#### Quick Actions
- **Deposit**: Add money to your account
- **Withdraw**: Remove money from your account (if sufficient balance)
- **Transfer**: Send money to another account
- **View History**: See all your transactions

#### Account Settings
- Change your PIN (requires current PIN)
- View account creation date
- Manage your account information

## Project Structure

```
web-banking/
├── public/
│   ├── index.html          # Login/Register page
│   ├── dashboard.html      # Main banking interface
│   ├── auth.js            # Authentication logic
│   └── dashboard.js       # Dashboard functionality
├── server/
│   ├── server.js          # Express server & API
│   ├── accounts.json      # Data storage (auto-created)
│   └── package.json       # Dependencies
└── README.md              # This file
```

## API Endpoints

### Authentication
- `POST /api/register` - Create new account
- `POST /api/login` - Login to existing account
- `POST /api/logout` - Logout

### Account Operations
- `GET /api/account/:token` - Get account details
- `POST /api/deposit` - Deposit money
- `POST /api/withdraw` - Withdraw money
- `POST /api/transfer` - Transfer to another account
- `GET /api/transactions/:token` - Get transaction history
- `POST /api/change-pin` - Change account PIN

## Data Storage

Account data is stored in `server/accounts.json` with the following structure:

```json
{
  "accounts": {
    "1001": {
      "accountNumber": "1001",
      "name": "John Doe",
      "email": "john@example.com",
      "pin": "1234",
      "balance": 5000.00,
      "createdAt": "2024-03-09T10:30:00.000Z",
      "transactions": [...]
    }
  },
  "sessions": {
    "token-uuid": {
      "accountNumber": "1001",
      "loginTime": "2024-03-09T15:45:00.000Z"
    }
  }
}
```

## Example Test Transactions

After starting the server, try these test accounts:

1. **Account Creation**: 
   - Account: 1001
   - Name: Demo User
   - Email: demo@example.com
   - PIN: 1234

2. **Test Transactions**:
   - Deposit: Add $1000
   - Withdraw: Remove $200
   - Transfer: To another account (create second account first)

## Security Features (Production Use)
⚠️ **Note**: This system is for demonstration purposes. For production use, implement:

- Password encryption (bcrypt)
- Database instead of JSON file (MongoDB, PostgreSQL)
- HTTPS/SSL encryption
- Rate limiting on API endpoints
- Input validation and sanitization
- JWT tokens for session management
- Account lockout after failed attempts
- Two-factor authentication (2FA)
- Transaction encryption

## Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Port already in use
If port 3000 is already in use, modify the `PORT` variable in `server/server.js`

### Can't connect to server
- Make sure the server is running (`npm start`)
- Check that no firewall is blocking port 3000
- Try `http://localhost:3000` in your browser

### Data not persisting
- Check that `accounts.json` exists in the `server` directory
- Ensure the server has write permissions to the directory

## License
This project is for educational purposes.

## Support
For issues or questions, check the console logs in both browser (F12) and terminal.

---

**Happy Banking! 🏦**
