/* ==========================================================================
   LMW Travel — Hero Controller
   Parallax (background-position shift), Ken Burns will-change
   ========================================================================== */

(function () {
  'use strict';

  const heroImage = document.querySelector('.hero__image');
  const hero = document.querySelector('.hero');

  const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches;
  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ──────────────────────────────────────────
     Ken Burns — will-change management
     Deferred to after load to avoid unnecessary
     compositing layers during initial paint.
  ────────────────────────────────────────── */

  window.addEventListener('load', () => {
    if (!prefersReducedMotion() && heroImage) {
      heroImage.style.willChange = 'transform';
    }
  });

  /* ──────────────────────────────────────────
     Parallax (desktop only)
     Shifts background-position-y so it doesn't
     interfere with the Ken Burns transform animation.
     Ratio: 30% of scroll speed.
  ────────────────────────────────────────── */

  let parallaxTicking = false;

  function updateParallax() {
    if (!isDesktop() || prefersReducedMotion() || !heroImage) return;

    const scrollY = window.scrollY;
    const heroHeight = hero.offsetHeight;

    if (scrollY <= heroHeight) {
      const offset = Math.round(scrollY * 0.3);
      heroImage.style.backgroundPositionY = `calc(50% + ${offset}px)`;
    }
  }

  function onParallaxScroll() {
    if (!parallaxTicking) {
      window.requestAnimationFrame(() => {
        updateParallax();
        parallaxTicking = false;
      });
      parallaxTicking = true;
    }
  }

  if (isDesktop() && !prefersReducedMotion()) {
    window.addEventListener('scroll', onParallaxScroll, { passive: true });
  }

  /* ──────────────────────────────────────────
     Responsive Parallax Listener Management
     Enable/disable parallax on viewport changes.
  ────────────────────────────────────────── */

  const desktopQuery = window.matchMedia('(min-width: 1024px)');

  desktopQuery.addEventListener('change', (mq) => {
    if (mq.matches && !prefersReducedMotion()) {
      window.addEventListener('scroll', onParallaxScroll, { passive: true });
    } else {
      window.removeEventListener('scroll', onParallaxScroll);
      if (heroImage) {
        heroImage.style.backgroundPositionY = '';
      }
    }
  });
})();
