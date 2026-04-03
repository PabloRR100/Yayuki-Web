/* ===================================
   YAYUKI — Interactive Behaviors
   ================================== */

(function () {
  'use strict';

  // --- Scroll: Nav background ---
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

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

  // --- Menu tabs ---
  const tabs = document.querySelectorAll('.menu__tab');
  const items = document.querySelectorAll('.menu__item');

  function filterMenu(cat) {
    items.forEach(item => {
      const match = item.dataset.cat === cat;
      item.classList.toggle('hidden', !match);
    });

    tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.cat === cat);
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => filterMenu(tab.dataset.cat));
  });

  // Initialize with first category
  filterMenu('especiales');

  // --- Scroll reveal ---
  const reveals = document.querySelectorAll(
    '.section-header, .menu__tabs, .about__text, .about__details, .contact__info, .contact__cta'
  );

  reveals.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  reveals.forEach(el => observer.observe(el));

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

  // --- Stagger menu items on tab switch ---
  const menuGrid = document.getElementById('menuGrid');
  const mutObs = new MutationObserver(() => {
    const visible = menuGrid.querySelectorAll('.menu__item:not(.hidden)');
    visible.forEach((item, i) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(12px)';
      setTimeout(() => {
        item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, i * 50);
    });
  });

  mutObs.observe(menuGrid, { childList: false, subtree: true, attributes: true, attributeFilter: ['class'] });
})();
