// ==========================================
// HEALTHFIT - MEAL PLANNER UTILITIES
// ==========================================

function getMealPlanSummary() {
    const summary = {
        totalMeals: 0, totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0,
        mealBreakdown: {}
    };

    Object.keys(AppState.mealPlan).forEach(type => {
        const meals = AppState.mealPlan[type];
        let cal = 0, p = 0, c = 0, f = 0;
        meals.forEach(m => {
            cal += parseFloat(m.calories) || 0;
            p += parseFloat(m.protein) || 0;
            c += parseFloat(m.carbs) || 0;
            f += parseFloat(m.fat) || 0;
        });
        summary.totalMeals += meals.length;
        summary.totalCalories += cal;
        summary.totalProtein += p;
        summary.totalCarbs += c;
        summary.totalFat += f;
        summary.mealBreakdown[type] = { count: meals.length, calories: Math.round(cal), protein: Math.round(p), carbs: Math.round(c), fat: Math.round(f) };
    });
    return summary;
}

function exportMealPlanJSON() {
    const data = {
        user: AppState.currentUser,
        date: getTodayDate(),
        mealPlan: AppState.mealPlan,
        summary: getMealPlanSummary()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meal-plan-' + getTodayDate() + '.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported as JSON', 'success');
}

window.getMealPlanSummary = getMealPlanSummary;
window.exportMealPlanJSON = exportMealPlanJSON;
