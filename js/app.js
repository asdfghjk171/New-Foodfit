// ==========================================
// HEALTHFIT - FIXED PRODUCTION APP.JS
// ==========================================

const AppState = {
    currentUser: null,
    currentPage: 'landing',
    isAuthenticated: false,
    mealPlan: { breakfast: [], lunch: [], dinner: [], snacks: [] },
    userHealth: {}
};

// ---------- SAFE PARSE ----------
function safeParse(key, fallback = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch {
        return fallback;
    }
}

// ---------- INIT ----------
function initializeApp() {
    setTimeout(() => {
        toggleLoading(false);
        checkAuth();
        setupEvents();
        showPage(AppState.isAuthenticated ? 'dashboard' : 'landing');
    }, 800);
}

function toggleLoading(show) {
    const loading = document.getElementById('loading-screen');
    const app = document.getElementById('app');
    if (loading) loading.style.display = show ? 'block' : 'none';
    if (app) app.style.display = show ? 'none' : 'block';
}

// ---------- AUTH ----------
function checkAuth() {
    const user = safeParse('currentUser');
    if (!user) return;

    AppState.currentUser = user;
    AppState.isAuthenticated = true;
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    AppState.isAuthenticated = false;
    showPage('landing');
}

// ---------- NAVIGATION FIX ----------
function showPage(pageName) {
    // FIX: prevent multiple page stacking
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none';
    });

    const page = document.getElementById(`${pageName}-page`);
    if (page) {
        page.classList.add('active');
        page.style.display = 'block';
    }

    const navbar = document.getElementById('navbar');
    if (navbar) {
        navbar.style.display = ['landing','login','signup'].includes(pageName) ? 'none' : 'block';
    }

    if (pageName === 'dashboard') loadDashboard();
    if (pageName === 'meal-planner') loadMealPlanner();
}

// ---------- EVENTS ----------
function setupEvents() {
    document.addEventListener('click', (e) => {
        const nav = e.target.closest('[data-page]');
        if (nav) {
            e.preventDefault();
            showPage(nav.dataset.page);
        }

        if (e.target.id === 'logout-btn') handleLogout();

        const card = e.target.closest('.feature-card');
        if (card && card.dataset.page) {
            showPage(card.dataset.page);
        }
    });
}

// ---------- BMI FIX ----------
function loadDashboard() {
    const btn = document.getElementById('calculate-bmi-btn');
    if (!btn || btn.dataset.bound) return;

    btn.dataset.bound = true;

    btn.addEventListener('click', (e) => {
        e.preventDefault();

        const h = parseFloat(document.getElementById('height').value);
        const w = parseFloat(document.getElementById('weight').value);
        const age = parseFloat(document.getElementById('age').value);
        const gender = document.getElementById('gender').value;

        if (!h || !w || !age) {
            alert('Enter valid values');
            return;
        }

        const bmi = w / ((h/100)*(h/100));
        let category = '';

        if (bmi < 18.5) category = 'Underweight';
        else if (bmi < 25) category = 'Normal';
        else if (bmi < 30) category = 'Overweight';
        else category = 'Obese';

        const bmr = gender === 'male'
            ? 10*w + 6.25*h - 5*age + 5
            : 10*w + 6.25*h - 5*age - 161;

        document.getElementById('bmi-results').style.display = 'block';
        document.getElementById('bmi-value').textContent = bmi.toFixed(1);
        document.getElementById('bmi-category').textContent = category;
        document.getElementById('bmr-value').textContent = Math.round(bmr);

        generateCharts(bmi, bmr);
    });
}

// ---------- CHART FIX ----------
function generateCharts(bmi, bmr) {
    if (typeof Chart === 'undefined') return;

    const ctx1 = document.getElementById('macros-chart');
    const ctx2 = document.getElementById('calories-chart');

    if (!ctx1 || !ctx2) return;

    new Chart(ctx1, {
        type: 'doughnut',
        data: {
            labels: ['Protein','Carbs','Fat'],
            datasets: [{
                data: [30,50,20], // FIXED realistic data
                backgroundColor: ['#10b981','#3b82f6','#f59e0b']
            }]
        }
    });

    new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: ['Breakfast','Lunch','Dinner','Snacks'],
            datasets: [{
                data: [bmr*0.25,bmr*0.35,bmr*0.3,bmr*0.1],
                backgroundColor: '#3b82f6'
            }]
        }
    });
}

// ---------- MEAL PLANNER FIX ----------
function loadMealPlanner() {
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        if (btn.dataset.bound) return;
        btn.dataset.bound = true;

        btn.addEventListener('click', () => {
            document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// ---------- START ----------
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
