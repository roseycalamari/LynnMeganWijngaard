/* ==========================================================================
   LMW Travel — Contact Page Controller
   Hero reveal, scroll-triggered entrances, back-to-top
   ========================================================================== */

(function () {
  'use strict';

  var hero = document.querySelector('.contact-hero');
  var header = document.querySelector('.header');

  /* ──────────────────────────────────────────
     Hero Reveal (after page loads)
  ────────────────────────────────────────── */

  window.addEventListener('load', function () {
    requestAnimationFrame(function () {
      if (hero) hero.classList.add('contact-hero--ready');
      if (header) header.classList.add('header--ready');
    });
  });

  /* ──────────────────────────────────────────
     Scroll-Triggered Entrances
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
