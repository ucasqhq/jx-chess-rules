/* ============================================================
 * 规则说明页 · 交互
 * 只做导航、滚动进度、大图与入场动画，不依赖任何库。
 * ============================================================ */

(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  /* ---------------------------- 游戏入口 ---------------------------- */

  // 直接双击 index.html 打开时，相对路径找不到游戏，退回线上地址。
  var ONLINE_URL = 'https://jx-chess-jx-chess-d8gj6n3fu65dc45db.webapps.tcloudbase.com/';
  if (window.location.protocol === 'file:') {
    var playLinks = doc.querySelectorAll('[data-play]');
    for (var i = 0; i < playLinks.length; i++) playLinks[i].href = ONLINE_URL;
  }

  /* ---------------------------- 年份 ---------------------------- */

  var yearEl = doc.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------------------------- 顶栏导航 ---------------------------- */

  var topbar = doc.getElementById('topbar');
  var navToggle = doc.getElementById('navToggle');
  var nav = doc.getElementById('nav');

  function closeNav() {
    if (!topbar) return;
    topbar.classList.remove('nav-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && topbar) {
    navToggle.addEventListener('click', function () {
      var open = topbar.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  if (nav) {
    nav.addEventListener('click', function (evt) {
      if (evt.target.closest('a')) closeNav();
    });
  }

  doc.addEventListener('keydown', function (evt) {
    if (evt.key === 'Escape') closeNav();
  });

  doc.addEventListener('click', function (evt) {
    if (!topbar || !topbar.classList.contains('nav-open')) return;
    if (!topbar.contains(evt.target)) closeNav();
  });

  /* ---------------------------- 阅读进度与回顶 ---------------------------- */

  var progressBar = doc.getElementById('progressBar');
  var toTop = doc.getElementById('toTop');
  var ticking = false;

  function updateScroll() {
    var scrollTop = window.pageYOffset || root.scrollTop;
    var max = root.scrollHeight - window.innerHeight;
    if (progressBar) {
      progressBar.style.width = (max > 0 ? Math.min(1, scrollTop / max) * 100 : 0).toFixed(2) + '%';
    }
    if (toTop) toTop.classList.toggle('show', scrollTop > 600);
    ticking = false;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateScroll);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  updateScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------------------------- 章节高亮 ---------------------------- */

  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]')) : [];
  var linkById = {};

  navLinks.forEach(function (link) {
    var id = link.getAttribute('href').slice(1);
    if (id) linkById[id] = link;
  });

  var sections = Array.prototype.slice.call(doc.querySelectorAll('main section[id]'));

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var active = linkById[entry.target.id];
        if (!active) return;
        navLinks.forEach(function (link) {
          if (link === active) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-42% 0px -52% 0px', threshold: 0 });

    sections.forEach(function (section) {
      if (linkById[section.id]) spy.observe(section);
    });
  }

  /* ---------------------------- 大图 ---------------------------- */

  var lightbox = doc.getElementById('lightbox');
  var lightboxImg = doc.getElementById('lightboxImg');
  var lightboxCap = doc.getElementById('lightboxCap');
  var lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;

  function openLightbox(button) {
    if (!lightbox || !lightboxImg || typeof lightbox.showModal !== 'function') return;
    var source = button.querySelector('img');
    if (!source) return;

    lightboxImg.src = source.currentSrc || source.src;
    lightboxImg.alt = source.alt || '';
    if (lightboxCap) lightboxCap.textContent = button.getAttribute('data-caption') || '';
    if (!lightbox.open) lightbox.showModal();
  }

  var zoomButtons = doc.querySelectorAll('[data-zoom]');
  for (var j = 0; j < zoomButtons.length; j++) {
    (function (button) {
      button.addEventListener('click', function () { openLightbox(button); });
    })(zoomButtons[j]);
  }

  if (lightbox) {
    lightbox.addEventListener('click', function (evt) {
      if (evt.target === lightbox) lightbox.close();
    });
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', function () {
      if (lightbox) lightbox.close();
    });
  }

  /* ---------------------------- 入场动画 ---------------------------- */

  var revealItems = Array.prototype.slice.call(doc.querySelectorAll('.reveal'));

  if (!reduceMotion && 'IntersectionObserver' in window && revealItems.length) {
    root.classList.add('reveal-ready');

    var revealer = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealItems.forEach(function (item) { revealer.observe(item); });
  }
})();
