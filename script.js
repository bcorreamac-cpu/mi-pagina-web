/* ============================================================
   BOXING PRO GYM - script.js
   ============================================================ */

/* ── NAVBAR: scroll effect + mobile toggle ────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  // Scroll effect
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  // Mobile hamburger toggle
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', false);
    });
  });
})();


/* ── CAROUSEL ─────────────────────────────────────────────── */
(function initCarousel() {
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsContainer = document.getElementById('carouselDots');

  if (!track) return;

  const slides = track.querySelectorAll('.carousel-slide');
  const total = slides.length;
  let current = 0;
  let autoTimer = null;

  // How many slides are visible at once (responsive)
  function visibleCount() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  // Build dot indicators
  function buildDots() {
    dotsContainer.innerHTML = '';
    const groups = Math.ceil(total / visibleCount());
    for (let i = 0; i < groups; i++) {
      const btn = document.createElement('button');
      btn.className = 'dot' + (i === 0 ? ' active' : '');
      btn.setAttribute('aria-label', `Ir a imagen ${i + 1}`);
      btn.addEventListener('click', () => goTo(i * visibleCount()));
      dotsContainer.appendChild(btn);
    }
  }

  function updateDots() {
    const dots = dotsContainer.querySelectorAll('.dot');
    const vc = visibleCount();
    const activeGroup = Math.floor(current / vc);
    dots.forEach((d, i) => d.classList.toggle('active', i === activeGroup));
  }

  function goTo(index) {
    const vc = visibleCount();
    const maxIndex = total - vc;
    // Clamp
    current = Math.max(0, Math.min(index, maxIndex));
    const slideWidthPercent = 100 / vc;
    track.style.transform = `translateX(-${current * slideWidthPercent}%)`;
    // Update slide widths
    slides.forEach(s => (s.style.minWidth = `${slideWidthPercent}%`));
    updateDots();
  }

  function next() {
    const vc = visibleCount();
    if (current + vc >= total) {
      goTo(0); // wrap around
    } else {
      goTo(current + 1);
    }
  }

  function prev() {
    if (current === 0) {
      goTo(total - visibleCount());
    } else {
      goTo(current - 1);
    }
  }

  // Init
  goTo(0);
  buildDots();

  // Re-init on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildDots();
      goTo(Math.min(current, total - visibleCount()));
    }, 200);
  });

  // Buttons
  nextBtn.addEventListener('click', () => { next(); resetAuto(); });
  prevBtn.addEventListener('click', () => { prev(); resetAuto(); });

  // Touch / swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
      resetAuto();
    }
  });

  // Autoplay
  function startAuto() {
    autoTimer = setInterval(next, 4000);
  }

  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  startAuto();

  // Pause on hover
  track.parentElement.addEventListener('mouseenter', () => clearInterval(autoTimer));
  track.parentElement.addEventListener('mouseleave', startAuto);
})();


/* ── CONTACT FORM VALIDATION ──────────────────────────────── */
(function initForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const successMsg = document.getElementById('successMsg');

  const fields = {
    nombre: {
      el: document.getElementById('nombre'),
      err: document.getElementById('errorNombre'),
      validate(v) {
        if (!v.trim()) return 'El nombre es obligatorio.';
        if (v.trim().length < 2) return 'Ingresa tu nombre completo.';
        return '';
      }
    },
    email: {
      el: document.getElementById('email'),
      err: document.getElementById('errorEmail'),
      validate(v) {
        if (!v.trim()) return 'El correo es obligatorio.';
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(v)) return 'Ingresa un correo válido.';
        return '';
      }
    },
    whatsapp: {
      el: document.getElementById('whatsapp'),
      err: document.getElementById('errorWhatsapp'),
      validate(v) {
        if (!v.trim()) return 'El número de WhatsApp es obligatorio.';
        const digits = v.replace(/\s/g, '');
        if (!/^\d{8,9}$/.test(digits)) return 'Ingresa un número válido (8-9 dígitos).';
        return '';
      }
    },
    mensaje: {
      el: document.getElementById('mensaje'),
      err: document.getElementById('errorMensaje'),
      validate(v) {
        if (!v.trim()) return 'El mensaje es obligatorio.';
        if (v.trim().length < 10) return 'El mensaje debe tener al menos 10 caracteres.';
        return '';
      }
    }
  };

  // Live validation on blur
  Object.values(fields).forEach(field => {
    field.el.addEventListener('blur', () => validateField(field));
    field.el.addEventListener('input', () => {
      if (field.el.classList.contains('invalid')) validateField(field);
    });
  });

  function validateField(field) {
    const msg = field.validate(field.el.value);
    field.err.textContent = msg;
    field.el.classList.toggle('invalid', !!msg);
    // Handle phone-wrap
    const wrap = field.el.closest('.phone-input-wrap');
    if (wrap) wrap.classList.toggle('invalid', !!msg);
    return !msg;
  }

  function validateAll() {
    return Object.values(fields).map(validateField).every(Boolean);
  }

  // Handler en fase de captura: se ejecuta ANTES que el del embed del CRM.
  // Si la validaci\u00f3n falla, detenemos propagaci\u00f3n para que el CRM no registre env\u00edos inv\u00e1lidos.
  // Si pasa, actualizamos el campo oculto phone con el prefijo +56 y dejamos que el embed contin\u00fae.
  form.addEventListener('submit', e => {
    successMsg.classList.remove('show');

    if (!validateAll()) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }

    // Recoger valores
    const nombre   = fields.nombre.el.value.trim();
    const email    = fields.email.el.value.trim();
    const whatsapp = fields.whatsapp.el.value.trim();
    const mensaje  = fields.mensaje.el.value.trim();

    // Actualizar el campo oculto con el tel\u00e9fono completo (incluye +56) para el CRM
    const crmPhone = document.getElementById('crm_phone');
    if (crmPhone) crmPhone.value = `+56${whatsapp}`;

    // N\u00famero del gimnasio
    const NUMERO_GIMNASIO = '56900000000';

    const texto =
      `Hola, me interesa el entrenamiento:\n` +
      `Nombre: ${nombre}\n` +
      `Email: ${email}\n` +
      `WhatsApp del cliente: +56${whatsapp}\n` +
      `Mensaje: ${mensaje}`;

    const waURL = `https://wa.me/${NUMERO_GIMNASIO}?text=${encodeURIComponent(texto)}`;

    // Animaci\u00f3n breve y luego abrir WhatsApp.
    // En paralelo, el embed del CRM intercepta este submit y registra el contacto.
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;

    setTimeout(() => {
      window.open(waURL, '_blank', 'noopener,noreferrer');

      // Limpiar estados de error
      Object.values(fields).forEach(f => {
        f.el.classList.remove('invalid');
        f.err.textContent = '';
        const wrap = f.el.closest('.phone-input-wrap');
        if (wrap) wrap.classList.remove('invalid');
      });

      btn.textContent = originalText;
      btn.disabled = false;
      successMsg.classList.add('show');
      setTimeout(() => successMsg.classList.remove('show'), 6000);
    }, 600);
  }, true);
})();


/* ── INTERSECTION OBSERVER: fade-in on scroll ─────────────── */
(function initAnimations() {
  const style = document.createElement('style');
  style.textContent = `
    .fade-in { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .fade-in.visible { opacity: 1; transform: translateY(0); }
  `;
  document.head.appendChild(style);

  const targets = document.querySelectorAll(
    '.service-card, .about-grid, .contact-wrapper, .carousel-wrapper'
  );

  targets.forEach(el => el.classList.add('fade-in'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
})();


/* ── SMOOTH SCROLL for older browsers ────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
