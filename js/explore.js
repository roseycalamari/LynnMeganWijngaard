/* ==========================================================================
   LMW Travel — Explore Gallery
   Open/close gallery, mobile scroll indicators
   ========================================================================== */

(function () {
  'use strict';

  var cta = document.querySelector('.hero__cta');
  var gallery = document.getElementById('explore-gallery');
  var track = document.getElementById('explore-track');
  var indicators = document.querySelectorAll('.explore-gallery__indicator');
  if (!cta || !gallery || !track) return;

  var cards = track.querySelectorAll('.explore-card');

  /* ---- Open / Close the gallery ---- */

  function openExplore() {
    track.scrollLeft = 0;
    document.body.classList.add('explore-active');
    updateIndicators();
  }

  function closeExplore() {
    document.body.classList.remove('explore-active');
  }

  /* ---- CTA toggle ---- */

  cta.addEventListener('click', function (e) {
    e.preventDefault();
    if (document.body.classList.contains('explore-active')) {
      closeExplore();
    } else {
      openExplore();
    }
  });

  /* ---- Keyboard: Escape ---- */

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('explore-active')) {
      closeExplore();
    }
  });

  /* ---- Click backdrop to close gallery ---- */

  gallery.addEventListener('click', function (e) {
    if (e.target === gallery || e.target === track) {
      closeExplore();
    }
  });

  /* ---- Mobile scroll indicators ---- */

  function updateIndicators() {
    if (!indicators.length || window.innerWidth >= 768) return;

    var scrollLeft = track.scrollLeft;
    var trackCenter = track.offsetWidth / 2;
    var closestIndex = 0;
    var closestDist = Infinity;

    cards.forEach(function (card, i) {
      var cardCenter = card.offsetLeft - scrollLeft + card.offsetWidth / 2;
      var dist = Math.abs(cardCenter - trackCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = i;
      }
    });

    indicators.forEach(function (ind, i) {
      if (i === closestIndex) {
        ind.classList.add('explore-gallery__indicator--active');
      } else {
        ind.classList.remove('explore-gallery__indicator--active');
      }
    });
  }

  var ticking = false;
  track.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        updateIndicators();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ==========================================================================
   Language Switcher — sync all [data-lang] buttons across the page
   ========================================================================== */

(function () {
  'use strict';

  function getActiveClass(btn) {
    var classes = btn.className.split(/\s+/);
    for (var i = 0; i < classes.length; i++) {
      if (classes[i] && classes[i].indexOf('--active') === -1 && classes[i].indexOf('btn') !== -1) {
        return classes[i] + '--active';
      }
    }
    return null;
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-lang]');
    if (!btn) return;

    var lang = btn.getAttribute('data-lang');
    var allBtns = document.querySelectorAll('[data-lang]');

    allBtns.forEach(function (b) {
      var activeCls = getActiveClass(b);
      if (!activeCls) return;

      if (b.getAttribute('data-lang') === lang) {
        b.classList.add(activeCls);
      } else {
        b.classList.remove(activeCls);
      }
    });
  });
})();
