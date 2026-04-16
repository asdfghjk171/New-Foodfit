// ==========================================
// HEALTHFIT - MEAL PLANNER + WEEKLY VIEW + EXPORT/IMPORT
// ==========================================

// ---- Daily summary helper ----
function getMealPlanSummary() {
    var summary = { totalMeals: 0, totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, mealBreakdown: {} };
    Object.keys(AppState.mealPlan).forEach(function(type) {
        var meals = AppState.mealPlan[type];
        var cal = 0, p = 0, c = 0, f = 0;
        meals.forEach(function(m) { cal += parseFloat(m.calories)||0; p += parseFloat(m.protein)||0; c += parseFloat(m.carbs)||0; f += parseFloat(m.fat)||0; });
        summary.totalMeals += meals.length;
        summary.totalCalories += cal;
        summary.totalProtein += p;
        summary.totalCarbs += c;
        summary.totalFat += f;
        summary.mealBreakdown[type] = { count: meals.length, calories: Math.round(cal), protein: Math.round(p), carbs: Math.round(c), fat: Math.round(f) };
    });
    return summary;
}

// ---- Export daily meal plan as JSON ----
function exportMealPlanJSON() {
    var data = { version: 1, type: 'daily', user: AppState.currentUser ? AppState.currentUser.name : 'Guest', date: getTodayDate(), mealPlan: AppState.mealPlan, summary: getMealPlanSummary() };
    downloadJSON(data, 'healthfit-meal-' + getTodayDate() + '.json');
    showToast('Daily meal plan exported!', 'success');
}

// ---- Import daily meal plan from JSON ----
function importMealPlanJSON(input) {
    var file = input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var data = JSON.parse(e.target.result);
            if (data.mealPlan && data.mealPlan.breakfast !== undefined) {
                AppState.mealPlan = { breakfast: data.mealPlan.breakfast || [], lunch: data.mealPlan.lunch || [], dinner: data.mealPlan.dinner || [], snacks: data.mealPlan.snacks || [] };
                renderMealPlan();
                if (typeof updateChartsWithHealthData === 'function') updateChartsWithHealthData();
                if (typeof updateQuickStats === 'function') updateQuickStats();
                showToast('Meal plan imported! (' + (data.date || 'unknown date') + ')', 'success');
            } else {
                showToast('Invalid file format. Expected a HealthFit meal plan JSON.', 'error');
            }
        } catch (err) {
            showToast('Could not parse file. Make sure it is valid JSON.', 'error');
        }
        input.value = '';
    };
    reader.readAsText(file);
}

// ---- Helpers ----
function downloadJSON(obj, filename) {
    var blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function getDateStr(d) { return d.toISOString().split('T')[0]; }

function getWeekDates(offset) {
    var now = new Date();
    var day = now.getDay();
    var monday = new Date(now);
    monday.setDate(now.getDate() - ((day + 6) % 7) + (offset * 7));
    var dates = [];
    for (var i = 0; i < 7; i++) {
        var d = new Date(monday);
        d.setDate(monday.getDate() + i);
        dates.push(d);
    }
    return dates;
}

var DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
var DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ---- Load Weekly Plan ----
function loadWeeklyPlan() {
    if (!AppState.currentUser) return;
    var dates = getWeekDates(AppState.weekOffset);
    var today = getDateStr(new Date());

    // Week label
    var lbl = document.getElementById('week-label');
    if (lbl) {
        var d0 = dates[0], d6 = dates[6];
        lbl.textContent = d0.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' - ' + d6.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    var grid = document.getElementById('weekly-grid');
    if (!grid) return;
    grid.innerHTML = '';

    var weekTotalCal = 0, weekTotalMeals = 0, plannedDays = 0;

    dates.forEach(function(date, idx) {
        var dateStr = getDateStr(date);
        var key = 'meal_' + AppState.currentUser.email + '_' + dateStr;
        var plan = null;
        try { var raw = localStorage.getItem(key); if (raw) plan = JSON.parse(raw); } catch (e) {}

        var dayCal = 0, dayMeals = 0;
        var mealSlots = ['breakfast', 'lunch', 'dinner', 'snacks'];
        var mealLabels = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snacks: 'Snacks' };

        var bodyHTML = '';
        if (plan) {
            mealSlots.forEach(function(slot) {
                var items = plan[slot];
                if (items && items.length > 0) {
                    bodyHTML += '<div class="wdc-meal-group"><div class="wdc-meal-label">' + mealLabels[slot] + '</div>';
                    items.forEach(function(m) {
                        var cal = parseFloat(m.calories) || 0;
                        dayCal += cal;
                        dayMeals++;
                        bodyHTML += '<div class="wdc-meal-item"><span>' + (m.name.length > 30 ? m.name.substring(0, 28) + '...' : m.name) + '</span><span class="wdc-mi-cal">' + Math.round(cal) + '</span></div>';
                    });
                    bodyHTML += '</div>';
                }
            });
        }

        if (dayMeals === 0) { bodyHTML = '<div class="wdc-empty">No meals planned</div>'; }
        else { plannedDays++; }

        weekTotalCal += dayCal;
        weekTotalMeals += dayMeals;

        var isToday = dateStr === today;
        var card = document.createElement('div');
        card.className = 'week-day-card' + (isToday ? ' is-today' : '');
        card.setAttribute('data-testid', 'week-day-' + idx);

        card.innerHTML = '<div class="wdc-header"><h4>' + DAY_NAMES[idx] + (isToday ? ' <span class="day-badge">Today</span>' : '') +
            ' <small style="color:var(--text-muted);font-weight:400;font-size:0.78rem;margin-left:0.3rem;">' +
            date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + '</small></h4>' +
            '<span class="wdc-cal">' + Math.round(dayCal) + ' kcal</span></div>' +
            '<div class="wdc-body">' + bodyHTML + '</div>' +
            '<div class="wdc-footer">' +
            '<button class="btn btn-primary btn-sm" onclick="editDayPlan(\'' + dateStr + '\')" data-testid="edit-day-' + idx + '"><i class="fas fa-pen"></i> Edit</button>' +
            (plan ? '<button class="btn btn-outline btn-sm" onclick="copyDayPlan(\'' + dateStr + '\')" data-testid="copy-day-' + idx + '"><i class="fas fa-copy"></i> Copy</button>' : '') +
            '</div>';
        grid.appendChild(card);
    });

    // Summary bar
    var el = function(id, v) { var e = document.getElementById(id); if (e) e.textContent = v; };
    el('week-total-cal', Math.round(weekTotalCal));
    el('week-avg-cal', plannedDays > 0 ? Math.round(weekTotalCal / plannedDays) : 0);
    el('week-total-meals', weekTotalMeals);
    el('week-planned-days', plannedDays + '/7');
}

function changeWeek(dir) {
    AppState.weekOffset += dir;
    loadWeeklyPlan();
}

// Edit a specific day's plan = navigate to daily planner with that day loaded
function editDayPlan(dateStr) {
    if (!AppState.currentUser) return;
    var key = 'meal_' + AppState.currentUser.email + '_' + dateStr;
    var plan = null;
    try { var raw = localStorage.getItem(key); if (raw) plan = JSON.parse(raw); } catch (e) {}
    AppState.mealPlan = plan || { breakfast: [], lunch: [], dinner: [], snacks: [] };
    AppState._editingDate = dateStr;
    showPage('meal-planner');
    showToast('Editing plan for ' + dateStr, 'info');
}

// Copy a day's plan to today
function copyDayPlan(dateStr) {
    if (!AppState.currentUser) return;
    var key = 'meal_' + AppState.currentUser.email + '_' + dateStr;
    var raw = localStorage.getItem(key);
    if (!raw) { showToast('No plan found for that day', 'warning'); return; }
    var plan = JSON.parse(raw);
    var today = getTodayDate();
    localStorage.setItem('meal_' + AppState.currentUser.email + '_' + today, JSON.stringify(plan));
    AppState.mealPlan = JSON.parse(JSON.stringify(plan));
    showToast('Copied plan from ' + dateStr + ' to today!', 'success');
    loadWeeklyPlan();
}

// ---- Export entire week as JSON ----
function exportWeeklyPlanJSON() {
    if (!AppState.currentUser) { showToast('Please login first', 'error'); return; }
    var dates = getWeekDates(AppState.weekOffset);
    var weekData = { version: 1, type: 'weekly', user: AppState.currentUser.name, email: AppState.currentUser.email, weekStart: getDateStr(dates[0]), weekEnd: getDateStr(dates[6]), days: {} };

    dates.forEach(function(d) {
        var dateStr = getDateStr(d);
        var key = 'meal_' + AppState.currentUser.email + '_' + dateStr;
        var raw = localStorage.getItem(key);
        if (raw) { try { weekData.days[dateStr] = JSON.parse(raw); } catch (e) {} }
    });

    downloadJSON(weekData, 'healthfit-week-' + getDateStr(dates[0]) + '.json');
    showToast('Weekly plan exported!', 'success');
}

// ---- Import weekly plan from JSON ----
function importWeeklyPlanJSON(input) {
    var file = input.files[0];
    if (!file) return;
    if (!AppState.currentUser) { showToast('Please login first', 'error'); input.value = ''; return; }

    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var data = JSON.parse(e.target.result);
            if (data.type === 'weekly' && data.days) {
                var count = 0;
                Object.keys(data.days).forEach(function(dateStr) {
                    var plan = data.days[dateStr];
                    if (plan && plan.breakfast !== undefined) {
                        localStorage.setItem('meal_' + AppState.currentUser.email + '_' + dateStr, JSON.stringify(plan));
                        count++;
                    }
                });
                // Also save to history
                Object.keys(data.days).forEach(function(dateStr) {
                    var plan = data.days[dateStr];
                    if (!plan) return;
                    var historyKey = 'history_' + AppState.currentUser.email;
                    var history = [];
                    try { history = JSON.parse(localStorage.getItem(historyKey) || '[]'); } catch (err) {}
                    var idx = history.findIndex(function(i) { return i.date === dateStr && i.type === 'meal_plan'; });
                    var item = { date: dateStr, timestamp: new Date().toISOString(), type: 'meal_plan', data: plan };
                    if (idx >= 0) history[idx] = item; else history.unshift(item);
                    history = history.slice(0, 60);
                    localStorage.setItem(historyKey, JSON.stringify(history));
                });
                // Refresh today's data if included
                var todayKey = 'meal_' + AppState.currentUser.email + '_' + getTodayDate();
                var todayRaw = localStorage.getItem(todayKey);
                if (todayRaw) { try { AppState.mealPlan = JSON.parse(todayRaw); } catch (err) {} }
                loadWeeklyPlan();
                showToast(count + ' day(s) imported successfully!', 'success');
            } else if (data.mealPlan) {
                // Daily format - import to today
                importDailyToToday(data);
            } else {
                showToast('Invalid format. Use a HealthFit export file.', 'error');
            }
        } catch (err) {
            showToast('Could not parse file.', 'error');
        }
        input.value = '';
    };
    reader.readAsText(file);
}

function importDailyToToday(data) {
    if (data.mealPlan) {
        AppState.mealPlan = { breakfast: data.mealPlan.breakfast || [], lunch: data.mealPlan.lunch || [], dinner: data.mealPlan.dinner || [], snacks: data.mealPlan.snacks || [] };
        var today = getTodayDate();
        localStorage.setItem('meal_' + AppState.currentUser.email + '_' + today, JSON.stringify(AppState.mealPlan));
        loadWeeklyPlan();
        showToast('Daily plan imported to today!', 'success');
    }
}

// ---- Global exports ----
window.getMealPlanSummary = getMealPlanSummary;
window.exportMealPlanJSON = exportMealPlanJSON;
window.importMealPlanJSON = importMealPlanJSON;
window.loadWeeklyPlan = loadWeeklyPlan;
window.changeWeek = changeWeek;
window.editDayPlan = editDayPlan;
window.copyDayPlan = copyDayPlan;
window.exportWeeklyPlanJSON = exportWeeklyPlanJSON;
window.importWeeklyPlanJSON = importWeeklyPlanJSON;
