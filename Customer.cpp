#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main()
{
    vector<string> customers;
    int choice;
    string name;

    do
    {
        cout << "\n1. Add Customer\n";
        cout << "2. Show Next Customer\n";
        cout << "3. Show Line Length\n";
        cout << "4. Check People Ahead\n";
        cout << "5. Exit\n";
        cout << "Enter choice: ";
        cin >> choice;

        if (choice == 1)
        {
            cout << "Enter name: ";
            cin >> name;
            customers.push_back(name);
            cout << "Customer added.\n";
        }

        else if (choice == 2)
        {
            if (customers.size() > 0)
                cout << "Next customer: " << customers[0] << endl;
            else
                cout << "Line is empty.\n";
        }

        else if (choice == 3)
        {
            cout << "Total customers: " << customers.size() << endl;
        }

        else if (choice == 4)
        {
            cout << "Enter name to search: ";
            cin >> name;

            int position = -1;

            for (int i = 0; i < customers.size(); i++)
            {
                if (customers[i] == name)
                {
                    position = i;
                    break;
                }
            }

            if (position != -1)
                cout << position << " people are ahead.\n";
            else
                cout << "Customer not found.\n";
        }

    } while (choice != 5);

    return 0;
}