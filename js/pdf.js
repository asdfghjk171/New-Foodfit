// ==========================================
// HEALTHFIT - PDF GENERATION LOGIC
// ==========================================

// Generate PDF Report
function generatePDF() {
    // Check if jsPDF is loaded
    if (typeof jspdf === 'undefined') {
        showToast('PDF library not loaded. Please refresh the page.', 'error');
        return;
    }
    
    if (!AppState.currentUser) {
        showToast('Please login to generate PDF', 'error');
        return;
    }
    
    try {
        // Get jsPDF from the global scope
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Get summary data
        const summary = getMealPlanSummary();
        const today = getTodayDate();
        
        // Set up styling
        const primaryColor = [16, 185, 129];
        const textColor = [15, 23, 42];
        const secondaryColor = [148, 163, 184];
        
        let yPosition = 20;
        
        // Title
        doc.setFontSize(24);
        doc.setTextColor(...primaryColor);
        doc.text('HealthFit Meal Plan Report', 105, yPosition, { align: 'center' });
        
        yPosition += 10;
        
        // Date
        doc.setFontSize(12);
        doc.setTextColor(...secondaryColor);
        doc.text(`Generated on: ${today}`, 105, yPosition, { align: 'center' });
        
        yPosition += 15;
        
        // User Info
        doc.setFontSize(14);
        doc.setTextColor(...textColor);
        doc.text(`User: ${AppState.currentUser.name}`, 20, yPosition);
        yPosition += 7;
        doc.setFontSize(10);
        doc.setTextColor(...secondaryColor);
        doc.text(`Email: ${AppState.currentUser.email}`, 20, yPosition);
        
        yPosition += 15;
        
        // Health Data (if available)
        if (AppState.userHealth.bmi) {
            doc.setFontSize(16);
            doc.setTextColor(...primaryColor);
            doc.text('Health Metrics', 20, yPosition);
            yPosition += 10;
            
            doc.setFontSize(11);
            doc.setTextColor(...textColor);
            doc.text(`BMI: ${AppState.userHealth.bmi.toFixed(1)} (${AppState.userHealth.category})`, 20, yPosition);
            yPosition += 6;
            doc.text(`BMR: ${Math.round(AppState.userHealth.bmr)} calories/day`, 20, yPosition);
            yPosition += 6;
            doc.text(`Height: ${AppState.userHealth.height} cm | Weight: ${AppState.userHealth.weight} kg`, 20, yPosition);
            yPosition += 6;
            doc.text(`Age: ${AppState.userHealth.age} | Gender: ${AppState.userHealth.gender}`, 20, yPosition);
            
            yPosition += 15;
        }
        
        // Meal Plan Summary
        doc.setFontSize(16);
        doc.setTextColor(...primaryColor);
        doc.text('Daily Nutrition Summary', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(11);
        doc.setTextColor(...textColor);
        doc.text(`Total Meals: ${summary.totalMeals}`, 20, yPosition);
        yPosition += 6;
        doc.text(`Total Calories: ${Math.round(summary.totalCalories)} kcal`, 20, yPosition);
        yPosition += 6;
        doc.text(`Protein: ${Math.round(summary.totalProtein)}g | Carbs: ${Math.round(summary.totalCarbs)}g | Fat: ${Math.round(summary.totalFat)}g`, 20, yPosition);
        
        yPosition += 15;
        
        // Meal Breakdown
        doc.setFontSize(16);
        doc.setTextColor(...primaryColor);
        doc.text('Meal Breakdown', 20, yPosition);
        yPosition += 10;
        
        const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
        const mealIcons = {
            breakfast: '☀️',
            lunch: '🌤️',
            dinner: '🌙',
            snacks: '🍪'
        };
        
        mealTypes.forEach(mealType => {
            const meals = AppState.mealPlan[mealType];
            const breakdown = summary.mealBreakdown[mealType];
            
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            
            doc.setFontSize(14);
            doc.setTextColor(...textColor);
            doc.text(`${mealType.charAt(0).toUpperCase() + mealType.slice(1)} (${breakdown.count} items)`, 20, yPosition);
            yPosition += 7;
            
            if (meals.length > 0) {
                doc.setFontSize(10);
                doc.setTextColor(...secondaryColor);
                
                meals.forEach((meal, index) => {
                    if (yPosition > 270) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    
                    const mealText = `  ${index + 1}. ${meal.name}`;
                    doc.text(mealText, 25, yPosition);
                    yPosition += 5;
                    
                    const nutritionText = `     Cal: ${meal.calories || 0} | P: ${meal.protein || 0}g | C: ${meal.carbs || 0}g | F: ${meal.fat || 0}g`;
                    doc.text(nutritionText, 25, yPosition);
                    yPosition += 6;
                });
                
                doc.setFontSize(10);
                doc.setTextColor(...textColor);
                doc.text(`  Subtotal: ${breakdown.calories} kcal`, 25, yPosition);
                yPosition += 10;
            } else {
                doc.setFontSize(10);
                doc.setTextColor(...secondaryColor);
                doc.text('  No meals added', 25, yPosition);
                yPosition += 10;
            }
        });
        
        // Health Suggestions (if available)
        if (AppState.userHealth.bmi) {
            if (yPosition > 220) {
                doc.addPage();
                yPosition = 20;
            }
            
            doc.setFontSize(16);
            doc.setTextColor(...primaryColor);
            doc.text('Health Recommendations', 20, yPosition);
            yPosition += 10;
            
            const suggestions = generateHealthSuggestions();
            doc.setFontSize(10);
            doc.setTextColor(...textColor);
            
            suggestions.forEach((suggestion, index) => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }
                
                const lines = doc.splitTextToSize(`${index + 1}. ${suggestion}`, 170);
                doc.text(lines, 20, yPosition);
                yPosition += (lines.length * 5) + 3;
            });
        }
        
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(...secondaryColor);
            doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
            doc.text('Generated by HealthFit - Your Personal Health Companion', 105, 285, { align: 'center' });
        }
        
        // Save PDF
        doc.save(`HealthFit-Meal-Plan-${today}.pdf`);
        
        showToast('PDF report generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        showToast('Error generating PDF. Please try again.', 'error');
    }
}

// Make function globally accessible
window.generatePDF = generatePDF;
