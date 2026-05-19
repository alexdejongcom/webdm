/* ============================================================
   DUNDER MIFFLIN PAPER COMPANY — main.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Sticky nav shadow on scroll ─────────────────────────────
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Mobile hamburger ─────────────────────────────────────────
  const burger  = document.querySelector('.hamburger');
  const navList = document.querySelector('.nav-links');
  if (burger && navList) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      navList.classList.toggle('open');
    });
    // Close when a link is clicked
    navList.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        burger.classList.remove('open');
        navList.classList.remove('open');
      })
    );
    // Close on outside click
    document.addEventListener('click', e => {
      if (!header.contains(e.target)) {
        burger.classList.remove('open');
        navList.classList.remove('open');
      }
    });
  }

  // ── Active nav link ──────────────────────────────────────────
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage ||
        (currentPage === '' && href === 'index.html') ||
        (currentPage === '/' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ── Intersection Observer fade-in ────────────────────────────
  const fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    fadeEls.forEach(el => observer.observe(el));
  }

  // ── Staggered children ───────────────────────────────────────
  document.querySelectorAll('[data-stagger]').forEach(parent => {
    parent.querySelectorAll('.fade-in').forEach((child, i) => {
      child.style.transitionDelay = `${i * 80}ms`;
    });
  });

  // ── Smooth scroll for anchor links ───────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = (header ? header.offsetHeight : 0) + 16;
        window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
      }
    });
  });

  // ── Products page category scroll ────────────────────────────
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.target);
      if (target) {
        const offset = (header ? header.offsetHeight : 0) + 24;
        window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
      }
    });
  });

  // ── Contact form ─────────────────────────────────────────────
  const form    = document.querySelector('.contact-form');
  const success = document.querySelector('.form-success');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;

      // Clear previous errors
      form.querySelectorAll('.field-error').forEach(el => el.remove());
      form.querySelectorAll('.form-control').forEach(el => el.classList.remove('error-border'));

      const required = form.querySelectorAll('[required]');
      required.forEach(field => {
        if (!field.value.trim()) {
          valid = false;
          field.classList.add('error-border');
          const err = document.createElement('span');
          err.className = 'field-error';
          err.textContent = 'This field is required.';
          err.style.cssText = 'color:#b91c1c;font-size:.78rem;display:block;margin-top:4px;';
          field.parentNode.insertBefore(err, field.nextSibling);
        }
      });

      const emailField = form.querySelector('[type="email"]');
      if (emailField && emailField.value.trim()) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(emailField.value.trim())) {
          valid = false;
          emailField.classList.add('error-border');
          const err = document.createElement('span');
          err.className = 'field-error';
          err.textContent = 'Please enter a valid email address.';
          err.style.cssText = 'color:#b91c1c;font-size:.78rem;display:block;margin-top:4px;';
          emailField.parentNode.insertBefore(err, emailField.nextSibling);
        }
      }

      if (!valid) return;

      const btn = form.querySelector('[type="submit"]');
      btn.textContent = 'Sending…';
      btn.disabled = true;

      setTimeout(() => {
        form.style.display = 'none';
        if (success) success.style.display = 'block';
      }, 900);
    });

    // Live error-border clearing
    form.querySelectorAll('.form-control').forEach(field => {
      field.addEventListener('input', () => {
        field.classList.remove('error-border');
        const err = field.parentNode.querySelector('.field-error');
        if (err) err.remove();
      });
    });
  }

  // ── error-border CSS (injected dynamically) ───────────────────
  const style = document.createElement('style');
  style.textContent = `.form-control.error-border{border-color:#b91c1c!important;box-shadow:0 0 0 3px rgba(185,28,28,.1)!important}`;
  document.head.appendChild(style);

  // ── "That's What She Said" floating button ────────────────────
  const twssStyles = document.createElement('style');
  twssStyles.textContent = `
    #twss-btn {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 9999;
      background: var(--navy, #1b3a6b);
      color: #fff;
      border: none;
      border-radius: 99px;
      padding: 10px 18px;
      font-size: .78rem;
      font-weight: 700;
      letter-spacing: .06em;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,.25);
      transition: background .2s, transform .15s;
      display: flex;
      align-items: center;
      gap: 7px;
    }
    #twss-btn:hover { background: #c9a227; transform: scale(1.06); }
    #twss-popup {
      position: fixed;
      bottom: 80px;
      right: 28px;
      z-index: 9998;
      display: flex;
      align-items: flex-end;
      gap: 12px;
      pointer-events: none;
      opacity: 0;
      transform: translateY(16px);
      transition: opacity .3s, transform .3s;
    }
    #twss-popup.visible { opacity: 1; transform: translateY(0); pointer-events: auto; }
    #twss-bubble {
      background: var(--white, #fff);
      border: 2px solid var(--navy, #1b3a6b);
      border-radius: 16px 16px 4px 16px;
      padding: 14px 18px;
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--navy-dark, #0f2444);
      max-width: 220px;
      text-align: center;
      box-shadow: 0 6px 24px rgba(0,0,0,.15);
      line-height: 1.4;
    }
    #twss-bubble small {
      display: block;
      font-family: 'Inter', sans-serif;
      font-size: .7rem;
      font-weight: 600;
      letter-spacing: .08em;
      text-transform: uppercase;
      color: #c9a227;
      margin-top: 6px;
    }
    #twss-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      object-fit: cover;
      object-position: top center;
      border: 3px solid var(--navy, #1b3a6b);
      box-shadow: 0 4px 12px rgba(0,0,0,.2);
      flex-shrink: 0;
    }
  `;
  document.head.appendChild(twssStyles);

  const twssBtn = document.createElement('button');
  twssBtn.id = 'twss-btn';
  twssBtn.innerHTML = '😏 TWSS';
  twssBtn.title = "That's What She Said";
  document.body.appendChild(twssBtn);

  const twssPopup = document.createElement('div');
  twssPopup.id = 'twss-popup';
  twssPopup.innerHTML = `
    <div id="twss-bubble">
      "That's what she said."
      <small>— Michael Scott</small>
    </div>
    <img id="twss-avatar" src="https://www.thatswhatwhosaid.com/images/characters/michael.webp" alt="Michael Scott">
  `;
  document.body.appendChild(twssPopup);

  let twssTimer;
  twssBtn.addEventListener('click', () => {
    twssPopup.classList.add('visible');
    clearTimeout(twssTimer);
    twssTimer = setTimeout(() => twssPopup.classList.remove('visible'), 3200);
  });

  // ── Paper plane animation on load ─────────────────────────────
  const planeStyles = document.createElement('style');
  planeStyles.textContent = `
    #paper-plane {
      position: fixed;
      top: 18vh;
      left: -120px;
      z-index: 99999;
      pointer-events: none;
      animation: planeFly 2.8s cubic-bezier(.4,0,.2,1) forwards;
      font-size: 3rem;
      filter: drop-shadow(2px 4px 8px rgba(0,0,0,.18));
    }
    @keyframes planeFly {
      0%   { left: -120px; top: 18vh; transform: rotate(-8deg) scale(.8); opacity: 0; }
      10%  { opacity: 1; }
      50%  { top: 28vh; transform: rotate(4deg) scale(1); }
      80%  { opacity: 1; }
      100% { left: calc(100vw + 120px); top: 12vh; transform: rotate(-6deg) scale(.85); opacity: 0; }
    }
  `;
  document.head.appendChild(planeStyles);

  const plane = document.createElement('div');
  plane.id = 'paper-plane';
  plane.textContent = '✈️';
  document.body.appendChild(plane);
  setTimeout(() => { if (plane.parentNode) plane.parentNode.removeChild(plane); }, 3200);

});
