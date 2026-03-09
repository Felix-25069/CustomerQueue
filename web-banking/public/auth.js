function toggleForms() {
    const loginSection = document.getElementById('loginSection');
    const registerSection = document.getElementById('registerSection');
    const alertMessage = document.getElementById('alertMessage');

    loginSection.classList.toggle('active');
    registerSection.classList.toggle('active');
    alertMessage.style.display = 'none';
}

function showAlert(message, type) {
    const alertMessage = document.getElementById('alertMessage');
    alertMessage.textContent = message;
    alertMessage.className = `alert-custom alert-${type}`;
    alertMessage.style.display = 'block';

    if (type === 'success') {
        setTimeout(() => {
            alertMessage.style.display = 'none';
        }, 3000);
    }
}

// Login Form
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const accountNumber = document.getElementById('loginAccountNumber').value;
    const pin = document.getElementById('loginPin').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accountNumber, pin })
        });

        const data = await response.json();

        if (!response.ok) {
            showAlert(data.error, 'error');
            return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('account', JSON.stringify(data.account));
        showAlert('Login successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } catch (error) {
        showAlert('Error: ' + error.message, 'error');
    }
});

// Register Form
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const accountNumber = document.getElementById('registerAccountNumber').value;
    const pin = document.getElementById('registerPin').value;
    const confirmPin = document.getElementById('confirmPin').value;

    if (pin !== confirmPin) {
        showAlert('PINs do not match!', 'error');
        return;
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        showAlert('PIN must be exactly 4 digits!', 'error');
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accountNumber, name, email, pin })
        });

        const data = await response.json();

        if (!response.ok) {
            showAlert(data.error, 'error');
            return;
        }

        showAlert('Account created! Redirecting to login...', 'success');
        setTimeout(() => {
            toggleForms();
            document.getElementById('registerForm').reset();
        }, 2000);
    } catch (error) {
        showAlert('Error: ' + error.message, 'error');
    }
});
