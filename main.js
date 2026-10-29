/**
 * ==========================================================================
 * Luca Monteserin © | PH + VIDEO - Script Principal Definitivo y Blindado
 * ==========================================================================
 */

const $ = s => document.querySelector(s);  const $$ = s => [...document.querySelectorAll(s)];
const WA = "5493492591128";
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad = n => String(n).padStart(2, '0');
const today = new Date(); today.setHours(0, 0, 0, 0);
const todayKey = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
const setPressed = (sel, fn) => $$(sel).forEach(b => b.setAttribute('aria-pressed', fn(b)));

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
const filterButtons = $$('.filter');  const allCards = $$('#gallery .card');
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

const lb = $('#lightbox');   let lbFrom = null;      if (lb) {         $$('#gallery .card').forEach(c => {
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
// 4. Calendario Público Sincronizado
// ==========================================================================
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
let Y = 2026, M = 9;

function renderPublicCalendar(year, month) {
  const calGrid = $('#cal-grid');
  const monthTitle = $('#month-title');
  if (!calGrid || !monthTitle) return;

  const bookings = JSON.parse(localStorage.getItem('luca_bookings') || '{}');
  monthTitle.textContent = `${MESES[month]} ${year}`;
  
  $$('.yr').forEach(b => {
    b.setAttribute('aria-pressed', (+b.dataset.y === year) ? 'true' : 'false');
  });

  calGrid.innerHTML = '';

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    calGrid.appendChild(document.createElement('div'));
  }

  for (let day = 1; day <= totalDays; day++) {
    const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
    const btn = document.createElement('button');
    btn.type = 'button';
    
    const data = bookings[dateStr];
    const status = data ? data.status : 'available';

    if (status === 'reserved') {
      btn.className = 'aspect-square rounded-2xl text-xs font-bold flex items-center justify-center bg-gold-400 text-warm-950 cursor-not-allowed opacity-90';
      btn.disabled = true;
    } else if (status === 'one_spot') {
      btn.className = 'aspect-square rounded-2xl text-xs font-bold flex items-center justify-center bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 cursor-pointer';
    } else {
      btn.className = 'aspect-square rounded-2xl text-xs font-semibold flex items-center justify-center bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 cursor-pointer';
    }
    btn.textContent = day;

    if (status !== 'reserved') {
      btn.addEventListener('click', () => {
        const dateBanner = $('#date-banner');
        const dateText = $('#date-text');
        const fDateInput = $('#f-date');
        if (dateBanner && dateText) {
          dateText.textContent = `${day} de ${MESES[month]} de ${year}`;
          dateBanner.classList.remove('hidden');
          dateBanner.classList.add('flex');
        }
        if (fDateInput) fDateInput.value = dateStr;
      });
    }
    calGrid.appendChild(btn);
  }
}

const prevBtn = $('#prev');
const nextBtn = $('#next');  if (prevBtn) {   prevBtn.onclick = () => {     M--;     if (M < 0) { M = 11; Y = (Y === 2027) ? 2026 : 2027; }     renderPublicCalendar(Y, M);   }; }  if (nextBtn) {   nextBtn.onclick = () => {     M++;     if (M > 11) { M = 0; Y = (Y === 2026) ? 2027 : 2026; }     renderPublicCalendar(Y, M);   }; }  $$('.yr').forEach(b => {
  b.onclick = () => {
    Y = +b.dataset.y;
    M = (Y === 2026) ? 9 : 0;
    renderPublicCalendar(Y, M);
  };
});

const dateConfirm = $('#date-confirm');
if (dateConfirm) {
  dateConfirm.onclick = () => { 
    go('#presupuesto'); 
    toast('Fecha cargada en tu presupuesto.'); 
  };
}

// ==========================================================================
// 5. Cotizador en Tiempo Real (Tarifas Actualizadas)
// ==========================================================================
const PRICES_USD = {
  hourlyRateSingle: 60,  
  hourlyRateBoth: 120,   
  teamMember: 240,       
  liveEdit: 240,         
  expressEdit: 120,      
  extraBook: 120,        
  graduateRate: 120      
};

let currentUsdRate = 1200; 
const S = { ev: 'Quinceaños', fmt: 'ambos', h: 8, sh: 1, books: 0 };
const FMT = { foto: 'Solo foto', video: 'Solo video', ambos: 'Foto + video' };

async function fetchUsdRate() {
  try {
    const response = await fetch('https://dolarapi.com/v1/dolares/oficial');
    const data = await response.json();
    currentUsdRate = data.venta;
    updateCalculatedPrice();
  } catch (error) {
    console.error('Error al obtener cotización:', error);
    currentUsdRate = 1200;
    updateCalculatedPrice();
  }
}

function updateCalculatedPrice() {
  const totalArsEl = $('#price-display-ars');
  const totalUsdEl = $('#price-display-usd');
  if (!totalArsEl) return;

  const isGrad = S.ev === 'Graduación';
  const isSession = S.ev === 'Sesión'; 
  const f = S.fmt;
  const c = id => $( '#' + id )?.checked;

  let totalUsd = 0;

  if (isGrad) {
    const gradQty = parseInt($('#grad-qty')?.value || 30);
    totalUsd = gradQty * PRICES_USD.graduateRate;
  } else if (isSession) {
    const activeShrsBtn = document.querySelector('.shrs[aria-pressed="true"]');
    const sessionHours = activeShrsBtn ? parseInt(activeShrsBtn.dataset.sh) : S.sh;
    const hourlyRate = (f === 'ambos') ? PRICES_USD.hourlyRateBoth : PRICES_USD.hourlyRateSingle;
    totalUsd = sessionHours * hourlyRate;
    if (f !== 'video' && c('express')) totalUsd += PRICES_USD.expressEdit;
  } else {
    const activeHrsBtn = document.querySelector('.hrs[aria-pressed="true"]');
    const hours = activeHrsBtn ? parseInt(activeHrsBtn.dataset.h) : S.h;

    const hourlyRate = (f === 'ambos') ? PRICES_USD.hourlyRateBoth : PRICES_USD.hourlyRateSingle;
    totalUsd = hours * hourlyRate;

    if (f !== 'video' && c('xphoto')) totalUsd += PRICES_USD.teamMember;
    if (f !== 'foto' && c('xvideo')) totalUsd += PRICES_USD.teamMember;
    if (S.books > 0) totalUsd += S.books * PRICES_USD.extraBook;

    if (f !== 'video' && c('express')) totalUsd += PRICES_USD.expressEdit;
    if (f !== 'foto' && c('live')) totalUsd += PRICES_USD.liveEdit;
    if (c('drone')) totalUsd += PRICES_USD.expressEdit;
  }

  const totalArs = currentUsdRate > 0 ? totalUsd * currentUsdRate : 0;

  totalArsEl.textContent = `$ ${Math.round(totalArs).toLocaleString('es-AR')} ARS`;
  if (totalUsdEl) {
    totalUsdEl.textContent = `(USD $${totalUsd} a cotización oficial)`;
  }
}

function updateEventUI() {
  const isSession = S.ev === 'Sesión';
  const isGrad = S.ev === 'Graduación';

  $('#grad-wrap')?.classList.toggle('hidden', !isGrad);
  $('#fs-hrs-event')?.classList.toggle('hidden', isSession);
  $('#fs-hrs-session')?.classList.toggle('hidden', !isSession);
  $('#fs-team')?.classList.toggle('hidden', isSession);
  $('#fs-books')?.classList.toggle('hidden', isSession);
  updateCalculatedPrice();
}

// ==========================================================================
// 6. Formulario y WhatsApp
// ==========================================================================
const fDateInput = $('#f-date');
if (fDateInput) fDateInput.min = todayKey;

const formElem = $('#form');
if (formElem) {
  formElem.addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    if (!f.reportValidity()) return;
    const v = id => $( '#' + id )?.value.trim() || '';
    
    const txt = `Hola! Mi nombre es *${v('f-name')}*. Quisiera consultar disponibilidad:\n\n📅 *Fecha:* ${v('f-date')}\n🏛️ *Salón / Locación:* ${v('f-place') || 'A definir'}\n👥 *Invitados / Personas:* ${v('f-guests') || 'A definir'}\n📞 *WhatsApp:* ${v('f-phone')}\n\n💬 *Mensaje / Detalle:*\n${v('f-msg') || 'Sin detalles adicionales'}`;
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(txt)}`, '_blank', 'noopener');
    toast('Se abrió WhatsApp con la consulta preparada. Revisá los datos antes de enviar.');
    f.reset();
  });
}

// ==========================================================================
// 7. Carrusel de Videos Infinito
// ==========================================================================
const sliderSection = $('#slider-cinematico');
const track = $('#marquee-track');

if (sliderSection && track) {
  const videos = [...track.querySelectorAll('video')];
  const posterImages = [
    'https://cdn.picflow.com/assets/images/resized/1282x1920/3c06b3f2-8be4-4523-8d90-28bc1cbb4ecc.jpg',
    'https://cdn.picflow.com/assets/images/resized/1920x1280/9677b423-0791-42c7-b9e5-a99c6784d29b.jpg',
    'https://cdn.picflow.com/assets/images/resized/1282x1920/51c7e480-1a3a-47f4-b9ae-9518fdecfc5f.jpg',
    'https://cdn.picflow.com/assets/images/resized/1920x1282/f0a1cf7f-9d97-4826-b784-9ea0214a73cb.jpg'
  ];
  if (prefersReducedMotion) {
    videos.forEach((vid, index) => {
      const still = document.createElement('img');
      still.src = posterImages[index % posterImages.length];
      still.alt = '';
      still.loading = 'lazy';
      still.decoding = 'async';
      still.setAttribute('aria-hidden', 'true');
      still.className = vid.className;
      vid.replaceWith(still);
    });
  } else {
    const videoObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      const vid = entry.target;
      if (entry.isIntersecting && !document.hidden) vid.play().catch(() => {});
      else vid.pause();
    }), { rootMargin: '100px' });
    videos.forEach(vid => {
      vid.muted = true;
      vid.preload = 'none';
      videoObserver.observe(vid);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) videos.forEach(vid => vid.pause());
    });
  }

  let currentX = 0;
  let baseSpeed = 1.2; 
  let targetSpeed = baseSpeed;
  
  sliderSection.addEventListener('mousemove', (e) => {
    const rect = sliderSection.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const sectionWidth = rect.width;
    const normalized = (mouseX / sectionWidth) * 2 - 1;
    targetSpeed = normalized * 4.5;
  });

  sliderSection.addEventListener('mouseleave', () => {
    targetSpeed = baseSpeed;
  });

  let sliderVisible = false;
  let sliderFrame = 0;
  const sliderObserver = new IntersectionObserver(entries => {
    sliderVisible = entries.some(entry => entry.isIntersecting);
    if (sliderVisible && !prefersReducedMotion && !document.hidden && !sliderFrame) {
      sliderFrame = requestAnimationFrame(animateSlider);
    } else if (!sliderVisible && sliderFrame) {
      cancelAnimationFrame(sliderFrame);
      sliderFrame = 0;
    }
  });
  sliderObserver.observe(sliderSection);

  function animateSlider() {
    if (prefersReducedMotion || document.hidden || !sliderVisible) { sliderFrame = 0; return; }
    baseSpeed = 1.2; 
    let activeTarget = (targetSpeed === baseSpeed) ? -baseSpeed : targetSpeed;
    currentX += activeTarget;
    const halfWidth = track.scrollWidth / 2;

    if (currentX <= -halfWidth) {
      currentX += halfWidth;
    } else if (currentX >= 0) {
      currentX -= halfWidth;
    }

    track.style.transform = `translateX(${currentX}px)`;
    sliderFrame = requestAnimationFrame(animateSlider);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && sliderFrame) {
      cancelAnimationFrame(sliderFrame);
      sliderFrame = 0;
    } else if (!document.hidden && sliderVisible && !prefersReducedMotion && !sliderFrame) {
      sliderFrame = requestAnimationFrame(animateSlider);
    }
  });
}

// ==========================================================================
  // Inicialización General y Listeners del Cotizador
  // ==========================================================================
  
  // NUEVO: Interceptar clics en enlaces internos para evitar el #hash en la URL
  document.addEventListener('click', e => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    
    const targetId = anchor.getAttribute('href');
    if (targetId === '#' || !targetId) return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      e.preventDefault(); // Evita que se agregue el # a la barra de direcciones
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

// ==========================================================================
// 8. Inicialización General y Listeners del Cotizador
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  const year = $('#current-year');
  if (year) year.textContent = new Date().getFullYear();
  renderPublicCalendar(Y, M);
  if ($('#price-display-ars')) fetchUsdRate();
  updateEventUI();

  $$('.opt.ev').forEach(b => {
    b.addEventListener('click', () => {
      S.ev = b.dataset.ev.trim();
      $$('.opt.ev').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
      updateEventUI();
    });
  });

  $$('.opt.fmt').forEach(b => {
    b.addEventListener('click', () => {
      S.fmt = b.dataset.fmt.trim();
      $$('.opt.fmt').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
      updateCalculatedPrice();
    });
  });

  $$('.hrs').forEach(b => {
    b.addEventListener('click', () => {
      S.h = +b.dataset.h;
      $$('.hrs').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
      updateCalculatedPrice();
    });
  });

  $$('.shrs').forEach(b => {
    b.addEventListener('click', () => {
      S.sh = +b.dataset.sh;
      $$('.shrs').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
      updateCalculatedPrice();
    });
  });

  $$('.toggle-btn').forEach(toggle => {
    const checkboxId = toggle.dataset.target;
    const checkbox = $('#' + checkboxId);
    
    toggle.addEventListener('click', () => {
      if (!checkbox) return;
      checkbox.checked = !checkbox.checked;
      
      const indicator = toggle.querySelector('.toggle-indicator');
      const dot = indicator?.querySelector('div');

      if (checkbox.checked) {
        toggle.classList.add('border-gold-400', 'bg-gold-500/10');
        if (indicator) indicator.classList.add('bg-gold-400');
        if (dot) dot.style.transform = 'translateX(16px)';
      } else {
        toggle.classList.remove('border-gold-400', 'bg-gold-500/10');
        if (indicator) indicator.classList.remove('bg-gold-400');
        if (dot) dot.style.transform = 'translateX(0px)';
      }
      updateCalculatedPrice();
    });
  });

  $('#grad-qty')?.addEventListener('input', updateCalculatedPrice);

  const booksOut = $('#books');
  $('#books-minus')?.addEventListener('click', () => {
    S.books = Math.max(0, S.books - 1);
    if (booksOut) booksOut.textContent = S.books;
    updateCalculatedPrice();
  });
  $('#books-plus')?.addEventListener('click', () => {
    S.books = Math.min(2, S.books + 1);
    if (booksOut) booksOut.textContent = S.books;
    updateCalculatedPrice();
  });

  const quoteSend = $('#quote-send');
  if (quoteSend) {
    quoteSend.onclick = () => {
      const arsText = $('#price-display-ars')?.textContent || '';
      const usdText = $('#price-display-usd')?.textContent || '';
      const ex = [];
      const c = id => $('#' + id)?.checked;
      const isSession = S.ev === 'Sesión';
      const duration = isSession ? `${S.sh} hora(s)` : `${S.h} hs`;

      if (!isSession) {
        if (S.fmt !== 'video' && c('xphoto')) ex.push('2do Fotógrafo');
        if (S.fmt !== 'foto' && c('xvideo')) ex.push('2do Videógrafo');
        if (S.books) ex.push(`${S.books} book(s)`);
        if (S.fmt !== 'foto' && c('live')) ex.push('Edición en Vivo');
        if (c('drone')) ex.push('Tomas Aéreas');
      }
      if (S.fmt !== 'video' && c('express')) ex.push('Fotos en 72 hs.');

      let gradInfo = (S.ev === 'Graduación') ? `\nCantidad de graduados: ${$('#grad-qty')?.value || '30'}` : '';

      const msg = $('#f-msg');
      if (msg) {
        msg.value = `Presupuesto cotizado:\nTipo: ${S.ev}\nCobertura: ${FMT[S.fmt]}\nDuración: ${duration}${gradInfo}\nAdicionales: ${ex.join(', ') || 'Ninguno'}\nEstimado: ${arsText} ${usdText}`;
      }
      go('#contacto');
      toast('Presupuesto cargado en el formulario.');
    };
  }

  setTimeout(() => {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }, 50);
});
