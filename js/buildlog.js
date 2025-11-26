/* ========================================
   BUILD LOG PAGE JAVASCRIPT
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    const buildlogEntries = document.querySelectorAll('.buildlog-entry');

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

