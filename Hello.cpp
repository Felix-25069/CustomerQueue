#include <iostream>
using namespace std;

class smallest
{
private:
  float a, b, c, d, s1, s2, s;

public:
  void accept()
  {
    cout << "Enter the 4 numbers";
    cin >> a >> b >> c >> d;
  }
  void compare();
};
void smallest::compare()
{
  s1 = (a < b) ? a : b;
  s2 = (c < d) ? c : d;
  s = (s1 < s2) ? s1 : s2;

  cout << "smallest element is " << s << endl;
};
int main()
{
  smallest sm;
  sm.accept();
  sm.compare();
  return 0;
}
