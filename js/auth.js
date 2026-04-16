// ==========================================
// HEALTHFIT - AUTHENTICATION LOGIC
// ==========================================

// Initialize Auth Event Listeners
function initializeAuth() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}

// Handle Login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    // Validate inputs
    if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showToast('Please enter a valid email', 'error');
        return;
    }
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Set current user
        AppState.currentUser = {
            name: user.name,
            email: user.email
        };
        AppState.isAuthenticated = true;
        
        localStorage.setItem('currentUser', JSON.stringify(AppState.currentUser));
        
        showToast(`Welcome back, ${user.name}!`, 'success');
        
        // Reset form
        e.target.reset();
        
        // Redirect to dashboard
        setTimeout(() => {
            showPage('dashboard');
        }, 500);
    } else {
        showToast('Invalid email or password', 'error');
    }
}

// Handle Signup
function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    
    // Validate inputs
    if (!name || !email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showToast('Please enter a valid email', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user already exists
    if (users.some(u => u.email === email)) {
        showToast('Email already registered', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        name,
        email,
        password,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Set current user
    AppState.currentUser = {
        name: newUser.name,
        email: newUser.email
    };
    AppState.isAuthenticated = true;
    
    localStorage.setItem('currentUser', JSON.stringify(AppState.currentUser));
    
    showToast(`Account created successfully! Welcome, ${name}!`, 'success');
    
    // Reset form
    e.target.reset();
    
    // Redirect to dashboard
    setTimeout(() => {
        showPage('dashboard');
    }, 500);
}

// Validate Email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Initialize auth when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuth);
} else {
    initializeAuth();
}
