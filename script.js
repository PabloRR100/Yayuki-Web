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

  // ===================================
  // CART
  // ===================================

  const WHATSAPP_NUMBER = '34624619546';
  const cart = {}; // { name: { name, price, qty } }

  const cartBtn     = document.getElementById('cartBtn');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartDrawer  = document.getElementById('cartDrawer');
  const cartClose   = document.getElementById('cartClose');
  const cartBody    = document.getElementById('cartBody');
  const cartCountEl = document.getElementById('cartCount');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartClear   = document.getElementById('cartClear');
  const cartWA      = document.getElementById('cartWhatsapp');

  // Inject "+" button into every menu card header
  document.querySelectorAll('.menu__card').forEach(card => {
    const nameEl  = card.querySelector('h3');
    const priceEl = card.querySelector('.menu__card-price');
    if (!nameEl) return;

    const name  = nameEl.textContent.trim();
    const price = priceEl ? parseFloat(priceEl.textContent.replace('€', '').trim()) || 0 : 0;

    const btn = document.createElement('button');
    btn.className = 'menu__card-add';
    btn.setAttribute('aria-label', `Añadir ${name}`);
    btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="6.5" y1="1" x2="6.5" y2="12"/><line x1="1" y1="6.5" x2="12" y2="6.5"/></svg>';
    btn.dataset.name  = name;
    btn.dataset.price = price;

    card.querySelector('.menu__card-header').appendChild(btn);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart(name, price, btn);
    });
  });

  function addToCart(name, price, btn) {
    if (cart[name]) {
      cart[name].qty++;
    } else {
      cart[name] = { name, price, qty: 1 };
    }
    if (btn) {
      btn.classList.add('in-cart');
      btn.style.transform = 'scale(1.35)';
      setTimeout(() => { btn.style.transform = ''; }, 280);
    }
    renderCart();
  }

  function removeFromCart(name) {
    if (!cart[name]) return;
    cart[name].qty--;
    if (cart[name].qty <= 0) {
      delete cart[name];
      // Remove in-cart highlight from all matching add buttons
      document.querySelectorAll('.menu__card-add').forEach(b => {
        if (b.dataset.name === name) b.classList.remove('in-cart');
      });
    }
    renderCart();
  }

  function clearCart() {
    Object.keys(cart).forEach(k => delete cart[k]);
    document.querySelectorAll('.menu__card-add').forEach(b => b.classList.remove('in-cart'));
    renderCart();
  }

  function getTotal()      { return Object.values(cart).reduce((s, i) => s + i.price * i.qty, 0); }
  function getTotalItems() { return Object.values(cart).reduce((s, i) => s + i.qty, 0); }

  function renderCart() {
    const items      = Object.values(cart);
    const total      = getTotal();
    const totalItems = getTotalItems();

    // Floating button
    cartCountEl.textContent = totalItems;
    cartBtn.classList.toggle('visible', totalItems > 0);

    // Body
    if (items.length === 0) {
      cartBody.innerHTML = '<span class="cart-empty-jp">空</span><p class="cart-empty">Tu carrito está vacío</p>';
    } else {
      cartBody.innerHTML = items.map(item => `
        <div class="cart-item">
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__qty">
            <button class="cart-item__qty-btn" data-action="dec" data-name="${item.name}" aria-label="Quitar uno">−</button>
            <span class="cart-item__qty-num">${item.qty}</span>
            <button class="cart-item__qty-btn" data-action="inc" data-name="${item.name}" aria-label="Añadir uno">+</button>
          </div>
          <div class="cart-item__price">€${(item.price * item.qty).toFixed(2)}</div>
        </div>
      `).join('');

      cartBody.querySelectorAll('.cart-item__qty-btn').forEach(b => {
        b.addEventListener('click', () => {
          const n = b.dataset.name;
          if (b.dataset.action === 'inc') {
            addToCart(n, cart[n].price, null);
          } else {
            removeFromCart(n);
          }
        });
      });
    }

    // Total & WhatsApp link
    cartTotalEl.textContent = `€${total.toFixed(2)}`;
    cartWA.href = buildWhatsAppUrl();
    cartWA.classList.toggle('disabled', items.length === 0);
  }

  function buildWhatsAppUrl() {
    const items = Object.values(cart);
    if (items.length === 0) return '#';

    let msg = '🍱 *Pedido Yayuki*\n\n';
    items.forEach(i => {
      msg += `• ${i.name} x${i.qty}`;
      if (i.price > 0) msg += ` — €${(i.price * i.qty).toFixed(2)}`;
      msg += '\n';
    });
    const total = getTotal();
    if (total > 0) msg += `\n*Total estimado: €${total.toFixed(2)}*`;
    msg += '\n\n_Pedido desde yayuki.es_';
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  }

  function openCart()  {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  cartBtn.addEventListener('click', openCart);
  cartOverlay.addEventListener('click', closeCart);
  cartClose.addEventListener('click', closeCart);
  cartClear.addEventListener('click', clearCart);
  cartWA.addEventListener('click', (e) => {
    if (Object.keys(cart).length === 0) { e.preventDefault(); return; }
    cartWA.href = buildWhatsAppUrl();
  });

  // Init
  renderCart();

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

      if (theme === 'matsuri') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }

      themePanel.classList.remove('open');
    });
  });
})();
