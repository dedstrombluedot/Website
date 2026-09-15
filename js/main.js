/* ============================================================
   Blue Dot Analytics — Main JavaScript
   ============================================================ */

// ── Starfield Canvas ───────────────────────────────────────
function createStarfield(canvasId, options = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const {
    starCount   = 280,
    speed       = 0.015,
    maxRadius   = 1.4,
    color       = '255, 255, 255',
    blueStars   = true,
  } = options;

  let stars = [];
  let animFrame;
  let width, height;

  function resize() {
    width  = canvas.width  = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
    initStars();
  }

  function randBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function initStars() {
    stars = Array.from({ length: starCount }, () => createStar(true));
  }

  function createStar(randomY = false) {
    const isBlue = blueStars && Math.random() < 0.12;
    return {
      x:       Math.random() * width,
      y:       randomY ? Math.random() * height : -2,
      r:       randBetween(0.3, maxRadius),
      opacity: randBetween(0.3, 1),
      speed:   randBetween(speed * 0.3, speed * 1.5),
      twinkle: randBetween(0.001, 0.003),
      phase:   Math.random() * Math.PI * 2,
      isBlue,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    const now = performance.now() / 1000;

    stars.forEach(star => {
      const twinkleOp = star.opacity * (0.6 + 0.4 * Math.sin(now * star.twinkle * 600 + star.phase));
      const c = star.isBlue ? '74, 158, 255' : color;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c}, ${twinkleOp})`;
      ctx.fill();

      // slow drift downward for depth
      star.y += star.speed;
      if (star.y > height + 2) {
        Object.assign(star, createStar(false));
      }
    });

    animFrame = requestAnimationFrame(draw);
  }

  // Init
  resize();
  draw();

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement || document.body);

  return () => {
    cancelAnimationFrame(animFrame);
    ro.disconnect();
  };
}

// ── Navigation ─────────────────────────────────────────────
function initNav() {
  const nav    = document.getElementById('nav');
  const toggle = document.getElementById('nav-toggle');
  const links  = document.getElementById('nav-links');

  // Scroll state
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Mobile toggle
  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ── Scroll Reveal ──────────────────────────────────────────
function initScrollReveal() {
  const targets = [
    '.service-card',
    '.why-card',
    '.approach-step',
    '.stat',
    '.sagan-quote',
    '.quote-bridge',
    '.contact-content',
    '.contact-form',
    '.about-photo-frame',
  ];

  const elements = document.querySelectorAll(targets.join(', '));
  elements.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger cards in a grid
        const siblings = [...entry.target.parentElement.children]
          .filter(el => el.classList.contains('reveal'));
        const idx = siblings.indexOf(entry.target);
        const delay = Math.min(idx * 80, 400);
        setTimeout(() => entry.target.classList.add('visible'), delay);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => io.observe(el));
}

// ── Active Nav Link ────────────────────────────────────────
function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}`
            ? 'var(--color-text)'
            : '';
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => io.observe(s));
}

// ── Contact Form ───────────────────────────────────────────
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;

    btn.textContent = 'Message Sent!';
    btn.style.background = 'var(--color-blue-glow)';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
      btn.disabled = false;
      form.reset();
    }, 3000);
  });
}

// ── Smooth Scroll Polyfill for older Safari ────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ── Boot ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  createStarfield('starfield',       { starCount: 320, speed: 0.012 });
  createStarfield('starfield-small', { starCount: 180, speed: 0.008, maxRadius: 1.1 });
  initNav();
  initScrollReveal();
  initActiveNavLink();
  initContactForm();
  initSmoothScroll();
});
