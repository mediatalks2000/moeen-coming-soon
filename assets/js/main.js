(function () {
  'use strict';

  var root = document.documentElement;

  var store = {
    get: function (key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } },
    set: function (key, value) { try { window.localStorage.setItem(key, value); } catch (e) { /* storage unavailable */ } }
  };

  /* ---------------------------------------------------------------- i18n */
  var I18N = {
    ar: {
      dir: 'rtl',
      docTitle: 'مُعين | قريباً',
      metaDescription: 'مُعين — منظومة وكلاء ذكاء اصطناعي للأعمال. نجهّز مساحة جديدة لمُعين، وحتى يحين اللقاء يسعدنا تواصلك.',
      skip: 'انتقل إلى المحتوى',
      eyebrow: 'قيد الإنشاء',
      h1a: 'مُعين…',
      h1b: 'قريباً',
      lead: 'نجهّز مساحة جديدة لمُعين. وحتى يحين اللقاء، يسعدنا تواصلك.',
      cta: 'تواصل معنا',
      socialNavFooter: 'حسابات مُعين على منصات التواصل',
      brandLabel: 'مُعين — moeen.ae',
      newTab: '(يفتح في تبويب جديد)',
      langButton: 'English',
      langButtonLang: 'en',
      langButtonLabel: 'Switch to English',
      logoAlt: 'شعار مُعين — MOEEN',
      footer: '© 2026 مُعين. جميع الحقوق محفوظة.',
      platforms: {
        instagram: 'إنستغرام', x: 'إكس', facebook: 'فيسبوك', linkedin: 'لينكدإن',
        youtube: 'يوتيوب', threads: 'ثريدز', tiktok: 'تيك توك'
      }
    },
    en: {
      dir: 'ltr',
      docTitle: 'Moeen | Coming soon',
      metaDescription: 'Moeen — AI agents for business. We are preparing a new space for Moeen; until we meet, we would love to hear from you.',
      skip: 'Skip to content',
      eyebrow: 'Under construction',
      h1a: 'Moeen…',
      h1b: 'coming soon',
      lead: "We're preparing a new space for Moeen. Until we meet, we'd love to hear from you.",
      cta: 'Contact us',
      socialNavFooter: 'Moeen social media accounts',
      brandLabel: 'Moeen — moeen.ae',
      newTab: '(opens in a new tab)',
      langButton: 'العربية',
      langButtonLang: 'ar',
      langButtonLabel: 'التبديل إلى العربية',
      logoAlt: 'Moeen logo — مُعين',
      footer: '© 2026 Moeen. All rights reserved.',
      platforms: {
        instagram: 'Instagram', x: 'X', facebook: 'Facebook', linkedin: 'LinkedIn',
        youtube: 'YouTube', threads: 'Threads', tiktok: 'TikTok'
      }
    }
  };

  var langButton = document.getElementById('langToggle');
  var metaDescription = document.querySelector('meta[name="description"]');
  var currentLang = root.lang === 'en' ? 'en' : 'ar';

  function each(selector, fn) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), fn);
  }

  function applyLanguage(lang) {
    var t = I18N[lang];
    currentLang = lang;
    root.lang = lang;
    root.dir = t.dir;
    document.title = t.docTitle;
    if (metaDescription) metaDescription.setAttribute('content', t.metaDescription);

    each('[data-i18n]', function (el) {
      var key = el.getAttribute('data-i18n');
      if (key in t) el.textContent = t[key];
    });
    each('[data-i18n-alt]', function (el) { el.setAttribute('alt', t[el.getAttribute('data-i18n-alt')]); });
    each('[data-i18n-aria]', function (el) { el.setAttribute('aria-label', t[el.getAttribute('data-i18n-aria')]); });
    each('.social__link', function (link) {
      var name = t.platforms[link.getAttribute('data-platform')];
      link.setAttribute('data-name', name);
      link.setAttribute('aria-label', name + ' ' + t.newTab);
    });
    document.querySelector('.brand').setAttribute('aria-label', t.brandLabel);

    langButton.textContent = t.langButton;
    langButton.setAttribute('lang', t.langButtonLang);
    langButton.setAttribute('aria-label', t.langButtonLabel);
    root.classList.remove('i18n-pending');
  }

  function switchLanguage() {
    var next = currentLang === 'ar' ? 'en' : 'ar';
    applyLanguage(next);
    store.set('moeen-lang', next);
    try {
      var url = new URL(window.location.href);
      if (next === 'en') url.searchParams.set('lang', 'en');
      else url.searchParams.delete('lang');
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch (e) { /* older browsers: keep the URL as is */ }
  }

  /* -------------------------------------------------------------- motion */
  var motionOn = root.classList.contains('anim');
  var stage = document.getElementById('stage');
  var social = document.getElementById('social');

  if (motionOn) {
    // The intro takes ~3.2s; afterwards only the ambient loops remain.
    window.setTimeout(function () { root.classList.add('intro-done'); }, 3400);
  }

  // If the visitor turns on "reduce motion" while the page is open, stop.
  var reduceQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  if (reduceQuery) {
    var onReduceChange = function (event) {
      motionOn = !event.matches;
      root.classList.add('intro-done');
      root.classList.toggle('anim', motionOn);
    };
    if (reduceQuery.addEventListener) reduceQuery.addEventListener('change', onReduceChange);
    else if (reduceQuery.addListener) reduceQuery.addListener(onReduceChange);
  }

  if ('IntersectionObserver' in window) {
    // Pause the ambient loops while the drawing is off-screen.
    if (stage) {
      new IntersectionObserver(function (entries) {
        stage.classList.toggle('is-offscreen', !entries[0].isIntersecting);
      }).observe(stage);
    }
    // Social icons rise in once the footer is on screen.
    if (social) {
      var socialObserver = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          social.classList.add('is-visible');
          socialObserver.disconnect();
        }
      }, { rootMargin: '0px 0px -40px 0px' });
      socialObserver.observe(social);
    }
  } else if (social) {
    social.classList.add('is-visible');
  }
  document.addEventListener('visibilitychange', function () {
    root.classList.toggle('is-hidden', document.hidden);
  });

  // Social icons turn gold with a soft ring when pressed.
  each('.social__link', function (link) {
    link.addEventListener('click', function () {
      link.classList.remove('is-pressed');
      void link.offsetWidth; // restart the ring if pressed again
      link.classList.add('is-pressed');
      window.setTimeout(function () { link.classList.remove('is-pressed'); }, 900);
    });
  });
  // Lets :active styles show on touch in iOS Safari.
  document.addEventListener('touchstart', function () {}, { passive: true });

  // A gentle tilt of the drawing that follows the pointer (mouse/trackpad only).
  var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  var hero = document.querySelector('.hero');
  if (finePointer && hero && stage) {
    var frame = null;
    hero.addEventListener('pointermove', function (event) {
      if (!motionOn || !root.classList.contains('intro-done') || frame) return;
      frame = window.requestAnimationFrame(function () {
        frame = null;
        var box = stage.getBoundingClientRect();
        var x = Math.max(-1, Math.min(1, (event.clientX - (box.left + box.width / 2)) / box.width));
        var y = Math.max(-1, Math.min(1, (event.clientY - (box.top + box.height / 2)) / box.height));
        stage.style.setProperty('--ry', (x * 4).toFixed(2) + 'deg');
        stage.style.setProperty('--rx', (y * -4).toFixed(2) + 'deg');
      });
    });
    hero.addEventListener('pointerleave', function () {
      stage.style.setProperty('--ry', '0deg');
      stage.style.setProperty('--rx', '0deg');
    });
  }

  /* --------------------------------------------------------------- start */
  langButton.addEventListener('click', switchLanguage);
  if (currentLang === 'en') applyLanguage('en');
})();
