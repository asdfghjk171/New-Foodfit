# HealthFit - PRD & Progress Tracker

## Original Problem Statement
User had a GitHub Pages static health/nutrition web app at https://asdfghjk171.github.io/New-Foodfit/ with multiple critical issues. Required industry-level improvements.

## Architecture
- **Stack**: Pure HTML/CSS/JavaScript (static site for GitHub Pages)
- **Auth**: localStorage-based (simulated login/signup)
- **Food Database**: Built-in 1500+ items (70% Indian, 30% International) from user's CSV + enhancements
- **Charts**: Chart.js 4.x (doughnut + bar)
- **PDF**: jsPDF 2.5.1
- **No backend required** - everything runs client-side

## User Personas
1. Health-conscious Indian users wanting to track daily nutrition
2. Users preferring Indian day-to-day foods (dal, roti, biryani, dosa, paneer etc.)
3. Users wanting BMI/BMR calculations with actionable health suggestions

## Core Requirements (Static)
- Fix login popup appearing everywhere (CSS specificity bug)
- Fix BMI calculator not working
- Fix toggle buttons low opacity
- Replace external API with comprehensive Indian food database
- Fix pie chart showing no/useless data
- Improve UI with user's food background image
- Maintain PDF report generation
- Keep it static-friendly for GitHub Pages

## What's Been Implemented (Jan 2026)
1. **Login Popup Bug Fix** - CSS `.auth-page` was overriding `.page` display property. Fixed with specificity `.page.active.auth-page { display: flex; }`
2. **BMI/BMR Calculator** - Working with BMI gauge, category, daily target, and Indian-specific health suggestions
3. **Toggle Buttons** - Fully visible and functional (All, Vegetarian, Non-Veg, High Protein)
4. **Food Database** - 1499 foods from user's HBRS.csv with estimated macros (protein, carbs, fat, fiber)
5. **Food Search** - Built-in database search replacing unreliable OpenFoodFacts API, prioritizes Indian foods
6. **Charts** - Macronutrient Split (doughnut) + Calories by Meal (bar) showing real data, empty state when no meals
7. **UI Overhaul** - Dark green theme, Unsplash food background with overlay, Playfair Display + DM Sans fonts, glassmorphism
8. **Popular Indian Foods** - Quick-add chips for dal, roti, paneer, biryani, dosa, etc.
9. **Recommended Foods** - Dashboard section with personalized recommendations based on BMI
10. **Meal Timeline** - Breakfast/Lunch/Dinner/Snacks with calorie badges and remove buttons
11. **Meal Summary** - Total calories, protein, carbs, fat at a glance
12. **PDF Reports** - Improved PDF with health metrics, meal breakdown, and health recommendations
13. **History** - Saves and displays past meal plans
14. **Profile** - User info, image upload, stats

## Project Structure
```
/app/
├── index.html              # Main HTML (421 lines)
├── css/styles.css          # Modern styling (1328 lines)
├── js/
│   ├── foodDatabase.js     # 1500+ food items with macros
│   ├── app.js              # Main logic, page management (547 lines)
│   ├── auth.js             # Authentication (67 lines)
│   ├── dashboard.js        # BMI/BMR calculator (59 lines)
│   ├── charts.js           # Chart.js integration (137 lines)
│   ├── api.js              # Food search & recommendations (193 lines)
│   ├── mealPlanner.js      # Meal planning utilities (48 lines)
│   └── pdf.js              # PDF generation (151 lines)
```

## Backlog
- P0: All critical items completed
- P1: Mobile responsive navigation (hamburger menu)
- P2: Weekly meal plan view
- P2: Export/import meal plans
- P3: Water intake tracker
- P3: Exercise log integration
