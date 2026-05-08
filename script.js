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
  const navLinks = document.querySelectorAll('.sticknav__link');

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
    const y = window.scrollY + (document.getElementById('sticknav')?.offsetHeight || 80);
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
        const offset = document.getElementById('sticknav')?.offsetHeight || 0;
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset - 10, behavior: 'smooth' });
      }
    });
  });

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

  // Obwody cards — click to expand, click again to collapse
  document.querySelectorAll('.ok').forEach(card => {
    card.querySelector('.ok__head').addEventListener('click', () => {
      const wasOpen = card.classList.contains('open');
      // Close all others
      document.querySelectorAll('.ok.open').forEach(c => c.classList.remove('open'));
      // Toggle clicked
      if (!wasOpen) card.classList.add('open');
    });
  });

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

/* ============================================================
   PANEL ADMINA + DYNAMICZNE AKTUALNOŚCI
   ============================================================ */

<<<<<<< HEAD
// ===== KONFIGURACJA — zmień to po wdrożeniu backendu na Railway =====
const API_BASE = 'https://YOUR-RAILWAY-APP.up.railway.app';
=======
// ===== KONFIGURACJA — zmień to po wdrożeniu backendu  =====
const API_BASE = 'https://api.pzlregionrybnicki.pl';
>>>>>>> c1965876c3a64fb8006bff5bd8825c5097172084
// =====================================================================

const TOKEN_KEY = 'pzl_admin_token';
const tok = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
  has: () => !!localStorage.getItem(TOKEN_KEY),
};

const $ = (id) => document.getElementById(id);

// ----- helpers -----
function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
function fmtDate(d, short = false) {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date)) return '';
  const months = ['Sty','Lut','Mar','Kwi','Maj','Cze','Lip','Sie','Wrz','Paź','Lis','Gru'];
  if (short) return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  const dd = String(date.getDate()).padStart(2,'0');
  const mm = String(date.getMonth()+1).padStart(2,'0');
  const hh = String(date.getHours()).padStart(2,'0');
  const mi = String(date.getMinutes()).padStart(2,'0');
  return `${dd}.${mm}.${date.getFullYear()} ${hh}:${mi}`;
}
function truncate(s, max = 120) {
  if (!s) return '';
  s = s.replace(/\s+/g, ' ').trim();
  return s.length <= max ? s : s.slice(0, max).trim() + '…';
}
function openModal(id) { $(id)?.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeModal(id) { $(id)?.classList.remove('open'); document.body.style.overflow = ''; }
function closeAllModals() {
  document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  document.body.style.overflow = '';
}

// ----- modal close handlers -----
document.querySelectorAll('[data-close-modal]').forEach(btn => {
  btn.addEventListener('click', () => btn.closest('.modal-overlay').classList.remove('open'));
});
document.querySelectorAll('.modal-overlay').forEach(ov => {
  ov.addEventListener('click', (e) => { if (e.target === ov) ov.classList.remove('open'); });
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAllModals(); });

// ----- admin button -----
// ----- admin button (visible only when scrolled to footer) -----
const adminBtnEl = $('adminBtn');
const footerEl = document.querySelector('.footer');
if (adminBtnEl && footerEl && 'IntersectionObserver' in window) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      adminBtnEl.classList.toggle('visible', entry.isIntersecting);
    });
  }, { threshold: 0.05 });
  obs.observe(footerEl);
}

$('adminBtn')?.addEventListener('click', () => {
  if (tok.has()) openAdminPanel();
  else openModal('loginModal');
});

// ----- login -----
$('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = $('loginPassword').value;
  const errEl = $('loginError');
  errEl.textContent = '';
  try {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || 'Niepoprawne hasło');
    }
    const data = await res.json();
    tok.set(data.access_token);
    $('loginPassword').value = '';
    closeModal('loginModal');
    openAdminPanel();
  } catch (err) {
    errEl.textContent = err.message;
  }
});

$('logoutBtn')?.addEventListener('click', () => {
  if (confirm('Wylogować?')) {
    tok.clear();
    closeModal('adminModal');
  }
});

// ----- admin panel -----
async function openAdminPanel() {
  openModal('adminModal');
  resetNewsForm();
  await loadAdminNews();
}

async function loadAdminNews() {
  const list = $('adminNewsList');
  list.innerHTML = '<p class="admin-loading">Ładowanie...</p>';
  try {
    const res = await fetch(`${API_BASE}/news`);
    if (!res.ok) throw new Error('Błąd ładowania');
    const news = await res.json();
    if (news.length === 0) {
      list.innerHTML = '<p class="admin-loading">Brak aktualności. Dodaj pierwszą!</p>';
      return;
    }
    list.innerHTML = news.map(n => `
      <div class="admin-news-item" data-id="${n.id}">
        <div class="admin-news-item__info">
          <div class="admin-news-item__title">${escapeHtml(n.title)}${n.event_date ? `<span class="admin-event-tag">📅 ${fmtDate(n.event_date)}</span>` : ''}</div>
          <div class="admin-news-item__meta">Dodano: ${fmtDate(n.created_at)}</div>
        </div>
        <div class="admin-actions">
          <button class="admin-btn-sm admin-btn-sm--edit" data-edit="${n.id}">Edytuj</button>
          <button class="admin-btn-sm admin-btn-sm--del" data-del="${n.id}">Usuń</button>
        </div>
      </div>
    `).join('');
    list.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => editNews(+b.dataset.edit)));
    list.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => deleteNews(+b.dataset.del)));
  } catch (err) {
    list.innerHTML = `<p class="admin-loading" style="color:#a83838">Błąd: ${escapeHtml(err.message)}</p>`;
  }
}

// ----- news form -----
$('newsForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('newsId').value;
  const title = $('newsTitle').value.trim();
  const description = $('newsDescription').value.trim();
  const short_description = $('newsShortDesc').value.trim() || null;
  const event_date_raw = $('newsEventDate').value;
  const event_date = event_date_raw ? new Date(event_date_raw).toISOString() : null;
  const location = $('newsLocation').value.trim() || null;
  const imageFile = $('newsImage').files[0];

  let image_base64 = $('newsImageExisting').value || null;
  if (imageFile) {
    if (imageFile.size > 20 * 1024 * 1024) {
      alert('Plik za duży (max 20 MB)');
      return;
    }
    image_base64 = await fileToBase64(imageFile);
  }

  const payload = { title, description, short_description, image_base64, event_date, location };
  const url = id ? `${API_BASE}/news/${id}` : `${API_BASE}/news`;
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tok.get()}`,
      },
      body: JSON.stringify(payload),
    });
    if (res.status === 401) {
      tok.clear();
      alert('Sesja wygasła — zaloguj się ponownie.');
      closeModal('adminModal');
      return;
    }
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.detail || 'Błąd zapisu');
    }
    resetNewsForm();
    await loadAdminNews();
    await loadPublicNews();
    await loadUpcomingEvent();
  } catch (err) {
    alert('Błąd: ' + err.message);
  }
});

$('resetFormBtn')?.addEventListener('click', resetNewsForm);

function resetNewsForm() {
  const form = $('newsForm');
  if (!form) return;
  form.reset();
  $('newsId').value = '';
  $('newsImageExisting').value = '';
  $('newsImagePreview').style.display = 'none';
  $('newsImagePreview').src = '';
  $('newsFormTitle').textContent = 'Dodaj aktualność';
}

async function editNews(id) {
  try {
    const res = await fetch(`${API_BASE}/news/${id}`);
    const n = await res.json();
    $('newsId').value = n.id;
    $('newsTitle').value = n.title;
    $('newsDescription').value = n.description;
    $('newsShortDesc').value = n.short_description || '';
    $('newsLocation').value = n.location || '';
    $('newsEventDate').value = n.event_date ? n.event_date.slice(0, 16) : '';
    $('newsImageExisting').value = n.image_base64 || '';
    if (n.image_base64) {
      $('newsImagePreview').src = n.image_base64;
      $('newsImagePreview').style.display = 'block';
    } else {
      $('newsImagePreview').style.display = 'none';
    }
    $('newsFormTitle').textContent = 'Edytuj aktualność';
    $('newsForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    alert('Błąd: ' + err.message);
  }
}

async function deleteNews(id) {
  if (!confirm('Na pewno usunąć tę aktualność?')) return;
  try {
    const res = await fetch(`${API_BASE}/news/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tok.get()}` },
    });
    if (res.status === 401) {
      tok.clear();
      alert('Sesja wygasła — zaloguj się ponownie.');
      closeModal('adminModal');
      return;
    }
    if (!res.ok) throw new Error('Błąd usuwania');
    await loadAdminNews();
    await loadPublicNews();
    await loadUpcomingEvent();
  } catch (err) {
    alert('Błąd: ' + err.message);
  }
}

// Image preview on upload
$('newsImage')?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 20 * 1024 * 1024) {
    alert('Plik za duży (max 20 MB)');
    e.target.value = '';
    return;
  }
  const b64 = await fileToBase64(file);
  $('newsImagePreview').src = b64;
  $('newsImagePreview').style.display = 'block';
});

// ----- public: load news from API -----
async function loadPublicNews() {
  const grid = document.querySelector('.news__grid');
  if (!grid) return;
  try {
    const res = await fetch(`${API_BASE}/news?limit=3`);
    if (!res.ok) return;
    const news = await res.json();
    if (!news.length) return;

    grid.innerHTML = news.map((n, i) => `
      <article class="news__card visible" data-news-id="${n.id}" style="transition-delay:${i * 100}ms">
        ${n.image_base64
          ? `<div class="news__card-img"><img src="${n.image_base64}" alt=""><span class="news__card-date">${fmtDate(n.created_at, true)}</span></div>`
          : `<div class="news__card-img news__card-img--placeholder"><span class="news__card-date">${fmtDate(n.created_at, true)}</span></div>`
        }
        <div class="news__card-body">
          <h3 class="news__card-title">${escapeHtml(n.title)}</h3>
          <p class="news__card-text">${escapeHtml(n.short_description || truncate(n.description, 120))}</p>
          <a class="news__card-link">Czytaj więcej →</a>
        </div>
      </article>
    `).join('');

    grid.querySelectorAll('.news__card').forEach(card => {
      card.addEventListener('click', () => openNewsDetail(+card.dataset.newsId));
    });
  } catch (err) {
    console.warn('News load failed:', err);
  }
}

async function loadUpcomingEvent() {
  try {
    const res = await fetch(`${API_BASE}/news/upcoming`);
    if (!res.ok) return;
    const event = await res.json();
    if (!event) return;
    const card = document.querySelector('.hl-card[href="#aktualnosci"]');
    if (!card) return;
    const title = card.querySelector('.hl-card__title');
    const desc = card.querySelector('.hl-card__desc');
    if (title) title.textContent = event.title;
    if (desc) {
      const parts = [fmtDate(event.event_date)];
      if (event.location) parts.push(event.location);
      desc.textContent = parts.join(' · ');
    }
    card.dataset.newsId = event.id;
    card.addEventListener('click', (e) => {
      e.preventDefault();
      openNewsDetail(event.id);
    }, { once: false });
  } catch (err) {
    console.warn('Upcoming event load failed:', err);
  }
}

async function openNewsDetail(id) {
  try {
    const res = await fetch(`${API_BASE}/news/${id}`);
    if (!res.ok) throw new Error('Nie znaleziono');
    const n = await res.json();

    const img = $('newsModalImg');
    if (n.image_base64) { img.src = n.image_base64; img.style.display = 'block'; }
    else { img.style.display = 'none'; }

    $('newsModalDate').textContent = `Opublikowano: ${fmtDate(n.created_at)}`;
    $('newsModalTitle').textContent = n.title;
    $('newsModalDesc').textContent = n.description;

    if (n.event_date) {
      $('newsModalEvent').style.display = 'flex';
      $('newsModalEventDate').textContent = fmtDate(n.event_date);
      $('newsModalEventLoc').textContent = n.location || '—';
    } else {
      $('newsModalEvent').style.display = 'none';
    }

    openModal('newsModal');
  } catch (err) {
    alert('Błąd ładowania: ' + err.message);
  }
}

// ----- init -----
loadPublicNews();
loadUpcomingEvent();
