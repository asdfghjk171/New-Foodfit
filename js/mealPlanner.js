// ==========================================
// HEALTHFIT - MEAL PLANNER LOGIC
// ==========================================

// This file handles meal planning specific functionality
// Most of the meal planner logic is in app.js

// Additional meal planner utilities can be added here

// Get Meal Plan Summary
function getMealPlanSummary() {
    const summary = {
        totalMeals: 0,
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        mealBreakdown: {}
    };
    
    Object.keys(AppState.mealPlan).forEach(mealType => {
        const meals = AppState.mealPlan[mealType];
        const mealCount = meals.length;
        
        let mealCalories = 0;
        let mealProtein = 0;
        let mealCarbs = 0;
        let mealFat = 0;
        
        meals.forEach(meal => {
            mealCalories += parseFloat(meal.calories) || 0;
            mealProtein += parseFloat(meal.protein) || 0;
            mealCarbs += parseFloat(meal.carbs) || 0;
            mealFat += parseFloat(meal.fat) || 0;
        });
        
        summary.totalMeals += mealCount;
        summary.totalCalories += mealCalories;
        summary.totalProtein += mealProtein;
        summary.totalCarbs += mealCarbs;
        summary.totalFat += mealFat;
        
        summary.mealBreakdown[mealType] = {
            count: mealCount,
            calories: Math.round(mealCalories),
            protein: Math.round(mealProtein),
            carbs: Math.round(mealCarbs),
            fat: Math.round(mealFat)
        };
    });
    
    return summary;
}

// Export Meal Plan as JSON
function exportMealPlanJSON() {
    const data = {
        user: AppState.currentUser,
        date: getTodayDate(),
        mealPlan: AppState.mealPlan,
        summary: getMealPlanSummary()
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `meal-plan-${getTodayDate()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    
    showToast('Meal plan exported as JSON', 'success');
}

// Clear Today's Meal Plan
function clearMealPlan() {
    if (confirm('Are you sure you want to clear today\'s meal plan?')) {
        AppState.mealPlan = {
            breakfast: [],
            lunch: [],
            dinner: [],
            snacks: []
        };
        
        renderMealPlan();
        
        if (typeof updateChartsWithHealthData === 'function') {
            updateChartsWithHealthData();
        }
        
        showToast('Meal plan cleared', 'success');
    }
}

// Make functions globally accessible
window.getMealPlanSummary = getMealPlanSummary;
window.exportMealPlanJSON = exportMealPlanJSON;
window.clearMealPlan = clearMealPlan;
