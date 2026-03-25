/* ============================================
   KOŁO ŁOWIECKIE – REGION RYBNIK
   Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  const hero = document.querySelector('.hero');

  // --- Hero loaded animation ---
  window.addEventListener('load', () => {
    setTimeout(() => hero.classList.add('loaded'), 150);
  });

  // --- Mobile Navigation ---
  const burger = document.querySelector('.navbar__burger');
  const navLinks = document.querySelector('.navbar__links');
  const allNavLinks = document.querySelectorAll('.navbar__link');

  if (burger) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    allNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('open');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Active nav link on scroll ---
  const sections = document.querySelectorAll('section[id]');
  const navbar = document.querySelector('.navbar');

  function updateActiveNav() {
    const scrollY = window.scrollY + (navbar ? navbar.offsetHeight + 20 : 120);

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        allNavLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });

  // --- Intersection Observer for animations ---
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll(
    '.about__content, .about__visual, .contact__info, .contact__form-wrapper, .news__card, .member-card'
  ).forEach(el => observer.observe(el));

  // --- Stagger delay for cards ---
  document.querySelectorAll('.news__card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 100}ms`;
  });
  document.querySelectorAll('.member-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 80}ms`;
  });

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        const navbarH = navbar ? navbar.offsetHeight : 0;
        const pos = target.getBoundingClientRect().top + window.scrollY - navbarH - 10;
        window.scrollTo({ top: pos, behavior: 'smooth' });
      }
    });
  });

  // --- Contact form handling (placeholder) ---
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = this.querySelector('.btn--submit');
      const originalHTML = btn.innerHTML;
      btn.textContent = 'Wysyłanie...';
      btn.style.opacity = '0.7';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = '✓ Wysłano!';
        btn.style.background = '#2a4d2a';
        btn.style.opacity = '1';
        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.style.background = '';
          btn.disabled = false;
          contactForm.reset();
        }, 2500);
      }, 1200);
    });
  }

  // --- Counter animation ---
  const stats = document.querySelectorAll('.about__stat-number');
  let statsCounted = false;

  function animateCounters() {
    if (statsCounted || !stats.length) return;
    const rect = stats[0].getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) {
      statsCounted = true;
      stats.forEach(stat => {
        const target = parseInt(stat.dataset.count, 10);
        let current = 0;
        const increment = Math.ceil(target / 45);
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) { current = target; clearInterval(timer); }
          stat.textContent = current;
        }, 28);
      });
    }
  }
  window.addEventListener('scroll', animateCounters, { passive: true });

  // --- Subtle parallax on hero ---
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        const heroHeight = hero.offsetHeight;
        if (scrolled < heroHeight) {
          const bgImg = document.querySelector('.hero__bg img');
          if (bgImg) {
            bgImg.style.transform = `scale(${1.03 + scrolled * 0.00008}) translateY(${scrolled * 0.12}px)`;
          }
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

});
