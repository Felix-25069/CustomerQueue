#include <iostream>
#include <fstream>
#include <map>
#include <vector>
#include <string>
#include <iomanip>
#include <ctime>

using namespace std;

struct Transaction {
    string type;        // "DEPOSIT", "WITHDRAW", "TRANSFER"
    double amount;
    string timestamp;
    string description;
};

struct Account {
    int accountNumber;
    string name;
    string pin;
    double balance;
    vector<Transaction> transactions;
};

map<int, Account> accounts;

// Helper function to get current timestamp
string getTimestamp() {
    time_t now = time(0);
    char buffer[80];
    strftime(buffer, sizeof(buffer), "%Y-%m-%d %H:%M:%S", localtime(&now));
    return string(buffer);
}

// Load accounts from file
void loadAccounts() {
    ifstream file("accounts.txt");
    if (!file.is_open()) {
        cout << "No existing accounts file. Starting fresh.\n";
        return;
    }

    int accNum;
    string name, pin;
    double balance;

    while (file >> accNum >> name >> pin >> balance) {
        accounts[accNum] = {accNum, name, pin, balance, {}};
    }
    file.close();
}

// Save accounts to file
void saveAccounts() {
    ofstream file("accounts.txt");
    for (auto& pair : accounts) {
        Account& acc = pair.second;
        file << acc.accountNumber << " " << acc.name << " " 
             << acc.pin << " " << acc.balance << "\n";
    }
    file.close();
}

// Record transaction to transaction history
void recordTransaction(int accountNum, const Transaction& trans) {
    if (accounts.find(accountNum) != accounts.end()) {
        accounts[accountNum].transactions.push_back(trans);
    }
}

// Create new account
void createAccount() {
    int accNum;
    string name, pin;

    cout << "\n=== Create New Account ===\n";
    cout << "Enter account number: ";
    cin >> accNum;

    if (accounts.find(accNum) != accounts.end()) {
        cout << "Account already exists!\n";
        return;
    }

    cout << "Enter account holder name: ";
    cin.ignore();
    getline(cin, name);
    cout << "Enter PIN (4 digits): ";
    cin >> pin;

    accounts[accNum] = {accNum, name, pin, 0.0, {}};
    saveAccounts();
    cout << "Account created successfully!\n";
}

// Deposit money
void deposit() {
    int accNum;
    double amount;

    cout << "\n=== Deposit ===\n";
    cout << "Enter account number: ";
    cin >> accNum;

    if (accounts.find(accNum) == accounts.end()) {
        cout << "Account not found!\n";
        return;
    }

    cout << "Enter PIN: ";
    string pin;
    cin >> pin;

    if (accounts[accNum].pin != pin) {
        cout << "Invalid PIN!\n";
        return;
    }

    cout << "Enter amount to deposit: ";
    cin >> amount;

    if (amount <= 0) {
        cout << "Invalid amount!\n";
        return;
    }

    accounts[accNum].balance += amount;
    Transaction trans = {"DEPOSIT", amount, getTimestamp(), "Cash deposit"};
    recordTransaction(accNum, trans);
    saveAccounts();

    cout << "Deposit successful! New balance: $" << fixed << setprecision(2) 
         << accounts[accNum].balance << "\n";
}

// Withdraw money
void withdraw() {
    int accNum;
    double amount;

    cout << "\n=== Withdraw ===\n";
    cout << "Enter account number: ";
    cin >> accNum;

    if (accounts.find(accNum) == accounts.end()) {
        cout << "Account not found!\n";
        return;
    }

    cout << "Enter PIN: ";
    string pin;
    cin >> pin;

    if (accounts[accNum].pin != pin) {
        cout << "Invalid PIN!\n";
        return;
    }

    cout << "Enter amount to withdraw: ";
    cin >> amount;

    if (amount <= 0) {
        cout << "Invalid amount!\n";
        return;
    }

    if (amount > accounts[accNum].balance) {
        cout << "Insufficient balance!\n";
        return;
    }

    accounts[accNum].balance -= amount;
    Transaction trans = {"WITHDRAW", amount, getTimestamp(), "Cash withdrawal"};
    recordTransaction(accNum, trans);
    saveAccounts();

    cout << "Withdrawal successful! New balance: $" << fixed << setprecision(2) 
         << accounts[accNum].balance << "\n";
}

// Check balance
void checkBalance() {
    int accNum;

    cout << "\n=== Check Balance ===\n";
    cout << "Enter account number: ";
    cin >> accNum;

    if (accounts.find(accNum) == accounts.end()) {
        cout << "Account not found!\n";
        return;
    }

    cout << "Enter PIN: ";
    string pin;
    cin >> pin;

    if (accounts[accNum].pin != pin) {
        cout << "Invalid PIN!\n";
        return;
    }

    cout << "\nAccount Holder: " << accounts[accNum].name << "\n";
    cout << "Balance: $" << fixed << setprecision(2) << accounts[accNum].balance << "\n";
}

// View transaction history
void viewTransactions() {
    int accNum;

    cout << "\n=== Transaction History ===\n";
    cout << "Enter account number: ";
    cin >> accNum;

    if (accounts.find(accNum) == accounts.end()) {
        cout << "Account not found!\n";
        return;
    }

    cout << "Enter PIN: ";
    string pin;
    cin >> pin;

    if (accounts[accNum].pin != pin) {
        cout << "Invalid PIN!\n";
        return;
    }

    Account& acc = accounts[accNum];
    cout << "\n=== Transactions for " << acc.name << " ===\n";

    if (acc.transactions.empty()) {
        cout << "No transactions yet.\n";
        return;
    }

    for (const auto& trans : acc.transactions) {
        cout << trans.type << " | Amount: $" << fixed << setprecision(2) 
             << trans.amount << " | " << trans.timestamp << "\n";
    }
}

// Transfer money between accounts
void transfer() {
    int fromAcc, toAcc;
    double amount;

    cout << "\n=== Transfer Money ===\n";
    cout << "Enter from account number: ";
    cin >> fromAcc;

    if (accounts.find(fromAcc) == accounts.end()) {
        cout << "Account not found!\n";
        return;
    }

    cout << "Enter PIN: ";
    string pin;
    cin >> pin;

    if (accounts[fromAcc].pin != pin) {
        cout << "Invalid PIN!\n";
        return;
    }

    cout << "Enter to account number: ";
    cin >> toAcc;

    if (accounts.find(toAcc) == accounts.end()) {
        cout << "Recipient account not found!\n";
        return;
    }

    cout << "Enter amount to transfer: ";
    cin >> amount;

    if (amount <= 0) {
        cout << "Invalid amount!\n";
        return;
    }

    if (amount > accounts[fromAcc].balance) {
        cout << "Insufficient balance!\n";
        return;
    }

    accounts[fromAcc].balance -= amount;
    accounts[toAcc].balance += amount;

    Transaction fromTrans = {"TRANSFER", amount, getTimestamp(), "Transfer to account " + to_string(toAcc)};
    Transaction toTrans = {"TRANSFER", amount, getTimestamp(), "Transfer from account " + to_string(fromAcc)};

    recordTransaction(fromAcc, fromTrans);
    recordTransaction(toAcc, toTrans);
    saveAccounts();

    cout << "Transfer successful!\n";
    cout << "Your new balance: $" << fixed << setprecision(2) << accounts[fromAcc].balance << "\n";
}

// Main menu
void displayMenu() {
    cout << "\n========== BANKING SYSTEM ==========\n";
    cout << "1. Create Account\n";
    cout << "2. Deposit Money\n";
    cout << "3. Withdraw Money\n";
    cout << "4. Check Balance\n";
    cout << "5. Transfer Money\n";
    cout << "6. View Transaction History\n";
    cout << "7. Exit\n";
    cout << "====================================\n";
    cout << "Enter choice: ";
}

int main() {
    loadAccounts();

    int choice;
    while (true) {
        displayMenu();
        cin >> choice;

        switch (choice) {
            case 1:
                createAccount();
                break;
            case 2:
                deposit();
                break;
            case 3:
                withdraw();
                break;
            case 4:
                checkBalance();
                break;
            case 5:
                transfer();
                break;
            case 6:
                viewTransactions();
                break;
            case 7:
                cout << "Thank you for using our banking system!\n";
                return 0;
            default:
                cout << "Invalid choice! Please try again.\n";
        }
    }

    return 0;
}