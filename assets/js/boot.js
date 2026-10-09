/* Runs in <head> before first paint: sets the language direction and whether
   motion plays, so the page never flashes the wrong layout. */
(function () {
  var root = document.documentElement;
  function read(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  var match = /[?&]lang=(en|ar)(?:&|$)/.exec(window.location.search);
  var lang = match ? match[1] : (read('moeen-lang') || 'ar');
  if (lang === 'en') {
    root.lang = 'en';
    root.dir = 'ltr';
    root.classList.add('i18n-pending');
  }
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  root.classList.add('js');
  root.classList.add(reduce ? 'intro-done' : 'anim');
})();
