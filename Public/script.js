// Global variables
let allCountries = [];        // All countries fetched from API
let filteredCountries = [];   // Countries after search/filter
let displayedCount = 12;      // Initially show 12 countries
const countriesPerPage = 12;  // Load 12 more when "Show More" is clicked

function normalizeCountryName(nameObj) {
    const commonName = nameObj?.common || 'N/A';
    if (commonName === 'United States Minor Outlying Islands') {
        return { ...nameObj, common: 'United States of America' };
    }
    return nameObj || { common: 'N/A' };
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch countries from Node.js API
        await fetchData();

        // Initially, show first 20 countries
        filteredCountries = [...allCountries.slice(0, 20)];

        // Populate initial country cards
        displayedCount = 12;
        populateCountryCards();

        // Update stats
        updateStats();

        // Setup search/filter and pagination buttons
        setupEventListeners();
        updatePaginationButtons();
    } catch (err) {
        console.error('Error initializing app:', err);
        const noResults = document.getElementById('noResults');
        noResults.style.display = 'block';
        noResults.textContent = 'Failed to load countries. Please try again later.';
    }
});

// Fetch countries from Node.js API
async function fetchData() {
    try {
        const response = await fetch('/countries');
        if (!response.ok) {
            throw new Error(`Countries request failed with status ${response.status}`);
        }
        const countries = await response.json();

        // Normalize data to avoid missing fields
        allCountries = countries.map(country => ({
            name: normalizeCountryName(country.name),
            capital: country.capital || 'N/A',
            region: country.region || 'N/A',
            subregion: country.subregion || 'N/A',
            population: country.population || 0,
            flags: country.flags || {},
            currencies: country.currencies || {},
            languages: country.languages || {}
        }));
    } catch (err) {
        console.error('Error fetching countries:', err);
        throw err;
    }
}

// Setup search, filter, and pagination button events
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const regionFilter = document.getElementById('regionFilter');
    const populationInput = document.getElementById('populationInput');
    const showMoreBtn = document.getElementById('showMoreBtn');
    const backBtn = document.getElementById('backBtn');

    searchInput.addEventListener('input', () => {
        displayedCount = 12; // Reset display on new search
        filterCountries();
    });

    regionFilter.addEventListener('change', () => {
        displayedCount = 12; // Reset display on new filter
        filterCountries();
    });

    populationInput.addEventListener('input', () => {
        displayedCount = 12; // Reset display on population filter change
        filterCountries();
    });

    showMoreBtn.addEventListener('click', () => {
        displayedCount += countriesPerPage;
        populateCountryCards();
        updatePaginationButtons();
    });

    backBtn.addEventListener('click', () => {
        displayedCount = 12;
        populateCountryCards();
        updatePaginationButtons();
    });
}

// Filter countries based on search input and region
function filterCountries() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const regionValue = document.getElementById('regionFilter').value;
    const populationValue = document.getElementById('populationInput').value.trim();

    filteredCountries = allCountries.filter(country => {
        const countryName = country.name.common.toLowerCase();
        const matchesSearch = countryName.includes(searchValue);
        const matchesRegion = !regionValue || country.region === regionValue;
        const matchesPopulation = matchesPopulationFilter(country.population, populationValue);
        return matchesSearch && matchesRegion && matchesPopulation;
    });

    populateCountryCards();
    updateStats();
    updatePaginationButtons();
}

function matchesPopulationFilter(population, filterValue) {
    if (!filterValue) {
        return true;
    }

    const value = filterValue.replaceAll(',', '').replaceAll(' ', '');

    if (/^\d+-\d+$/.test(value)) {
        const [min, max] = value.split('-').map(Number);
        return population >= min && population <= max;
    }

    if (/^>=\d+$/.test(value)) {
        return population >= Number(value.slice(2));
    }

    if (/^<=\d+$/.test(value)) {
        return population <= Number(value.slice(2));
    }

    if (/^>\d+$/.test(value)) {
        return population > Number(value.slice(1));
    }

    if (/^<\d+$/.test(value)) {
        return population < Number(value.slice(1));
    }

    if (/^\d+$/.test(value)) {
        return population === Number(value);
    }

    return true;
}

// Populate country cards
function populateCountryCards() {
    const container = document.getElementById('country-cards-container');
    const noResults = document.getElementById('noResults');

    container.innerHTML = '';

    if (!filteredCountries || filteredCountries.length === 0) {
        container.style.display = 'none';
        noResults.style.display = 'block';
        noResults.textContent = 'No countries found.';
        return;
    }

    container.style.display = 'grid';
    noResults.style.display = 'none';

    // Slice countries to display only up to displayedCount
    const countriesToDisplay = filteredCountries.slice(0, displayedCount);

    countriesToDisplay.forEach(country => {
        const card = createCountryCard(country);
        container.appendChild(card);
    });
}

// Create a single country card element
function createCountryCard(country) {
    const card = document.createElement('div');
    card.className = 'country-card';
    card.style.cursor = 'pointer';

    const flagImage = country.flags?.png || country.flags?.svg || null;

    const currencies = Object.values(country.currencies || {});
    const firstCurrency = currencies[0] || { name: 'N/A', symbol: '' };
    const currencyDisplay = `${firstCurrency.symbol || ''} ${firstCurrency.name}`.trim();

    const population = country.population.toLocaleString();

    let flagHTML = '';
    if (flagImage) {
        flagHTML = `<img src="${flagImage}" alt="${country.name.common} flag" class="country-flag" loading="lazy">`;
    } else {
        flagHTML = `<div class="flag-placeholder">🌍</div>`;
    }

    card.innerHTML = `
        <div class="flag-container">
            ${flagHTML}
        </div>
        <h2>${country.name.common}</h2>
        <div class="country-card-content">
            <div class="country-info">
                <span class="info-label">Capital</span>
                <span class="info-value">${country.capital}</span>
            </div>
            <div class="country-info">
                <span class="info-label">Region</span>
                <span class="info-value">${country.region}</span>
            </div>
            <div class="country-info">
                <span class="info-label">Population</span>
                <span class="info-value">${population}</span>
            </div>
            <div class="country-info">
                <span class="info-label">Currency</span>
                <span class="info-value">${currencyDisplay}</span>
            </div>
        </div>
    `;

    card.addEventListener('click', () => countryCardHandler(country));

    return card;
}

function getFormattedCurrencies(currencies) {
    const formatted = Object.values(currencies || {})
        .map(currency => currency?.name)
        .filter(Boolean);

    return formatted.length ? formatted.join(', ') : 'N/A';
}

function getFormattedLanguages(languages) {
    const formatted = Object.values(languages || {}).filter(Boolean);
    return formatted.length ? formatted.join(', ') : 'N/A';
}

function countryCardHandler(country) {
    const params = new URLSearchParams({
        name: country.name?.common || 'N/A',
        capital: Array.isArray(country.capital) ? country.capital.join(', ') : (country.capital || 'N/A'),
        region: country.region || 'N/A',
        subregion: country.subregion || 'N/A',
        population: String(country.population || 0),
        flag: country.flags?.png || country.flags?.svg || '',
        currencies: getFormattedCurrencies(country.currencies),
        languages: getFormattedLanguages(country.languages)
    });

    window.location.href = `detail.html?${params.toString()}`;
}

// Update total and displayed stats
function updateStats() {
    const totalCountriesEl = document.getElementById('totalCountries');
    const displayedCountriesEl = document.getElementById('displayedCountries');

    totalCountriesEl.textContent = allCountries.length;      // Total fetched countries
    displayedCountriesEl.textContent = filteredCountries.length; // Filtered/displayed count
}

// Update pagination buttons
function updatePaginationButtons() {
    const showMoreBtn = document.getElementById('showMoreBtn');
    const backBtn = document.getElementById('backBtn');

    backBtn.style.display = displayedCount > 12 ? 'inline-block' : 'none';
    showMoreBtn.style.display = displayedCount < filteredCountries.length ? 'inline-block' : 'none';
}
