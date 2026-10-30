/**
 * ==========================================================================
 * Luca Monteserin © | PH + VIDEO - Script Principal Definitivo Completo
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
const menuBtn = $('#menu-btn');
const fullscreenMenu = $('#fullscreen-menu');
const closeMenuBtn = $('#close-menu-btn');

function openMenu() {
  if (!fullscreenMenu) return;
  fullscreenMenu.classList.remove('hidden');
  fullscreenMenu.classList.add('flex');
  document.body.classList.add('overflow-hidden');
  if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeMenu() {
  if (!fullscreenMenu) return;
  fullscreenMenu.classList.add('hidden');
  fullscreenMenu.classList.remove('flex');
  document.body.classList.remove('overflow-hidden');
  if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
}

if (menuBtn && fullscreenMenu) {
  menuBtn.addEventListener('click', openMenu);
  if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
  fullscreenMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !fullscreenMenu.classList.contains('hidden')) {
      closeMenu();
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
// 3. Slider Cinemático de Videos (100% Funcional sin Fallos)
// ==========================================================================
function initVideoSlider() {
  const sliderSection = document.getElementById('slider-cinematico');
  const track = document.getElementById('marquee-track');

  if (!sliderSection || !track) return;

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
    let activeTarget = (targetSpeed === baseSpeed) ? baseSpeed : -targetSpeed;
    currentX -= activeTarget;

    const halfWidth = track.scrollWidth / 2;
    if (halfWidth > 0) {
      if (currentX <= -halfWidth) {
        currentX += halfWidth;
      } else if (currentX >= 0) {
        currentX -= halfWidth;
      }
    }

    track.style.transform = `translateX(${currentX}px)`;
    requestAnimationFrame(animateSlider);
  }

  requestAnimationFrame(animateSlider);
}

// ==========================================================================
// 4. Lógica del Presupuestador de Eventos
// ==========================================================================
let tipoEvento = 'quince';
let tarifaPorHoraUSD = 60;
let horas = 8;
let sesiones = 0;
let tipoCobertura = 'foto';
let extraFotoUSD = 0;
let extraVideoUSD = 0;
let extraExpressUSD = 0;
let extraLiveUSD = 0;
let extraDroneUSD = 0;
let mensajeWhatsAppInterno = '';
let cotizacionDolar = 1535;
const TARIFA_SESION_USD = 120;

function resaltarBotonActivo(element, activo) {
  if (!element) return;
  if (activo) {
    element.classList.remove('text-white', 'bg-white/5', 'sm:bg-zinc-800');
    element.classList.add('bg-amber-400', 'text-zinc-950', 'border-amber-400', 'font-bold');
    element.setAttribute('aria-pressed', 'true');
  } else {
    element.classList.remove('bg-amber-400', 'text-zinc-950', 'border-amber-400', 'font-bold');
    element.classList.add('text-white', 'bg-white/5', 'sm:bg-zinc-800');
    element.setAttribute('aria-pressed', 'false');
  }
}

async function obtenerDolar() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('https://dolarapi.com/v1/dolares/oficial', { signal: controller.signal });
    clearTimeout(timeoutId);
    const data = await res.json();
    if (data && data.venta) {
      cotizacionDolar = data.venta;
      const label = $('#dolar-label');
      if (label) label.textContent = `Dólar oficial: $${cotizacionDolar}`;
    }
  } catch (e) {
    const label = $('#dolar-label');
    if (label) label.textContent = `Dólar oficial: $${cotizacionDolar} (ref)`;
  }
  calcular();
}

function actualizarDisponibilidad() {
  const btnSes1 = $('#btn-ses-1');
  const btnSes2 = $('#btn-ses-2');
  const btnSes = $$('.btn-ses');
  const btnXPhoto = $('#btn-xphoto');
  const btnXVideo = $('#btn-xvideo');
  const btnExpress = $('#btn-express');
  const btnLive = $('#btn-live');
  const btnDrone = $('#btn-drone');

  if (tipoCobertura === 'ambos') {
    if (btnSes1) {
      btnSes1.disabled = true;
      btnSes1.setAttribute('aria-disabled', 'true');
      btnSes1.classList.remove('bg-amber-400', 'text-zinc-950', 'border-amber-400', 'font-bold');
      btnSes1.classList.add('text-white', 'opacity-40', 'cursor-not-allowed');
    }
    if (sesiones === 1) {
      btnSes.forEach(b => resaltarBotonActivo(b, false));
      resaltarBotonActivo(btnSes2, true);
      sesiones = 2;
    }
  } else if (btnSes1) {
    btnSes1.disabled = false;
    btnSes1.setAttribute('aria-disabled', 'false');
    btnSes1.classList.remove('opacity-40', 'cursor-not-allowed');
  }

  if (tipoCobertura === 'video') {
    if (btnXPhoto) { btnXPhoto.disabled = true; extraFotoUSD = 0; resaltarBotonActivo(btnXPhoto, false); btnXPhoto.classList.add('opacity-40', 'cursor-not-allowed'); }
    if (btnExpress) { btnExpress.disabled = true; extraExpressUSD = 0; resaltarBotonActivo(btnExpress, false); btnExpress.classList.add('opacity-40', 'cursor-not-allowed'); }
  } else {
    if (btnXPhoto) { btnXPhoto.disabled = false; btnXPhoto.classList.remove('opacity-40', 'cursor-not-allowed'); }
    if (btnExpress) { btnExpress.disabled = false; btnExpress.classList.remove('opacity-40', 'cursor-not-allowed'); }
  }

  if (tipoCobertura === 'foto') {
    if (btnXVideo) { btnXVideo.disabled = true; extraVideoUSD = 0; resaltarBotonActivo(btnXVideo, false); btnXVideo.classList.add('opacity-40', 'cursor-not-allowed'); }
    if (btnLive) { btnLive.disabled = true; extraLiveUSD = 0; resaltarBotonActivo(btnLive, false); btnLive.classList.add('opacity-40', 'cursor-not-allowed'); }
    if (btnDrone) { btnDrone.disabled = true; extraDroneUSD = 0; resaltarBotonActivo(btnDrone, false); btnDrone.classList.add('opacity-40', 'cursor-not-allowed'); }
  } else {
    if (btnXVideo) { btnXVideo.disabled = false; btnXVideo.classList.remove('opacity-40', 'cursor-not-allowed'); }
    if (btnLive) { btnLive.disabled = false; btnLive.classList.remove('opacity-40', 'cursor-not-allowed'); }
    if (btnDrone) { btnDrone.disabled = false; btnDrone.classList.remove('opacity-40', 'cursor-not-allowed'); }
  }
}

function calcularFinanciacion(totalListaARS) {
  const pagoEfectivoEl = $('#pago-efectivo');
  const containerSinInteres = $('#container-sin-interes');
  if (!pagoEfectivoEl || !containerSinInteres) return '';

  const totalEfectivo = totalListaARS * 0.85;
  pagoEfectivoEl.textContent = `$${Math.round(totalEfectivo).toLocaleString('es-AR')} ARS`;

  const opcionesSinInteres = [3]; 
  if (totalListaARS > 2700000) opcionesSinInteres.push(6, 9, 12);
  else if (totalListaARS > 1800000) opcionesSinInteres.push(6, 9);
  else if (totalListaARS > 900000) opcionesSinInteres.push(6);

  containerSinInteres.innerHTML = '';
  let resumenSinInteresTexto = '';

  opcionesSinInteres.forEach(n => {
    const valorCuota = totalListaARS / n;
    const valorFormateado = Math.round(valorCuota).toLocaleString('es-AR');
    
    const row = document.createElement('div');
    row.className = 'flex justify-between items-center py-0.5';
    row.innerHTML = `
      <span class="text-zinc-400 flex items-center gap-1.5">
        <i data-lucide="calendar" class="w-4 h-4 text-sky-400"></i> ${n} Cuotas sin interés:
      </span>
      <span class="font-medium text-sky-400">${n}x $${valorFormateado} ARS</span>
    `;
    containerSinInteres.appendChild(row);

    resumenSinInteresTexto += `• ${n} Cuotas sin interés: ${n}x $${valorFormateado} ARS\n`;
  });

  if (typeof lucide !== 'undefined') lucide.createIcons();
  return resumenSinInteresTexto;
}

function generarMensajeWhatsApp(resumenSinInteresTexto = '') {
  const nombre = $('#client-name')?.value.trim() || 'Cliente';
  const telefono = $('#client-phone')?.value.trim();
  const fecha = $('#event-date')?.value;
  const salon = $('#venue-name')?.value.trim();
  const personas = $('#guest-count')?.value.trim();

  let textoEvento = tipoEvento === 'quince' ? 'Quinceaños' : (tipoEvento === 'boda' ? 'Boda' : 'Graduación');
  let textoCobertura = tipoCobertura === 'foto' ? 'Solo Foto' : (tipoCobertura === 'video' ? 'Solo Video' : 'Foto + Video');
  let detallesEspecificos = '';

  if (tipoEvento === 'graduacion') {
    const cantGraduados = parseInt($('#grad-qty')?.value) || 0;
    detallesEspecificos += `• Cantidad de graduados: ${cantGraduados}\n`;
    detallesEspecificos += `• Horas de servicio: ${horas} hs\n`;

    const momentosSeleccionados = [];
    $$('.btn-grad-opt').forEach(btn => {
      if (btn.classList.contains('bg-amber-400')) {
        momentosSeleccionados.push(btn.getAttribute('data-nombre'));
      }
    });

    if (momentosSeleccionados.length > 0) {
      detallesEspecificos += `• Coberturas especiales: ${momentosSeleccionados.join(', ')}\n`;
    }
  } else {
    detallesEspecificos += `• Horas de servicio: ${horas} hs\n`;
    detallesEspecificos += `• Sesiones previas: ${sesiones}\n`;

    const equipoSel = [];
    if (extraFotoUSD > 0) equipoSel.push('2do Fotógrafo');
    if (extraVideoUSD > 0) equipoSel.push('2do Videógrafo');
    if (equipoSel.length > 0) {
      detallesEspecificos += `• Equipo adicional: ${equipoSel.join(', ')}\n`;
    }
  }

  const adicionalesSel = [];
  if (extraExpressUSD > 0) adicionalesSel.push('Fotos Exprés');
  if (extraLiveUSD > 0) adicionalesSel.push('Edición en Vivo');
  if (extraDroneUSD > 0) adicionalesSel.push('Tomas Aéreas');

  if (adicionalesSel.length > 0) {
    detallesEspecificos += `• Adicionales: ${adicionalesSel.join(', ')}\n`;
  }

  const totalARS = $('#total-ars')?.textContent || '$0 ARS';
  const totalUSD = $('#total-usd')?.textContent || '(USD $0)';
  const totalEfectivo = $('#pago-efectivo')?.textContent || '$0 ARS';

  let msg = `Hola! Mi nombre es ${nombre}.\n`;
  msg += `Me gustaría cotizar el siguiente servicio:\n\n`;
  msg += `📌 *DETALLES DEL EVENTO*\n`;
  msg += `• Evento: ${textoEvento}\n`;
  if (telefono) msg += `• WhatsApp de contacto: ${telefono}\n`;
  if (fecha) msg += `• Fecha: ${fecha}\n`;
  if (salon) msg += `• Salón / Lugar: ${salon}\n`;
  if (personas) msg += `• Cantidad de personas: ${personas}\n`;
  msg += `\n📌 *RESUMEN DE COBERTURA*\n`;
  msg += `• Cobertura: ${textoCobertura}\n`;
  msg += detallesEspecificos;

  msg += `\n💰 *VALORES ESTIMADOS*\n`;
  msg += `• Total de Lista: ${totalARS} ${totalUSD}\n`;
  msg += `• Contado / Transferencia: ${totalEfectivo}\n`;
  if (resumenSinInteresTexto) {
    msg += resumenSinInteresTexto;
  }
  msg += `\n_Cotización calculada con Dólar Oficial de referencia ($${cotizacionDolar})._`;

  mensajeWhatsAppInterno = msg;
}

function calcular() {
  const totalArsEl = $('#total-ars');
  const totalUsdEl = $('#total-usd');
  if (!totalArsEl || !totalUsdEl) return;

  let subtotalBaseUSD = 0;
  let adicionalesSumUSD = 0;

  if (tipoEvento === 'graduacion') {
    const cantGraduados = parseInt($('#grad-qty')?.value) || 0;
    let tarifaGraduadoHora = horas === 12 ? 60 : (horas === 10 ? 50 : 40);
    if (tipoCobertura === 'ambos') tarifaGraduadoHora *= 2;

    let tarifaOpcionesGraduado = 0;
    $$('.btn-grad-opt').forEach(btn => {
      if (btn.classList.contains('bg-amber-400')) {
        let val = parseInt(btn.getAttribute('data-val')) || 4;
        if (tipoCobertura === 'ambos') val *= 2;
        tarifaOpcionesGraduado += val;
      }
    });

    subtotalBaseUSD = cantGraduados * (tarifaGraduadoHora + tarifaOpcionesGraduado);
    if (extraExpressUSD > 0) adicionalesSumUSD += 8;
    if (extraLiveUSD > 0) adicionalesSumUSD += 12;
    if (extraDroneUSD > 0) adicionalesSumUSD += 4;
  } else {
    const extraSesionesUSD = sesiones * TARIFA_SESION_USD;
    subtotalBaseUSD = (tarifaPorHoraUSD * horas) + extraSesionesUSD + extraFotoUSD + extraVideoUSD;
    adicionalesSumUSD = extraExpressUSD + extraLiveUSD + extraDroneUSD;
  }

  const totalUSD = subtotalBaseUSD + adicionalesSumUSD;
  const totalListaARS = totalUSD * cotizacionDolar;

  totalArsEl.textContent = `$${Math.round(totalListaARS).toLocaleString('es-AR')} ARS`;
  totalUsdEl.textContent = `(USD $${totalUSD})`;

  const resumenSinInteresTexto = calcularFinanciacion(totalListaARS);
  generarMensajeWhatsApp(resumenSinInteresTexto);
}

function initPresupuestador() {
  const btnEvs = $$('.btn-ev');
  const btnCobs = $$('.btn-cob');
  const btnHrs = $$('.btn-hr');
  const btnSes = $$('.btn-ses');
  const gradWrap = $('#grad-wrap');
  const equipmentOptions = $('#equipment-options');
  const sessionOptions = $('#session-options');

  btnEvs.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetBtn = e.target.closest('.btn-ev');
      if (!targetBtn) return;
      btnEvs.forEach(b => resaltarBotonActivo(b, false));
      resaltarBotonActivo(targetBtn, true);
      tipoEvento = targetBtn.getAttribute('data-ev');

      if (tipoEvento === 'graduacion') {
        gradWrap?.classList.remove('hidden');
        equipmentOptions?.classList.add('hidden');
        sessionOptions?.classList.add('hidden');
      } else {
        gradWrap?.classList.add('hidden');
        equipmentOptions?.classList.remove('hidden');
        sessionOptions?.classList.remove('hidden');
      }

      actualizarDisponibilidad();
      calcular();
    });
  });

  $('#grad-qty')?.addEventListener('input', calcular);

  $$('.btn-grad-opt').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetBtn = e.target.closest('.btn-grad-opt');
      if (!targetBtn) return;
      const estaActivo = targetBtn.classList.contains('bg-amber-400');
      resaltarBotonActivo(targetBtn, !estaActivo);
      calcular();
    });
  });

  btnCobs.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetBtn = e.target.closest('.btn-cob');
      if (!targetBtn) return;
      btnCobs.forEach(b => resaltarBotonActivo(b, false));
      resaltarBotonActivo(targetBtn, true);
      tarifaPorHoraUSD = parseInt(targetBtn.getAttribute('data-tarifa'));
      tipoCobertura = targetBtn.getAttribute('data-tipo');
      actualizarDisponibilidad();
      calcular();
    });
  });

  btnHrs.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetBtn = e.target.closest('.btn-hr');
      if (!targetBtn) return;
      btnHrs.forEach(b => resaltarBotonActivo(b, false));
      resaltarBotonActivo(targetBtn, true);
      horas = parseInt(targetBtn.getAttribute('data-horas'));
      calcular();
    });
  });

  btnSes.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetBtn = e.target.closest('.btn-ses');
      if (!targetBtn) return;
      const valSesion = parseInt(targetBtn.getAttribute('data-sesiones'));
      if (tipoCobertura === 'ambos' && valSesion === 1) return;

      btnSes.forEach(b => resaltarBotonActivo(b, false));
      resaltarBotonActivo(targetBtn, true);
      sesiones = valSesion;
      calcular();
    });
  });

  const btnXPhoto = $('#btn-xphoto');
  const btnXVideo = $('#btn-xvideo');
  const btnExpress = $('#btn-express');
  const btnLive = $('#btn-live');
  const btnDrone = $('#btn-drone');

  btnXPhoto?.addEventListener('click', () => {
    if (tipoCobertura === 'video') return;
    const activo = !btnXPhoto.classList.contains('bg-amber-400');
    resaltarBotonActivo(btnXPhoto, activo);
    extraFotoUSD = activo ? parseInt(btnXPhoto.getAttribute('data-val')) : 0;
    calcular();
  });

  btnXVideo?.addEventListener('click', () => {
    if (tipoCobertura === 'foto') return;
    const activo = !btnXVideo.classList.contains('bg-amber-400');
    resaltarBotonActivo(btnXVideo, activo);
    extraVideoUSD = activo ? parseInt(btnXVideo.getAttribute('data-val')) : 0;
    calcular();
  });

  btnExpress?.addEventListener('click', () => {
    if (tipoCobertura === 'video') return;
    const activo = !btnExpress.classList.contains('bg-amber-400');
    resaltarBotonActivo(btnExpress, activo);
    extraExpressUSD = activo ? parseInt(btnExpress.getAttribute('data-val')) : 0;
    calcular();
  });

  btnLive?.addEventListener('click', () => {
    if (tipoCobertura === 'foto') return;
    const activo = !btnLive.classList.contains('bg-amber-400');
    resaltarBotonActivo(btnLive, activo);
    extraLiveUSD = activo ? parseInt(btnLive.getAttribute('data-val')) : 0;
    calcular();
  });

  btnDrone?.addEventListener('click', () => {
    if (tipoCobertura === 'foto') return;
    const activo = !btnDrone.classList.contains('bg-amber-400');
    resaltarBotonActivo(btnDrone, activo);
    extraDroneUSD = activo ? parseInt(btnDrone.getAttribute('data-val')) : 0;
    calcular();
  });

  $('#client-name')?.addEventListener('input', () => generarMensajeWhatsApp());
  $('#client-phone')?.addEventListener('input', () => generarMensajeWhatsApp());
  $('#event-date')?.addEventListener('input', () => generarMensajeWhatsApp());
  $('#venue-name')?.addEventListener('input', () => generarMensajeWhatsApp());
  $('#guest-count')?.addEventListener('input', () => generarMensajeWhatsApp());

  $('#btn-whatsapp')?.addEventListener('click', () => {
    const text = encodeURIComponent(mensajeWhatsAppInterno);
    const url = `https://wa.me/5493492591128?text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  const activarBotonInicial = (grupo) => { if (grupo[0]) resaltarBotonActivo(grupo[0], true); };
  activarBotonInicial(btnEvs);
  activarBotonInicial(btnCobs);
  activarBotonInicial(btnHrs);
  activarBotonInicial(btnSes);

  $$('.btn-grad-opt, .btn-eq, .btn-add').forEach(b => resaltarBotonActivo(b, false));
  actualizarDisponibilidad();
  obtenerDolar();
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
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  initVideoSlider();
  initPresupuestador();

  setTimeout(() => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }, 50);
});
