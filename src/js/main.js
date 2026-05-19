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

});
