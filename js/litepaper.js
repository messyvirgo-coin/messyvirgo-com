/* ========================================
   LITEPAPER PAGE JAVASCRIPT
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // --- Tax/Tokenomics Chart ---
    const taxData = {
        labels: ['Reinvested in Project (3.70%)', 'Shared with You (1.25%)'],
        datasets: [{
            data: [3.70, 1.25],
            backgroundColor: ['#D97706', '#FBBF24'],
            borderColor: '#0a0a0a',
            borderWidth: 4,
            hoverOffset: 4
        }]
    };

    const taxConfig = {
        type: 'doughnut',
        data: taxData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            family: "'Inter', sans-serif",
                            size: 14
                        },
                        color: '#d1d5db',
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw}%`;
                        }
                    },
                    backgroundColor: 'rgba(10, 10, 10, 0.9)',
                    titleColor: '#e5e7eb',
                    bodyColor: '#d1d5db'
                }
            },
            cutout: '60%'
        }
    };
    
    const taxChartCtx = document.getElementById('taxChart');
    if (taxChartCtx) {
        new Chart(taxChartCtx.getContext('2d'), taxConfig);
    }

    // --- Vesting Timeline Chart ---
    const vestingData = [
        { name: 'Protocol Liquidity', cliff: 3, vesting: 21, color: '#38A169' },
        { name: 'Community & Partners', cliff: 6, vesting: 18, color: '#3182CE' },
        { name: 'Contributors & Advisors', cliff: 12, vesting: 12, color: '#805AD5' },
        { name: 'Treasury (Strategic)', cliff: 9, vesting: 15, color: '#D53F8C' },
        { name: 'CTO (Michael) - Upfront', cliff: 1, vesting: 1, color: '#F59E0B' },
        { name: 'CTO (Michael) - Vesting', cliff: 6, vesting: 18, color: '#FBBF24' }
    ];

    const chartContainer = document.getElementById('vesting-chart-container');
    const detailsPanel = document.getElementById('vesting-details');
    
    if (chartContainer && detailsPanel) {
        const computedStyle = window.getComputedStyle(chartContainer);
        const paddingLeft = parseFloat(computedStyle.paddingLeft);
        const paddingRight = parseFloat(computedStyle.paddingRight);
        const containerWidth = chartContainer.clientWidth - paddingLeft - paddingRight;

        vestingData.forEach((item, index) => {
            const totalDuration = 24; 
            const topOffset = index * 40;

            const fullBarContainer = document.createElement('div');
            fullBarContainer.style.position = 'absolute';
            fullBarContainer.style.width = `${containerWidth}px`;
            fullBarContainer.style.height = '16px';
            fullBarContainer.style.top = `${topOffset + 40}px`;
            
            const cliffBar = document.createElement('div');
            cliffBar.className = 'vesting-bar';
            cliffBar.style.backgroundColor = item.color;
            cliffBar.style.opacity = '0.3';
            cliffBar.style.left = `0%`;
            cliffBar.style.width = `${(item.cliff / totalDuration) * 100}%`;
            
            const bar = document.createElement('div');
            bar.className = 'vesting-bar';
            bar.style.backgroundColor = item.color;
            bar.style.left = `${(item.cliff / totalDuration) * 100}%`;
            bar.style.width = `${(item.vesting / totalDuration) * 100}%`;
            
            const label = document.createElement('div');
            label.className = 'absolute text-xs text-gray-400 whitespace-nowrap vesting-label';
            label.textContent = item.name;
            label.style.bottom = '100%';
            label.style.marginBottom = '2px';
            label.style.left = `0%`;
            
            fullBarContainer.appendChild(label);
            fullBarContainer.appendChild(cliffBar);
            fullBarContainer.appendChild(bar);
            chartContainer.appendChild(fullBarContainer);

            [bar, cliffBar].forEach(el => {
                el.addEventListener('mouseover', () => {
                    detailsPanel.innerHTML = `
                        <strong style="color:${item.color}">${item.name}</strong><br>
                        Cliff: ${item.cliff} months, Vesting: ${item.vesting} months
                    `;
                });
                el.addEventListener('mouseout', () => {
                    detailsPanel.innerHTML = 'Hover over a bar to see vesting details.';
                });
            });
        });
    }

    // --- Fade-In Sections ---
    const sections = document.querySelectorAll('.litepaper-section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        threshold: 0.1
    });
    sections.forEach(section => {
        observer.observe(section);
    });
    
    // --- Glossary Toggle with Keyboard Support ---
    const glossaryToggles = document.querySelectorAll('.glossary-toggle');
    glossaryToggles.forEach(toggle => {
        // Make toggleable with keyboard
        toggle.setAttribute('tabindex', '0');
        toggle.setAttribute('role', 'button');

        const handleToggle = () => {
            const content = toggle.nextElementSibling;
            const arrow = toggle.querySelector('span');
            
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                arrow.style.transform = 'rotate(0deg)';
                toggle.setAttribute('aria-expanded', 'false');
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
                arrow.style.transform = 'rotate(180deg)';
                toggle.setAttribute('aria-expanded', 'true');
            }
        };

        toggle.addEventListener('click', handleToggle);
        toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleToggle();
            }
        });

        toggle.setAttribute('aria-expanded', 'false');
    });

    // --- Sticky Navigation Activation ---
    const litePaperNav = document.querySelectorAll('.litepaper-nav a');
    window.addEventListener('scroll', () => {
        let current = '';
        litePaperNav.forEach(link => {
            const section = document.querySelector(link.getAttribute('href'));
            if (section && section.offsetTop <= window.scrollY + 100) {
                current = link.getAttribute('href');
            }
        });
        litePaperNav.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === current) {
                link.classList.add('active');
            }
        });
    });

});

