const registerButton = document.getElementById('register');
const loginButton = document.getElementById('login');
const container = document.getElementById('container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

// Toggle between login and register
registerButton.onclick = function() {
    container.className = 'active';
}

loginButton.onclick = function() {
    container.className = 'close';
}

// Handle login form submission
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Get stored users from localStorage
    const users = JSON.parse(localStorage.getItem('srs_cashews_users') || '[]');

    // Find user
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // Store logged in user
        localStorage.setItem('srs_cashews_current_user', JSON.stringify(user));

        // Show success message
        alert('Login successful! Welcome ' + user.name);

        // Redirect to main page
        window.location.href = 'customer.html';
    } else {
        alert('Invalid email or password!');
    }
});

// Handle register form submission
registerForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    // Get stored users from localStorage
    const users = JSON.parse(localStorage.getItem('srs_cashews_users') || '[]');

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
        alert('User with this email already exists!');
        return;
    }

    // Add new user
    const newUser = {
        id: 'user_' + Date.now(),
        name: name,
        email: email,
        password: password,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);

    // Save to localStorage
    localStorage.setItem('srs_cashews_users', JSON.stringify(users));

    // Show success message
    alert('Registration successful! Please login.');

    // Switch to login view
    container.className = 'close';

    // Reset form
    registerForm.reset();
});