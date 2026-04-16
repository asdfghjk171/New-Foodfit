// ==========================================
// HEALTHFIT - PRODUCTION READY APP.JS
// ==========================================

const AppState = {
    currentUser: null,
    currentPage: 'landing',
    isAuthenticated: false,
    dietPreference: 'all',
    mealPlan: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
    },
    currentMealSlot: null,
    userHealth: {}
};

// ---------- UTILITIES ----------
function safeParse(key, fallback = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch {
        return fallback;
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type} show`;

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ---------- INIT ----------
function initializeApp() {
    setTimeout(() => {
        toggleLoading(false);
        checkAuth();
        setupEventListeners();
        routeInitialPage();
    }, 800);
}

function toggleLoading(show) {
    const loading = document.getElementById('loading-screen');
    const app = document.getElementById('app');
    if (loading) loading.style.display = show ? 'block' : 'none';
    if (app) app.style.display = show ? 'none' : 'block';
}

function routeInitialPage() {
    showPage(AppState.isAuthenticated ? 'dashboard' : 'landing');
}

// ---------- AUTH ----------
function checkAuth() {
    const user = safeParse('currentUser');
    if (!user) return;

    AppState.currentUser = user;
    AppState.isAuthenticated = true;

    AppState.userHealth = safeParse(`health_${user.email}`, {});

    const todayKey = `meal_${user.email}_${getTodayDate()}`;
    AppState.mealPlan = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
        ...safeParse(todayKey, {})
    };
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    AppState.currentUser = null;
    AppState.isAuthenticated = false;

    showToast('Logged out', 'success');
    showPage('landing');
}

// ---------- NAVIGATION ----------
function showPage(pageName) {
    if (!AppState.isAuthenticated && !['landing', 'login', 'signup'].includes(pageName)) {
        return showPage('login');
    }

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    const page = document.getElementById(`${pageName}-page`);
    if (page) page.classList.add('active');

    AppState.currentPage = pageName;

    const navbar = document.getElementById('navbar');
    if (navbar) {
        navbar.style.display = ['landing', 'login', 'signup'].includes(pageName) ? 'none' : 'block';
    }

    if (pageName === 'dashboard') loadDashboard();
    if (pageName === 'meal-planner') loadMealPlanner();
}

// ---------- EVENTS ----------
function setupEventListeners() {
    document.addEventListener('click', (e) => {
        if (e.target.matches('[data-page]')) {
            e.preventDefault();
            showPage(e.target.dataset.page);
        }

        if (e.target.id === 'logout-btn') handleLogout();
    });

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Login handled in auth.js');
        });
    }
}

// ---------- DASHBOARD ----------
function loadDashboard() {
    const nameEl = document.getElementById('user-name-display');
    if (nameEl && AppState.currentUser) {
        nameEl.textContent = AppState.currentUser.name;
    }

    if (AppState.userHealth?.bmi) displayBMIResults();
}

// ---------- MEAL PLANNER ----------
function loadMealPlanner() {
    renderMealPlan();
    setupMealPlannerEvents();
}

function setupMealPlannerEvents() {
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        if (btn.dataset.bound) return;
        btn.dataset.bound = true;

        btn.addEventListener('click', () => {
            document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.dietPreference = btn.dataset.diet;
        });
    });

    const searchBtn = document.getElementById('search-food-btn');
    const searchInput = document.getElementById('food-search');

    if (searchBtn && searchInput) {
        let debounce;
        searchBtn.onclick = () => {
            clearTimeout(debounce);
            debounce = setTimeout(() => {
                if (searchInput.value.trim()) {
                    window.searchFoodAPI?.(searchInput.value.trim());
                }
            }, 300);
        };
    }
}

function renderMealPlan() {
    ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(slot => {
        const container = document.querySelector(`[data-meal="${slot}"] .meal-items`);
        if (!container) return;

        container.innerHTML = '';

        const meals = AppState.mealPlan[slot];
        if (!meals?.length) {
            container.innerHTML = '<p>No meals added</p>';
            return;
        }

        meals.forEach((meal, i) => {
            const el = document.createElement('div');
            el.className = 'meal-item';
            el.innerHTML = `<h5>${meal.name}</h5><button data-remove="${slot}-${i}">X</button>`;
            container.appendChild(el);
        });
    });
}

// ---------- START ----------
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
