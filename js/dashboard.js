// ==========================================
// HEALTHFIT - DASHBOARD LOGIC
// ==========================================

// Initialize Dashboard
function initializeDashboard() {
    const bmiForm = document.getElementById('bmi-form');
    
    if (bmiForm) {
        bmiForm.addEventListener('submit', calculateBMI);
    }
    
    // Load saved health data if exists
    if (AppState.userHealth.height) {
        document.getElementById('height').value = AppState.userHealth.height;
    }
    if (AppState.userHealth.weight) {
        document.getElementById('weight').value = AppState.userHealth.weight;
    }
    if (AppState.userHealth.age) {
        document.getElementById('age').value = AppState.userHealth.age;
    }
    if (AppState.userHealth.gender) {
        document.getElementById('gender').value = AppState.userHealth.gender;
    }
}

// Calculate BMI and BMR
function calculateBMI(e) {
    e.preventDefault();
    
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    
    // Validate inputs
    if (!height || !weight || !age || height <= 0 || weight <= 0 || age <= 0) {
        showToast('Please enter valid values', 'error');
        return;
    }
    
    // Calculate BMI (weight in kg / (height in m)^2)
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    // Calculate BMR using Harris-Benedict Equation
    let bmr;
    if (gender === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
    
    // Determine BMI category
    let category;
    if (bmi < 18.5) {
        category = 'Underweight';
    } else if (bmi >= 18.5 && bmi < 25) {
        category = 'Normal Weight';
    } else if (bmi >= 25 && bmi < 30) {
        category = 'Overweight';
    } else {
        category = 'Obese';
    }
    
    // Update AppState
    AppState.userHealth = {
        height,
        weight,
        age,
        gender,
        bmi,
        bmr,
        category
    };
    
    // Save to localStorage
    if (AppState.currentUser) {
        localStorage.setItem(`health_${AppState.currentUser.email}`, JSON.stringify(AppState.userHealth));
    }
    
    // Display results
    displayBMIResults();
    
    // Update charts with new data
    if (typeof updateChartsWithHealthData === 'function') {
        updateChartsWithHealthData();
    }
    
    showToast('BMI and BMR calculated successfully!', 'success');
}

// Initialize dashboard when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    initializeDashboard();
}
