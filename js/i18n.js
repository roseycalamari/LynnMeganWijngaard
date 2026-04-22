/* ==========================================================================
   LMW Travel i18n
   Client-side translations (en default, pt-PT, nl)
   ========================================================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'lmw_lang';
  var DEFAULT_LANG = 'en';
  var SUPPORTED = ['en', 'pt-PT', 'nl'];

  function normalizeLang(lang) {
    if (!lang) return DEFAULT_LANG;
    if (lang === 'pt') return 'pt-PT';
    if (lang === 'pt-pt') return 'pt-PT';
    if (lang === 'nl-nl') return 'nl';
    return lang;
  }

  function isSupported(lang) {
    return SUPPORTED.indexOf(lang) !== -1;
  }

  function getBrowserPreferredLang() {
    var raw = (navigator.language || navigator.userLanguage || DEFAULT_LANG).toLowerCase();
    if (raw.startsWith('pt')) return 'pt-PT';
    if (raw.startsWith('nl')) return 'nl';
    return 'en';
  }

  function resolveInitialLang() {
    var stored = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch (_) {}
    var normalized = normalizeLang((stored || '').trim());
    if (isSupported(normalized)) return normalized;
    return getBrowserPreferredLang();
  }

  function safeGet(obj, key) {
    if (!obj || !key) return undefined;
    return Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : undefined;
  }

  function parseAttrSpec(spec) {
    // Format: "aria-label:nav.home|title:nav.homeTitle"
    if (!spec) return [];
    return spec
      .split('|')
      .map(function (p) { return p.trim(); })
      .filter(Boolean)
      .map(function (p) {
        var idx = p.indexOf(':');
        if (idx === -1) return null;
        return { attr: p.slice(0, idx).trim(), key: p.slice(idx + 1).trim() };
      })
      .filter(Boolean);
  }

  function applyTranslations(dict, lang) {
    var langDict = dict[lang] || {};
    var enDict = dict.en || {};

    // Set document language (helps screen readers)
    document.documentElement.setAttribute('lang', lang === 'pt-PT' ? 'pt-PT' : lang);

    // Text nodes
    var nodes = document.querySelectorAll('[data-i18n]');
    nodes.forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (!key) return;
      var val = safeGet(langDict, key);
      if (val == null) val = safeGet(enDict, key);
      if (val == null) {
        console.warn('[i18n] Missing key:', key, 'lang:', lang);
        return;
      }
      el.textContent = val;
    });

    // Attributes
    var attrNodes = document.querySelectorAll('[data-i18n-attr]');
    attrNodes.forEach(function (el) {
      var spec = el.getAttribute('data-i18n-attr');
      parseAttrSpec(spec).forEach(function (pair) {
        var val = safeGet(langDict, pair.key);
        if (val == null) val = safeGet(enDict, pair.key);
        if (val == null) {
          console.warn('[i18n] Missing attr key:', pair.key, 'lang:', lang);
          return;
        }
        el.setAttribute(pair.attr, val);
      });
    });

    // Update language button active states
    var langBtns = document.querySelectorAll('[data-lang]');
    langBtns.forEach(function (btn) {
      var btnLang = normalizeLang(btn.getAttribute('data-lang'));
      var isActive = btnLang === lang;
      if (btn.classList.contains('nav-overlay__lang-btn')) {
        btn.classList.toggle('nav-overlay__lang-btn--active', isActive);
      }
      if (btn.classList.contains('hero__lang-btn')) {
        btn.classList.toggle('hero__lang-btn--active', isActive);
      }
    });
  }

  function loadDictionary() {
    // Cache-bust to avoid stale translations after deploys/edits.
    // The file remains cacheable by the browser, but this ensures updates are picked up.
    var v = '20260422';
    return fetch('i18n/translations.json?v=' + v, { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load translations.json');
        return res.json();
      });
  }

  var state = {
    dict: null,
    lang: resolveInitialLang(),
  };

  function setLanguage(lang) {
    var next = normalizeLang(lang);
    if (!isSupported(next)) next = DEFAULT_LANG;
    state.lang = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch (_) {}
    if (state.dict) applyTranslations(state.dict, next);
  }

  function t(key) {
    if (!state.dict) return '';
    var langDict = state.dict[state.lang] || {};
    var enDict = state.dict.en || {};
    var val = safeGet(langDict, key);
    if (val == null) val = safeGet(enDict, key);
    return val == null ? '' : String(val);
  }

  function init() {
    loadDictionary()
      .then(function (dict) {
        state.dict = dict || {};
        setLanguage(state.lang);
      })
      .catch(function (err) {
        console.error('[i18n] init failed', err);
      });

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-lang]');
      if (!btn) return;
      var lang = btn.getAttribute('data-lang');
      setLanguage(lang);
    });
  }

  init();

  // Expose minimal API (useful for debugging)
  window.LMW_I18N = {
    setLanguage: setLanguage,
    getLanguage: function () { return state.lang; },
    t: t,
  };
})();

