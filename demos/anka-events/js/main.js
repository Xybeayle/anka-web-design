(() => {

  /* ===============================
     Helpers
  =============================== */

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const on = (el, ev, fn, opt) => el && el.addEventListener(ev, fn, opt);

  let scrollY = 0;

  function lockScroll(lock) {
    if (lock) {
      scrollY = window.scrollY || 0;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
    } else {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      window.scrollTo(0, scrollY);
    }
  }




  /* ===============================
     Page Transitions
  =============================== */

  (function transitions() {

    let overlay = $(".pageFade");

    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "pageFade";
      document.body.appendChild(overlay);
    }

    const main = $("main");

    const enter = () => {
      if (main) main.classList.add("is-loaded");
      overlay.classList.remove("is-on");
    };

    window.addEventListener("load", enter);
    window.addEventListener("pageshow", enter);

    function shouldIntercept(a, e) {
      if (!a) return false;
      if (a && a.hasAttribute("data-open-booking")) return false;


      const href = a.getAttribute("href") || "";
      if (!href || href === "#") return false;
      if (href.startsWith("#")) return false; // same-page hash handled by browser/smooth scroll
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;
      if (a.target === "_blank" || a.hasAttribute("download")) return false;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;

      const url = new URL(href, window.location.href);

      // If same page + hash only, do not intercept
      if (
        url.origin === window.location.origin &&
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.hash
      ) {
        return false;
      }

      if (url.origin !== window.location.origin) return false;

      return true;
    }

    document.addEventListener("click", (e) => {
      
      const a = e.target.closest("a");
      if (!shouldIntercept(a, e)) return;

      e.preventDefault();

      overlay.classList.add("is-on");
      if (main) main.classList.remove("is-loaded");

      const url = new URL(a.href);
      setTimeout(() => {
        window.location.href = url.href;
      }, 420);

    }, true);

  })();

  /* ===============================
     Basic UI
  =============================== */

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const nav = $(".nav");
  const toTop = $("#toTop");
  const progressBar = $(".progress__bar");

  function onScroll() {
    const y = window.scrollY || 0;

    if (nav) nav.classList.toggle("is-scrolled", y > 6);
    if (toTop) toTop.classList.toggle("is-show", y > 500);

    if (progressBar) {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (y / max) * 100 : 0;
      progressBar.style.width = pct + "%";
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  on(toTop, "click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ===============================
     Mobile Menu
  =============================== */

  const burger = $("#burger");
  const mobileMenu = $("#mobileMenu");

  function openMobile() {
    if (!burger || !mobileMenu) return;
    burger.setAttribute("aria-expanded", "true");
    mobileMenu.classList.add("is-open");
  }

  function closeMobile() {
    if (!burger || !mobileMenu) return;
    burger.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("is-open");
  }

  on(burger, "click", () => {
    const expanded = burger.getAttribute("aria-expanded") === "true";
    expanded ? closeMobile() : openMobile();
  });

  /* ===============================
     Scroll Reveal
  =============================== */

  const revealEls = $$(".reveal");

  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(el => io.observe(el));
  }

  /* ===============================
     Pulse Mode
  =============================== */

  const soundBtn = $("#soundBtn");

  on(soundBtn, "click", () => {
    const onState = document.body.classList.toggle("pulse");
    if (soundBtn) soundBtn.setAttribute("aria-pressed", String(onState));
  });

  /* ===============================
     Booking Modal
  =============================== */

  const bookingModal = $("#bookingModal");
  const bookingForm = $("#bookingForm");
  const bookingNote = $("#bookingNote");

  function openBooking() {
    if (!bookingModal) return;
    bookingModal.classList.add("is-open");
    bookingModal.setAttribute("aria-hidden", "false");
    lockScroll(true);
  }

  function closeBooking() {
    if (!bookingModal) return;
    bookingModal.classList.remove("is-open");
    bookingModal.setAttribute("aria-hidden", "true");
    lockScroll(false);
  }

$$("[data-open-booking]").forEach((btn) =>
  btn.addEventListener(
    "click",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      openBooking();
    },
    true
  )
);


$$("[data-close-booking]").forEach(btn =>
  on(btn, "click", (e) => {
    e.preventDefault();
    closeBooking();
  })
);

// Open Event details
  $$("[data-open-event]").forEach((btn) =>
   on(btn, "click", () => {
    const id = btn.getAttribute("data-open-event") || "";
    // simplest: go to event page (you can improve later with a modal)
    window.location.href = id
      ? `event.html?id=${encodeURIComponent(id)}`
      : "event.html";
  })
);

  if (bookingForm) {
    on(bookingForm, "submit", (e) => {
      e.preventDefault();

      if (bookingNote) {
        bookingNote.textContent = "Request received. (Demo only — connect to backend/email.)";
      }

      bookingForm.reset();
    });
  }

  /* ===============================
     Contact Form
  =============================== */

  const contactForm = $("#contactForm");
  const formNote = $("#formNote");

  if (contactForm) {
    on(contactForm, "submit", (e) => {
      e.preventDefault();

      if (formNote) {
        formNote.textContent = "Message received. (Demo only — connect to backend/email.)";
      }

      contactForm.reset();
    });
  }

  /* ===============================
     Newsletter (Footer) - SAFE
  =============================== */

  const newsBtn = $("#ankaNewsBtn");
  const newsInput = $("#ankaNews");
  const newsNote = $("#ankaNewsNote");

  if (newsBtn && newsInput && newsNote) {
    on(newsBtn, "click", () => {
      const v = (newsInput.value || "").trim();
      if (!v || !v.includes("@")) {
        newsNote.textContent = "Please enter a valid email.";
        return;
      }
      newsNote.textContent = "Saved. We’ll notify you about upcoming drops. (Demo)";
      newsInput.value = "";
    });
  }

  /* ===============================
     ESC closes modals
  =============================== */

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeBooking();
      closeMobile();
    }
  });

})();
// Make whole event card clickable (opens the same modal as the Details button)
document.addEventListener("click", (e) => {
  const card = e.target.closest(".event[data-event-id]");
  if (!card) return;

  // Don't hijack clicks on real interactive elements
  if (e.target.closest("a, button, input, select, textarea, label")) return;

  const id = card.getAttribute("data-event-id");
  const btn = card.querySelector(`[data-open-event="${id}"]`);
  if (btn) btn.click();
});

document.addEventListener("keydown", (e) => {
  const card = e.target.closest(".event[data-event-id]");
  if (!card) return;

  if (e.key !== "Enter" && e.key !== " ") return;
  e.preventDefault();

  const id = card.getAttribute("data-event-id");
  const btn = card.querySelector(`[data-open-event="${id}"]`);
  if (btn) btn.click();
});
