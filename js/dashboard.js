// ==========================================
// HEALTHFIT - DASHBOARD / BMI CALCULATOR (FIXED)
// ==========================================

function initializeDashboard() {
    const bmiForm = document.getElementById('bmi-form');
    if (bmiForm) bmiForm.onsubmit = calculateBMI;
}

function calculateBMI(e) {
    e.preventDefault();

    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;

    if (!height || !weight || !age || height <= 0 || weight <= 0 || age <= 0) {
        showToast('Please enter valid values', 'error');
        return;
    }

    if (height < 50 || height > 300) { showToast('Height should be between 50-300 cm', 'error'); return; }
    if (weight < 10 || weight > 500) { showToast('Weight should be between 10-500 kg', 'error'); return; }
    if (age < 1 || age > 150) { showToast('Please enter a valid age', 'error'); return; }

    // BMI Formula: weight(kg) / (height(m))^2
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);

    // BMR using Harris-Benedict Equation
    let bmr;
    if (gender === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    // Category
    let category;
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal Weight';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';

    AppState.userHealth = { height: height, weight: weight, age: age, gender: gender, bmi: bmi, bmr: bmr, category: category };

    // Save to localStorage
    if (AppState.currentUser) {
        localStorage.setItem('health_' + AppState.currentUser.email, JSON.stringify(AppState.userHealth));
    }

    displayBMIResults();
    updateQuickStats();

    if (typeof updateChartsWithHealthData === 'function') updateChartsWithHealthData();

    showToast('BMI: ' + bmi.toFixed(1) + ' (' + category + ') | BMR: ' + Math.round(bmr) + ' cal/day', 'success');
}
