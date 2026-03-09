#include <iostream>
#include <fstream>
#include <vector>
#include <string>

using namespace std;

struct Account {
    int accountNumber;
    string name;
    int pin;
    double balance;
};

vector<Account> accounts;

void loadAccounts() {
    ifstream file("accounts.txt");

    Account acc;

    while(file >> acc.accountNumber >> acc.name >> acc.pin >> acc.balance) {
        accounts.push_back(acc);
    }

    file.close();
}

void saveAccounts() {
    ofstream file("accounts.txt");

    for(Account acc : accounts) {
        file << acc.accountNumber << " "
             << acc.name << " "
             << acc.pin << " "
             << acc.balance << endl;
    }

    file.close();
}

void recordTransaction(string text) {
    ofstream file("transactions.txt", ios::app);
    file << text << endl;
    file.close();
}

void createAccount() {
    Account acc;

    cout << "Enter account number: ";
    cin >> acc.accountNumber;

    cout << "Enter name: ";
    cin >> acc.name;

    cout << "Set PIN: ";
    cin >> acc.pin;

    cout << "Initial deposit: ";
    cin >> acc.balance;

    accounts.push_back(acc);

    saveAccounts();

    cout << "Account created successfully!\n";
}

int findAccount(int accNumber) {

    for(int i=0;i<accounts.size();i++) {
        if(accounts[i].accountNumber == accNumber)
            return i;
    }

    return -1;
}

bool login(int &index) {

    int accNumber;
    int pin;

    cout << "Account Number: ";
    cin >> accNumber;

    cout << "PIN: ";
    cin >> pin;

    index = findAccount(accNumber);

    if(index != -1 && accounts[index].pin == pin) {
        cout << "Login successful\n";
        return true;
    }

    cout << "Invalid login\n";
    return false;
}

void deposit(int index) {

    double amount;

    cout << "Amount to deposit: ";
    cin >> amount;

    accounts[index].balance += amount;

    recordTransaction(
        "Account " + to_string(accounts[index].accountNumber)
        + " deposited " + to_string(amount)
    );

    saveAccounts();

    cout << "Deposit successful\n";
}

void withdraw(int index) {

    double amount;

    cout << "Amount to withdraw: ";
    cin >> amount;

    if(amount > accounts[index].balance) {
        cout << "Insufficient funds\n";
        return;
    }

    accounts[index].balance -= amount;

    recordTransaction(
        "Account " + to_string(accounts[index].accountNumber)
        + " withdrew " + to_string(amount)
    );

    saveAccounts();

    cout << "Withdrawal successful\n";
}

void transfer(int index) {

    int receiver;
    double amount;

    cout << "Enter receiver account: ";
    cin >> receiver;

    int rIndex = findAccount(receiver);

    if(rIndex == -1) {
        cout << "Receiver account not found\n";
        return;
    }

    cout << "Amount: ";
    cin >> amount;

    if(amount > accounts[index].balance) {
        cout << "Insufficient balance\n";
        return;
    }

    accounts[index].balance -= amount;
    accounts[rIndex].balance += amount;

    recordTransaction(
        "Transfer " + to_string(amount)
        + " from " + to_string(accounts[index].accountNumber)
        + " to " + to_string(receiver)
    );

    saveAccounts();

    cout << "Transfer successful\n";
}

void showBalance(int index) {

    cout << "Current Balance: "
         << accounts[index].balance << endl;
}

void viewTransactions() {

    ifstream file("transactions.txt");

    string line;

    while(getline(file,line)) {
        cout << line << endl;
    }

    file.close();
}

void adminPanel() {

    cout << "\n---- ADMIN PANEL ----\n";

    for(Account acc : accounts) {

        cout << "Account: " << acc.accountNumber
             << " Name: " << acc.name
             << " Balance: " << acc.balance
             << endl;
    }
}

void atmMenu(int index) {

    int choice;

    do {

        cout << "\n---- ATM MENU ----\n";
        cout << "1 Deposit\n";
        cout << "2 Withdraw\n";
        cout << "3 Transfer\n";
        cout << "4 Balance\n";
        cout << "5 Transactions\n";
        cout << "6 Logout\n";
        cout << "Choice: ";

        cin >> choice;

        switch(choice) {

            case 1:
                deposit(index);
                break;

            case 2:
                withdraw(index);
                break;

            case 3:
                transfer(index);
                break;

            case 4:
                showBalance(index);
                break;

            case 5:
                viewTransactions();
                break;

        }

    } while(choice != 6);
}

int main() {

    loadAccounts();

    int choice;

    do {

        cout << "\n===== BANK SYSTEM =====\n";
        cout << "1 Create Account\n";
        cout << "2 Login\n";
        cout << "3 Admin Panel\n";
        cout << "4 Exit\n";
        cout << "Choice: ";

        cin >> choice;

        if(choice == 1)
            createAccount();

        else if(choice == 2) {

            int index;

            if(login(index))
                atmMenu(index);
        }

        else if(choice == 3)
            adminPanel();

    }

    while(choice != 4);

    return 0;
}