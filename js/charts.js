// ==========================================
// HEALTHFIT - CHARTS LOGIC
// ==========================================

let macrosChart = null;
let caloriesChart = null;

// Initialize Charts
function initializeCharts() {
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded');
        return;
    }
    
    // Destroy existing charts if they exist
    if (macrosChart) macrosChart.destroy();
    if (caloriesChart) caloriesChart.destroy();
    
    // Get canvas elements
    const macrosCanvas = document.getElementById('macros-chart');
    const caloriesCanvas = document.getElementById('calories-chart');
    
    if (!macrosCanvas || !caloriesCanvas) return;
    
    // Calculate total macros from today's meal plan
    const totals = calculateTotalMacros();
    
    // Create Macros Pie Chart
    macrosChart = new Chart(macrosCanvas, {
        type: 'doughnut',
        data: {
            labels: ['Protein', 'Carbs', 'Fat'],
            datasets: [{
                data: [totals.protein, totals.carbs, totals.fat],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(245, 158, 11, 0.8)'
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(245, 158, 11, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#f1f5f9',
                        font: {
                            size: 12,
                            family: 'Poppins'
                        },
                        padding: 15
                    }
                },
                title: {
                    display: true,
                    text: 'Macronutrient Distribution',
                    color: '#f1f5f9',
                    font: {
                        size: 16,
                        family: 'Poppins',
                        weight: '600'
                    },
                    padding: 20
                }
            }
        }
    });
    
    // Create Calories Bar Chart
    caloriesChart = new Chart(caloriesCanvas, {
        type: 'bar',
        data: {
            labels: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
            datasets: [{
                label: 'Calories',
                data: [
                    calculateMealCalories('breakfast'),
                    calculateMealCalories('lunch'),
                    calculateMealCalories('dinner'),
                    calculateMealCalories('snacks')
                ],
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#94a3b8',
                        font: {
                            family: 'Poppins'
                        }
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#94a3b8',
                        font: {
                            family: 'Poppins'
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Calories by Meal',
                    color: '#f1f5f9',
                    font: {
                        size: 16,
                        family: 'Poppins',
                        weight: '600'
                    },
                    padding: 20
                }
            }
        }
    });
}

// Calculate Total Macros from all meals
function calculateTotalMacros() {
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    Object.values(AppState.mealPlan).forEach(meals => {
        meals.forEach(meal => {
            totalProtein += parseFloat(meal.protein) || 0;
            totalCarbs += parseFloat(meal.carbs) || 0;
            totalFat += parseFloat(meal.fat) || 0;
        });
    });
    
    // If no data, show default values
    if (totalProtein === 0 && totalCarbs === 0 && totalFat === 0) {
        return {
            protein: 30,
            carbs: 50,
            fat: 20
        };
    }
    
    return {
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat
    };
}

// Calculate Calories for a specific meal
function calculateMealCalories(mealType) {
    const meals = AppState.mealPlan[mealType];
    if (!meals || meals.length === 0) return 0;
    
    return meals.reduce((total, meal) => {
        return total + (parseFloat(meal.calories) || 0);
    }, 0);
}

// Update charts when health data changes
function updateChartsWithHealthData() {
    if (macrosChart && caloriesChart) {
        initializeCharts();
    }
}

// Make function globally accessible
window.initializeCharts = initializeCharts;
window.updateChartsWithHealthData = updateChartsWithHealthData;
