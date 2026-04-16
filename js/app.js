// ==========================================
// HEALTHFIT - MAIN APPLICATION LOGIC (FIXED)
// ==========================================

const AppState = {
    currentUser: null,
    currentPage: 'landing',
    isAuthenticated: false,
    dietPreference: 'all',
    selectedFoods: [],
    mealPlan: { breakfast: [], lunch: [], dinner: [], snacks: [] },
    currentMealSlot: null,
    userHealth: { height: null, weight: null, age: null, gender: null, bmi: null, bmr: null, category: null },
    weekOffset: 0,
    _initialized: false
};

// Single initialization entry point - prevents duplicate listeners
function initializeApp() {
    if (AppState._initialized) return;
    AppState._initialized = true;

    setTimeout(() => {
        const ls = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        if (ls) ls.style.display = 'none';
        if (app) app.style.display = 'block';

        checkAuth();
        setupEventListeners();
        initializeAuth();
        initializeDashboard();

        if (AppState.isAuthenticated) {
            showPage('dashboard');
        } else {
            showPage('landing');
        }
    }, 800);
}

function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        try {
            AppState.currentUser = JSON.parse(user);
            AppState.isAuthenticated = true;
            const healthData = localStorage.getItem('health_' + AppState.currentUser.email);
            if (healthData) AppState.userHealth = JSON.parse(healthData);
            const todaysMeal = localStorage.getItem('meal_' + AppState.currentUser.email + '_' + getTodayDate());
            if (todaysMeal) AppState.mealPlan = JSON.parse(todaysMeal);
        } catch (e) {
            localStorage.removeItem('currentUser');
            AppState.isAuthenticated = false;
        }
    }
}

function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

function setupEventListeners() {
    // Landing buttons
    const gs = document.getElementById('get-started-btn');
    const lb = document.getElementById('login-btn');
    if (gs) gs.addEventListener('click', () => showPage('signup'));
    if (lb) lb.addEventListener('click', () => showPage('login'));

    // Auth toggles
    const ss = document.getElementById('show-signup');
    const sl = document.getElementById('show-login');
    if (ss) ss.addEventListener('click', (e) => { e.preventDefault(); showPage('signup'); });
    if (sl) sl.addEventListener('click', (e) => { e.preventDefault(); showPage('login'); });

    // Nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            showPage(page);
        });
    });

    // Logout
    const lo = document.getElementById('logout-btn');
    if (lo) lo.addEventListener('click', handleLogout);

    // Profile image upload
    const piu = document.getElementById('profile-image-upload');
    if (piu) piu.addEventListener('change', handleProfileImageUpload);

    // Save meal plan
    const smp = document.getElementById('save-meal-plan');
    if (smp) smp.addEventListener('click', saveMealPlan);

    // Download PDF
    const dp = document.getElementById('download-pdf');
    if (dp) dp.addEventListener('click', () => { if (typeof generatePDF === 'function') generatePDF(); });
}

// Show Page - single source of truth for page visibility
function showPage(pageName) {
    // Hide ALL pages first
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Show requested page
    const page = document.getElementById(pageName + '-page');
    if (page) {
        page.classList.add('active');
        AppState.currentPage = pageName;
    }

    // Navbar visibility
    const navbar = document.getElementById('navbar');
    const authPages = ['landing', 'login', 'signup'];
    if (navbar) {
        navbar.style.display = authPages.includes(pageName) ? 'none' : 'block';
    }

    // Update nav active state
    document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.toggle('active', l.getAttribute('data-page') === pageName);
    });

    // Load page data
    switch (pageName) {
        case 'dashboard': loadDashboard(); break;
        case 'meal-planner': loadMealPlanner(); break;
        case 'weekly-plan': if (typeof loadWeeklyPlan === 'function') loadWeeklyPlan(); break;
        case 'history': loadHistory(); break;
        case 'profile': loadProfile(); break;
    }
}

function loadDashboard() {
    if (!AppState.currentUser) return;
    const dn = document.getElementById('user-name-display');
    if (dn) dn.textContent = AppState.currentUser.name;

    // Update quick stats
    updateQuickStats();

    // Show BMI results if available
    if (AppState.userHealth.bmi) {
        displayBMIResults();
        populateBMIForm();
    }

    // Initialize charts
    if (typeof initializeCharts === 'function') initializeCharts();

    // Load recommended foods
    if (typeof loadRecommendedFoods === 'function') loadRecommendedFoods();
}

function updateQuickStats() {
    const qsBmi = document.getElementById('qs-bmi');
    const qsBmr = document.getElementById('qs-bmr');
    const qsMeals = document.getElementById('qs-meals');
    const qsCal = document.getElementById('qs-calories');

    if (qsBmi) qsBmi.textContent = AppState.userHealth.bmi ? AppState.userHealth.bmi.toFixed(1) : '--';
    if (qsBmr) qsBmr.textContent = AppState.userHealth.bmr ? Math.round(AppState.userHealth.bmr) : '--';

    let totalMeals = 0, totalCal = 0;
    Object.values(AppState.mealPlan).forEach(meals => {
        totalMeals += meals.length;
        meals.forEach(m => { totalCal += parseFloat(m.calories) || 0; });
    });
    if (qsMeals) qsMeals.textContent = totalMeals;
    if (qsCal) qsCal.textContent = Math.round(totalCal);
}

function populateBMIForm() {
    const h = AppState.userHealth;
    if (h.height) { const el = document.getElementById('height'); if (el) el.value = h.height; }
    if (h.weight) { const el = document.getElementById('weight'); if (el) el.value = h.weight; }
    if (h.age) { const el = document.getElementById('age'); if (el) el.value = h.age; }
    if (h.gender) { const el = document.getElementById('gender'); if (el) el.value = h.gender; }
}

function loadMealPlanner() {
    renderMealPlan();
    setupDietToggle();
    setupFoodSearch();
    if (typeof loadPopularFoods === 'function') loadPopularFoods();
}

function setupDietToggle() {
    document.querySelectorAll('.toggle-btn[data-diet]').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.toggle-btn[data-diet]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.dietPreference = btn.getAttribute('data-diet');
            showToast('Filter: ' + AppState.dietPreference, 'success');
            // Refresh popular foods with new filter
            if (typeof loadPopularFoods === 'function') loadPopularFoods();
        };
    });
}

function setupFoodSearch() {
    const searchBtn = document.getElementById('search-food-btn');
    const searchInput = document.getElementById('food-search');

    if (searchBtn) {
        searchBtn.onclick = () => {
            const query = searchInput ? searchInput.value.trim() : '';
            if (query) {
                if (typeof searchFoodDatabase === 'function') searchFoodDatabase(query);
            } else {
                showToast('Please enter a food name to search', 'warning');
            }
        };
    }

    if (searchInput) {
        searchInput.onkeypress = (e) => { if (e.key === 'Enter' && searchBtn) searchBtn.click(); };
    }
}

function setMealSlot(slot) {
    AppState.currentMealSlot = slot;
    // Highlight active slot
    document.querySelectorAll('.meal-slot').forEach(s => s.classList.remove('slot-active'));
    const slotEl = document.querySelector('[data-meal="' + slot + '"]');
    if (slotEl) slotEl.classList.add('slot-active');
    showToast('Adding to ' + slot + '. Search or click a food item.', 'info');
}

function renderMealPlan() {
    ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(slot => {
        const container = document.getElementById(slot + '-items');
        if (!container) return;
        container.innerHTML = '';

        const meals = AppState.mealPlan[slot];
        if (meals && meals.length > 0) {
            meals.forEach((meal, index) => {
                const div = document.createElement('div');
                div.className = 'meal-item';
                div.innerHTML = '<div class="meal-item-info"><h5>' + meal.name + '</h5><p>' +
                    (meal.calories || 0) + ' kcal | P: ' + (meal.protein || 0) + 'g | C: ' +
                    (meal.carbs || 0) + 'g | F: ' + (meal.fat || 0) + 'g</p></div>' +
                    '<button class="btn-remove-meal" onclick="removeMealItem(\'' + slot + '\',' + index + ')" data-testid="remove-' + slot + '-' + index + '"><i class="fas fa-times"></i></button>';
                container.appendChild(div);
            });
        } else {
            container.innerHTML = '<div class="empty-meal">No meals added yet</div>';
        }

        // Update calorie badge
        const calBadge = document.getElementById(slot + '-cal');
        if (calBadge) {
            const cal = meals ? meals.reduce((s, m) => s + (parseFloat(m.calories) || 0), 0) : 0;
            calBadge.textContent = Math.round(cal) + ' kcal';
        }
    });

    updateMealSummary();
}

function updateMealSummary() {
    let tCal = 0, tP = 0, tC = 0, tF = 0;
    Object.values(AppState.mealPlan).forEach(meals => {
        meals.forEach(m => {
            tCal += parseFloat(m.calories) || 0;
            tP += parseFloat(m.protein) || 0;
            tC += parseFloat(m.carbs) || 0;
            tF += parseFloat(m.fat) || 0;
        });
    });

    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    el('total-cal', Math.round(tCal) + ' kcal');
    el('total-protein', Math.round(tP) + 'g');
    el('total-carbs', Math.round(tC) + 'g');
    el('total-fat', Math.round(tF) + 'g');
}

function removeMealItem(slot, index) {
    AppState.mealPlan[slot].splice(index, 1);
    renderMealPlan();
    if (typeof updateChartsWithHealthData === 'function') updateChartsWithHealthData();
    updateQuickStats();
    showToast('Item removed', 'success');
}

function saveMealPlan() {
    if (!AppState.currentUser) {
        showToast('Please login to save meal plan', 'error');
        return;
    }

    var saveDate = AppState._editingDate || getTodayDate();
    localStorage.setItem('meal_' + AppState.currentUser.email + '_' + saveDate, JSON.stringify(AppState.mealPlan));

    // Save to history
    var historyKey = 'history_' + AppState.currentUser.email;
    var history = [];
    try { history = JSON.parse(localStorage.getItem(historyKey) || '[]'); } catch (e) { history = []; }

    var historyItem = {
        date: saveDate,
        timestamp: new Date().toISOString(),
        type: 'meal_plan',
        data: JSON.parse(JSON.stringify(AppState.mealPlan))
    };

    var existingIdx = history.findIndex(function(i) { return i.date === saveDate && i.type === 'meal_plan'; });
    if (existingIdx >= 0) { history[existingIdx] = historyItem; }
    else { history.unshift(historyItem); }

    history = history.slice(0, 60);
    localStorage.setItem(historyKey, JSON.stringify(history));

    // Clear editing date
    AppState._editingDate = null;

    showToast('Meal plan saved for ' + saveDate + '!', 'success');
}

function loadHistory() {
    if (!AppState.currentUser) return;
    const historyKey = 'history_' + AppState.currentUser.email;
    let history = [];
    try { history = JSON.parse(localStorage.getItem(historyKey) || '[]'); } catch (e) { history = []; }

    const container = document.getElementById('history-content');
    if (!container) return;

    if (history.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-clock-rotate-left"></i><p>No history yet. Save a meal plan to see it here!</p></div>';
        return;
    }

    container.innerHTML = '';
    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        const date = new Date(item.timestamp);
        const formatted = date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

        let totalMeals = 0;
        let totalCal = 0;
        if (item.data) {
            Object.values(item.data).forEach(meals => {
                totalMeals += meals.length;
                meals.forEach(m => { totalCal += parseFloat(m.calories) || 0; });
            });
        }

        div.innerHTML = '<div class="history-item-header"><h3>' + item.date + '</h3><span class="history-date">' + formatted + '</span></div>' +
            '<div class="history-item-content"><p>' + totalMeals + ' meals planned | ' + Math.round(totalCal) + ' kcal total</p>' +
            '<div class="history-meal-counts">' +
            '<span class="history-meal-count">Breakfast: ' + (item.data.breakfast ? item.data.breakfast.length : 0) + '</span>' +
            '<span class="history-meal-count">Lunch: ' + (item.data.lunch ? item.data.lunch.length : 0) + '</span>' +
            '<span class="history-meal-count">Dinner: ' + (item.data.dinner ? item.data.dinner.length : 0) + '</span>' +
            '<span class="history-meal-count">Snacks: ' + (item.data.snacks ? item.data.snacks.length : 0) + '</span></div></div>';

        container.appendChild(div);
    });
}

function loadProfile() {
    if (!AppState.currentUser) return;

    const pn = document.getElementById('profile-name');
    const pe = document.getElementById('profile-email');
    const pi = document.getElementById('profile-image');

    if (pn) pn.textContent = AppState.currentUser.name;
    if (pe) pe.textContent = AppState.currentUser.email;

    // Profile image
    const savedImg = localStorage.getItem('profile_image_' + AppState.currentUser.email);
    if (savedImg && pi) {
        pi.src = savedImg;
    } else if (pi) {
        pi.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(AppState.currentUser.name) + '&background=16a34a&color=fff&size=150';
    }

    // Stats
    const historyKey = 'history_' + AppState.currentUser.email;
    let history = [];
    try { history = JSON.parse(localStorage.getItem(historyKey) || '[]'); } catch (e) { history = []; }

    const mpc = document.getElementById('meal-plans-count');
    const da = document.getElementById('days-active');
    const tml = document.getElementById('total-meals-logged');

    if (mpc) mpc.textContent = history.filter(i => i.type === 'meal_plan').length;
    if (da) da.textContent = [...new Set(history.map(i => i.date))].length;
    if (tml) {
        let total = 0;
        history.forEach(i => {
            if (i.data) Object.values(i.data).forEach(m => { total += m.length; });
        });
        tml.textContent = total;
    }
}

function handleProfileImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('Image must be under 2MB', 'error'); return; }
    if (!file.type.startsWith('image/')) { showToast('Please upload an image', 'error'); return; }

    const reader = new FileReader();
    reader.onload = (e) => {
        localStorage.setItem('profile_image_' + AppState.currentUser.email, e.target.result);
        const pi = document.getElementById('profile-image');
        if (pi) pi.src = e.target.result;
        showToast('Profile image updated!', 'success');
    };
    reader.readAsDataURL(file);
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    AppState.currentUser = null;
    AppState.isAuthenticated = false;
    AppState.userHealth = { height: null, weight: null, age: null, gender: null, bmi: null, bmr: null, category: null };
    AppState.mealPlan = { breakfast: [], lunch: [], dinner: [], snacks: [] };
    showToast('Logged out successfully', 'success');
    showPage('landing');
}

function showToast(message, type) {
    type = type || 'info';
    const toast = document.getElementById('toast');
    if (!toast) return;

    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    toast.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + '"></i> ' + message;
    toast.className = 'toast ' + type + ' show';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

function displayBMIResults() {
    const rd = document.getElementById('bmi-results');
    const bv = document.getElementById('bmi-value');
    const brv = document.getElementById('bmr-value');
    const bc = document.getElementById('bmi-category');
    const sl = document.getElementById('suggestions-list');
    const tv = document.getElementById('target-value');
    const tl = document.getElementById('target-label');

    if (rd) rd.style.display = 'block';
    if (bv) bv.textContent = AppState.userHealth.bmi.toFixed(1);
    if (brv) brv.textContent = Math.round(AppState.userHealth.bmr);
    if (bc) {
        bc.textContent = AppState.userHealth.category;
        bc.style.color = getCategoryColor(AppState.userHealth.category);
    }

    // BMI Gauge position
    const gauge = document.getElementById('bmi-gauge');
    if (gauge) {
        const bmi = AppState.userHealth.bmi;
        const pct = Math.min(Math.max((bmi - 10) / 35 * 100, 2), 98);
        gauge.style.setProperty('--gauge-pos', pct + '%');
        const style = document.createElement('style');
        style.textContent = '.bmi-gauge::after { left: ' + pct + '% !important; }';
        gauge.appendChild(style);
    }

    // Daily target
    const bmr = AppState.userHealth.bmr;
    const bmi = AppState.userHealth.bmi;
    let target = Math.round(bmr * 1.2);
    let label = 'maintain weight';
    if (bmi < 18.5) { target = Math.round(bmr * 1.2 + 400); label = 'healthy gain'; }
    else if (bmi >= 25 && bmi < 30) { target = Math.round(bmr * 1.2 - 400); label = 'gradual loss'; }
    else if (bmi >= 30) { target = Math.round(bmr * 1.2 - 500); label = 'weight loss'; }

    if (tv) tv.textContent = target;
    if (tl) tl.textContent = 'cal/day (' + label + ')';

    // Suggestions
    if (sl) {
        sl.innerHTML = '';
        generateHealthSuggestions().forEach(s => {
            const li = document.createElement('li');
            li.textContent = s;
            sl.appendChild(li);
        });
    }
}

function getCategoryColor(cat) {
    if (cat === 'Underweight') return '#0ea5e9';
    if (cat === 'Normal Weight') return '#22c55e';
    if (cat === 'Overweight') return '#f59e0b';
    return '#ef4444';
}

function generateHealthSuggestions() {
    var bmi = AppState.userHealth.bmi;
    var bmr = AppState.userHealth.bmr;
    var s = [];

    if (bmi < 18.5) {
        s.push('You are underweight. Include calorie-dense foods like paneer, ghee, banana shakes, and nuts.');
        s.push('Target ' + Math.round(bmr * 1.2 + 400) + ' calories daily with 5-6 smaller meals.');
        s.push('Add dal-chawal, paratha with curd, and dry fruits to your daily diet.');
        s.push('Strength training with proper nutrition helps build healthy weight.');
        s.push('Exercise Plan: Focus on weight/strength training 4 days/week (45 min each). Do compound exercises like squats, deadlifts, bench press, and rows. Rest 2-3 days. Avoid excessive cardio.');
        s.push('Add 20 min of yoga or stretching daily for flexibility and stress relief. Try Surya Namaskar (12 rounds) every morning.');
        s.push('Ensure 7-8 hours of sleep for muscle recovery and healthy weight gain.');
    } else if (bmi < 25) {
        s.push('Great! Your weight is in the healthy range. Maintain balanced nutrition.');
        s.push('Target around ' + Math.round(bmr * 1.2) + ' calories daily.');
        s.push('Include a mix of roti, sabzi, dal, salad, and fruits in every meal.');
        s.push('Stay active with 30 minutes of exercise daily for overall fitness.');
        s.push('Exercise Plan: Mix of cardio + strength training. 3 days strength (push-ups, squats, lunges, planks - 40 min), 2 days cardio (brisk walking, cycling, swimming - 30 min), 2 days active rest (yoga/stretching).');
        s.push('Try interval training: alternate 1 min jogging with 2 min walking for 20 min. Gradually increase intensity.');
        s.push('Include 10 min daily stretching routine. Maintain 7-8 hours sleep for optimal metabolism.');
    } else if (bmi < 30) {
        s.push('You are overweight. A moderate calorie deficit will help.');
        s.push('Target ' + Math.round(bmr * 1.2 - 400) + ' calories daily for gradual weight loss.');
        s.push('Replace fried snacks with roasted chana, sprouts, and buttermilk.');
        s.push('Walk 45 minutes daily and reduce rice/roti portions at dinner.');
        s.push('Exercise Plan: Daily 45-60 min brisk walking or cycling. Add bodyweight exercises 3 days/week: 3 sets each of squats (15 reps), push-ups (10 reps), lunges (12 per leg), planks (30 sec hold).');
        s.push('HIIT workouts 2x/week: 20 min sessions with burpees, jumping jacks, mountain climbers. Burns more fat in less time.');
        s.push('Avoid sitting for more than 1 hour continuously. Take 5-min walking breaks. Aim for 8,000-10,000 steps daily.');
        s.push('Try morning yoga (30 min) - Bhujangasana, Dhanurasana, and Pawanmuktasana are excellent for weight management.');
    } else {
        s.push('BMI indicates obesity. Please consult a healthcare professional before starting intense exercise.');
        s.push('Target ' + Math.round(bmr * 1.2 - 500) + ' calories with nutrient-dense foods.');
        s.push('Focus on vegetables, dal, grilled proteins, and avoid sugary drinks.');
        s.push('Start with light walks and gradually increase activity level.');
        s.push('Exercise Plan: Begin with 20-30 min slow walking daily. After 2 weeks increase to 40 min. Add gentle chair exercises and water aerobics if possible.');
        s.push('Low-impact activities: swimming, stationary cycling, or elliptical machine for 20 min, 3x/week. These are joint-friendly.');
        s.push('Once comfortable, add simple bodyweight exercises: wall push-ups (10 reps), chair squats (10 reps), standing calf raises (15 reps). 2 sets each, 3 days/week.');
        s.push('Prioritize sleep (7-9 hours) and stress management. High cortisol from stress increases belly fat. Try deep breathing exercises for 10 min daily.');
    }
    return s;
}

function clearMealPlan() {
    if (!confirm('Clear all meals for today?')) return;
    AppState.mealPlan = { breakfast: [], lunch: [], dinner: [], snacks: [] };
    renderMealPlan();
    if (typeof updateChartsWithHealthData === 'function') updateChartsWithHealthData();
    updateQuickStats();
    showToast('Meal plan cleared', 'success');
}

// Global functions
window.showPage = showPage;
window.removeMealItem = removeMealItem;
window.setMealSlot = setMealSlot;
window.clearMealPlan = clearMealPlan;
window.showToast = showToast;

// Single init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
