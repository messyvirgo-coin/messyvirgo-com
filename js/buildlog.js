/* ========================================
   BUILD LOG PAGE JAVASCRIPT
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    
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

