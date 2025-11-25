/* ========================================
   BUILD LOG PAGE JAVASCRIPT
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // --- Filter Functionality ---
    const filterBadges = document.querySelectorAll('.filter-badge');
    const buildlogEntries = document.querySelectorAll('.buildlog-entry');
    let activeFilters = new Set();

    filterBadges.forEach(badge => {
        badge.addEventListener('click', () => {
            const category = badge.dataset.category;
            
            if (activeFilters.has(category)) {
                activeFilters.delete(category);
                badge.classList.remove('active');
            } else {
                activeFilters.add(category);
                badge.classList.add('active');
            }
            
            filterEntries();
        });

        // Keyboard support
        badge.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                badge.click();
            }
        });

        badge.setAttribute('tabindex', '0');
    });

    function filterEntries() {
        buildlogEntries.forEach((entry, index) => {
            const entryTags = Array.from(entry.querySelectorAll('.entry-tag'))
                .map(tag => tag.textContent.trim().toLowerCase());

            const shouldShow = activeFilters.size === 0 || 
                Array.from(activeFilters).some(filter => 
                    entryTags.some(tag => tag.includes(filter))
                );

            if (!shouldShow) {
                entry.classList.add('hidden');
                entry.style.animation = 'none';
            } else {
                entry.classList.remove('hidden');
                // Stagger animation for visible entries
                entry.style.animation = `fadeIn 0.6s ease-out ${index * 0.05}s forwards`;
            }
        });
    }

    // --- Search Functionality with Debounce ---
    const searchInput = document.querySelector('.buildlog-search');
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.toLowerCase().trim();
            
            searchTimeout = setTimeout(() => {
                buildlogEntries.forEach((entry, index) => {
                    const text = entry.textContent.toLowerCase();
                    const matches = text.includes(query);
                    
                    if (!matches) {
                        entry.classList.add('hidden');
                        entry.style.animation = 'none';
                    } else {
                        entry.classList.remove('hidden');
                        entry.style.animation = `fadeIn 0.6s ease-out ${index * 0.05}s forwards`;
                    }
                });
            }, 300);
        });
    }

    // --- Entry Expansion Toggle with Smooth Animation ---
    const entryCards = document.querySelectorAll('.buildlog-entry-card');
    
    // Expand the first (newest) entry by default
    if (entryCards.length > 0) {
        const firstCard = entryCards[0];
        const firstContent = firstCard.querySelector('.buildlog-entry-content');
        const firstToggle = firstCard.querySelector('.buildlog-entry-toggle');
        if (firstContent && firstToggle) {
            firstContent.classList.add('expanded');
            firstToggle.classList.add('expanded');
        }
    }
    
    entryCards.forEach(card => {
        const header = card.querySelector('.buildlog-entry-header');
        
        header.addEventListener('click', function(e) {
            // Prevent toggle if clicking on a link
            if (e.target.tagName === 'A') return;
            
            const content = card.querySelector('.buildlog-entry-content');
            const toggle = card.querySelector('.buildlog-entry-toggle');
            
            content.classList.toggle('expanded');
            toggle.classList.toggle('expanded');
        });

        // Keyboard support
        header.setAttribute('tabindex', '0');
        header.setAttribute('role', 'button');
        header.style.cursor = 'pointer';

        header.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                header.click();
            }
        });
    });

    // --- Staggered Fade-In Animation ---
    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting && !entry.target.classList.contains('hidden')) {
                entry.target.style.animation = `fadeIn 0.6s ease-out ${index * 0.05}s forwards`;
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                fadeInObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    buildlogEntries.forEach((entry, index) => {
        if (!entry.classList.contains('hidden')) {
            entry.style.opacity = '0';
            entry.style.transform = 'translateY(20px)';
            fadeInObserver.observe(entry);
        }
    });

    // --- Smooth Scroll Behavior ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // --- Load More Functionality (Optional) ---
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        let itemsShown = 10;
        
        loadMoreBtn.addEventListener('click', () => {
            const hiddenEntries = document.querySelectorAll('.buildlog-entry[style*="display: none"]');
            let count = 0;
            
            hiddenEntries.forEach(entry => {
                if (count < 5) {
                    entry.style.display = 'block';
                    entry.style.animation = `fadeIn 0.6s ease-out forwards`;
                    count++;
                }
            });

            if (hiddenEntries.length <= 5) {
                loadMoreBtn.style.display = 'none';
            }
        });
    }
});

