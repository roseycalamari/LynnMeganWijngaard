/* ==========================================================================
   LMW Travel — Loader Controller
   Tracks real page-load progress, animates the bar, then smoothly
   reveals the site once everything is ready.
   ========================================================================== */

(function () {
  'use strict';

  var loader  = document.getElementById('loader');
  var curtain = loader && loader.querySelector('.loader__curtain');
  var bar     = document.getElementById('loader-bar');
  var hero    = document.querySelector('.hero');
  var header  = document.querySelector('.header');

  if (!loader || !curtain || !bar) return;

  var MIN_DISPLAY_MS = 1800;
  var SETTLE_AFTER_LOAD_MS = 400;
  var startTime = Date.now();

  /* ── Resource-based progress tracking ────────────────── */

  var images = Array.from(document.images);
  var totalResources = images.length || 1;
  var loadedResources = 0;
  var realProgress = 0;
  var displayedProgress = 0;
  var pageLoaded = false;
  var rafId;

  function onResourceLoad() {
    loadedResources++;
    realProgress = Math.min(loadedResources / totalResources, 1);
  }

  images.forEach(function (img) {
    if (img.complete) {
      onResourceLoad();
    } else {
      img.addEventListener('load', onResourceLoad, { once: true });
      img.addEventListener('error', onResourceLoad, { once: true });
    }
  });

  /* ── Smooth progress animation loop ─────────────────── */

  function tick() {
    var target = pageLoaded ? 1 : Math.min(realProgress, 0.9);

    displayedProgress += (target - displayedProgress) * 0.08;

    if (target - displayedProgress < 0.002) {
      displayedProgress = target;
    }

    bar.style.width = (displayedProgress * 100).toFixed(1) + '%';

    if (displayedProgress >= 0.998 && pageLoaded) {
      bar.style.width = '100%';
      cancelAnimationFrame(rafId);
      scheduleExit();
      return;
    }

    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);

  /* ── Page load event ────────────────────────────────── */

  window.addEventListener('load', function () {
    realProgress = 1;
    pageLoaded = true;
  });

  /* ── Exit: wait for minimum display time, then reveal ─ */

  var exiting = false;

  function scheduleExit() {
    if (exiting) return;
    exiting = true;

    var elapsed = Date.now() - startTime;
    var remaining = Math.max(MIN_DISPLAY_MS - elapsed, 0) + SETTLE_AFTER_LOAD_MS;

    setTimeout(exit, remaining);
  }

  function exit() {
    loader.classList.add('loader--leaving');

    /* Reveal the site as the curtain starts to rise (0.4s delay in CSS) */
    setTimeout(function () {
      if (hero) hero.classList.add('hero--ready');
      if (header) header.classList.add('header--ready');
    }, 350);

    curtain.addEventListener('animationend', function handler(e) {
      if (e.target !== curtain) return;
      curtain.removeEventListener('animationend', handler);
      loader.classList.add('loader--done');
    });
  }
})();
