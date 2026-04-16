// ==========================================
// HEALTHFIT - PDF GENERATION (FIXED LAYOUT + NUTRITION CHART + EXERCISES)
// ==========================================

function generatePDF() {
    if (typeof jspdf === 'undefined') { showToast('PDF library not loaded. Refresh page.', 'error'); return; }
    if (!AppState.currentUser) { showToast('Please login to generate PDF', 'error'); return; }

    try {
        var jsPDF = window.jspdf.jsPDF;
        var doc = new jsPDF();
        var summary = getMealPlanSummary();
        var today = getTodayDate();
        var y = 10;

        // ===== CLEAN WHITE HEADER (no dark background glitch) =====
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, 210, 42, 'F');

        // Green accent bar at top
        doc.setFillColor(45, 143, 78);
        doc.rect(0, 0, 210, 4, 'F');

        // Title
        doc.setFontSize(26);
        doc.setTextColor(45, 143, 78);
        doc.text('HealthFit', 15, 18);

        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text('Personal Health & Food Recommendation Report', 15, 26);

        doc.setFontSize(9);
        doc.setTextColor(130, 130, 130);
        doc.text('Date: ' + today + '   |   User: ' + AppState.currentUser.name + '   |   ' + AppState.currentUser.email, 15, 33);

        // Separator line
        doc.setDrawColor(45, 143, 78);
        doc.setLineWidth(0.8);
        doc.line(15, 38, 195, 38);

        y = 46;

        // ===== HEALTH METRICS =====
        if (AppState.userHealth.bmi) {
            doc.setFontSize(14);
            doc.setTextColor(45, 143, 78);
            doc.text('Health Metrics', 15, y);
            y += 8;

            doc.setFillColor(245, 250, 242);
            doc.roundedRect(15, y - 3, 180, 30, 3, 3, 'F');
            doc.setDrawColor(200, 220, 200);
            doc.setLineWidth(0.3);
            doc.roundedRect(15, y - 3, 180, 30, 3, 3, 'S');

            doc.setFontSize(10);
            doc.setTextColor(30, 30, 30);
            doc.text('BMI: ' + AppState.userHealth.bmi.toFixed(1) + ' (' + AppState.userHealth.category + ')', 20, y + 5);
            doc.text('BMR: ' + Math.round(AppState.userHealth.bmr) + ' cal/day', 110, y + 5);
            doc.text('Height: ' + AppState.userHealth.height + ' cm   |   Weight: ' + AppState.userHealth.weight + ' kg', 20, y + 13);
            doc.text('Age: ' + AppState.userHealth.age + '   |   Gender: ' + AppState.userHealth.gender, 110, y + 13);

            // BMI category color indicator
            var catCol = AppState.userHealth.category === 'Normal Weight' ? [74,186,106] : AppState.userHealth.category === 'Overweight' ? [232,167,33] : AppState.userHealth.category === 'Obese' ? [232,93,58] : [66,153,225];
            doc.setFillColor(catCol[0], catCol[1], catCol[2]);
            doc.roundedRect(20, y + 18, 40, 5, 2, 2, 'F');
            doc.setFontSize(7);
            doc.setTextColor(255, 255, 255);
            doc.text(AppState.userHealth.category, 22, y + 22);

            y += 37;
        }

        // ===== NUTRITION CHART DATA (Live values in PDF) =====
        doc.setFontSize(14);
        doc.setTextColor(45, 143, 78);
        doc.text('Nutrition Overview', 15, y);
        y += 8;

        // Macros box
        doc.setFillColor(245, 250, 242);
        doc.roundedRect(15, y - 3, 180, 34, 3, 3, 'F');
        doc.setDrawColor(200, 220, 200);
        doc.setLineWidth(0.3);
        doc.roundedRect(15, y - 3, 180, 34, 3, 3, 'S');

        doc.setFontSize(10);
        doc.setTextColor(30, 30, 30);
        doc.text('Total Meals: ' + summary.totalMeals, 20, y + 5);
        doc.text('Total Calories: ' + Math.round(summary.totalCalories) + ' kcal', 90, y + 5);

        // Macros breakdown bars
        var totalMacroGrams = Math.round(summary.totalProtein) + Math.round(summary.totalCarbs) + Math.round(summary.totalFat);
        var pPct = totalMacroGrams > 0 ? Math.round(summary.totalProtein) / totalMacroGrams : 0.33;
        var cPct = totalMacroGrams > 0 ? Math.round(summary.totalCarbs) / totalMacroGrams : 0.34;
        var fPct = totalMacroGrams > 0 ? Math.round(summary.totalFat) / totalMacroGrams : 0.33;
        var barW = 140;

        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        doc.text('Protein: ' + Math.round(summary.totalProtein) + 'g (' + Math.round(pPct * 100) + '%)', 20, y + 14);
        doc.text('Carbs: ' + Math.round(summary.totalCarbs) + 'g (' + Math.round(cPct * 100) + '%)', 75, y + 14);
        doc.text('Fat: ' + Math.round(summary.totalFat) + 'g (' + Math.round(fPct * 100) + '%)', 130, y + 14);

        // Stacked bar
        var bx = 20, by = y + 18;
        doc.setFillColor(66, 153, 225);
        doc.roundedRect(bx, by, barW * pPct, 6, 1, 1, 'F');
        bx += barW * pPct;
        doc.setFillColor(74, 186, 106);
        doc.rect(bx, by, barW * cPct, 6, 'F');
        bx += barW * cPct;
        doc.setFillColor(232, 167, 33);
        doc.roundedRect(bx, by, barW * fPct, 6, 1, 1, 'F');

        // Per-meal calorie row
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        var bd = summary.mealBreakdown;
        doc.text('Breakfast: ' + (bd.breakfast ? bd.breakfast.calories : 0) + ' kcal   |   Lunch: ' + (bd.lunch ? bd.lunch.calories : 0) + ' kcal   |   Dinner: ' + (bd.dinner ? bd.dinner.calories : 0) + ' kcal   |   Snacks: ' + (bd.snacks ? bd.snacks.calories : 0) + ' kcal', 20, y + 30);

        y += 42;

        // ===== MEAL BREAKDOWN =====
        var mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
        var mealLabels = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snacks: 'Snacks' };

        mealTypes.forEach(function(type) {
            var meals = AppState.mealPlan[type];
            var mbd = summary.mealBreakdown[type];

            if (y > 248) { doc.addPage(); y = 15; }

            doc.setFontSize(12);
            doc.setTextColor(232, 93, 58);
            doc.text(mealLabels[type] + ' (' + mbd.count + ' items, ' + mbd.calories + ' kcal)', 15, y);
            y += 6;

            if (meals.length > 0) {
                meals.forEach(function(meal, idx) {
                    if (y > 270) { doc.addPage(); y = 15; }
                    doc.setFontSize(9);
                    doc.setTextColor(50, 50, 50);
                    doc.text((idx + 1) + '. ' + meal.name, 20, y);
                    doc.setTextColor(120, 120, 120);
                    doc.text('' + (meal.calories || 0) + ' kcal | P:' + (meal.protein || 0) + 'g | C:' + (meal.carbs || 0) + 'g | F:' + (meal.fat || 0) + 'g', 110, y);
                    y += 5;
                });
            } else {
                doc.setFontSize(9);
                doc.setTextColor(170, 170, 170);
                doc.text('No meals added', 20, y);
                y += 5;
            }
            y += 5;
        });

        // ===== HEALTH & EXERCISE RECOMMENDATIONS =====
        if (AppState.userHealth.bmi) {
            if (y > 200) { doc.addPage(); y = 15; }

            doc.setFontSize(14);
            doc.setTextColor(45, 143, 78);
            doc.text('Health & Exercise Recommendations', 15, y);
            y += 8;

            var suggestions = generateHealthSuggestions();
            doc.setFontSize(8.5);
            suggestions.forEach(function(s, i) {
                if (y > 268) { doc.addPage(); y = 15; }
                doc.setTextColor(50, 50, 50);
                var lines = doc.splitTextToSize((i + 1) + '. ' + s, 175);
                doc.text(lines, 18, y);
                y += lines.length * 4 + 2;
            });
        }

        // ===== FOOTER ON ALL PAGES =====
        var pages = doc.internal.getNumberOfPages();
        for (var i = 1; i <= pages; i++) {
            doc.setPage(i);
            doc.setDrawColor(45, 143, 78);
            doc.setLineWidth(0.5);
            doc.line(15, 286, 195, 286);
            doc.setFontSize(7);
            doc.setTextColor(150, 150, 150);
            doc.text('HealthFit - Smart Food Recommendations for Your Health | Page ' + i + ' of ' + pages, 105, 292, { align: 'center' });
        }

        doc.save('HealthFit-Report-' + today + '.pdf');
        showToast('PDF report downloaded!', 'success');

    } catch (error) {
        console.error('PDF Error:', error);
        showToast('Error generating PDF: ' + error.message, 'error');
    }
}

window.generatePDF = generatePDF;
