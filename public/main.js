document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('main-header');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    // Sticky Header on Scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
    });

    // Mobile Menu Toggle
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isOpen = menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', isOpen);
            menuToggle.setAttribute('aria-label', isOpen ? 'Stäng meny' : 'Öppna meny');
            
            // Close dropdowns when menu is closed
            if (!isOpen) {
                document.querySelectorAll('.dropdown.active').forEach(d => d.classList.remove('active'));
            }
        });
    }

    // Mobile Dropdown Toggle (Click-to-expand)
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        if (link) {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 1024) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Close other dropdowns
                    dropdowns.forEach(other => {
                        if (other !== dropdown) other.classList.remove('active');
                    });
                    
                    const isOpen = dropdown.classList.toggle('active');
                    link.setAttribute('aria-expanded', isOpen);
                }
            });
        }
    });

    // Video Play/Pause Toggle
    const video = document.getElementById('hero-video');
    const videoToggle = document.getElementById('video-toggle');
    const videoIcon = document.getElementById('video-icon');

    if (video && videoToggle) {
        videoToggle.addEventListener('click', () => {
            if (video.paused) {
                video.play();
                videoToggle.setAttribute('aria-label', 'Pausa video');
                videoIcon.innerHTML = '<path d="M6 4h4v16H6zm8 0h4v16h-4z"/>'; // Pause icon
            } else {
                video.pause();
                videoToggle.setAttribute('aria-label', 'Spela video');
                videoIcon.innerHTML = '<path d="M8 5v14l11-7z"/>'; // Play icon
            }
        });
    }

    // Reveal animations on load
    const panels = document.querySelectorAll('.panel-content');
    panels.forEach((panel, index) => {
        setTimeout(() => {
            panel.style.opacity = '1';
            panel.style.transform = 'translateY(0)';
        }, 300 * (index + 1));
    });
    
    // Fade-in Animation Observer
    const faders = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .fade-in-up');
    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        // Mobile-only: Intercept core service rows and swap their animation classes for center pop-up
        if (window.innerWidth < 768 && fader.closest('.service-row')) {
            fader.classList.remove('fade-in-left', 'fade-in-right', 'fade-in', 'fade-in-up');
            fader.classList.add('mobile-pop-standby');
            return; // Skip standard observer
        }
        appearOnScroll.observe(fader);
    });

    // --- Mobile-only Center Pop-up Observer ---
    if (window.innerWidth < 768) {
        const mobilePopObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('mobile-pop-active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0,
            rootMargin: "-40% 0px -40% 0px" // Triggers when element crosses the middle 20% of viewport
        });

        // Small delay to ensure classes are added before observing
        setTimeout(() => {
            const mobileFaders = document.querySelectorAll('.mobile-pop-standby');
            mobileFaders.forEach(fader => mobilePopObserver.observe(fader));
        }, 100);
    }

    // --- Projects Carousel ---
    window.initProjectsCarousel = function() {
        const carousel = document.getElementById('projects-carousel');
        if (!carousel) return;

        const track = carousel.querySelector('.carousel-track');
        const dots = carousel.querySelectorAll('.carousel-dot');
        const prevBtn = document.getElementById('carousel-prev');
        const nextBtn = document.getElementById('carousel-next');
        if (!track || !prevBtn || !nextBtn) return;
        const totalSlides = track.children.length;
        if (totalSlides === 0) return;
        let currentSlide = 0;

        // Clear any previous auto-play
        if (window._carouselAutoPlay) {
            clearInterval(window._carouselAutoPlay);
            window._carouselAutoPlay = null;
        }

        // Remove old listeners by cloning buttons
        const newPrev = prevBtn.cloneNode(true);
        const newNext = nextBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrev, prevBtn);
        nextBtn.parentNode.replaceChild(newNext, nextBtn);

        function goToSlide(index) {
            currentSlide = ((index % totalSlides) + totalSlides) % totalSlides;
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
            dots.forEach(d => {
                d.classList.remove('active');
                d.removeAttribute('aria-current');
            });
            if (dots[currentSlide]) {
                dots[currentSlide].classList.add('active');
                dots[currentSlide].setAttribute('aria-current', 'true');
            }
        }

        function startAutoPlay() {
            stopAutoPlay();
            window._carouselAutoPlay = setInterval(() => {
                goToSlide(currentSlide + 1);
            }, 5000);
        }

        function stopAutoPlay() {
            if (window._carouselAutoPlay) {
                clearInterval(window._carouselAutoPlay);
                window._carouselAutoPlay = null;
            }
        }

        newNext.addEventListener('click', () => {
            goToSlide(currentSlide + 1);
            startAutoPlay();
        });

        newPrev.addEventListener('click', () => {
            goToSlide(currentSlide - 1);
            startAutoPlay();
        });

        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                goToSlide(parseInt(dot.dataset.index));
                startAutoPlay();
            });
        });

        // Reset to first slide and start
        goToSlide(0);
        startAutoPlay();
    };

    // Auto-initialize only if carousel is NOT marked as dynamic
    const carousel = document.getElementById('projects-carousel');
    if (carousel && !carousel.hasAttribute('data-dynamic')) {
        window.initProjectsCarousel();
    }

    // Animated Stat Counters
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    if (statNumbers.length > 0) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.getAttribute('data-target'), 10);
                    const duration = 2000;
                    const startTime = performance.now();

                    function animate(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        // Ease-out quad
                        const eased = 1 - (1 - progress) * (1 - progress);
                        el.textContent = Math.floor(eased * target);
                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            el.textContent = target;
                        }
                    }
                    requestAnimationFrame(animate);
                    counterObserver.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(el => counterObserver.observe(el));
    }

    // --- Project Filtering ---
    const filterBtns = document.querySelectorAll('.filter-btn');

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
                const filterValue = btn.dataset.filter;
                // Fetch dynamically loaded cards
                const currentProjectCards = document.querySelectorAll('.project-card');
                currentProjectCards.forEach(card => {
                    if (filterValue === 'all' || card.dataset.category === filterValue) {
                        card.classList.remove('is-hidden');
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                            card.classList.add('visible');
                        }, 10);
                    } else {
                        card.classList.add('is-hidden');
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';
                    }
                });
            });
        });
    }

    // --- Premium Blog Card Intersection Observer ---
    const premiumBlogCards = document.querySelectorAll('.premium-blog-card');
    if (premiumBlogCards.length > 0) {
        const blogCardObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    blogCardObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        premiumBlogCards.forEach(el => blogCardObserver.observe(el));
    }

    // --- Premium Blog Filtering ---
    const blogFilterBtns = document.querySelectorAll('.blog-filter-nav-v2 button, .blog-filter-nav button');

    if (blogFilterBtns.length > 0) {
        blogFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                blogFilterBtns.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
                const filterValue = btn.dataset.filter;
                // Fetch dynamically loaded blog cards
                const currentBlogCardsList = document.querySelectorAll('.premium-blog-card');
                currentBlogCardsList.forEach(card => {
                    if (filterValue === 'all' || card.dataset.category === filterValue) {
                        card.classList.remove('is-hidden');
                        setTimeout(() => {
                            card.classList.add('visible');
                        }, 50);
                    } else {
                        card.classList.add('is-hidden');
                        card.classList.remove('visible');
                    }
                });
            });
        });
    }

    // --- Partner Cards Staggered Animation ---
    const partnerCards = document.querySelectorAll('.partner-card');
    if (partnerCards.length > 0) {
        const partnerObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    partnerCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('visible');
                        }, index * 150);
                    });
                    partnerObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        const grid = document.querySelector('.partnerships-grid');
        if (grid) partnerObserver.observe(grid);
    }

    // --- File Size Validation (Max 5MB) ---
    const fileInput = document.getElementById('file-upload');
    const fileError = document.getElementById('file-error');
    const fileLabelText = document.getElementById('file-label-text');
    const submitBtn = document.getElementById('submit-btn');

    if (fileInput && submitBtn) {
        // Form is initially enabled
        submitBtn.disabled = false; 

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            
            // Update label text if file is selected
            if (file) {
                fileLabelText.textContent = file.name.length > 25 ? file.name.substring(0, 22) + "..." : file.name;
            } else {
                fileLabelText.textContent = "Ingen fil vald";
            }

            if (file && file.size > 5 * 1024 * 1024) {
                fileError.style.display = 'block';
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.5';
                submitBtn.style.cursor = 'not-allowed';
            } else {
                if (fileError) fileError.style.display = 'none';
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                submitBtn.style.cursor = 'pointer';
            }
        });
    }

    // --- Dynamic Select Color (Placeholder matching) ---
    const serviceSelect = document.getElementById('service');
    if (serviceSelect) {
        serviceSelect.addEventListener('change', () => {
            if (serviceSelect.value !== "") {
                serviceSelect.style.color = '#1B263B'; // Dark Navy for selection
            }
        });
    }

    // --- Premium FAQ Accordion ---
    const faqQuestions = document.querySelectorAll('.faq-question');
    if (faqQuestions.length > 0) {
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const item = question.closest('.faq-item');
                const isActive = item.classList.contains('active');
                
                // Close other items for a more focused premium experience
                document.querySelectorAll('.faq-item').forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active');
            });
        });
    }

    // --- Google reCAPTCHA v3 Implementation ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Pause submission

            // Replace 'YOUR_SITE_KEY' with your actual public site key
            if (typeof grecaptcha !== 'undefined') {
                grecaptcha.ready(function() {
                    grecaptcha.execute('YOUR_SITE_KEY', {action: 'submit'}).then(function(token) {
                        // Inject token into hidden input
                        document.getElementById('recaptchaToken').value = token;
                        
                        // Now truly submit the form
                        contactForm.submit();
                    });
                });
            } else {
                // Fallback if script failed to load
                contactForm.submit();
            }
        });
    }
});

/* --- GDPR Intercept Logic --- */
window.addEventListener('DOMContentLoaded', () => {
    const newsletterForm = document.getElementById('newsletterForm');
    const gdprModal = document.getElementById('gdpr-modal');
    
    if (newsletterForm && gdprModal) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            gdprModal.classList.add('active'); 
            gdprModal.setAttribute('aria-hidden', 'false');
        });

        const closeModal = () => {
            gdprModal.classList.remove('active');
            gdprModal.setAttribute('aria-hidden', 'true');
        };

        const closeBtn = gdprModal.querySelector('.modal-close');
        const cancelBtn = gdprModal.querySelector('.gdpr-cancel');
        const acceptBtn = gdprModal.querySelector('.gdpr-accept');

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                closeModal();
                setTimeout(() => {
                    alert('Tack! Ditt samtycke är verifierat och din e-post registrerad.');
                    newsletterForm.reset();
                }, 400);
            });
        }
        
        gdprModal.addEventListener('click', (e) => {
            if (e.target === gdprModal) {
                closeModal();
            }
        });
    }
});

/* --- FAQ Expand Toggle Logic --- */
window.addEventListener('DOMContentLoaded', () => {
    const faqToggles = [
        { btn: 'faq-toggle-konstruktion', panel: 'faq-extra-konstruktion' },
        { btn: 'faq-toggle-skyddsrum',    panel: 'faq-extra-skyddsrum'    },
    ];

    faqToggles.forEach(({ btn, panel }) => {
        const button = document.getElementById(btn);
        const extra  = document.getElementById(panel);
        if (!button || !extra) return;

        button.addEventListener('click', () => {
            const isOpen = button.getAttribute('aria-expanded') === 'true';

            if (isOpen) {
                extra.classList.remove('is-open');
                extra.setAttribute('aria-hidden', 'true');
                button.setAttribute('aria-expanded', 'false');
                button.querySelector('.btn-label').textContent = 'VISA FLER FAQs';
            } else {
                extra.classList.add('is-open');
                extra.setAttribute('aria-hidden', 'false');
                button.setAttribute('aria-expanded', 'true');
                button.querySelector('.btn-label').textContent = 'VISA FÄRRE FAQs';
            }
        });
    });
});

/* --- GDPR Cookie Consent Logic --- */
(function() {
    const CONSENT_KEY = 'gc_cookie_consent';

    function getConsent() {
        try { return JSON.parse(localStorage.getItem(CONSENT_KEY)); } catch { return null; }
    }

    function setConsent(obj) {
        localStorage.setItem(CONSENT_KEY, JSON.stringify({ ...obj, ts: Date.now() }));
    }

    function hideBanner() {
        const b = document.getElementById('cookie-banner');
        if (b) { b.classList.remove('visible'); setTimeout(() => b.remove(), 600); }
    }

    function hideModal() {
        const m = document.getElementById('cookie-modal-overlay');
        if (m) m.classList.remove('active');
    }

    function showModal() {
        const m = document.getElementById('cookie-modal-overlay');
        if (m) m.classList.add('active');
    }

    function applyConsent(consent) {
        // Placeholder: fire analytics / marketing scripts here based on consent
        // e.g. if (consent.analytics) { /* init GA */ }
    }

    window.addEventListener('DOMContentLoaded', () => {
        const existing = getConsent();
        if (existing) { applyConsent(existing); return; } // Already answered

        // Inject banner HTML
        const banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.className = 'cookie-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Cookie-inställningar');
        banner.innerHTML = `
            <div class="cookie-banner-inner">
                <div class="cookie-text">
                    <strong>Vi respekterar din integritet 🔒</strong>
                    <p>Vi använder cookies för att förbättra din upplevelse och analysera trafik. Läs mer i vår <a href="#">Integritetspolicy</a> och <a href="#">Cookiepolicy</a>.</p>
                </div>
                <div class="cookie-actions">
                    <button class="btn-cookie-accept" id="cookie-accept-all">Acceptera alla</button>
                    <button class="btn-cookie-reject" id="cookie-reject">Endast nödvändiga</button>
                    <button class="btn-cookie-settings" id="cookie-open-settings">Hantera inställningar</button>
                </div>
            </div>`;
        document.body.appendChild(banner);
        setTimeout(() => banner.classList.add('visible'), 400);

        // Inject settings modal HTML
        const modal = document.createElement('div');
        modal.id = 'cookie-modal-overlay';
        modal.className = 'cookie-modal-overlay';
        modal.innerHTML = `
            <div class="cookie-modal" role="dialog" aria-modal="true" aria-label="Cookie-inställningar">
                <h3>Hantera cookie-inställningar</h3>
                <p>Välj vilka kategorier av cookies du godkänner. Nödvändiga cookies kan inte avaktiveras eftersom de krävs för att webbplatsen ska fungera.</p>

                <div class="cookie-category">
                    <div class="cookie-category-info">
                        <strong>Nödvändiga</strong>
                        <span>Krävs för grundläggande funktioner. Kan inte avaktiveras.</span>
                    </div>
                    <label class="cookie-toggle">
                        <input type="checkbox" id="toggle-necessary" checked disabled>
                        <span class="cookie-toggle-slider"></span>
                    </label>
                </div>

                <div class="cookie-category">
                    <div class="cookie-category-info">
                        <strong>Analytiska</strong>
                        <span>Hjälper oss förstå hur besökare använder sajten (t.ex. Google Analytics).</span>
                    </div>
                    <label class="cookie-toggle">
                        <input type="checkbox" id="toggle-analytics">
                        <span class="cookie-toggle-slider"></span>
                    </label>
                </div>

                <div class="cookie-category">
                    <div class="cookie-category-info">
                        <strong>Marknadsföring</strong>
                        <span>Används för riktad reklam och remarketing på externa plattformar.</span>
                    </div>
                    <label class="cookie-toggle">
                        <input type="checkbox" id="toggle-marketing">
                        <span class="cookie-toggle-slider"></span>
                    </label>
                </div>

                <div class="cookie-modal-actions">
                    <button class="btn-cookie-reject" id="cookie-modal-cancel">Avbryt</button>
                    <button class="btn-cookie-save" id="cookie-save-settings">Spara inställningar</button>
                </div>
            </div>`;
        document.body.appendChild(modal);

        // Close modal on overlay click
        modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });

        // Button logic
        document.getElementById('cookie-accept-all').addEventListener('click', () => {
            const consent = { necessary: true, analytics: true, marketing: true };
            setConsent(consent); applyConsent(consent); hideBanner();
        });

        document.getElementById('cookie-reject').addEventListener('click', () => {
            const consent = { necessary: true, analytics: false, marketing: false };
            setConsent(consent); applyConsent(consent); hideBanner();
        });

        document.getElementById('cookie-open-settings').addEventListener('click', showModal);
        document.getElementById('cookie-modal-cancel').addEventListener('click', hideModal);

        document.getElementById('cookie-save-settings').addEventListener('click', () => {
            const consent = {
                necessary: true,
                analytics:  document.getElementById('toggle-analytics').checked,
                marketing:  document.getElementById('toggle-marketing').checked,
            };
            setConsent(consent); applyConsent(consent); hideBanner(); hideModal();
        });
    });
})();


/* =====================================================
   SCROLL LINE ANIMATION
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const path = document.getElementById('services-path');
    if (path) {
        const pathLength = 3000;
        path.style.strokeDasharray = pathLength;
        path.style.strokeDashoffset = pathLength;

        window.addEventListener('scroll', () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight));
            const draw = pathLength * scrollPercent * 1.5; // Multiply for faster draw
            path.style.strokeDashoffset = pathLength - draw;
        });
    }
});



/* =====================================================
   SCROLL LINE ANIMATION FIXED
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const path = document.getElementById('services-path');
    if (path) {
        const pathLength = 4000;
        path.style.strokeDasharray = pathLength;
        path.style.strokeDashoffset = pathLength;

        window.addEventListener('scroll', () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight));
            const draw = pathLength * scrollPercent * 1.5; 
            path.style.strokeDashoffset = pathLength - draw;
        });
    }
});



/* =====================================================
   UNIVERSAL SCROLL LINE COMPONENT
   ===================================================== */
const updateScrollLine = () => {
    const paths = document.querySelectorAll('.scroll-line');
    paths.forEach(path => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPos = window.scrollY;
        const progress = Math.min(scrollPos / totalHeight, 1);
        
        // Path length is hardcoded to 10000 to cover longest pages
        const length = 10000; 
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length - (length * progress * 2); // Factor for faster reveal
    });
};

window.addEventListener('scroll', updateScrollLine);
window.addEventListener('resize', updateScrollLine);
document.addEventListener('DOMContentLoaded', updateScrollLine);



/* =====================================================
   UNIVERSAL SCROLL LINE COMPONENT (REFINED)
   ===================================================== */
const updateScrollLineFixed = () => {
    const paths = document.querySelectorAll('.scroll-line');
    paths.forEach(path => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPos = window.scrollY;
        const progress = Math.min(scrollPos / totalHeight, 1);
        
        const length = 6000; 
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length - (length * progress * 2.5); // Faster reveal
    });
};

window.addEventListener('scroll', updateScrollLineFixed);
window.addEventListener('resize', updateScrollLineFixed);
document.addEventListener('DOMContentLoaded', updateScrollLineFixed);


// --- Partners Grid Staggered Domino Animation ---
document.addEventListener('DOMContentLoaded', () => {
    const partnersGrids = document.querySelectorAll('.partners-grid');
    if (partnersGrids.length > 0) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        };

        const partnersObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const logoItems = entry.target.querySelectorAll('.partners-grid-item');
                    logoItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('visible');
                        }, index * 120); // 120ms staggered delay
                    });
                    partnersObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        partnersGrids.forEach(grid => partnersObserver.observe(grid));
    }
});


