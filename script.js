// Global variables
let allCountries = [];
let filteredCountries = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Limit to first 20 countries for the initial display
    allCountries = data.slice(0, 20);
    filteredCountries = [...allCountries];
    
    // Populate the cards
    populateCountryCards();
    
    // Update stats
    updateStats();
    
    // Add event listeners for search and filter
    setupEventListeners();
});

// Setup event listeners for search and filter
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const regionFilter = document.getElementById('regionFilter');
    
    searchInput.addEventListener('input', function() {
        filterCountries();
    });
    
    regionFilter.addEventListener('change', function() {
        filterCountries();
    });
}

// Filter countries based on search and region
function filterCountries() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const regionFilter = document.getElementById('regionFilter').value;
    
    filteredCountries = allCountries.filter(country => {
        const countryName = country.name.common.toLowerCase();
        const matchesSearch = countryName.includes(searchInput);
        const matchesRegion = !regionFilter || country.region === regionFilter;
        
        return matchesSearch && matchesRegion;
    });
    
    populateCountryCards();
    updateStats();
}

// Populate country cards
function populateCountryCards() {
    const container = document.getElementById('country-cards-container');
    const noResults = document.getElementById('noResults');
    
    container.innerHTML = '';
    
    if (!filteredCountries || filteredCountries.length === 0) {
        container.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }
    
    container.style.display = 'grid';
    noResults.style.display = 'none';
    
    filteredCountries.forEach(country => {
        const card = createCountryCard(country);
        container.appendChild(card);
    });
}

// Create a country card element
function createCountryCard(country) {
    const card = document.createElement('div');
    card.className = 'country-card';
    
    // Get flag image - prefer PNG over SVG
    const flagImage = country.flags && country.flags.png 
        ? country.flags.png 
        : country.flags && country.flags.svg
        ? country.flags.svg
        : null;
    
    // Get currency info
    const currency = country.currencies && country.currencies[0] 
        ? country.currencies[0] 
        : { code: 'N/A', name: 'N/A', symbol: '' };
    
    const countryName = country.name.common;
    const capital = country.capital || 'N/A';
    const region = country.region || 'N/A';
    const population = country.population ? country.population.toLocaleString() : 'N/A';
    const currencyDisplay = `${currency.symbol} ${currency.code} - ${currency.name}`;
    
    let flagHTML = '';
    if (flagImage) {
        flagHTML = `<img src="${flagImage}" alt="${countryName} flag" class="country-flag" loading="lazy">`;
    } else {
        flagHTML = `<div class="flag-placeholder">🌍</div>`;
    }
    
    card.innerHTML = `
        <div class="flag-container">
            ${flagHTML}
        </div>
        <h2>${countryName}</h2>
        <div class="country-card-content">
            <div class="country-info">
                <span class="info-label">Capital</span>
                <span class="info-value">${capital}</span>
            </div>
            <div class="country-info">
                <span class="info-label">Region</span>
                <span class="info-value">${region}</span>
            </div>
            <div class="country-info">
                <span class="info-label">Population</span>
                <span class="info-value"><span class="population-number">${population}</span></span>
            </div>
            <div class="country-info">
                <span class="info-label">Currency</span>
                <span class="info-value"><span class="currency-symbol">${currency.symbol}</span>${currencyDisplay}</span>
            </div>
        </div>
    `;
    
    return card;
}

// Update statistics
function updateStats() {
    const totalCountries = document.getElementById('totalCountries');
    totalCountries.textContent = filteredCountries.length;
}