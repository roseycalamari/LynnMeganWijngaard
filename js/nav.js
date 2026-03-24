/* ==========================================================================
   LMW Travel — Navigation Controller
   Header scroll state, mobile menu, focus trap
   ========================================================================== */

(function () {
  'use strict';

  const SCROLL_THRESHOLD = 60;

  const header = document.querySelector('.header');
  const hamburger = document.querySelector('.hamburger');
  const overlay = document.querySelector('.nav-overlay');
  const overlayLinks = overlay.querySelectorAll('.nav-overlay__link');
  const langBtns = overlay.querySelectorAll('.nav-overlay__lang-btn');

  /* ──────────────────────────────────────────
     Notch SVG — single continuous path
     Traces: 0,0 → left edge → down notch left
     side → across notch bottom → up notch right
     side → across top → right edge.
     r = bottom corner radius of notch.
  ────────────────────────────────────────── */

  const notchPath = document.querySelector('.header__notch-path');
  const notchEl   = document.querySelector('.header__notch');

  function drawNotchLine() {
    if (!notchPath || !notchEl) return;

    const vw = window.innerWidth;
    const rect = notchEl.getBoundingClientRect();
    const x1 = rect.left;
    const x2 = rect.right;
    const h  = rect.height;
    const rb = 8;
    const rt = 10;
    const t  = parseFloat(getComputedStyle(document.documentElement)
                 .getPropertyValue('--rail-weight')) || 2.5;

    // Filled shape: full-width rail + notch pocket
    // rt = concave (inward) radius where rail meets notch walls
    // rb = convex radius at notch bottom corners
    const d = [
      `M 0 0`,
      `H ${vw}`,
      `V ${t}`,
      `H ${x2 + rt}`,
      `Q ${x2} ${t} ${x2} ${t + rt}`,
      `V ${h - rb}`,
      `Q ${x2} ${h} ${x2 - rb} ${h}`,
      `H ${x1 + rb}`,
      `Q ${x1} ${h} ${x1} ${h - rb}`,
      `V ${t + rt}`,
      `Q ${x1} ${t} ${x1 - rt} ${t}`,
      `H 0`,
      `Z`,
    ].join(' ');

    notchPath.setAttribute('d', d);
  }

  drawNotchLine();

  /* Replace entrance animations with a class that holds final state,
     so CSS transitions can take over for menu open/close */
  document.querySelectorAll('.header__notch, .header__notch-wrap, .header__contact, .hamburger').forEach((el) => {
    el.addEventListener('animationend', () => {
      el.classList.add('anim-done');
    }, { once: true });
  });

  let resizeTicking = false;
  window.addEventListener('resize', () => {
    if (!resizeTicking) {
      window.requestAnimationFrame(() => {
        drawNotchLine();
        resizeTicking = false;
      });
      resizeTicking = true;
    }
  }, { passive: true });

  let isMenuOpen = false;
  let lastFocusedElement = null;

  /* ──────────────────────────────────────────
     Header Scroll State
  ────────────────────────────────────────── */

  let ticking = false;

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > SCROLL_THRESHOLD) {
          header.classList.add('header--scrolled');
        } else {
          header.classList.remove('header--scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ──────────────────────────────────────────
     Mobile Menu Toggle
  ────────────────────────────────────────── */

  function openMenu() {
    isMenuOpen = true;
    lastFocusedElement = document.activeElement;

    hamburger.classList.add('hamburger--active');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close navigation');

    overlay.classList.add('nav-overlay--open');
    header.classList.add('header--menu-open');
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      if (overlayLinks.length > 0) {
        overlayLinks[0].focus();
      }
    });
  }

  function closeMenu() {
    isMenuOpen = false;

    hamburger.classList.remove('hamburger--active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open navigation');

    overlay.classList.remove('nav-overlay--open');
    header.classList.remove('header--menu-open');
    document.body.style.overflow = '';

    if (lastFocusedElement) {
      lastFocusedElement.focus();
      lastFocusedElement = null;
    }
  }

  function toggleMenu() {
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  hamburger.addEventListener('click', toggleMenu);

  overlayLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  /* ──────────────────────────────────────────
     Photo Swap on Nav Link Hover
     Smooth crossfade with subtle zoom
  ────────────────────────────────────────── */

  const photoImgs = overlay.querySelectorAll('.nav-overlay__photo-img');
  let currentPhotoIndex = 0;

  function setActivePhoto(index) {
    if (index === currentPhotoIndex) return;
    currentPhotoIndex = index;
    photoImgs.forEach((img) => {
      const i = Number(img.dataset.index);
      if (i === index) {
        img.style.opacity = '1';
        img.style.transform = 'scale(1)';
        img.classList.add('nav-overlay__photo-img--active');
      } else {
        img.style.opacity = '0';
        img.style.transform = 'scale(1.08)';
        img.classList.remove('nav-overlay__photo-img--active');
      }
    });
  }

  overlayLinks.forEach((link) => {
    link.addEventListener('mouseenter', () => {
      const idx = Number(link.dataset.photo);
      if (!isNaN(idx)) setActivePhoto(idx);
    });
    link.addEventListener('mouseleave', () => {
      setActivePhoto(0);
    });
  });

  /* ──────────────────────────────────────────
     Language Selector
  ────────────────────────────────────────── */

  langBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      langBtns.forEach((b) => b.classList.remove('nav-overlay__lang-btn--active'));
      btn.classList.add('nav-overlay__lang-btn--active');
    });
  });

  /* ──────────────────────────────────────────
     Focus Trap inside Overlay
  ────────────────────────────────────────── */

  function getFocusableElements() {
    return Array.from(
      overlay.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    );
  }

  document.addEventListener('keydown', (e) => {
    if (!isMenuOpen) return;

    if (e.key === 'Escape') {
      closeMenu();
      return;
    }

    if (e.key === 'Tab') {
      const focusable = getFocusableElements();
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
  });

})();

