import API from '../utils/api.js';

class LoginPage {
    constructor() {
        this.setupForm();
    }

    setupForm() {
        const form = document.getElementById('loginForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await API.login(email, password);
                if (response.success) {
                    // Store auth token
                    localStorage.setItem('authToken', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    
                    // Redirect based on user role
                    if (email === 'yaschraibi16@gmail.com') {
                        window.location.href = '/pages/admin/dashboard.html';
                    } else {
                        window.location.href = '/pages/account/dashboard.html';
                    }
                } else {
                    this.showError('Invalid email or password');
                }
            } catch (error) {
                this.showError('An error occurred. Please try again.');
            }
        });
    }

    showError(message) {
        // Remove any existing error messages
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Create and show new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;

        const submitButton = document.querySelector('.auth-form .btn');
        submitButton.parentNode.insertBefore(errorDiv, submitButton);
    }
}

// Initialize the login page
document.addEventListener('DOMContentLoaded', () => {
    new LoginPage();
}); 