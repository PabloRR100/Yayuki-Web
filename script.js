/* ===================================
   YAYUKI — Interactive Behaviors
   ================================== */

(function () {
  'use strict';

  // --- Scroll: Nav background ---
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 60);
  }, { passive: true });

  // --- Mobile menu ---
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');

  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('active');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // --- Menu: Sticky tabs detection ---
  const tabsWrap = document.getElementById('menuTabsWrap');
  const stickyObserver = new IntersectionObserver(
    ([entry]) => { tabsWrap.classList.toggle('stuck', !entry.isIntersecting); },
    { threshold: 1, rootMargin: '-1px 0px 0px 0px' }
  );
  stickyObserver.observe(tabsWrap);

  // --- Menu: Tab filtering ---
  const tabs = document.querySelectorAll('.menu__tab');
  const cards = document.querySelectorAll('.menu__card');

  function filterMenu(cat) {
    // Hide/show cards
    cards.forEach(card => {
      const match = card.dataset.cat === cat;
      card.classList.toggle('hidden', !match);
    });

    // Active tab
    tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.cat === cat));

    // Stagger animation
    const visible = document.querySelectorAll('.menu__card:not(.hidden)');
    visible.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(12px)';
      setTimeout(() => {
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, i * 60);
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterMenu(tab.dataset.cat);
      // Scroll active tab into view
      tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  });

  // Initialize
  filterMenu('especiales');

  // --- Scroll reveal ---
  const reveals = document.querySelectorAll(
    '.section-header, .menu__tabs-wrap, .about__text, .about__details, .contact__info, .contact__cta'
  );
  reveals.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );
  reveals.forEach(el => revealObserver.observe(el));

  // --- Smooth anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Theme Switcher ---
  const themeToggle = document.getElementById('themeToggle');
  const themePanel = document.getElementById('themePanel');
  const themeOptions = document.querySelectorAll('.theme-switcher__option');

  themeToggle.addEventListener('click', () => themePanel.classList.toggle('open'));

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.theme-switcher')) themePanel.classList.remove('open');
  });

  themeOptions.forEach(option => {
    option.addEventListener('click', () => {
      const theme = option.dataset.theme;
      themeOptions.forEach(o => o.classList.remove('active'));
      option.classList.add('active');

      if (theme === 'wabisabi') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }

      themePanel.classList.remove('open');
    });
  });
})();
