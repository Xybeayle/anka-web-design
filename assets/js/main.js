/* FILE: assets/js/main.js */
(function() {
  'use strict';

  // --- helpers ---
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- mobile menu ---
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true' ? false : true;
      menuToggle.setAttribute('aria-expanded', expanded);
      mainNav.classList.toggle('open');
    });

    // Close menu when clicking a link (for better UX)
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        mainNav.classList.remove('open');
      });
    });
  }

  // --- smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    });
  });

  // --- scroll reveal (IntersectionObserver) ---
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });
    revealElements.forEach(el => observer.observe(el));
  } else {
    // auto-add reveal class to sections
    document.querySelectorAll('section:not(.hero)').forEach(el => el.classList.add('reveal'));
    // re-run observer after adding class
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  // --- accordion ---
  document.querySelectorAll('.accordion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true' ? false : true;
      btn.setAttribute('aria-expanded', expanded);
      const panel = btn.nextElementSibling;
      if (expanded) {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      } else {
        panel.style.maxHeight = null;
      }
    });
  });

  // --- modal logic ---
  const modal = document.getElementById('projectModal');
  const modalBody = modal?.querySelector('.modal-body');
  const modalClose = modal?.querySelector('.modal-close');
  const modalOverlay = modal?.querySelector('.modal-overlay');

  function openModal(project) {
    if (!modal || !modalBody) return;
    const html = `
      <h2>${project.title}</h2>
      <p class="category">${project.categoryLabel} · ${project.year}</p>
      <p><strong>Summary</strong><br>${project.summary}</p>
      <p><strong>Results</strong></p>
      <ul class="results">${project.results.map(r => `<li>${r}</li>`).join('')}</ul>
      <p><strong>Services</strong> ${project.services}</p>
    `;
    modalBody.innerHTML = html;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (modal) {
      modal.hidden = true;
      document.body.style.overflow = '';
    }
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
  });

  // --- render project cards (used on index and work) ---
  function renderProjects(containerId, filter = 'all', limit = Infinity) {
    const container = document.getElementById(containerId);
    if (!container || !window.workData) return;
    const filtered = filter === 'all' ? window.workData : window.workData.filter(p => p.category === filter);
    const limited = filtered.slice(0, limit);
    container.innerHTML = '';
    limited.forEach(proj => {
      const card = document.createElement('div');
      card.className = 'work-card';
      card.setAttribute('data-id', proj.id);
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `View details: ${proj.title}`);
      card.innerHTML = `
        <span class="category">${proj.categoryLabel}</span>
        <h3>${proj.title}</h3>
        <span class="year">${proj.year}</span>
      `;
      card.addEventListener('click', () => openModal(proj));
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(proj); } });
      container.appendChild(card);
    });
  }

  // --- featured work on index ---
  if (document.getElementById('featuredWorkGrid')) {
    renderProjects('featuredWorkGrid', 'all', 6);
  }

  // --- work page filter & grid ---
  const workGrid = document.getElementById('workGrid');
  if (workGrid) {
    renderProjects('workGrid', 'all');

    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        renderProjects('workGrid', filter);
      });
    });
  }

  // --- contact form validation + toast ---
  const contactForm = document.getElementById('demoContactForm');
  const toast = document.getElementById('successToast');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name')?.value.trim();
      const email = document.getElementById('email')?.value.trim();
      const message = document.getElementById('message')?.value.trim();
      if (!name || !email || !message) {
        alert('Please fill in all required fields.');
        return;
      }
      if (!email.includes('@')) {
        alert('Enter a valid email.');
        return;
      }
      if (toast) {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 4000);
      }
      contactForm.reset();
    });
  }

  // --- active nav highlight while scrolling (only on pages with sections) ---
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-list a');
  if (sections.length > 0) {
    window.addEventListener('scroll', () => {
      let current = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (pageYOffset >= sectionTop) current = section.getAttribute('id');
      });
      navLinks.forEach(link => {
        link.removeAttribute('aria-current');
        if (link.getAttribute('href') === '#' + current) link.setAttribute('aria-current', 'page');
      });
    });
  }
  // Mouse follower glow
const glow = document.querySelector('.cursor-glow');
if (glow) {
  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;
  const speed = 0.1;
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  function animateGlow() {
    glowX += (mouseX - glowX) * speed;
    glowY += (mouseY - glowY) * speed;
    glow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateGlow);
  }
  animateGlow();
  // 3D tilt on cards
const tiltCards = document.querySelectorAll('.service-card, .work-card, .pricing-card');
tiltCards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});
/* FILE: assets/js/main.js (add demo grid rendering at the end of the IIFE) */

// Render demo grid on homepage
const demoGrid = document.getElementById('demoGrid');
if (demoGrid && window.workData) {
  // Take first 4 projects with demo links
  const demos = window.workData.filter(p => p.demoLink).slice(0, 4);
  demoGrid.innerHTML = '';
  demos.forEach(proj => {
    const card = document.createElement('div');
    card.className = 'demo-card';
    card.innerHTML = `
      <div class="demo-image"></div>
      <span class="category">${proj.categoryLabel}</span>
      <h3>${proj.title}</h3>
      <p>${proj.summary.substring(0, 60)}…</p>
      <a href="${proj.demoLink}" target="_blank" rel="noopener" class="btn btn-outline btn-small">Live Demo →</a>
    `;
    demoGrid.appendChild(card);
  });
}
}
})();