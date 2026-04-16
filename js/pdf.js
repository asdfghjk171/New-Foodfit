// ==========================================
// HEALTHFIT - PDF GENERATION (IMPROVED)
// ==========================================

function generatePDF() {
    if (typeof jspdf === 'undefined') {
        showToast('PDF library not loaded. Please refresh.', 'error');
        return;
    }
    if (!AppState.currentUser) {
        showToast('Please login to generate PDF', 'error');
        return;
    }

    try {
        var jsPDF = window.jspdf.jsPDF;
        var doc = new jsPDF();
        var summary = getMealPlanSummary();
        var today = getTodayDate();

        var green = [22, 163, 74];
        var dark = [15, 31, 18];
        var text = [240, 253, 244];
        var muted = [107, 138, 112];
        var blue = [14, 165, 233];
        var y = 15;

        // Header background
        doc.setFillColor(15, 31, 18);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setFillColor(22, 163, 74);
        doc.rect(0, 38, 210, 2, 'F');

        // Title
        doc.setFontSize(22);
        doc.setTextColor(22, 163, 74);
        doc.text('HealthFit', 15, y + 8);
        doc.setFontSize(11);
        doc.setTextColor(167, 196, 171);
        doc.text('Personal Health & Meal Plan Report', 15, y + 16);
        doc.setFontSize(9);
        doc.text('Date: ' + today + '  |  User: ' + AppState.currentUser.name + '  |  ' + AppState.currentUser.email, 15, y + 24);

        y = 48;

        // Health Metrics
        if (AppState.userHealth.bmi) {
            doc.setFontSize(14);
            doc.setTextColor(22, 163, 74);
            doc.text('Health Metrics', 15, y);
            y += 8;

            doc.setFillColor(240, 253, 244);
            doc.roundedRect(15, y - 2, 180, 28, 3, 3, 'F');

            doc.setFontSize(10);
            doc.setTextColor(15, 31, 18);
            doc.text('BMI: ' + AppState.userHealth.bmi.toFixed(1) + ' (' + AppState.userHealth.category + ')', 20, y + 6);
            doc.text('BMR: ' + Math.round(AppState.userHealth.bmr) + ' cal/day', 20, y + 13);
            doc.text('Height: ' + AppState.userHealth.height + ' cm  |  Weight: ' + AppState.userHealth.weight + ' kg  |  Age: ' + AppState.userHealth.age + '  |  Gender: ' + AppState.userHealth.gender, 20, y + 20);

            y += 35;
        }

        // Nutrition Summary
        doc.setFontSize(14);
        doc.setTextColor(22, 163, 74);
        doc.text('Nutrition Summary', 15, y);
        y += 8;

        doc.setFillColor(240, 253, 244);
        doc.roundedRect(15, y - 2, 180, 18, 3, 3, 'F');
        doc.setFontSize(10);
        doc.setTextColor(15, 31, 18);
        doc.text('Meals: ' + summary.totalMeals + '  |  Calories: ' + Math.round(summary.totalCalories) + ' kcal  |  Protein: ' + Math.round(summary.totalProtein) + 'g  |  Carbs: ' + Math.round(summary.totalCarbs) + 'g  |  Fat: ' + Math.round(summary.totalFat) + 'g', 20, y + 8);

        y += 25;

        // Meal Breakdown
        var mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
        var mealLabels = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snacks: 'Snacks' };

        mealTypes.forEach(function(type) {
            var meals = AppState.mealPlan[type];
            var bd = summary.mealBreakdown[type];

            if (y > 250) { doc.addPage(); y = 20; }

            doc.setFontSize(12);
            doc.setTextColor(14, 165, 233);
            doc.text(mealLabels[type] + ' (' + bd.count + ' items, ' + bd.calories + ' kcal)', 15, y);
            y += 6;

            if (meals.length > 0) {
                meals.forEach(function(meal, idx) {
                    if (y > 270) { doc.addPage(); y = 20; }
                    doc.setFontSize(9);
                    doc.setTextColor(60, 60, 60);
                    doc.text((idx + 1) + '. ' + meal.name + '  (' + (meal.calories || 0) + ' kcal | P:' + (meal.protein || 0) + 'g | C:' + (meal.carbs || 0) + 'g | F:' + (meal.fat || 0) + 'g)', 20, y);
                    y += 5;
                });
            } else {
                doc.setFontSize(9);
                doc.setTextColor(150, 150, 150);
                doc.text('No meals added', 20, y);
                y += 5;
            }
            y += 5;
        });

        // Health Suggestions
        if (AppState.userHealth.bmi) {
            if (y > 220) { doc.addPage(); y = 20; }

            doc.setFontSize(14);
            doc.setTextColor(22, 163, 74);
            doc.text('Health Recommendations', 15, y);
            y += 8;

            var suggestions = generateHealthSuggestions();
            doc.setFontSize(9);
            doc.setTextColor(60, 60, 60);
            suggestions.forEach(function(s, i) {
                if (y > 270) { doc.addPage(); y = 20; }
                var lines = doc.splitTextToSize((i + 1) + '. ' + s, 175);
                doc.text(lines, 18, y);
                y += lines.length * 4.5 + 2;
            });
        }

        // Footer on all pages
        var pages = doc.internal.getNumberOfPages();
        for (var i = 1; i <= pages; i++) {
            doc.setPage(i);
            doc.setFillColor(22, 163, 74);
            doc.rect(0, 287, 210, 1, 'F');
            doc.setFontSize(7);
            doc.setTextColor(150, 150, 150);
            doc.text('HealthFit - Personal Health & Nutrition Planner | Page ' + i + ' of ' + pages, 105, 293, { align: 'center' });
        }

        doc.save('HealthFit-Report-' + today + '.pdf');
        showToast('PDF report downloaded!', 'success');

    } catch (error) {
        console.error('PDF Error:', error);
        showToast('Error generating PDF. Please try again.', 'error');
    }
}

window.generatePDF = generatePDF;
