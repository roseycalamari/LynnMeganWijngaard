/* ==========================================================================
   LMW Travel — What I Do Page Controller
   Scroll-triggered entrance animations, parallax hero
   ========================================================================== */

(function () {
  'use strict';

  var hero = document.querySelector('.wid-hero');
  var header = document.querySelector('.header');

  /* ──────────────────────────────────────────
     Hero Reveal (after page loads)
  ────────────────────────────────────────── */

  window.addEventListener('load', function () {
    requestAnimationFrame(function () {
      if (hero) hero.classList.add('wid-hero--ready');
      if (header) header.classList.add('header--ready');
    });
  });

  /* ──────────────────────────────────────────
     Scroll-Triggered Entrances
     Elements with the [data-reveal] attribute
     receive the .is-visible class when they
     enter the viewport.
  ────────────────────────────────────────── */

  var revealTargets = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window && revealTargets.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealTargets.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealTargets.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ──────────────────────────────────────────
     Parallax hero image (desktop only)
  ────────────────────────────────────────── */

  var heroImage = document.querySelector('.wid-hero__image');
  var isDesktop = function () { return window.matchMedia('(min-width: 1024px)').matches; };
  var prefersReducedMotion = function () {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  var parallaxTicking = false;

  function updateParallax() {
    if (!isDesktop() || prefersReducedMotion() || !heroImage || !hero) return;
    var scrollY = window.scrollY;
    var heroHeight = hero.offsetHeight;

    if (scrollY <= heroHeight) {
      var offset = Math.round(scrollY * 0.25);
      heroImage.style.backgroundPositionY = 'calc(40% + ' + offset + 'px)';
    }
  }

  function onParallaxScroll() {
    if (!parallaxTicking) {
      window.requestAnimationFrame(function () {
        updateParallax();
        parallaxTicking = false;
      });
      parallaxTicking = true;
    }
  }

  if (isDesktop() && !prefersReducedMotion()) {
    window.addEventListener('scroll', onParallaxScroll, { passive: true });
  }

  var desktopQuery = window.matchMedia('(min-width: 1024px)');
  desktopQuery.addEventListener('change', function (mq) {
    if (mq.matches && !prefersReducedMotion()) {
      window.addEventListener('scroll', onParallaxScroll, { passive: true });
    } else {
      window.removeEventListener('scroll', onParallaxScroll);
      if (heroImage) heroImage.style.backgroundPositionY = '';
    }
  });

  /* ──────────────────────────────────────────
     Back to Top Button
  ────────────────────────────────────────── */

  var btt = document.getElementById('back-to-top');
  if (btt) {
    var bttTicking = false;
    var bttVisible = false;
    var BTT_THRESHOLD = window.innerHeight * 0.8;

    function updateBtt() {
      var show = window.scrollY > BTT_THRESHOLD;
      if (show !== bttVisible) {
        bttVisible = show;
        if (show) {
          btt.classList.add('back-to-top--visible');
        } else {
          btt.classList.remove('back-to-top--visible');
        }
      }
    }

    window.addEventListener('scroll', function () {
      if (!bttTicking) {
        requestAnimationFrame(function () {
          updateBtt();
          bttTicking = false;
        });
        bttTicking = true;
      }
    }, { passive: true });

    btt.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
