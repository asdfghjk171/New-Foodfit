// ==========================================
// HEALTHFIT - CHARTS (FIXED - Real data, no useless defaults)
// ==========================================

let macrosChart = null;
let caloriesChart = null;

function initializeCharts() {
    if (typeof Chart === 'undefined') return;

    const macrosCanvas = document.getElementById('macros-chart');
    const caloriesCanvas = document.getElementById('calories-chart');
    if (!macrosCanvas || !caloriesCanvas) return;

    const totals = calculateTotalMacros();
    const hasMealData = totals.protein > 0 || totals.carbs > 0 || totals.fat > 0;

    const emptyState = document.getElementById('charts-empty-state');
    const chartsArea = document.getElementById('charts-area');

    if (!hasMealData) {
        if (emptyState) emptyState.style.display = 'block';
        if (chartsArea) chartsArea.style.display = 'none';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (chartsArea) chartsArea.style.display = 'grid';

    if (macrosChart) macrosChart.destroy();
    if (caloriesChart) caloriesChart.destroy();

    // Macros Doughnut Chart
    macrosChart = new Chart(macrosCanvas, {
        type: 'doughnut',
        data: {
            labels: ['Protein (' + Math.round(totals.protein) + 'g)', 'Carbs (' + Math.round(totals.carbs) + 'g)', 'Fat (' + Math.round(totals.fat) + 'g)'],
            datasets: [{
                data: [totals.protein, totals.carbs, totals.fat],
                backgroundColor: ['rgba(14, 165, 233, 0.85)', 'rgba(34, 197, 94, 0.85)', 'rgba(245, 158, 11, 0.85)'],
                borderColor: ['rgba(14, 165, 233, 1)', 'rgba(34, 197, 94, 1)', 'rgba(245, 158, 11, 1)'],
                borderWidth: 2,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#a7c4ab', font: { size: 12, family: 'DM Sans' }, padding: 15, usePointStyle: true }
                },
                title: {
                    display: true,
                    text: 'Macronutrient Split',
                    color: '#f0fdf4',
                    font: { size: 15, family: 'Playfair Display', weight: '600' },
                    padding: { bottom: 15 }
                }
            }
        }
    });

    // Calories Bar Chart
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
                backgroundColor: ['rgba(245, 158, 11, 0.75)', 'rgba(34, 197, 94, 0.75)', 'rgba(14, 165, 233, 0.75)', 'rgba(168, 85, 247, 0.75)'],
                borderColor: ['rgba(245, 158, 11, 1)', 'rgba(34, 197, 94, 1)', 'rgba(14, 165, 233, 1)', 'rgba(168, 85, 247, 1)'],
                borderWidth: 2,
                borderRadius: 8,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#6b8a70', font: { family: 'DM Sans' } },
                    grid: { color: 'rgba(34, 197, 94, 0.06)' }
                },
                x: {
                    ticks: { color: '#a7c4ab', font: { family: 'DM Sans' } },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Calories by Meal',
                    color: '#f0fdf4',
                    font: { size: 15, family: 'Playfair Display', weight: '600' },
                    padding: { bottom: 15 }
                }
            }
        }
    });
}

function calculateTotalMacros() {
    let p = 0, c = 0, f = 0;
    Object.values(AppState.mealPlan).forEach(meals => {
        meals.forEach(m => {
            p += parseFloat(m.protein) || 0;
            c += parseFloat(m.carbs) || 0;
            f += parseFloat(m.fat) || 0;
        });
    });
    return { protein: p, carbs: c, fat: f };
}

function calculateMealCalories(mealType) {
    const meals = AppState.mealPlan[mealType];
    if (!meals || meals.length === 0) return 0;
    return meals.reduce((t, m) => t + (parseFloat(m.calories) || 0), 0);
}

function updateChartsWithHealthData() {
    initializeCharts();
}

window.initializeCharts = initializeCharts;
window.updateChartsWithHealthData = updateChartsWithHealthData;
