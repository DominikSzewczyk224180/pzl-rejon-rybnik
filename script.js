/* ============================================
   KOŁO ŁOWIECKIE - REGION RYBNIK
   Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Header scroll effect ---
  const header = document.querySelector('.header');
  const hero = document.querySelector('.hero');

  function handleHeaderScroll() {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  // --- Hero loaded animation ---
  window.addEventListener('load', () => {
    setTimeout(() => {
      hero.classList.add('loaded');
    }, 200);
  });

  // --- Mobile Navigation ---
  const burger = document.querySelector('.header__burger');
  const nav = document.querySelector('.header__nav');
  const navLinks = document.querySelectorAll('.header__nav-link');

  if (burger) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      nav.classList.toggle('open');
      document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('open');
        nav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Active nav link on scroll ---
  const sections = document.querySelectorAll('section[id]');

  function updateActiveNav() {
    const scrollY = window.scrollY + 120;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
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
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');

        // Stagger children if they have stagger data attribute
        if (entry.target.dataset.stagger) {
          const children = entry.target.querySelectorAll('[data-stagger-child]');
          children.forEach((child, i) => {
            child.style.transitionDelay = `${i * 120}ms`;
            child.classList.add('visible');
          });
        }

        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe animated elements
  document.querySelectorAll(
    '.about__content, .about__visual, .contact__info, .contact__form-wrapper'
  ).forEach(el => observer.observe(el));

  // Observe cards with stagger
  document.querySelectorAll('.news__card, .member-card').forEach(el => {
    observer.observe(el);
  });

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        const headerHeight = header.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // --- Contact form handling (placeholder) ---
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const btn = this.querySelector('.btn--submit');
      const originalText = btn.textContent;
      btn.textContent = 'Wysyłanie...';
      btn.style.opacity = '0.7';
      btn.disabled = true;

      // Simulated send (replace with real backend later)
      setTimeout(() => {
        btn.textContent = 'Wysłano!';
        btn.style.background = '#3d6b3d';
        btn.style.opacity = '1';

        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
          contactForm.reset();
        }, 2500);
      }, 1200);
    });
  }

  // --- Counter animation for stats ---
  const stats = document.querySelectorAll('.about__stat-number');
  let statsCounted = false;

  function animateCounters() {
    if (statsCounted) return;
    const firstStat = stats[0];
    if (!firstStat) return;

    const rect = firstStat.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) {
      statsCounted = true;
      stats.forEach(stat => {
        const target = parseInt(stat.dataset.count, 10);
        let current = 0;
        const increment = Math.ceil(target / 50);
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          stat.textContent = current;
        }, 30);
      });
    }
  }
  window.addEventListener('scroll', animateCounters, { passive: true });

  // --- Parallax subtle effect on hero ---
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        if (scrolled < window.innerHeight) {
          const bgImg = document.querySelector('.hero__bg img');
          if (bgImg) {
            bgImg.style.transform = `scale(${1 + scrolled * 0.0001}) translateY(${scrolled * 0.15}px)`;
          }
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

});
