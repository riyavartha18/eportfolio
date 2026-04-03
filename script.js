/* =====================================================
   script.js — Riya Vartha Portfolio (v3 — Enhanced)
   ===================================================== */

/* ── THEME TOGGLE ── */
function toggleTheme() {
  const html = document.documentElement;
  const cur  = html.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  document.getElementById('theme-toggle').querySelector('.theme-icon').textContent =
    next === 'dark' ? '🌙' : '☀️';
  // Update particle colors after theme change
  updateParticleTheme(next);
}

/* ── CINEMATIC LANDING ANIMATION (FLICKER-FREE) ──
   Each .rv-letter has TWO child spans:
     .rv-short  →  "R" or "V"  (initial letter)
     .rv-full   →  "Riya" or "Vartha" (full word, clipped)

   Timeline:
   0–900ms   : "RV" zooms in via CSS
   1100ms    : R slides left, V slides right
   1450ms    : full words expand (clip-path width opens)
   1700ms    : glow settles
   2300ms    : Enter button appears
*/
(function initLanding() {
  const stage   = document.getElementById('rv-stage');
  const rEl     = document.getElementById('rv-r');
  const vEl     = document.getElementById('rv-v');
  const btn     = document.getElementById('enter-btn');

  if (!stage || !rEl || !vEl) return;

  // Build inner HTML for each letter — short + full, never hidden
  function buildLetter(el, shortChar, fullWord) {
    el.innerHTML = [
      `<span class="rv-short">${shortChar}</span>`,
      `<span class="rv-full">${fullWord}</span>`
    ].join('');
  }

  buildLetter(rEl, 'R', 'iya');
  buildLetter(vEl, 'V', 'artha');

  // Phase 2 – split apart
  setTimeout(() => {
    stage.classList.add('rv-split');
  }, 1100);

  // Phase 3 – expand full words (clip opens)
  setTimeout(() => {
    stage.classList.add('rv-expand');
  }, 1450);

  // Phase 4 – glow softens
  setTimeout(() => {
    stage.classList.add('rv-done');
  }, 2200);

  // Phase 5 – show button
  setTimeout(() => {
    btn.classList.add('show');
  }, 2300);
})();


/* ── LANDING → PORTFOLIO TRANSITION ── */
function enterPortfolio() {
  const landing   = document.getElementById('landing-page');
  const portfolio = document.getElementById('portfolio');

  landing.style.transition    = 'opacity 0.6s ease';
  landing.style.opacity       = '0';
  landing.style.pointerEvents = 'none';

  setTimeout(() => {
    landing.style.display = 'none';
    portfolio.classList.remove('hidden');
    portfolio.style.opacity = '0';

    requestAnimationFrame(() => {
      portfolio.style.transition = 'opacity 0.6s ease';
      portfolio.style.opacity    = '1';
      setTimeout(() => {
        portfolio.style.transition = '';
        initPortfolio();
      }, 620);
    });
  }, 620);
}

/* ── NAVBAR TOGGLE ── */
function toggleMenu() {
  document.getElementById('nav-links').classList.toggle('open');
}

function closeMenu() {
  document.getElementById('nav-links').classList.remove('open');
}

/* ── TYPING ANIMATION ── */
function initTyping() {
  const el   = document.getElementById('typing-text');
  const text = "Hi, I'm Riya Vartha";
  let   idx  = 0;

  function type() {
    if (idx <= text.length) {
      el.textContent = text.slice(0, idx++);
      setTimeout(type, 58);
    }
  }
  setTimeout(type, 400);
}

/* ── SCROLL REVEAL ── */
function initReveal() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          entry.target.classList.add('glow-in');
          setTimeout(() => entry.target.classList.remove('glow-in'), 1600);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 0.1}s`;
    io.observe(el);
  });
}

/* ── ACTIVE NAV LINK ── */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a:not(.nav-resume-btn)');

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(a => a.classList.remove('active'));
        const a = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => io.observe(s));
}

/* ── NAVBAR SCROLL EFFECT ── */
function initNavScroll() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

/* ── CONTACT FORM ── */
function handleFormSubmit(e) {
  e.preventDefault();
  const btn     = e.target.querySelector('.form-submit');
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');

  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
  btn.disabled  = true;

  setTimeout(() => {
    form.style.display = 'none';
    success.classList.remove('hidden');
  }, 1200);
}

/* ── BUBBLE / PARTICLE ENGINE ── */
let portfolioParticleThemeCallback = null;

function createParticleEngine(canvas, opts = {}) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  let W, H, bubbles = [], raf;
  let colorR = 0, colorG = 212, colorB = 255;

  const cfg = {
    count:  opts.count  ?? 65,
    maxR:   opts.maxR   ?? 2.2,
    speed:  opts.speed  ?? 0.5,
  };

  function parseColor(hex) {
    return [
      parseInt(hex.slice(1,3), 16),
      parseInt(hex.slice(3,5), 16),
      parseInt(hex.slice(5,7), 16),
    ];
  }

  function setColor(hex) {
    [colorR, colorG, colorB] = parseColor(hex);
  }

  // Initial dark color
  setColor('#00d4ff');

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);
  }

  function mkBubble(fresh) {
    const radius = Math.random() * cfg.maxR + 0.6;
    const speed  = (Math.random() * 0.55 + 0.35) * cfg.speed;
    return {
      x:        Math.random() * W,
      y:        fresh ? H + radius : Math.random() * H,
      r:        radius,
      vy:       -speed,
      swayAmp:  Math.random() * 0.4 + 0.1,
      swaySpd:  0.008 + Math.random() * 0.012,
      swayPh:   Math.random() * Math.PI * 2,
      o:        Math.random() * 0.4 + 0.15,
      ph:       Math.random() * Math.PI * 2,
      ps:       0.012 + Math.random() * 0.012,
    };
  }

  function init() {
    bubbles = Array.from({ length: cfg.count }, () => mkBubble(false));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    bubbles.forEach((p, i) => {
      p.ph  += p.ps;
      const alpha = Math.max(0.06, p.o + Math.sin(p.ph) * 0.1);

      p.swayPh += p.swaySpd;
      p.x += Math.sin(p.swayPh) * p.swayAmp;

      const glowR = p.r * 5;
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
      grd.addColorStop(0, `rgba(${colorR},${colorG},${colorB},${alpha * 0.45})`);
      grd.addColorStop(1, `rgba(${colorR},${colorG},${colorB},0)`);
      ctx.beginPath();
      ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${colorR},${colorG},${colorB},${alpha})`;
      ctx.fill();

      p.y += p.vy;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -p.r * 6) {
        bubbles[i] = mkBubble(true);
        bubbles[i].x = Math.random() * W;
      }
    });

    raf = requestAnimationFrame(draw);
  }

  function start() { resize(); init(); draw(); }
  function stop()  { cancelAnimationFrame(raf); }

  window.addEventListener('resize', () => { resize(); init(); }, { passive: true });

  return { start, stop, setColor };
}

/* ── CURSOR TRAIL ENGINE ── */
function initCursorTrail() {
  const canvas = document.getElementById('cursor-canvas');
  const ctx    = canvas.getContext('2d');
  const dpr    = window.devicePixelRatio || 1;
  let W = window.innerWidth, H = window.innerHeight;
  let particles = [];
  let mouse = { x: -200, y: -200 };

  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  ctx.scale(dpr, dpr);

  window.addEventListener('resize', () => {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width  = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);
  }, { passive: true });

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    // Spawn 1-2 trail particles per move
    for (let i = 0; i < 2; i++) {
      spawnParticle(mouse.x, mouse.y);
    }
  }, { passive: true });

  function getAccentColor() {
    const theme = document.documentElement.getAttribute('data-theme');
    // Light mode uses a soft pastel lavender [196, 181, 253]
    return theme === 'light' ? [196, 181, 253] : [0, 212, 255];
  }

  function spawnParticle(x, y) {
    const [r, g, b] = getAccentColor();
    particles.push({
      x: x + (Math.random() - 0.5) * 6,
      y: y + (Math.random() - 0.5) * 6,
      r: Math.random() * 2 + 0.8,
      o: Math.random() * 0.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8 - 0.3,
      cr: r, cg: g, cb: b,
      decay: 0.035 + Math.random() * 0.02,
    });
  }

  function drawTrail() {
    ctx.clearRect(0, 0, W, H);

    particles = particles.filter(p => p.o > 0);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.cr},${p.cg},${p.cb},${p.o})`;
      ctx.fill();

      // glow
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      grd.addColorStop(0, `rgba(${p.cr},${p.cg},${p.cb},${p.o * 0.3})`);
      grd.addColorStop(1, `rgba(${p.cr},${p.cg},${p.cb},0)`);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;
      p.o -= p.decay;
    });

    requestAnimationFrame(drawTrail);
  }

  drawTrail();
}

/* ── UPDATE PARTICLE THEME ── */
function updateParticleTheme(theme) {
  // Called by theme toggle – update live particle colors
  if (portfolioParticleThemeCallback) {
    const color = theme === 'light' ? '#c4b5fd' : '#00d4ff';
    portfolioParticleThemeCallback(color);
  }
}

/* ── LANDING CANVAS ── */
(function() {
  const c = document.getElementById('landing-canvas');
  createParticleEngine(c, {
    count:  90,
    maxR:   2.0,
    speed:  0.38,
  }).start();
})();

/* ── CURSOR TRAIL (always on) ── */
initCursorTrail();

/* ── MAIN PORTFOLIO INIT ── */
function initPortfolio() {
  const c = document.getElementById('portfolio-canvas');
  const engine = createParticleEngine(c, {
    count: 70,
    maxR:  1.8,
    speed: 0.3,
  });
  engine.start();

  // Expose color setter for theme switch
  portfolioParticleThemeCallback = (color) => engine.setColor(color);

  initTyping();
  initReveal();
  initActiveNav();
  initNavScroll();
}
