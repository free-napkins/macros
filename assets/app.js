// Shared behavior for every page: theme toggle, mobile sidebar drawer,
// dropdown menus, and active-nav highlighting. Loaded on every page after
// the DOM markup so selectors below are safe to run immediately.
(function () {
  'use strict';

  /* ---------- Theme (light / dark) ---------- */
  var THEME_KEY = 'macros-theme';
  var root = document.documentElement;

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    document.querySelectorAll('[data-theme-icon-sun]').forEach(function (el) {
      el.classList.toggle('hidden', theme === 'dark');
    });
    document.querySelectorAll('[data-theme-icon-moon]').forEach(function (el) {
      el.classList.toggle('hidden', theme !== 'dark');
    });
    window.dispatchEvent(new CustomEvent('macros:themechange', { detail: { theme: theme } }));
  }

  function currentTheme() {
    return root.classList.contains('dark') ? 'dark' : 'light';
  }

  var storedTheme = localStorage.getItem(THEME_KEY);
  var systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(storedTheme || (systemPrefersDark ? 'dark' : 'light'));

  document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  });

  /* ---------- Mobile sidebar drawer ---------- */
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebar-overlay');

  function openSidebar() {
    if (!sidebar || !overlay) return;
    sidebar.classList.remove('-translate-x-full');
    overlay.classList.remove('hidden');
    document.body.classList.add('overflow-hidden', 'lg:overflow-auto');
    var closeBtn = sidebar.querySelector('[data-sidebar-close]');
    if (closeBtn) closeBtn.focus();
  }

  function closeSidebar() {
    if (!sidebar || !overlay) return;
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
    document.body.classList.remove('overflow-hidden', 'lg:overflow-auto');
  }

  document.querySelectorAll('[data-sidebar-open]').forEach(function (btn) {
    btn.addEventListener('click', openSidebar);
  });
  document.querySelectorAll('[data-sidebar-close]').forEach(function (btn) {
    btn.addEventListener('click', closeSidebar);
  });
  if (overlay) overlay.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSidebar();
  });

  /* ---------- Generic dropdowns (notifications, user menu) ---------- */
  document.querySelectorAll('[data-dropdown-trigger]').forEach(function (trigger) {
    var targetId = trigger.getAttribute('data-dropdown-trigger');
    var menu = document.getElementById(targetId);
    if (!menu) return;

    function close() {
      menu.classList.add('hidden', 'opacity-0', 'scale-95');
      trigger.setAttribute('aria-expanded', 'false');
    }
    function open() {
      document.querySelectorAll('[data-dropdown-menu]').forEach(function (m) {
        if (m !== menu) { m.classList.add('hidden', 'opacity-0', 'scale-95'); }
      });
      menu.classList.remove('hidden');
      requestAnimationFrame(function () {
        menu.classList.remove('opacity-0', 'scale-95');
      });
      trigger.setAttribute('aria-expanded', 'true');
    }

    menu.setAttribute('data-dropdown-menu', '');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var isHidden = menu.classList.contains('hidden');
      isHidden ? open() : close();
    });
    document.addEventListener('click', function (e) {
      if (!menu.contains(e.target) && !trigger.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  });

  /* ---------- Active nav link highlighting ---------- */
  var page = document.body.getAttribute('data-page');
  if (page) {
    document.querySelectorAll('[data-nav-link]').forEach(function (link) {
      var isActive = link.getAttribute('data-nav-link') === page;
      link.classList.toggle('bg-brand-50', isActive);
      link.classList.toggle('text-brand-700', isActive);
      link.classList.toggle('dark:bg-brand-500/10', isActive);
      link.classList.toggle('dark:text-brand-300', isActive);
      link.classList.toggle('text-slate-600', !isActive);
      link.classList.toggle('dark:text-slate-300', !isActive);
      if (isActive) link.setAttribute('aria-current', 'page');
    });
  }
})();
