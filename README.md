"# HealthFit - Personal Health & Nutrition Planner

A fully dynamic, user-personalized health-based food recommendation web application built with **pure HTML, CSS, and Vanilla JavaScript**.

## 🌟 Features

### 1. **Authentication System**
- User signup and login functionality
- LocalStorage-based authentication
- Secure password handling
- Session persistence

### 2. **BMI & BMR Calculator**
- Calculate Body Mass Index (BMI)
- Calculate Basal Metabolic Rate (BMR) using Harris-Benedict Equation
- Health category classification (Underweight, Normal, Overweight, Obese)
- Smart health suggestions based on results

### 3. **Nutrition Charts**
- Interactive macronutrient distribution chart (Protein, Carbs, Fat)
- Calories breakdown by meal type
- Real-time chart updates based on meal plan
- Built with Chart.js

### 4. **Meal Planning System**
- Day-wise meal timeline (Breakfast, Lunch, Dinner, Snacks)
- Dietary preference toggle (All, Vegetarian, Non-Vegetarian)
- Add/remove meals from timeline
- Nutritional tracking per meal

### 5. **Food Search & API Integration**
- Integration with Open Food Facts API (free API)
- Search thousands of foods with nutritional data
- Real-time search results
- Detailed nutritional information per 100g

### 6. **PDF Report Generation**
- Comprehensive health reports using jsPDF
- Includes BMI/BMR metrics
- Complete meal plan breakdown
- Nutritional summary
- Health recommendations

### 7. **History & Tracking**
- Save meal plans to LocalStorage
- View past meal plans (up to 30 days)
- Track daily nutrition over time
- Activity statistics

### 8. **Profile Management**
- Profile image upload (up to 2MB)
- User statistics
- Account information
- Days active tracking

### 9. **Modern UI/UX**
- Glassmorphism design
- Gradient backgrounds
- Smooth animations and transitions
- Fully responsive (mobile, tablet, desktop)
- Dark theme with accent colors
- Toast notifications

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Libraries**: 
  - Chart.js (for charts)
  - jsPDF (for PDF generation)
  - Font Awesome (for icons)
- **Storage**: LocalStorage / IndexedDB
- **API**: Open Food Facts API (free)
- **Fonts**: Google Fonts (Poppins)

## 📁 Project Structure

```
/app/
├── index.html              # Main HTML file
├── css/
│   └── styles.css         # Main stylesheet
├── js/
│   ├── app.js             # Main application logic
│   ├── auth.js            # Authentication
│   ├── dashboard.js       # BMI/BMR calculator
│   ├── charts.js          # Chart.js integration
│   ├── api.js             # API integration
│   ├── mealPlanner.js     # Meal planning utilities
│   └── pdf.js             # PDF generation
└── assets/
    └── images/            # Image assets
```

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No backend server required!

### Installation

1. **Clone or download the project**
   ```bash
   cd /app
   ```

2. **Open in browser**
   - Simply open `index.html` in your web browser
   - Or use a local server:
     ```bash
     # Using Python
     python3 -m http.server 3000
     
     # Using Node.js
     npx serve
     ```

3. **Access the application**
   - Open your browser and navigate to the served URL
   - No build process required!

## 📖 How to Use

### 1. **Getting Started**
- Click \"Get Started\" to create a new account
- Or click \"Login\" if you already have an account

### 2. **Calculate Your Health Metrics**
- Go to Dashboard
- Enter your height, weight, age, and gender
- Click \"Calculate BMI & BMR\"
- View your results and personalized health suggestions

### 3. **Plan Your Meals**
- Navigate to \"Meal Planner\"
- Set your dietary preference (All/Veg/Non-Veg)
- Search for foods using the search bar
- Click \"+\" on a meal slot to activate it
- Add foods to your meal timeline
- View nutrition charts update in real-time

### 4. **Save & Generate Reports**
- Click \"Save Meal Plan\" to save to history
- Click \"Download PDF\" to generate a comprehensive report
- View saved plans in the \"History\" section

### 5. **Manage Your Profile**
- Go to \"Profile\"
- Upload a profile picture
- View your activity statistics

## 🔧 Technical Details

### BMI Calculation
```javascript
BMI = weight (kg) / (height (m))²
```

### BMR Calculation (Harris-Benedict Equation)
```javascript
Male: BMR = 88.362 + (13.397 × weight) + (4.799 × height) - (5.677 × age)
Female: BMR = 447.593 + (9.247 × weight) + (3.098 × height) - (4.330 × age)
```

### Data Storage
- **Users**: `localStorage.users`
- **Current User**: `localStorage.currentUser`
- **Health Data**: `localStorage.health_{email}`
- **Meal Plans**: `localStorage.meal_{email}_{date}`
- **History**: `localStorage.history_{email}`
- **Profile Image**: `localStorage.profile_image_{email}`

### API Integration
- **Endpoint**: `https://world.openfoodfacts.org/cgi/search.pl`
- **Method**: GET
- **Response**: JSON with product nutritional data
- **Rate Limit**: No authentication required (free API)

## 🎨 Design Features

### Color Palette
- Primary: `#10b981` (Green)
- Secondary: `#3b82f6` (Blue)
- Accent: `#8b5cf6` (Purple)
- Background: `#0f172a` (Dark Blue)
- Text: `#f1f5f9` (Light Gray)

### Effects
- Glassmorphism with backdrop blur
- Gradient backgrounds
- Smooth transitions (0.3s ease)
- Hover effects and animations
- Loading states

## 📱 Responsive Design

- **Desktop**: Full layout with all features
- **Tablet**: Adapted grid layouts
- **Mobile**: Single column, touch-optimized

## 🔒 Security Notes

- Passwords are stored in plain text in LocalStorage (for demo purposes)
- In production, use proper backend authentication
- LocalStorage data persists per browser
- Clear browser data to reset the app

## 🌐 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+

## 📊 Data Limits

- **Profile Image**: Max 2MB
- **History**: Last 30 days
- **LocalStorage**: ~5-10MB (browser dependent)
- **Search Results**: Limited to 12 items per search

## 🚫 Limitations

- No backend server (all data stored locally)
- No user data synchronization across devices
- No real-time collaboration
- Limited to LocalStorage capacity
- No email verification or password recovery

## 🎯 Future Enhancements

- [ ] IndexedDB for larger data storage
- [ ] Export/Import meal plans
- [ ] Weekly meal planning
- [ ] Recipe suggestions
- [ ] Exercise tracking
- [ ] Water intake tracker
- [ ] Calorie goals and progress tracking
- [ ] Dark/Light theme toggle
- [ ] Multi-language support

## 📄 License

This project is for educational and personal use.

## 🙏 Credits

- **Open Food Facts API**: https://world.openfoodfacts.org
- **Chart.js**: https://www.chartjs.org
- **jsPDF**: https://github.com/parallax/jsPDF
- **Font Awesome**: https://fontawesome.com
- **Google Fonts**: https://fonts.google.com

## 💡 Tips

1. **Use realistic data** for accurate BMI/BMR calculations
2. **Search specific food names** for better API results
3. **Save regularly** to avoid losing meal plans
4. **Download PDFs** before clearing browser data
5. **Use desktop browser** for best experience

## 🐛 Troubleshooting

### Charts not displaying?
- Ensure Chart.js CDN is loaded
- Check browser console for errors
- Refresh the page

### PDF not generating?
- Ensure jsPDF CDN is loaded
- Check if you have meals added
- Try a different browser

### Login not working?
- Check if LocalStorage is enabled
- Clear browser cache and try again
- Use a different email

### API search not working?
- Check internet connection
- Try simpler search terms
- Wait a few seconds and retry

## 📞 Support

For issues or questions, please refer to the documentation or check the browser console for error messages.

---

**Built with ❤️ using Pure HTML, CSS, and JavaScript**

Last Updated: April 2025
"
