let allInventory = [];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Setup Scroll Reveal Observer
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
    
    // Beobachte statische Elemente
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // 2. Fetch and Render Inventory Dynamically
    const hardwareContainer = document.getElementById('hardware-container');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    if (hardwareContainer) {
        setTimeout(() => {
            fetch('inventory.json')
                .then(response => {
                    if (!response.ok) throw new Error('Netzwerkantwort war nicht ok');
                    return response.json();
                })
                .then(inventory => {
                    allInventory = inventory;
                    renderInventory('all');
                })
                .catch(error => {
                    console.error('Fehler beim Laden des Inventars:', error);
                    hardwareContainer.innerHTML = '<div class="error-msg" style="grid-column: 1/-1; text-align: center; padding: 2rem;">Aktuelle Angebote konnten nicht geladen werden. Bitte versuche es später noch einmal.</div>';
                });
        }, 800); // 800ms Delay für Skelett-Ansicht
    }

    function renderInventory(filterBrand) {
        if (!hardwareContainer) return;
        hardwareContainer.innerHTML = '';
        
        const filtered = filterBrand === 'all' 
            ? allInventory 
            : allInventory.filter(item => item.brand.toLowerCase() === filterBrand.toLowerCase());
            
        if (filtered.length === 0) {
            hardwareContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-muted);">Derzeit keine Angebote für diese Marke verfügbar.</div>';
            return;
        }
            
        filtered.forEach((item, index) => {
            const delay = index * 100;
            const delayStyle = delay > 0 ? `style="transition-delay: ${delay}ms;"` : '';
            
            const cardHTML = `
                <div class="glass-card product-card reveal" ${delayStyle}>
                    <div class="product-image">
                        <img src="${item.image}" alt="${item.brand} ${item.model}">
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
                            <button class="btn btn-secondary details-btn" data-id="${item.id}">Mehr erfahren</button>
                        </div>
                    </div>
                </div>
            `;
            hardwareContainer.insertAdjacentHTML('beforeend', cardHTML);
        });
        
        // Modal-Buttons verknüpfen
        document.querySelectorAll('.details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                openModal(id);
            });
        });
        
        // Scroll Animationen neu zuweisen
        document.querySelectorAll('#hardware-container .reveal').forEach(el => revealObserver.observe(el));
    }

    // Filter Logik
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => {
                b.classList.remove('active');
                b.style.borderColor = 'rgba(255,255,255,0.2)';
                b.style.background = 'transparent';
                b.style.color = 'var(--text-main)';
            });
            
            e.target.classList.add('active');
            e.target.style.borderColor = 'var(--accent-cyan)';
            e.target.style.background = 'rgba(0,229,255,0.1)';
            e.target.style.color = 'var(--accent-cyan)';
            
            const filter = e.target.getAttribute('data-filter');
            renderInventory(filter);
        });
    });

    // 3. Modal Logik
    const modal = document.getElementById('product-modal');
    const modalDetails = document.getElementById('modal-details');
    const closeModalBtn = document.querySelector('.close-modal');

    function openModal(id) {
        const item = allInventory.find(i => i.id === id);
        if (!item || !modalDetails) return;
        
        // Subjekt Dropdown vorbereiten für Contact Form
        const subjectSelect = document.getElementById('subject');
        if(subjectSelect) {
            subjectSelect.value = 'hardware';
        }
        const messageTextA = document.getElementById('message');
        if(messageTextA) {
            messageTextA.value = `Hallo Lukas, ich interessiere mich für das Gerät: ${item.brand} ${item.model} (ID: ${item.id}). Ist es noch verfügbar?`;
        }
        
        modalDetails.innerHTML = `
            <div class="modal-grid">
                <div class="modal-image">
                    <img src="${item.image}" alt="${item.brand} ${item.model}">
                </div>
                <div class="modal-info">
                    <h2 class="modal-title">${item.brand} ${item.model}</h2>
                    <span class="modal-price">CHF ${item.price}</span>
                    <p class="modal-description">${item.description}</p>
                    
                    <ul class="product-specs" style="margin-bottom: 2.5rem;">
                        <li><i class="fas fa-microchip text-accent"></i> <strong>CPU:</strong> ${item.cpu}</li>
                        <li><i class="fas fa-memory text-accent"></i> <strong>RAM:</strong> ${item.ram}</li>
                        <li><i class="fas fa-hdd text-accent"></i> <strong>Speicher:</strong> ${item.ssd}</li>
                        <li><i class="fas fa-desktop text-accent"></i> <strong>Display:</strong> ${item.screen}</li>
                        <li><i class="fas fa-gamepad text-accent"></i> <strong>Grafik:</strong> ${item.gpu}</li>
                        <li><i class="fas fa-clipboard-check text-accent"></i> <strong>Zustand:</strong> ${item.condition}</li>
                    </ul>
                    
                    <a href="#contact" class="btn btn-primary btn-large trigger-contact" style="width: 100%;">Jetzt anfragen <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
        // Kurzer Timer für CSS transition
        setTimeout(() => modal.classList.add('show'), 10);
        
        // Schliessen bei Klick auf anfragen
        document.querySelector('.trigger-contact').addEventListener('click', closeModal);
    }

    function closeModal() {
        if(modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // 4. FAQ Accordion Logik
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Alle schliessen
                faqItems.forEach(faq => faq.classList.remove('active'));
                
                // Dieses öffnen, falls es nicht schon offen war
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });

    // 5. Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // 6. Mobile menu toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileBtn && navLinks) {
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
        
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = mobileBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    // 7. Form submission
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            
            // Formulardaten auslesen
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Ladeanimation auf Button
            btn.innerHTML = '<span>Wird gesendet...</span> <i class="fas fa-spinner fa-spin"></i>';
            
            // Daten an Formsubmit senden
            fetch("https://formsubmit.co/ajax/Lukas_Walti@sluz.ch", {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    Name: data.name,
                    Email: data.email,
                    Betreff: data.subject,
                    Nachricht: data.message,
                    _subject: "Neue Anfrage über deine IT-Website!"
                })
            })
            .then(response => response.json())
            .then(result => {
                // Bei Erfolg: Erfolgsanimation
                btn.innerHTML = '<span>Gesendet!</span> <i class="fas fa-check"></i>';
                btn.style.background = 'var(--accent-green)';
                btn.style.color = 'var(--bg-dark)';
                
                setTimeout(() => {
                    form.reset();
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.style.color = '';
                }, 4000);
            })
            .catch(error => {
                console.error("Fehler beim Senden:", error);
                btn.innerHTML = '<span>Fehler beim Senden</span> <i class="fas fa-times"></i>';
                btn.style.background = '#FF5F56';
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                }, 3000);
            });
        });
    }
});
