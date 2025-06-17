document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const animeCards = document.querySelectorAll('.anime-card');
    const animeSection = document.querySelector('section');
    
    let searchResultsContainer = null;
    let allAnimeData = [];
    
    // Extract anime data from existing cards
    animeCards.forEach(card => {
        const animeData = {
            element: card,
            name: card.querySelector('h3').textContent.toLowerCase(),
            year: card.querySelector('p:nth-of-type(1)').textContent.toLowerCase(),
            genre: card.querySelector('p:nth-of-type(5)').textContent.toLowerCase(),
            summary: card.querySelector('p:nth-of-type(3)').textContent.toLowerCase(),
            stars: card.querySelector('p:nth-of-type(4)').textContent.toLowerCase()
        };
        allAnimeData.push(animeData);
    });
    
    // Create search results container
    function createSearchResultsContainer() {
        if (!searchResultsContainer) {
            searchResultsContainer = document.createElement('div');
            searchResultsContainer.id = 'searchResults';
            searchResultsContainer.style.cssText = `
                background: white;
                border: 1px solid #ddd;
                border-radius: 5px;
                max-height: 300px;
                overflow-y: auto;
                position: absolute;
                width: 100%;
                z-index: 1000;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                display: none;
            `;
            
            // Position relative to search form
            searchForm.style.position = 'relative';
            searchForm.appendChild(searchResultsContainer);
        }
        return searchResultsContainer;
    }
    
    // Show search suggestions
    function showSearchSuggestions(matches) {
        const container = createSearchResultsContainer();
        container.innerHTML = '';
        
        if (matches.length === 0) {
            container.innerHTML = '<div style="padding: 10px; color: #666;">No anime found</div>';
        } else {
            matches.forEach(match => {
                const suggestionItem = document.createElement('div');
                suggestionItem.style.cssText = `
                    padding: 10px;
                    cursor: pointer;
                    border-bottom: 1px solid #eee;
                    transition: background-color 0.2s;
                `;
                
                const animeName = match.element.querySelector('h3').textContent;
                const animeYear = match.element.querySelector('p:nth-of-type(1)').textContent;
                const animeGenre = match.element.querySelector('p:nth-of-type(5)').textContent;
                
                suggestionItem.innerHTML = `
                    <strong>${animeName}</strong><br>
                    <small style="color: #666;">${animeYear} • ${animeGenre}</small>
                `;
                
                // Hover effect
                suggestionItem.addEventListener('mouseenter', function() {
                    this.style.backgroundColor = '#f0f0f0';
                });
                
                suggestionItem.addEventListener('mouseleave', function() {
                    this.style.backgroundColor = 'white';
                });
                
                // Click to scroll to anime
                suggestionItem.addEventListener('click', function() {
                    // Hide search results
                    container.style.display = 'none';
                    
                    // Clear search input
                    searchInput.value = '';
                    
                    // Show all anime cards first
                    animeCards.forEach(card => {
                        card.style.display = 'block';
                    });
                    
                    // Scroll to the selected anime with smooth behavior
                    match.element.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                    
                    // Highlight the selected anime temporarily
                    match.element.style.cssText += `
                        border: 3px solid #007bff;
                        background-color: #f8f9fa;
                        transform: scale(1.02);
                        transition: all 0.3s ease;
                    `;
                    
                    // Remove highlight after 3 seconds
                    setTimeout(() => {
                        match.element.style.border = '';
                        match.element.style.backgroundColor = '';
                        match.element.style.transform = '';
                    }, 3000);
                });
                
                container.appendChild(suggestionItem);
            });
        }
        
        container.style.display = 'block';
    }
    
    // Hide search results
    function hideSearchResults() {
        if (searchResultsContainer) {
            searchResultsContainer.style.display = 'none';
        }
    }
    
    // Search functionality
    function performSearch(query) {
        if (query.length === 0) {
            hideSearchResults();
            // Show all anime cards
            animeCards.forEach(card => {
                card.style.display = 'block';
            });
            return;
        }
        
        const matches = allAnimeData.filter(anime => {
            return anime.name.includes(query) || 
                   anime.genre.includes(query) || 
                   anime.year.includes(query) ||
                   anime.summary.includes(query) ||
                   anime.stars.includes(query);
        });
        
        showSearchSuggestions(matches);
    }
    
    // Event listeners
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        performSearch(query);
    });
    
    searchInput.addEventListener('focus', function() {
        const query = this.value.toLowerCase().trim();
        if (query.length > 0) {
            performSearch(query);
        }
    });
    
    // Hide search results when clicking outside
    document.addEventListener('click', function(event) {
        if (!searchForm.contains(event.target)) {
            hideSearchResults();
        }
    });
    
    // Prevent form submission and perform search instead
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const query = searchInput.value.toLowerCase().trim();
        
        if (query.length > 0) {
            // Filter visible anime cards
            let hasVisibleResults = false;
            animeCards.forEach(card => {
                const cardData = allAnimeData.find(anime => anime.element === card);
                if (cardData && (
                    cardData.name.includes(query) || 
                    cardData.genre.includes(query) || 
                    cardData.year.includes(query) ||
                    cardData.summary.includes(query) ||
                    cardData.stars.includes(query)
                )) {
                    card.style.display = 'block';
                    hasVisibleResults = true;
                } else {
                    card.style.display = 'none';
                }
            });
            
            hideSearchResults();
            
            if (!hasVisibleResults) {
                // Show "no results" message
                let noResultsMsg = document.getElementById('noResultsMessage');
                if (!noResultsMsg) {
                    noResultsMsg = document.createElement('div');
                    noResultsMsg.id = 'noResultsMessage';
                    noResultsMsg.style.cssText = `
                        text-align: center;
                        padding: 20px;
                        color: #666;
                        font-style: italic;
                    `;
                    animeSection.appendChild(noResultsMsg);
                }
                noResultsMsg.innerHTML = `No anime found for "${searchInput.value}"`;
                noResultsMsg.style.display = 'block';
            } else {
                // Hide "no results" message if it exists
                const noResultsMsg = document.getElementById('noResultsMessage');
                if (noResultsMsg) {
                    noResultsMsg.style.display = 'none';
                }
            }
        } else {
            // Show all anime if search is empty
            animeCards.forEach(card => {
                card.style.display = 'block';
            });
            hideSearchResults();
        }
    });
    
    // Clear search functionality
    function clearSearch() {
        searchInput.value = '';
        hideSearchResults();
        animeCards.forEach(card => {
            card.style.display = 'block';
        });
        const noResultsMsg = document.getElementById('noResultsMessage');
        if (noResultsMsg) {
            noResultsMsg.style.display = 'none';
        }
    }
    
    // Add clear button functionality if needed
    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.textContent = 'Clear';
    clearButton.style.cssText = `
        margin-left: 10px;
        padding: 8px 12px;
        background: #6c757d;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;
    clearButton.addEventListener('click', clearSearch);
    searchForm.appendChild(clearButton);
});
