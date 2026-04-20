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

  /* ──────────────────────────────────────────
     Specialities Carousel (auto-slide + indicators)
  ────────────────────────────────────────── */

  (function () {
    var track = document.getElementById('specialities-track');
    if (!track) return;

    var cards = Array.from(track.querySelectorAll('.wid-card'));
    if (!cards.length) return;

    var indicatorsWrap = document.getElementById('specialities-indicators');
    var indicators = indicatorsWrap ? Array.from(indicatorsWrap.querySelectorAll('.wid-specialities__indicator')) : [];

    var prefersRM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isHoverCapable = window.matchMedia && window.matchMedia('(hover: hover)').matches;

    var index = 0;
    var timer = null;
    var paused = false;

    function setActiveIndicator(i) {
      if (!indicators.length) return;
      indicators.forEach(function (dot, idx) {
        if (idx === i) dot.classList.add('wid-specialities__indicator--active');
        else dot.classList.remove('wid-specialities__indicator--active');
      });
    }

    function getClosestIndex() {
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

      return closestIndex;
    }

    function scrollToIndex(i) {
      if (!cards[i]) return;
      index = i;
      setActiveIndicator(index);

      track.scrollTo({
        left: cards[i].offsetLeft - (track.offsetWidth - cards[i].offsetWidth) / 2,
        behavior: prefersRM ? 'auto' : 'smooth'
      });
    }

    function next() {
      scrollToIndex((index + 1) % cards.length);
    }

    function start() {
      if (prefersRM) return;
      stop();
      timer = window.setInterval(function () {
        if (!paused) next();
      }, 3200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    function pause() { paused = true; }
    function resume() { paused = false; }

    // Pause on user intent
    track.addEventListener('pointerdown', pause, { passive: true });
    track.addEventListener('touchstart', pause, { passive: true });
    track.addEventListener('touchend', function () { resume(); }, { passive: true });
    track.addEventListener('pointerup', function () { resume(); }, { passive: true });

    if (isHoverCapable) {
      track.addEventListener('mouseenter', pause);
      track.addEventListener('mouseleave', resume);
    }

    // Keep indicator in sync when user swipes
    var ticking = false;
    track.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          index = getClosestIndex();
          setActiveIndicator(index);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Dots clickable
    indicators.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        pause();
        scrollToIndex(i);
        window.setTimeout(resume, 800);
      });
    });

    // Initialize after layout settles
    window.requestAnimationFrame(function () {
      index = getClosestIndex();
      setActiveIndicator(index);
      start();
    });

    window.addEventListener('resize', function () {
      // re-center current card after breakpoint changes
      window.requestAnimationFrame(function () {
        scrollToIndex(index);
      });
    }, { passive: true });
  })();
})();
