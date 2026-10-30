/**
 * ==========================================================================
 * Luca Monteserin © | PH + VIDEO - Script Principal Definitivo y Blindado
 * ==========================================================================
 */

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const WA = "5493492591128";
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad = n => String(n).padStart(2, '0');
const today = new Date(); today.setHours(0, 0, 0, 0);
const todayKey = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

function toast(m) {
  const t = $('#toast');
  if (!t) return;
  $('#toast-msg').textContent = m;
  t.classList.remove('hidden');
  t.classList.add('flex', 'show');
  clearTimeout(t._t);
  t._t = setTimeout(() => { t.classList.add('hidden'); t.classList.remove('flex', 'show'); }, 3500);
}

const go = id => $(id)?.scrollIntoView({ behavior: 'smooth' });

// ==========================================================================
// 1. Control del Header y Hero
// ==========================================================================
const mainHeader = $('#main-header');
const heroSection = $('#hero');
const heroContent = $('#hero-content');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  if (mainHeader && heroSection) {
    const heroHeight = heroSection.offsetHeight;
    if (scrollY > heroHeight - 80) {
      mainHeader.classList.add('scrolled');
    } else {
      mainHeader.classList.remove('scrolled');
    }
  }

  if (heroSection && heroContent) {
    const heroHeight = heroSection.offsetHeight;
    if (scrollY <= heroHeight && !prefersReducedMotion) {
      let opacity = 1 - (scrollY / (heroHeight * 0.75));
      if (opacity < 0) opacity = 0;
      if (opacity > 1) opacity = 1;
      heroContent.style.opacity = opacity;
      heroContent.style.transform = `translateY(${scrollY * 0.2}px)`;
      heroContent.style.visibility = 'visible';
    } else {
      heroContent.style.opacity = 0;
      heroContent.style.visibility = 'hidden';
    }
  }
}, { passive: true });

// Carrusel del Hero principal
const slides = $$('.hero-slide');
let si = 0;
if (slides.length > 0 && heroSection && !prefersReducedMotion) {
  let heroTimer = null;
  const advanceHero = () => {
    slides[si].classList.remove('active');
    si = (si + 1) % slides.length;
    const nextSlide = slides[si];
    const img = nextSlide.querySelector('img[data-src]');
    const activate = () => nextSlide.classList.add('active');
    if (img) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      if (img.decode) img.decode().then(activate).catch(activate);
      else {
        img.addEventListener('load', activate, { once: true });
        img.addEventListener('error', activate, { once: true });
      }
    } else activate();
  };
  const heroObserver = new IntersectionObserver(([entry]) => {
    clearInterval(heroTimer);
    heroTimer = entry.isIntersecting && !document.hidden ? setInterval(advanceHero, 5200) : null;
  });
  heroObserver.observe(heroSection);
  document.addEventListener('visibilitychange', () => {
    clearInterval(heroTimer);
    const heroRect = heroSection.getBoundingClientRect();
    heroTimer = !document.hidden && heroRect.top < window.innerHeight && heroRect.bottom > 0
      ? setInterval(advanceHero, 5200) : null;
  });
}

// Menú móvil
const menu = $('#mobile-menu'), mbtn = $('#menu-btn');
if (mbtn && menu) {
  mbtn.onclick = () => {
    const open = menu.classList.toggle('hidden') === false;
    mbtn.setAttribute('aria-expanded', open);
    mbtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    if (open) menu.querySelector('a')?.focus();
  };
  menu.querySelectorAll('a').forEach(a => a.onclick = () => {
    menu.classList.add('hidden');
    mbtn.setAttribute('aria-expanded', 'false');
    mbtn.setAttribute('aria-label', 'Abrir menú');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !menu.classList.contains('hidden')) {
      menu.classList.add('hidden');
      mbtn.setAttribute('aria-expanded', 'false');
      mbtn.setAttribute('aria-label', 'Abrir menú');
      mbtn.focus();
    }
  });
}

// ==========================================================================
// 2. Efecto Spotlight y Animaciones Reveal
// ==========================================================================
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
if (!prefersReducedMotion && finePointer) {
  const spotlight = document.createElement('div');
  spotlight.className = 'spotlight-glow';
  spotlight.setAttribute('aria-hidden', 'true');
  document.body.appendChild(spotlight);
  let mouseX = 0, mouseY = 0, spotlightX = 0, spotlightY = 0;
  window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; spotlight.style.opacity = '1'; }, { passive: true });
  document.addEventListener('mouseleave', () => { spotlight.style.opacity = '0'; });
  const renderSpotlight = () => {
    if (!document.hidden) {
      spotlightX += (mouseX - spotlightX) * 0.1;
      spotlightY += (mouseY - spotlightY) * 0.1;
      spotlight.style.left = `${spotlightX}px`;
      spotlight.style.top = `${spotlightY}px`;
    }
    requestAnimationFrame(renderSpotlight);
  };
  renderSpotlight();
}

document.body.classList.add('js-ready');
const io = new IntersectionObserver(es => es.forEach(e => { 
  if (e.isIntersecting) { 
    e.target.classList.add('on'); 
    e.target.style.opacity = '1';
    e.target.style.transform = 'none';
    io.unobserve(e.target); 
  } 
}), { threshold: 0.01, rootMargin: '0px 0px 50px 0px' });

$$('.reveal').forEach(el => io.observe(el));

// ==========================================================================
// 3. Filtros de Proyectos y Lightbox Operativos
// ==========================================================================
const filterButtons = $$('.filter');
const allCards = $$('#gallery .card');
let activeCategory = 'all';

function showCategoryView(category) {
  filterButtons.forEach(b => {
    b.setAttribute('aria-pressed', b.dataset.cat === category ? 'true' : 'false');
  });
  allCards.forEach(card => {
    card.hidden = category !== 'all' && card.dataset.cat !== category;
  });
  const visibleCount = allCards.filter(card => !card.hidden).length;
  const status = $('#filter-status');
  if (status) status.textContent = `${visibleCount} trabajos en ${category === 'all' ? 'todas las categorías' : category}.`;
}

if (filterButtons.length > 0) {
  filterButtons.forEach(btn => {
    const cat = btn.dataset.cat;
    btn.addEventListener('click', () => {
      activeCategory = cat;
      showCategoryView(activeCategory);
    });
  });
  showCategoryView(activeCategory);
}

const lb = $('#lightbox');
let lbFrom = null;
if (lb) {
  $$('#gallery .card').forEach(c => {
    c.onclick = () => {
      lbFrom = c;
      $('#lb-img').src = c.dataset.full;
      $('#lb-img').alt = c.dataset.title;
      $('#lb-title').textContent = c.dataset.title;
      $('#lb-desc').textContent = c.dataset.desc;
      lb.classList.replace('hidden', 'flex');
      requestAnimationFrame(() => { lb.classList.add('open'); $('#lb-close').focus(); });
    };
  });
  const closeLb = () => {
    lb.classList.remove('open');
    setTimeout(() => { lb.classList.replace('flex', 'hidden'); lbFrom && lbFrom.focus(); }, 300);
  };
  const lbCloseBtn = $('#lb-close');
  if (lbCloseBtn) lbCloseBtn.onclick = closeLb;
  lb.onclick = e => { if (e.target === lb) closeLb(); };
  lb.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const focusables = [...lb.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])')];
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.classList.contains('hidden')) closeLb(); });
}

// ==========================================================================
// 4. Slider Cinemático de Videos Infinito (100% Funcional y Blindado)
// ==========================================================================
const sliderSection = document.getElementById('slider-cinematico');
const track = document.getElementById('marquee-track');

if (sliderSection && track) {
  const videos = [...track.querySelectorAll('video')];
  videos.forEach(vid => {
    vid.muted = true;
    vid.play().catch(() => {});
  });

  let currentX = 0;
  let baseSpeed = 1.2;
  let targetSpeed = baseSpeed;

  sliderSection.addEventListener('mousemove', (e) => {
    const rect = sliderSection.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const normalized = (mouseX / rect.width) * 2 - 1;
    targetSpeed = normalized * 3.5;
  });

  sliderSection.addEventListener('mouseleave', () => {
    targetSpeed = baseSpeed;
  });

  sliderSection.addEventListener('touchmove', () => {
    targetSpeed = 2.0;
  }, { passive: true });

  sliderSection.addEventListener('touchend', () => {
    targetSpeed = baseSpeed;
  });

  function animateSlider() {
    currentX -= targetSpeed;
    const halfWidth = track.scrollWidth / 2;

    if (halfWidth > 0) {
      if (currentX <= -halfWidth) {
        currentX += halfWidth;
      } else if (currentX > 0) {
        currentX -= halfWidth;
      }
    }

    track.style.transform = `translateX(${currentX}px)`;
    requestAnimationFrame(animateSlider);
  }

  // Arranca de manera inmediata y fluida sin depender de observers restrictivos
  requestAnimationFrame(animateSlider);
}

// ==========================================================================
// 5. Inicialización General y Navegación Suave
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  const year = $('#current-year');
  if (year) year.textContent = new Date().getFullYear();

  document.addEventListener('click', e => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    
    const targetId = anchor.getAttribute('href');
    if (targetId === '#' || !targetId) return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      e.preventDefault();
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });

  setTimeout(() => {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }, 50);
});
