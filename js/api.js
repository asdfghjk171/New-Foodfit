// ==========================================
// HEALTHFIT - FOOD SEARCH & RECOMMENDATIONS
// Using built-in database (1500+ Indian & International foods)
// ==========================================

// Search food from built-in database
function searchFoodDatabase(query) {
    const container = document.getElementById('search-results');
    if (!container) return;

    query = query.toLowerCase().trim();
    if (!query) return;

    // Search by name, cuisine, or course
    let results = FOOD_DATABASE.filter(food => {
        const nameMatch = food.name.toLowerCase().includes(query);
        const cuisineMatch = food.cuisine.toLowerCase().includes(query);
        const courseMatch = food.course.toLowerCase().includes(query);
        return nameMatch || cuisineMatch || courseMatch;
    });

    // Apply diet filter
    if (AppState.dietPreference === 'vegetarian') {
        results = results.filter(f => f.isVeg);
    } else if (AppState.dietPreference === 'non-vegetarian') {
        results = results.filter(f => !f.isVeg);
    } else if (AppState.dietPreference === 'high-protein') {
        results = results.filter(f => f.isHighProtein || f.protein > 15);
    }

    // Prioritize Indian foods (appear first)
    const indianCuisines = ['indian','south indian','north indian','andhra','punjabi','gujarati','rajasthani','bengali','kashmiri','mughlai','hyderabadi','goan','maharashtrian','kerala','tamil nadu','chettinad','awadhi','lucknowi','sindhi','parsi','bihari','assamese','oriya','karnataka','mangalorean','malabar','udupi','konkan','malvani','haryana','himachal','coorg','indo chinese','north east india','uttar pradesh','coastal karnataka','north karnataka','south karnataka','kongunadu'];
    results.sort((a, b) => {
        const aIsIndian = indianCuisines.some(c => a.cuisine.toLowerCase().includes(c));
        const bIsIndian = indianCuisines.some(c => b.cuisine.toLowerCase().includes(c));
        if (aIsIndian && !bIsIndian) return -1;
        if (!aIsIndian && bIsIndian) return 1;
        return 0;
    });

    results = results.slice(0, 24);

    if (results.length === 0) {
        container.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><i class="fas fa-search"></i><p>No results for "' + query + '". Try "dal", "rice", "chicken", "paneer", "biryani"...</p></div>';
        return;
    }

    container.innerHTML = '';
    results.forEach(food => {
        container.appendChild(createFoodCard(food));
    });
}

function createFoodCard(food) {
    const div = document.createElement('div');
    div.className = 'food-item';
    div.setAttribute('data-testid', 'food-item-' + food.id);

    const badges = [];
    if (food.isVeg) badges.push('<span class="food-item-badge badge-veg">Veg</span>');
    else badges.push('<span class="food-item-badge badge-nonveg">Non-Veg</span>');
    if (food.isHighProtein) badges.push('<span class="food-item-badge badge-hp">High Protein</span>');

    div.innerHTML = '<div class="food-item-header"><h4>' + food.name + '</h4><div>' + badges.join('') + '</div></div>' +
        '<div class="food-item-cuisine"><i class="fas fa-map-marker-alt"></i> ' + food.cuisine + ' | ' + food.course + '</div>' +
        '<div class="food-item-macros">' +
        '<div class="macro-item"><span class="macro-val">' + food.calories + '</span><span class="macro-label">kcal</span></div>' +
        '<div class="macro-item"><span class="macro-val">' + food.protein + 'g</span><span class="macro-label">protein</span></div>' +
        '<div class="macro-item"><span class="macro-val">' + food.carbs + 'g</span><span class="macro-label">carbs</span></div>' +
        '<div class="macro-item"><span class="macro-val">' + food.fat + 'g</span><span class="macro-label">fat</span></div></div>' +
        '<div class="food-item-actions"><button class="btn-add-food" data-testid="add-food-' + food.id + '"><i class="fas fa-plus"></i> Add to Meal</button></div>';

    div.querySelector('.btn-add-food').onclick = () => addFoodToMeal(food);
    return div;
}

function addFoodToMeal(food) {
    if (!AppState.currentMealSlot) {
        // Auto-assign based on food category
        const cat = food.mealCategory || 'lunch';
        AppState.currentMealSlot = cat;
    }

    const mealItem = {
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        cuisine: food.cuisine,
        isVeg: food.isVeg
    };

    if (!AppState.mealPlan[AppState.currentMealSlot]) {
        AppState.mealPlan[AppState.currentMealSlot] = [];
    }

    AppState.mealPlan[AppState.currentMealSlot].push(mealItem);
    renderMealPlan();
    if (typeof updateChartsWithHealthData === 'function') updateChartsWithHealthData();
    if (typeof updateQuickStats === 'function') updateQuickStats();
    showToast(food.name + ' added to ' + AppState.currentMealSlot, 'success');
}

// Load popular Indian foods for quick add
function loadPopularFoods() {
    const container = document.getElementById('popular-foods');
    if (!container) return;

    // Popular everyday Indian foods
    const popularNames = ['Dal Tadka', 'Roti', 'Paneer Butter Masala', 'Chicken Biryani', 'Masala Dosa', 'Curd Rice', 'Aloo Gobi', 'Rajma', 'Chole', 'Idli', 'Poha', 'Upma', 'Samosa', 'Palak Paneer', 'Butter Chicken', 'Raita', 'Chapati', 'Paratha', 'Khichdi', 'Dahi Vada'];

    let foods = [];
    popularNames.forEach(name => {
        const found = FOOD_DATABASE.find(f => f.name.toLowerCase().includes(name.toLowerCase()));
        if (found) foods.push(found);
    });

    // If not enough, add random Indian foods
    if (foods.length < 12) {
        const indianFoods = FOOD_DATABASE.filter(f =>
            f.cuisine.toLowerCase().includes('indian') ||
            f.cuisine.toLowerCase().includes('punjabi') ||
            f.cuisine.toLowerCase().includes('south indian')
        );
        while (foods.length < 16 && indianFoods.length > 0) {
            const idx = Math.floor(Math.random() * indianFoods.length);
            const food = indianFoods.splice(idx, 1)[0];
            if (!foods.find(f => f.id === food.id)) foods.push(food);
        }
    }

    // Apply diet filter
    if (AppState.dietPreference === 'vegetarian') {
        foods = foods.filter(f => f.isVeg);
    } else if (AppState.dietPreference === 'non-vegetarian') {
        foods = foods.filter(f => !f.isVeg);
    } else if (AppState.dietPreference === 'high-protein') {
        foods = foods.filter(f => f.isHighProtein || f.protein > 15);
    }

    container.innerHTML = '';
    foods.slice(0, 16).forEach(food => {
        const chip = document.createElement('div');
        chip.className = 'popular-food-chip';
        chip.setAttribute('data-testid', 'popular-food-' + food.id);
        chip.innerHTML = (food.isVeg ? '<i class="fas fa-leaf" style="color:#4ade80"></i>' : '<i class="fas fa-drumstick-bite" style="color:#fca5a5"></i>') +
            '<span>' + food.name.substring(0, 28) + '</span><span class="chip-cal">' + food.calories + ' cal</span>';
        chip.onclick = () => addFoodToMeal(food);
        container.appendChild(chip);
    });
}

// Recommended foods for dashboard
function loadRecommendedFoods() {
    const container = document.getElementById('recommended-foods');
    if (!container) return;

    // Get foods matching user's health goals
    let recommended = [];
    const bmi = AppState.userHealth.bmi;

    if (bmi && bmi < 18.5) {
        // High calorie, nutritious foods for underweight
        recommended = FOOD_DATABASE.filter(f => f.calories > 200 && f.calories < 600).sort(() => Math.random() - 0.5).slice(0, 8);
    } else if (bmi && bmi >= 25) {
        // Low calorie, high protein for overweight
        recommended = FOOD_DATABASE.filter(f => f.calories < 250 && f.protein > 8).sort(() => Math.random() - 0.5).slice(0, 8);
    } else {
        // Balanced recommendations
        recommended = FOOD_DATABASE.filter(f => f.calories > 100 && f.calories < 400).sort(() => Math.random() - 0.5).slice(0, 8);
    }

    // Prioritize Indian foods
    const indianCuisines = ['indian','south indian','north indian','punjabi','gujarati','mughlai'];
    recommended.sort((a, b) => {
        const aI = indianCuisines.some(c => a.cuisine.toLowerCase().includes(c));
        const bI = indianCuisines.some(c => b.cuisine.toLowerCase().includes(c));
        if (aI && !bI) return -1;
        if (!aI && bI) return 1;
        return 0;
    });

    container.innerHTML = '';
    recommended.forEach(food => {
        container.appendChild(createFoodCard(food));
    });
}

window.searchFoodDatabase = searchFoodDatabase;
window.addFoodToMeal = addFoodToMeal;
window.loadPopularFoods = loadPopularFoods;
window.loadRecommendedFoods = loadRecommendedFoods;
