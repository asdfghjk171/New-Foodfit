// ==========================================
// HEALTHFIT - AUTHENTICATION (FIXED - No duplicate popups)
// ==========================================

function initializeAuth() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    // Use onsubmit to prevent duplicate listeners
    if (loginForm) loginForm.onsubmit = handleLogin;
    if (signupForm) signupForm.onsubmit = handleSignup;
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) { showToast('Please fill in all fields', 'error'); return; }
    if (!isValidEmail(email)) { showToast('Please enter a valid email', 'error'); return; }

    let users = [];
    try { users = JSON.parse(localStorage.getItem('users') || '[]'); } catch (e) { users = []; }

    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        AppState.currentUser = { name: user.name, email: user.email };
        AppState.isAuthenticated = true;
        localStorage.setItem('currentUser', JSON.stringify(AppState.currentUser));
        showToast('Welcome back, ' + user.name + '!', 'success');
        e.target.reset();
        showPage('dashboard');
    } else {
        showToast('Invalid email or password', 'error');
    }
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    if (!name || !email || !password) { showToast('Please fill in all fields', 'error'); return; }
    if (!isValidEmail(email)) { showToast('Please enter a valid email', 'error'); return; }
    if (password.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }

    let users = [];
    try { users = JSON.parse(localStorage.getItem('users') || '[]'); } catch (e) { users = []; }

    if (users.some(u => u.email === email)) { showToast('Email already registered. Please login.', 'error'); return; }

    users.push({ name: name, email: email, password: password, createdAt: new Date().toISOString() });
    localStorage.setItem('users', JSON.stringify(users));

    AppState.currentUser = { name: name, email: email };
    AppState.isAuthenticated = true;
    localStorage.setItem('currentUser', JSON.stringify(AppState.currentUser));

    showToast('Account created! Welcome, ' + name + '!', 'success');
    e.target.reset();
    showPage('dashboard');
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
