/* ========================================
   SHARED JAVASCRIPT FOR ALL PAGES
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- Observer for fade-in animations ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });

    // --- Mobile Menu Toggle ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            const opening = mobileMenu.classList.contains('hidden');
            mobileMenu.classList.toggle('hidden');
            // When opening menu, always show the nav (even if scrolled)
            if (opening && navbar) {
                navbar.style.transform = 'translateY(0)';
            }
        });
    }

    // --- Auto-hide nav on scroll down, reveal on scroll up ---
    const navbar = document.getElementById('navbar');
    if (navbar) {
        let lastScrollY = window.scrollY;
        const hero = document.getElementById('hero');
        const heroThreshold = hero ? hero.offsetHeight - 80 : 0;

        // On pages with a hero, start hidden until user scrolls past it
        if (hero && window.scrollY < heroThreshold) {
            navbar.style.transform = 'translateY(-100%)';
        }

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            const menuOpen = mobileMenu && !mobileMenu.classList.contains('hidden');

            if (menuOpen) {
                // Never hide nav while mobile menu is visible
            } else if (hero && currentScrollY < heroThreshold) {
                // Still inside hero — keep nav hidden
                navbar.style.transform = 'translateY(-100%)';
            } else if (currentScrollY > lastScrollY) {
                // Scrolling down — hide
                navbar.style.transform = 'translateY(-100%)';
            } else if (currentScrollY < lastScrollY) {
                // Scrolling up — reveal
                navbar.style.transform = 'translateY(0)';
            }

            lastScrollY = Math.max(0, currentScrollY);
        }, { passive: true });
    }

    // --- Scroll Progress Bar ---
    const scrollProgress = document.getElementById('scroll-progress');
    if (scrollProgress) {
        window.addEventListener('scroll', () => {
            const totalHeight = document.body.scrollHeight - window.innerHeight;
            const progress = (window.scrollY / totalHeight) * 100;
            scrollProgress.style.width = `${progress}%`;
        });
    }
});

// --- Modal Toggle Function ---
function toggleModal(show) {
    const modal = document.getElementById('litepaperModal');
    if (show) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    } else {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

