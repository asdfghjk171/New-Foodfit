// ==========================================
// HEALTHFIT - MAIN APPLICATION LOGIC
// ==========================================

// App State
const AppState = {
    currentUser: null,
    currentPage: 'landing',
    isAuthenticated: false,
    dietPreference: 'all',
    selectedFoods: [],
    mealPlan: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
    },
    currentMealSlot: null,
    userHealth: {
        height: null,
        weight: null,
        age: null,
        gender: null,
        bmi: null,
        bmr: null,
        category: null
    }
};

// Initialize App
function initializeApp() {
    // Hide loading screen after 1 second
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('app').style.display = 'block';
        
        // Check if user is logged in
        checkAuth();
        
        // Set up event listeners
        setupEventListeners();
        
        // Show appropriate page
        if (AppState.isAuthenticated) {
            showPage('dashboard');
        } else {
            showPage('landing');
        }
    }, 1000);
}

// Check Authentication
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        AppState.currentUser = JSON.parse(user);
        AppState.isAuthenticated = true;
        
        // Load user health data if exists
        const healthData = localStorage.getItem(`health_${AppState.currentUser.email}`);
        if (healthData) {
            AppState.userHealth = JSON.parse(healthData);
        }
        
        // Load meal plan if exists
        const todaysMeal = localStorage.getItem(`meal_${AppState.currentUser.email}_${getTodayDate()}`);
        if (todaysMeal) {
            AppState.mealPlan = JSON.parse(todaysMeal);
        }
    }
}

// Get today's date in YYYY-MM-DD format
function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Setup Event Listeners
function setupEventListeners() {
    // Landing page buttons
    const getStartedBtn = document.getElementById('get-started-btn');
    const loginBtn = document.getElementById('login-btn');
    
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => showPage('signup'));
    }
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => showPage('login'));
    }
    
    // Auth page toggles
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');
    
    if (showSignupLink) {
        showSignupLink.addEventListener('click', (e) => {
            e.preventDefault();
            showPage('signup');
        });
    }
    
    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showPage('login');
        });
    }
    
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            link.classList.add('active');
            
            showPage(page);
        });
    });
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Profile image upload
    const profileImageUpload = document.getElementById('profile-image-upload');
    if (profileImageUpload) {
        profileImageUpload.addEventListener('change', handleProfileImageUpload);
    }
}

// Show Page
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show requested page
    const page = document.getElementById(`${pageName}-page`);
    if (page) {
        page.classList.add('active');
        AppState.currentPage = pageName;
    }
    
    // Show/hide navbar based on page
    const navbar = document.getElementById('navbar');
    const authPages = ['landing', 'login', 'signup'];
    
    if (authPages.includes(pageName)) {
        navbar.style.display = 'none';
    } else {
        navbar.style.display = 'block';
    }
    
    // Load page-specific data
    switch(pageName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'meal-planner':
            loadMealPlanner();
            break;
        case 'history':
            loadHistory();
            break;
        case 'profile':
            loadProfile();
            break;
    }
}

// Load Dashboard
function loadDashboard() {
    if (AppState.currentUser) {
        const displayName = document.getElementById('user-name-display');
        if (displayName) {
            displayName.textContent = AppState.currentUser.name;
        }
        
        // Load BMI results if available
        if (AppState.userHealth.bmi) {
            displayBMIResults();
        }
        
        // Initialize charts
        if (typeof initializeCharts === 'function') {
            initializeCharts();
        }
    }
}

// Load Meal Planner
function loadMealPlanner() {
    // Render existing meal plan
    renderMealPlan();
    
    // Set up diet preference toggle
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            toggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.dietPreference = btn.getAttribute('data-diet');
            showToast(`Dietary preference set to ${AppState.dietPreference}`, 'success');
        });
    });
    
    // Set up search
    const searchBtn = document.getElementById('search-food-btn');
    const searchInput = document.getElementById('food-search');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                if (typeof searchFoodAPI === 'function') {
                    searchFoodAPI(query);
                }
            } else {
                showToast('Please enter a food name to search', 'warning');
            }
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }
    
    // Set up add meal buttons
    const addMealBtns = document.querySelectorAll('.btn-add-meal');
    addMealBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mealSlot = btn.closest('.meal-slot').getAttribute('data-meal');
            AppState.currentMealSlot = mealSlot;
            showToast(`Search and click on a food to add to ${mealSlot}`, 'info');
        });
    });
    
    // Set up save and download buttons
    const saveMealBtn = document.getElementById('save-meal-plan');
    const downloadPdfBtn = document.getElementById('download-pdf');
    
    if (saveMealBtn) {
        saveMealBtn.addEventListener('click', saveMealPlan);
    }
    
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', () => {
            if (typeof generatePDF === 'function') {
                generatePDF();
            }
        });
    }
}

// Render Meal Plan
function renderMealPlan() {
    const mealSlots = ['breakfast', 'lunch', 'dinner', 'snacks'];
    
    mealSlots.forEach(slot => {
        const container = document.querySelector(`[data-meal="${slot}"] .meal-items`);
        if (container) {
            container.innerHTML = '';
            
            const meals = AppState.mealPlan[slot];
            if (meals && meals.length > 0) {
                meals.forEach((meal, index) => {
                    const mealElement = createMealItemElement(meal, slot, index);
                    container.appendChild(mealElement);
                });
            } else {
                container.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem; padding: 1rem;">No meals added yet</p>';
            }
        }
    });
}

// Create Meal Item Element
function createMealItemElement(meal, slot, index) {
    const div = document.createElement('div');
    div.className = 'meal-item';
    div.innerHTML = `
        <div class="meal-item-info">
            <h5>${meal.name}</h5>
            <p>Calories: ${meal.calories || 'N/A'} | Protein: ${meal.protein || 'N/A'}g | Carbs: ${meal.carbs || 'N/A'}g | Fat: ${meal.fat || 'N/A'}g</p>
        </div>
        <div class="meal-item-actions">
            <button class="btn-icon" onclick="removeMealItem('${slot}', ${index})" data-testid="remove-meal-btn-${slot}-${index}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    return div;
}

// Remove Meal Item
function removeMealItem(slot, index) {
    AppState.mealPlan[slot].splice(index, 1);
    renderMealPlan();
    showToast('Meal item removed', 'success');
}

// Save Meal Plan
function saveMealPlan() {
    if (!AppState.currentUser) {
        showToast('Please login to save meal plan', 'error');
        return;
    }
    
    const today = getTodayDate();
    const key = `meal_${AppState.currentUser.email}_${today}`;
    
    localStorage.setItem(key, JSON.stringify(AppState.mealPlan));
    
    // Save to history
    const historyKey = `history_${AppState.currentUser.email}`;
    let history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    
    const historyItem = {
        date: today,
        timestamp: new Date().toISOString(),
        type: 'meal_plan',
        data: AppState.mealPlan
    };
    
    // Check if today's meal plan already exists in history
    const existingIndex = history.findIndex(item => item.date === today && item.type === 'meal_plan');
    if (existingIndex >= 0) {
        history[existingIndex] = historyItem;
    } else {
        history.unshift(historyItem);
    }
    
    // Keep only last 30 days
    history = history.slice(0, 30);
    
    localStorage.setItem(historyKey, JSON.stringify(history));
    
    showToast('Meal plan saved successfully!', 'success');
}

// Load History
function loadHistory() {
    if (!AppState.currentUser) return;
    
    const historyKey = `history_${AppState.currentUser.email}`;
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    
    const historyContent = document.getElementById('history-content');
    if (historyContent) {
        if (history.length === 0) {
            historyContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>No history available yet. Start by saving a meal plan!</p>
                </div>
            `;
        } else {
            historyContent.innerHTML = '';
            history.forEach(item => {
                const historyItem = createHistoryItemElement(item);
                historyContent.appendChild(historyItem);
            });
        }
    }
}

// Create History Item Element
function createHistoryItemElement(item) {
    const div = document.createElement('div');
    div.className = 'history-item';
    
    const date = new Date(item.timestamp);
    const formattedDate = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    let content = '';
    if (item.type === 'meal_plan') {
        const totalMeals = Object.values(item.data).reduce((sum, meals) => sum + meals.length, 0);
        content = `
            <div class="history-item-header">
                <h3><i class="fas fa-utensils"></i> Meal Plan - ${item.date}</h3>
                <span class="history-date">${formattedDate}</span>
            </div>
            <div class="history-item-content">
                <p>${totalMeals} meals planned</p>
                <p>Breakfast: ${item.data.breakfast?.length || 0} | Lunch: ${item.data.lunch?.length || 0} | Dinner: ${item.data.dinner?.length || 0} | Snacks: ${item.data.snacks?.length || 0}</p>
            </div>
        `;
    }
    
    div.innerHTML = content;
    return div;
}

// Load Profile
function loadProfile() {
    if (!AppState.currentUser) return;
    
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileImage = document.getElementById('profile-image');
    
    if (profileName) profileName.textContent = AppState.currentUser.name;
    if (profileEmail) profileEmail.textContent = AppState.currentUser.email;
    
    // Load profile image if exists
    const savedImage = localStorage.getItem(`profile_image_${AppState.currentUser.email}`);
    if (savedImage && profileImage) {
        profileImage.src = savedImage;
    }
    
    // Load stats
    const historyKey = `history_${AppState.currentUser.email}`;
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    
    const mealPlansCount = document.getElementById('meal-plans-count');
    const daysActive = document.getElementById('days-active');
    
    if (mealPlansCount) {
        const mealPlans = history.filter(item => item.type === 'meal_plan');
        mealPlansCount.textContent = mealPlans.length;
    }
    
    if (daysActive) {
        // Calculate unique dates
        const uniqueDates = [...new Set(history.map(item => item.date))];
        daysActive.textContent = uniqueDates.length;
    }
}

// Handle Profile Image Upload
function handleProfileImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        showToast('Image size should be less than 2MB', 'error');
        return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const imageData = e.target.result;
        
        // Save to localStorage
        localStorage.setItem(`profile_image_${AppState.currentUser.email}`, imageData);
        
        // Update display
        const profileImage = document.getElementById('profile-image');
        if (profileImage) {
            profileImage.src = imageData;
        }
        
        showToast('Profile image updated successfully!', 'success');
    };
    
    reader.readAsDataURL(file);
}

// Handle Logout
function handleLogout() {
    localStorage.removeItem('currentUser');
    AppState.currentUser = null;
    AppState.isAuthenticated = false;
    AppState.userHealth = {
        height: null,
        weight: null,
        age: null,
        gender: null,
        bmi: null,
        bmr: null,
        category: null
    };
    AppState.mealPlan = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
    };
    
    showToast('Logged out successfully', 'success');
    showPage('landing');
}

// Show Toast Notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Display BMI Results
function displayBMIResults() {
    const resultsDiv = document.getElementById('bmi-results');
    const bmiValue = document.getElementById('bmi-value');
    const bmrValue = document.getElementById('bmr-value');
    const bmiCategory = document.getElementById('bmi-category');
    const suggestionsList = document.getElementById('suggestions-list');
    
    if (resultsDiv) resultsDiv.style.display = 'block';
    if (bmiValue) bmiValue.textContent = AppState.userHealth.bmi.toFixed(1);
    if (bmrValue) bmrValue.textContent = Math.round(AppState.userHealth.bmr);
    if (bmiCategory) bmiCategory.textContent = AppState.userHealth.category;
    
    if (suggestionsList) {
        suggestionsList.innerHTML = '';
        const suggestions = generateHealthSuggestions();
        suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.textContent = suggestion;
            suggestionsList.appendChild(li);
        });
    }
}

// Generate Health Suggestions based on BMI
function generateHealthSuggestions() {
    const bmi = AppState.userHealth.bmi;
    const bmr = AppState.userHealth.bmr;
    const suggestions = [];
    
    if (bmi < 18.5) {
        suggestions.push('You are underweight. Focus on calorie-dense, nutritious foods.');
        suggestions.push(`Aim for ${Math.round(bmr + 500)} calories per day to gain weight healthily.`);
        suggestions.push('Include protein-rich foods like nuts, lean meats, and dairy.');
        suggestions.push('Eat smaller, more frequent meals throughout the day.');
    } else if (bmi >= 18.5 && bmi < 25) {
        suggestions.push('You have a healthy weight! Maintain it with balanced nutrition.');
        suggestions.push(`Maintain around ${Math.round(bmr)} calories per day.`);
        suggestions.push('Continue regular physical activity for overall health.');
        suggestions.push('Focus on a balanced diet with fruits, vegetables, and whole grains.');
    } else if (bmi >= 25 && bmi < 30) {
        suggestions.push('You are overweight. Consider a calorie deficit for gradual weight loss.');
        suggestions.push(`Aim for ${Math.round(bmr - 500)} calories per day to lose weight healthily.`);
        suggestions.push('Increase physical activity and reduce processed foods.');
        suggestions.push('Focus on vegetables, lean proteins, and complex carbohydrates.');
    } else {
        suggestions.push('You are obese. Consult a healthcare provider for personalized advice.');
        suggestions.push(`Consider targeting ${Math.round(bmr - 500)} calories per day.`);
        suggestions.push('Prioritize whole foods and avoid sugary drinks.');
        suggestions.push('Start with light exercise and gradually increase intensity.');
    }
    
    return suggestions;
}

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Make removeMealItem globally accessible
window.removeMealItem = removeMealItem;
