document.addEventListener('DOMContentLoaded', () => {
    // 1. Setup Scroll Reveal Observer (so we can reuse it for dynamic content)
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    };
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const revealObserver = new IntersectionObserver(revealCallback, revealOptions);
    
    // Observe existing static elements
    const staticRevealElements = document.querySelectorAll('.reveal');
    staticRevealElements.forEach(el => revealObserver.observe(el));

    // 2. Fetch and Render Inventory Dynamically
    const hardwareContainer = document.getElementById('hardware-container');
    
    if (hardwareContainer) {
        // Künstliche Verzögerung, um die Loading-Skeletons zu demonstrieren
        // Kann in Produktion entfernt werden
        setTimeout(() => {
            fetch('inventory.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Netzwerkantwort war nicht ok');
                    }
                    return response.json();
                })
                .then(inventory => {
                    // Skeletons entfernen
                    hardwareContainer.innerHTML = '';
                    
                    // Produkte rendern
                    inventory.forEach((item, index) => {
                        const delay = index * 100;
                        const delayStyle = delay > 0 ? `style="transition-delay: ${delay}ms;"` : '';
                        
                        const cardHTML = `
                            <div class="glass-card product-card reveal" ${delayStyle}>
                                <div class="product-image">
                                    <i class="fas ${item.image}"></i>
                                </div>
                                <div class="product-content">
                                    <h3 class="product-title">${item.brand} ${item.model}</h3>
                                    <ul class="product-specs">
                                        <li><i class="fas fa-microchip text-accent"></i> ${item.cpu}</li>
                                        <li><i class="fas fa-memory text-accent"></i> ${item.ram}</li>
                                        <li><i class="fas fa-hdd text-accent"></i> ${item.ssd}</li>
                                    </ul>
                                    <div class="product-footer">
                                        <span class="product-price">CHF ${item.price}</span>
                                        <a href="#contact" class="btn btn-secondary">Details anfragen</a>
                                    </div>
                                </div>
                            </div>
                        `;
                        hardwareContainer.insertAdjacentHTML('beforeend', cardHTML);
                    });
                    
                    // Neue Elemente für Scroll-Animation registrieren
                    const newRevealElements = hardwareContainer.querySelectorAll('.reveal');
                    newRevealElements.forEach(el => revealObserver.observe(el));
                })
                .catch(error => {
                    console.error('Fehler beim Laden des Inventars:', error);
                    hardwareContainer.innerHTML = '<div class="error-msg" style="grid-column: 1/-1; text-align: center; padding: 2rem;">Aktuelle Angebote konnten nicht geladen werden. Bitte versuche es später noch einmal.</div>';
                });
        }, 800); // 800ms Delay für Skelett-Ansicht
    }

    // 3. Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 4. Mobile menu toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Close mobile menu when clicking a link
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = mobileBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });

    // 5. Form submission
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = '<span>Gesendet!</span> <i class="fas fa-check"></i>';
            btn.style.background = 'var(--accent-green)';
            btn.style.color = 'var(--bg-dark)';
            
            setTimeout(() => {
                form.reset();
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.style.color = '';
            }, 3000);
        });
    }
});
