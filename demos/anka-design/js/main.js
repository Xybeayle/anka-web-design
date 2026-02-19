/* ====================================================================
    ANKA DESIGN SYSTEM | MAIN JAVASCRIPT
    Version: 2.0
====================================================================
*/

document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------------------------------
    // 1. CUSTOM CURSOR LOGIC (Magnetic & Lag)
    // ----------------------------------------------------------------
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    // Only activate on non-touch devices
    if (window.matchMedia("(pointer: fine)").matches) {
        
        let mouseX = 0;
        let mouseY = 0;
        let outlineX = 0;
        let outlineY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Dot moves instantly
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
            
            // Add interactions with clickable elements
            const target = e.target;
            if (
                target.tagName === 'A' || 
                target.tagName === 'BUTTON' ||
                target.closest('.portfolio-card')
            ) {
                cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
                cursorOutline.style.borderColor = 'var(--accent-primary)';
            } else {
                cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
                cursorOutline.style.borderColor = 'var(--text-secondary)';
            }
        });

        // Animation Loop for Smooth "Lag" Effect
        const animateCursor = () => {
            // Linear Interpolation (Lerp) for smoothness
            // x = start + (end - start) * speed
            outlineX += (mouseX - outlineX) * 0.15;
            outlineY += (mouseY - outlineY) * 0.15;

            cursorOutline.style.left = `${outlineX}px`;
            cursorOutline.style.top = `${outlineY}px`;

            requestAnimationFrame(animateCursor);
        };
        animateCursor();
    }

    // ----------------------------------------------------------------
    // 2. SCROLL REVEAL ENGINE (Intersection Observer)
    // ----------------------------------------------------------------
    const revealOptions = {
        threshold: 0.15, // Trigger when 15% visible
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Run once per session
            }
        });
    }, revealOptions);

    const revealElements = document.querySelectorAll('.reveal-init');
    revealElements.forEach(el => revealOnScroll.observe(el));

    // ----------------------------------------------------------------
    // 3. FULL SCREEN MENU TOGGLE
    // ----------------------------------------------------------------
    const menuBtn = document.querySelector('#menuToggle');
    const closeBtn = document.querySelector('#menuClose');
    const menuOverlay = document.querySelector('.menu-overlay');
    const navLinks = document.querySelectorAll('.nav-link');

    const toggleMenu = () => {
        const isActive = menuOverlay.classList.contains('is-active');
        
        if (!isActive) {
            menuOverlay.classList.add('is-active');
            document.body.style.overflow = 'hidden'; // Lock Scroll
        } else {
            menuOverlay.classList.remove('is-active');
            document.body.style.overflow = ''; // Unlock Scroll
        }
    };

    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
    if (closeBtn) closeBtn.addEventListener('click', toggleMenu);

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', toggleMenu);
    });

    // ----------------------------------------------------------------
    // 4. STICKY HEADER TRANSFORMATION
    // ----------------------------------------------------------------
    const navContainer = document.querySelector('.nav-container');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navContainer.style.background = 'rgba(5, 5, 5, 0.95)';
            navContainer.style.height = '70px'; // Shrink slightly
        } else {
            navContainer.style.background = 'rgba(5, 5, 5, 0.85)';
            navContainer.style.height = 'var(--header-height)';
        }
    });

    // ----------------------------------------------------------------
    // 5. SMOOTH SCROLL FOR ANCHOR LINKS
    // ----------------------------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ----------------------------------------------------------------
    // 6. FORM HANDLING (Cosmetic Validation)
    // ----------------------------------------------------------------
    const inputs = document.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        // Check initial state
        if (input.value !== '') {
            input.setAttribute('valid', '');
        }

        input.addEventListener('blur', () => {
            if (input.value !== '') {
                input.classList.add('has-content');
            } else {
                input.classList.remove('has-content');
            }
        });
    });

    // ----------------------------------------------------------------
    // 7. DYNAMIC COPYRIGHT YEAR
    // ----------------------------------------------------------------
    const yearSpan = document.querySelector('#currentYear');
    if(yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});