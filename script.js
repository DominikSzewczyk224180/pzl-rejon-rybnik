/* ============================================
   KOŁO ŁOWIECKIE – REGION RYBNIK
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {

  const hero = document.querySelector('.hero');

  // Hero loaded animation (subtle zoom)
  window.addEventListener('load', () => {
    setTimeout(() => hero.classList.add('loaded'), 120);
  });

  // Mobile nav
  const burger = document.getElementById('burger');
  const nav = document.getElementById('mainNav');
  const navLinks = document.querySelectorAll('.header__nav-link');

  if (burger) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      nav.classList.toggle('open');
      document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
    });
    navLinks.forEach(l => l.addEventListener('click', () => {
      burger.classList.remove('open');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    }));
  }

  // Active nav on scroll
  const sections = document.querySelectorAll('section[id]');
  function updateActiveNav() {
    const y = window.scrollY + (document.getElementById('header')?.offsetHeight || 140);
    sections.forEach(s => {
      const top = s.offsetTop, h = s.offsetHeight, id = s.id;
      if (y >= top && y < top + h) {
        navLinks.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
        });
      }
    });
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });

  // Intersection Observer
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.about__content,.about__visual,.contact__info,.contact__form-wrap,.news__card,.member-card')
    .forEach(el => obs.observe(el));

  // Stagger cards
  document.querySelectorAll('.news__card').forEach((c, i) => c.style.transitionDelay = `${i * 100}ms`);
  document.querySelectorAll('.member-card').forEach((c, i) => c.style.transitionDelay = `${i * 80}ms`);

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      const id = this.getAttribute('href');
      if (id === '#') return;
      const el = document.querySelector(id);
      if (el) {
        const offset = document.getElementById('header')?.offsetHeight || 0;
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset - 10, behavior: 'smooth' });
      }
    });
  });

  // Contact form
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = this.querySelector('.btn-submit');
      const orig = btn.innerHTML;
      btn.textContent = 'Wysyłanie...';
      btn.style.opacity = '.7'; btn.disabled = true;
      setTimeout(() => {
        btn.textContent = '✓ Wysłano!';
        btn.style.background = '#2a4d2a'; btn.style.opacity = '1';
        setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; btn.disabled = false; form.reset(); }, 2500);
      }, 1200);
    });
  }

  // Counter animation
  const stats = document.querySelectorAll('.about__stat-num');
  let counted = false;
  function animCounters() {
    if (counted || !stats.length) return;
    if (stats[0].getBoundingClientRect().top < window.innerHeight * .85) {
      counted = true;
      stats.forEach(s => {
        const t = parseInt(s.dataset.count); let c = 0;
        const inc = Math.ceil(t / 45);
        const timer = setInterval(() => { c += inc; if (c >= t) { c = t; clearInterval(timer); } s.textContent = c; }, 28);
      });
    }
  }
  window.addEventListener('scroll', animCounters, { passive: true });

  // Subtle parallax
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < hero.offsetHeight) {
          const img = document.querySelector('.hero__bg img');
          if (img) img.style.transform = `scale(${1.02 + y * .00008}) translateY(${y * .1}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

});
