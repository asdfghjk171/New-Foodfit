// ==========================================
// HEALTHFIT - API INTEGRATION (Open Food Facts)
// ==========================================

const API_BASE_URL = 'https://world.openfoodfacts.org';

// Search Food API
async function searchFoodAPI(query) {
    const searchResults = document.getElementById('search-results');
    if (!searchResults) return;
    
    // Show loading
    searchResults.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-secondary);">Searching...</p>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`);
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        
        if (!data.products || data.products.length === 0) {
            searchResults.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No results found for "${query}". Try different keywords.</p>
                </div>
            `;
            return;
        }
        
        // Display results
        displaySearchResults(data.products);
        
    } catch (error) {
        console.error('Error searching food:', error);
        searchResults.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error loading results. Please try again.</p>
            </div>
        `;
        showToast('Error searching foods. Please try again.', 'error');
    }
}

// Display Search Results
function displaySearchResults(products) {
    const searchResults = document.getElementById('search-results');
    if (!searchResults) return;
    
    searchResults.innerHTML = '';
    
    // Filter and process products
    const processedProducts = products
        .filter(product => product.product_name && product.nutriments)
        .slice(0, 12); // Limit to 12 results
    
    if (processedProducts.length === 0) {
        searchResults.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>No nutritional data available for these items.</p>
            </div>
        `;
        return;
    }
    
    processedProducts.forEach(product => {
        const foodItem = createFoodItemElement(product);
        searchResults.appendChild(foodItem);
    });
}

// Create Food Item Element
function createFoodItemElement(product) {
    const div = document.createElement('div');
    div.className = 'food-item';
    
    const name = product.product_name || 'Unknown';
    const nutrients = product.nutriments || {};
    
    // Extract nutritional data (per 100g)
    const calories = Math.round(nutrients['energy-kcal_100g'] || nutrients['energy_100g'] / 4.184 || 0);
    const protein = (nutrients['proteins_100g'] || 0).toFixed(1);
    const carbs = (nutrients['carbohydrates_100g'] || 0).toFixed(1);
    const fat = (nutrients['fat_100g'] || 0).toFixed(1);
    
    // Check if vegetarian (simple heuristic)
    const isVegetarian = !product.ingredients_text?.toLowerCase().includes('meat') && 
                        !product.ingredients_text?.toLowerCase().includes('chicken') &&
                        !product.ingredients_text?.toLowerCase().includes('fish');
    
    const badge = isVegetarian ? 
        '<span class="food-item-badge" style="background: var(--success);">Veg</span>' : 
        '<span class="food-item-badge" style="background: var(--danger);">Non-Veg</span>';
    
    div.innerHTML = `
        <div class="food-item-header">
            <h4>${name}</h4>
            ${badge}
        </div>
        <div class="food-item-nutrition">
            <span><strong>${calories}</strong> kcal</span>
            <span><strong>${protein}g</strong> protein</span>
            <span><strong>${carbs}g</strong> carbs</span>
            <span><strong>${fat}g</strong> fat</span>
        </div>
        <div class="food-item-actions">
            <button class="btn btn-primary btn-small" onclick="addFoodToMeal(${JSON.stringify({
                name,
                calories,
                protein,
                carbs,
                fat
            }).replace(/"/g, '&quot;')})" data-testid="add-food-btn">
                <i class="fas fa-plus"></i> Add to Meal
            </button>
        </div>
    `;
    
    return div;
}

// Add Food to Meal
function addFoodToMeal(food) {
    if (!AppState.currentMealSlot) {
        showToast('Please select a meal slot first (Breakfast, Lunch, Dinner, or Snacks)', 'warning');
        return;
    }
    
    // Add food to the selected meal slot
    if (!AppState.mealPlan[AppState.currentMealSlot]) {
        AppState.mealPlan[AppState.currentMealSlot] = [];
    }
    
    AppState.mealPlan[AppState.currentMealSlot].push(food);
    
    // Re-render meal plan
    renderMealPlan();
    
    // Update charts
    if (typeof updateChartsWithHealthData === 'function') {
        updateChartsWithHealthData();
    }
    
    showToast(`${food.name} added to ${AppState.currentMealSlot}!`, 'success');
}

// Make functions globally accessible
window.searchFoodAPI = searchFoodAPI;
window.addFoodToMeal = addFoodToMeal;
