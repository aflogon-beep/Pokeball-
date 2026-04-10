// ── PokéBattle Canvas Scenario Engine ───────────────────
// Base class for animated Canvas-based battle backgrounds

class ScenarioCanvas {
  constructor(canvasId, sceneData) {
    this.id = canvasId;
    this.data = sceneData;
    this.canvas = null;
    this.ctx = null;
    this.raf = null;
    this.t = 0;
    this.particles = [];
  }

  init() {
    this.canvas = document.getElementById(this.id);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.setupParticles();
    this.loop();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.W = this.canvas.width;
    this.H = this.canvas.height;
  }

  setupParticles() {}  // override per scene

  loop() {
    if (!this.canvas) return;
    this.t += 0.016;
    this.draw();
    this.raf = requestAnimationFrame(() => this.loop());
  }

  draw() {}  // override per scene

  destroy() {
    if (this.raf) cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.resize);
    this.canvas = null;
    this.ctx = null;
  }

  // Utility: draw gradient sky
  sky(colors) {
    const g = this.ctx.createLinearGradient(0, 0, 0, this.H * 0.65);
    colors.forEach(([stop, col]) => g.addColorStop(stop, col));
    this.ctx.fillStyle = g;
    this.ctx.fillRect(0, 0, this.W, this.H);
  }

  // Utility: draw ground
  ground(y, colors) {
    const g = this.ctx.createLinearGradient(0, this.H * y, 0, this.H);
    colors.forEach(([stop, col]) => g.addColorStop(stop, col));
    this.ctx.fillStyle = g;
    this.ctx.fillRect(0, this.H * y, this.W, this.H * (1 - y));
  }

  // Utility: glowing circle
  glow(x, y, r, color, alpha = 0.6) {
    const g = this.ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color.replace(')', `,${alpha})`).replace('rgb', 'rgba'));
    g.addColorStop(1, 'transparent');
    this.ctx.fillStyle = g;
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, Math.PI * 2);
    this.ctx.fill();
  }
}

// ── CUEVA (Cave) ─────────────────────────────────────────
class ScenaCueva extends ScenarioCanvas {
  setupParticles() {
    // Floating embers from lava
    this.embers = Array.from({ length: 18 }, () => this.newEmber());
    // Bats
    this.bats = Array.from({ length: 3 }, (_, i) => ({
      x: Math.random() * this.W,
      y: this.H * (0.1 + Math.random() * 0.25),
      vx: (0.4 + Math.random() * 0.6) * (Math.random() < 0.5 ? 1 : -1),
      wingPhase: Math.random() * Math.PI * 2,
      size: 8 + Math.random() * 6,
    }));
    // Dripping water drops
    this.drops = Array.from({ length: 8 }, () => this.newDrop());
    // Crystal glow pulses
    this.crystals = [
      { x: 0.18, y: 0.52, r: 22, color: '100,200,255', phase: 0 },
      { x: 0.72, y: 0.55, r: 18, color: '180,100,255', phase: 1.2 },
      { x: 0.45, y: 0.48, r: 14, color: '100,255,180', phase: 2.4 },
    ];
  }

  newEmber() {
    return {
      x: (0.05 + Math.random() * 0.2) * (this.W || 400),
      y: (this.H || 600) * (0.75 + Math.random() * 0.15),
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(0.3 + Math.random() * 0.5),
      life: Math.random(),
      maxLife: 0.6 + Math.random() * 0.8,
      size: 1.5 + Math.random() * 2.5,
      side: Math.random() < 0.5 ? 0 : 1,
    };
  }

  newDrop() {
    return {
      x: (0.1 + Math.random() * 0.8) * (this.W || 400),
      y: 0,
      vy: 1.5 + Math.random() * 2,
      alpha: 0.4 + Math.random() * 0.4,
    };
  }

  draw() {
    const { ctx, W, H, t } = this;
    ctx.clearRect(0, 0, W, H);

    // Sky — deep cave dark
    const skyG = ctx.createLinearGradient(0, 0, 0, H * 0.6);
    skyG.addColorStop(0, '#050303');
    skyG.addColorStop(0.5, '#110800');
    skyG.addColorStop(1, '#1a0f05');
    ctx.fillStyle = skyG;
    ctx.fillRect(0, 0, W, H);

    // Lava glow on ceiling
    const lavaGlow = ctx.createRadialGradient(W * 0.15, H * 0.75, 0, W * 0.15, H * 0.75, W * 0.35);
    lavaGlow.addColorStop(0, 'rgba(255,80,0,0.25)');
    lavaGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = lavaGlow;
    ctx.fillRect(0, 0, W, H);

    const lavaGlow2 = ctx.createRadialGradient(W * 0.82, H * 0.8, 0, W * 0.82, H * 0.8, W * 0.28);
    lavaGlow2.addColorStop(0, 'rgba(255,100,0,0.2)');
    lavaGlow2.addColorStop(1, 'transparent');
    ctx.fillStyle = lavaGlow2;
    ctx.fillRect(0, 0, W, H);

    // Ground
    const groundY = H * 0.6;
    const groundG = ctx.createLinearGradient(0, groundY, 0, H);
    groundG.addColorStop(0, '#2d1f05');
    groundG.addColorStop(0.4, '#1a1008');
    groundG.addColorStop(1, '#0a0703');
    ctx.fillStyle = groundG;
    ctx.fillRect(0, groundY, W, H - groundY);

    // Stalactites (ceiling)
    ctx.fillStyle = '#1a1008';
    [[0.05, 14], [0.12, 22], [0.25, 16], [0.38, 10], [0.55, 18], [0.68, 12], [0.78, 20], [0.9, 15]].forEach(([px, len]) => {
      const x = px * W;
      ctx.beginPath();
      ctx.moveTo(x - len * 0.5, 0);
      ctx.lineTo(x + len * 0.5, 0);
      ctx.lineTo(x, len * 1.8);
      ctx.closePath();
      ctx.fill();
    });

    // Stalagmites (floor)
    ctx.fillStyle = '#2a1f0a';
    [[0.03, 20], [0.08, 14], [0.18, 25], [0.65, 18], [0.75, 22], [0.85, 16], [0.93, 20]].forEach(([px, h]) => {
      const x = px * W;
      ctx.beginPath();
      ctx.moveTo(x - h * 0.4, groundY + h * 1.6);
      ctx.lineTo(x + h * 0.4, groundY + h * 1.6);
      ctx.lineTo(x, groundY);
      ctx.closePath();
      ctx.fill();
    });

    // Lava pools
    [[0.12, 0.88, 0.14, 0.04], [0.78, 0.92, 0.11, 0.03]].forEach(([px, py, rx, ry]) => {
      const lx = px * W, ly = py * H;
      const pulse = 0.3 + Math.sin(t * 1.5) * 0.1;
      const lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, rx * W);
      lg.addColorStop(0, `rgba(255,160,0,${pulse + 0.4})`);
      lg.addColorStop(0.5, `rgba(255,60,0,${pulse})`);
      lg.addColorStop(1, 'rgba(100,20,0,0)');
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.ellipse(lx, ly, rx * W, ry * H, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Crystals glow
    this.crystals.forEach(cr => {
      const alpha = 0.2 + Math.sin(t * 1.2 + cr.phase) * 0.12;
      const x = cr.x * W, y = cr.y * H;
      const g = ctx.createRadialGradient(x, y, 0, x, y, cr.r * (1 + Math.sin(t + cr.phase) * 0.15));
      g.addColorStop(0, `rgba(${cr.color},${alpha + 0.1})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, cr.r * 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Embers from lava
    this.embers.forEach(em => {
      em.life += 0.008;
      em.x += em.vx + Math.sin(t * 2 + em.x) * 0.15;
      em.y += em.vy;
      if (em.life > em.maxLife) Object.assign(em, this.newEmber());
      const alpha = Math.sin((em.life / em.maxLife) * Math.PI) * 0.9;
      ctx.fillStyle = `rgba(255,${120 + Math.floor(em.size * 20)},0,${alpha})`;
      ctx.beginPath();
      ctx.arc(em.x, em.y, em.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Bats
    this.bats.forEach(bat => {
      bat.x += bat.vx;
      bat.wingPhase += 0.12;
      if (bat.x < -20) bat.x = W + 20;
      if (bat.x > W + 20) bat.x = -20;
      const wx = bat.size;
      const wy = bat.size * 0.5 * Math.sin(bat.wingPhase);
      ctx.fillStyle = 'rgba(20,10,5,0.85)';
      ctx.beginPath();
      ctx.ellipse(bat.x, bat.y, wx, Math.abs(wy) + 2, 0, 0, Math.PI * 2);
      ctx.fill();
      // Wing lines
      ctx.strokeStyle = 'rgba(40,20,10,0.6)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(bat.x - wx, bat.y);
      ctx.quadraticCurveTo(bat.x, bat.y + wy, bat.x + wx, bat.y);
      ctx.stroke();
    });

    // Water drips
    this.drops.forEach(d => {
      d.y += d.vy;
      if (d.y > groundY) {
        d.y = 0;
        d.x = (0.1 + Math.random() * 0.8) * W;
      }
      ctx.fillStyle = `rgba(100,180,255,${d.alpha})`;
      ctx.beginPath();
      ctx.ellipse(d.x, d.y, 1.5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// ── PLAYA (Beach) ────────────────────────────────────────
class ScenaPlaya extends ScenarioCanvas {
  setupParticles() {
    this.waveOffset = 0;
    this.clouds = Array.from({ length: 4 }, (_, i) => ({
      x: Math.random() * (this.W || 400),
      y: (0.12 + i * 0.06) * (this.H || 600),
      w: 60 + Math.random() * 80,
      speed: 0.15 + Math.random() * 0.2,
      alpha: 0.4 + Math.random() * 0.3,
    }));
    this.seagulls = Array.from({ length: 3 }, () => ({
      x: Math.random() * (this.W || 400),
      y: (0.1 + Math.random() * 0.2) * (this.H || 600),
      vx: 0.3 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
      size: 4 + Math.random() * 3,
    }));
  }

  draw() {
    const { ctx, W, H, t } = this;
    ctx.clearRect(0, 0, W, H);

    // Sunset sky
    const skyG = ctx.createLinearGradient(0, 0, 0, H * 0.65);
    skyG.addColorStop(0, '#1a0a3e');
    skyG.addColorStop(0.25, '#8B2500');
    skyG.addColorStop(0.5, '#FF6B35');
    skyG.addColorStop(0.75, '#FFB347');
    skyG.addColorStop(1, '#87CEEB');
    ctx.fillStyle = skyG;
    ctx.fillRect(0, 0, W, H);

    // Sun
    const sunX = W * 0.72, sunY = H * 0.28;
    const sunPulse = 1 + Math.sin(t * 0.5) * 0.02;
    const sunG = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 50 * sunPulse);
    sunG.addColorStop(0, 'rgba(255,255,200,1)');
    sunG.addColorStop(0.3, 'rgba(255,220,100,0.9)');
    sunG.addColorStop(0.6, 'rgba(255,160,50,0.5)');
    sunG.addColorStop(1, 'transparent');
    ctx.fillStyle = sunG;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 50 * sunPulse, 0, Math.PI * 2);
    ctx.fill();

    // Sun reflection on water
    const reflG = ctx.createLinearGradient(sunX - 30, H * 0.6, sunX + 30, H);
    reflG.addColorStop(0, 'rgba(255,180,50,0.3)');
    reflG.addColorStop(1, 'transparent');
    ctx.fillStyle = reflG;
    ctx.fillRect(sunX - 20, H * 0.6, 40, H * 0.4);

    // Clouds
    this.clouds.forEach(cl => {
      cl.x += cl.speed;
      if (cl.x > W + cl.w) cl.x = -cl.w;
      ctx.fillStyle = `rgba(255,220,180,${cl.alpha})`;
      ctx.beginPath();
      ctx.ellipse(cl.x, cl.y, cl.w, cl.w * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cl.x - cl.w * 0.3, cl.y, cl.w * 0.6, cl.w * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Sea/water
    const seaY = H * 0.58;
    const seaG = ctx.createLinearGradient(0, seaY, 0, H * 0.72);
    seaG.addColorStop(0, '#1a4a8a');
    seaG.addColorStop(0.4, '#2060aa');
    seaG.addColorStop(1, '#3a80c0');
    ctx.fillStyle = seaG;
    ctx.fillRect(0, seaY, W, H * 0.72 - seaY);

    // Animated waves (3 layers)
    this.waveOffset += 0.02;
    [0, 0.33, 0.66].forEach((off, wi) => {
      const wy = H * (0.62 + wi * 0.018);
      const alpha = 0.5 - wi * 0.12;
      ctx.strokeStyle = `rgba(150,210,255,${alpha})`;
      ctx.lineWidth = 2 - wi * 0.4;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 3) {
        const y = wy + Math.sin((x / W) * Math.PI * 4 + this.waveOffset + off * Math.PI * 2) * (5 - wi * 1.2);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    // Sandy beach
    const sandY = H * 0.68;
    const sandG = ctx.createLinearGradient(0, sandY, 0, H);
    sandG.addColorStop(0, '#C4A882');
    sandG.addColorStop(0.3, '#D4B896');
    sandG.addColorStop(0.7, '#E8D5B0');
    sandG.addColorStop(1, '#F0E0C0');
    ctx.fillStyle = sandG;
    ctx.fillRect(0, sandY, W, H - sandY);

    // Palm trees
    this.drawPalm(ctx, W * 0.05, sandY, H * 0.25, -0.2);
    this.drawPalm(ctx, W * 0.92, sandY, H * 0.22, 0.25);

    // Seagulls
    this.seagulls.forEach(sg => {
      sg.x += sg.vx;
      sg.phase += 0.08;
      sg.y += Math.sin(sg.phase) * 0.3;
      if (sg.x > W + 20) sg.x = -20;
      ctx.strokeStyle = 'rgba(20,10,5,0.7)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(sg.x - sg.size, sg.y + Math.sin(sg.phase) * 2);
      ctx.quadraticCurveTo(sg.x, sg.y - sg.size * 0.5, sg.x + sg.size, sg.y + Math.sin(sg.phase) * 2);
      ctx.stroke();
    });
  }

  drawPalm(ctx, x, groundY, h, lean) {
    // Trunk
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = Math.max(3, h * 0.04);
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    const topX = x + lean * h * 0.6;
    const topY = groundY - h;
    ctx.quadraticCurveTo(x + lean * h * 0.3, groundY - h * 0.5, topX, topY);
    ctx.stroke();
    // Leaves
    [[-0.8, -0.6], [0.8, -0.5], [-0.3, -0.9], [0.3, -0.85], [0, -1]].forEach(([dx, dy]) => {
      ctx.strokeStyle = `rgba(${lean < 0 ? '30,100,30' : '40,120,40'},0.85)`;
      ctx.lineWidth = Math.max(2, h * 0.025);
      ctx.beginPath();
      ctx.moveTo(topX, topY);
      ctx.quadraticCurveTo(
        topX + dx * h * 0.25,
        topY + dy * h * 0.15,
        topX + dx * h * 0.45,
        topY + dy * h * 0.3
      );
      ctx.stroke();
    });
  }
}

// ── NOCHE (Night) ────────────────────────────────────────
class ScenaNoche extends ScenarioCanvas {
  setupParticles() {
    // Stars
    this.stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * (this.W || 400),
      y: Math.random() * (this.H || 600) * 0.65,
      r: 0.5 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
    }));
    // Fireflies
    this.flies = Array.from({ length: 12 }, () => ({
      x: Math.random() * (this.W || 400),
      y: (0.45 + Math.random() * 0.35) * (this.H || 600),
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.3,
      phase: Math.random() * Math.PI * 2,
      size: 2 + Math.random() * 2,
    }));
    // Mist layers
    this.mist = Array.from({ length: 3 }, (_, i) => ({
      x: Math.random() * (this.W || 400),
      speed: 0.1 + i * 0.08,
      y: (0.55 + i * 0.06) * (this.H || 600),
      alpha: 0.04 + i * 0.02,
    }));
  }

  draw() {
    const { ctx, W, H, t } = this;
    ctx.clearRect(0, 0, W, H);

    // Night sky
    const skyG = ctx.createLinearGradient(0, 0, 0, H * 0.65);
    skyG.addColorStop(0, '#000408');
    skyG.addColorStop(0.4, '#010c18');
    skyG.addColorStop(0.8, '#031525');
    skyG.addColorStop(1, '#051e35');
    ctx.fillStyle = skyG;
    ctx.fillRect(0, 0, W, H);

    // Stars (twinkling)
    this.stars.forEach(s => {
      const alpha = 0.4 + Math.sin(t * s.speed + s.phase) * 0.5;
      const size = s.r * (0.8 + Math.sin(t * s.speed + s.phase) * 0.3);
      ctx.fillStyle = `rgba(255,250,230,${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Moon
    const moonX = W * 0.78, moonY = H * 0.18;
    const moonR = Math.min(W, H) * 0.08;
    // Moon halo
    const haloG = ctx.createRadialGradient(moonX, moonY, moonR, moonX, moonY, moonR * 3);
    haloG.addColorStop(0, 'rgba(255,240,180,0.12)');
    haloG.addColorStop(1, 'transparent');
    ctx.fillStyle = haloG;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR * 3, 0, Math.PI * 2);
    ctx.fill();
    // Moon body
    ctx.fillStyle = '#FFF9E6';
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();
    // Moon craters
    ctx.fillStyle = 'rgba(200,190,150,0.3)';
    [[0.3, -0.2, 0.15], [-0.2, 0.3, 0.1], [0.1, 0.1, 0.08]].forEach(([dx, dy, cr]) => {
      ctx.beginPath();
      ctx.arc(moonX + dx * moonR, moonY + dy * moonR, cr * moonR, 0, Math.PI * 2);
      ctx.fill();
    });
    // Moon reflection on ground
    const reflG = ctx.createLinearGradient(moonX - 30, H * 0.62, moonX + 30, H);
    reflG.addColorStop(0, 'rgba(255,240,150,0.08)');
    reflG.addColorStop(1, 'transparent');
    ctx.fillStyle = reflG;
    ctx.fillRect(moonX - 25, H * 0.62, 50, H * 0.38);

    // Ground
    const groundY = H * 0.62;
    const groundG = ctx.createLinearGradient(0, groundY, 0, H);
    groundG.addColorStop(0, '#081408');
    groundG.addColorStop(0.5, '#040e04');
    groundG.addColorStop(1, '#020802');
    ctx.fillStyle = groundG;
    ctx.fillRect(0, groundY, W, H - groundY);

    // Silhouette trees
    ctx.fillStyle = 'rgba(2,8,2,0.95)';
    [[0.03, 0.35], [0.07, 0.28], [0.88, 0.32], [0.93, 0.26], [0.97, 0.30]].forEach(([px, ph]) => {
      const tx = px * W, th = ph * H;
      const ty = groundY - th;
      // Trunk
      ctx.fillRect(tx - 3, ty + th * 0.6, 6, th * 0.4);
      // Triangle top (pine)
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx - th * 0.22, ty + th * 0.7);
      ctx.lineTo(tx + th * 0.22, ty + th * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(tx, ty + th * 0.2);
      ctx.lineTo(tx - th * 0.28, ty + th * 0.85);
      ctx.lineTo(tx + th * 0.28, ty + th * 0.85);
      ctx.closePath();
      ctx.fill();
    });

    // Mist
    this.mist.forEach(m => {
      m.x += m.speed;
      if (m.x > W + 200) m.x = -200;
      const mg = ctx.createLinearGradient(m.x - 100, 0, m.x + 200, 0);
      mg.addColorStop(0, 'transparent');
      mg.addColorStop(0.3, `rgba(150,180,200,${m.alpha})`);
      mg.addColorStop(0.7, `rgba(150,180,200,${m.alpha})`);
      mg.addColorStop(1, 'transparent');
      ctx.fillStyle = mg;
      ctx.fillRect(0, m.y - 15, W, 30);
    });

    // Fireflies
    this.flies.forEach(fly => {
      fly.x += fly.vx + Math.sin(t * 0.8 + fly.phase) * 0.3;
      fly.y += fly.vy + Math.cos(t * 0.6 + fly.phase) * 0.2;
      fly.phase += 0.02;
      // Bounce off edges
      if (fly.x < 0 || fly.x > W) fly.vx *= -1;
      if (fly.y < groundY * 0.7 || fly.y > H * 0.92) fly.vy *= -1;
      const glow = 0.5 + Math.sin(t * 3 + fly.phase) * 0.5;
      const g = ctx.createRadialGradient(fly.x, fly.y, 0, fly.x, fly.y, fly.size * 4);
      g.addColorStop(0, `rgba(180,255,100,${glow * 0.9})`);
      g.addColorStop(0.4, `rgba(140,220,80,${glow * 0.4})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(fly.x, fly.y, fly.size * 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// ── GALAXIA (Space) ──────────────────────────────────────
class ScenaGalaxia extends ScenarioCanvas {
  setupParticles() {
    this.stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * (this.W || 400),
      y: Math.random() * (this.H || 600) * 0.7,
      r: 0.3 + Math.random() * 1.8,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 2,
      color: Math.random() < 0.2 ? '200,220,255' : Math.random() < 0.1 ? '255,200,200' : '255,255,255',
    }));
    this.nebulas = [
      { x: 0.3, y: 0.3, rx: 0.25, ry: 0.15, color: '80,30,120', phase: 0 },
      { x: 0.7, y: 0.2, rx: 0.2, ry: 0.12, color: '20,60,120', phase: 1 },
      { x: 0.5, y: 0.45, rx: 0.18, ry: 0.1, color: '120,20,60', phase: 2 },
    ];
    this.meteors = [];
    this.meteorTimer = 0;
  }

  draw() {
    const { ctx, W, H, t } = this;
    ctx.clearRect(0, 0, W, H);

    // Deep space background
    const skyG = ctx.createLinearGradient(0, 0, 0, H * 0.7);
    skyG.addColorStop(0, '#000005');
    skyG.addColorStop(0.5, '#020010');
    skyG.addColorStop(1, '#050018');
    ctx.fillStyle = skyG;
    ctx.fillRect(0, 0, W, H);

    // Nebulae
    this.nebulas.forEach(nb => {
      const pulse = 1 + Math.sin(t * 0.4 + nb.phase) * 0.1;
      const g = ctx.createRadialGradient(nb.x * W, nb.y * H, 0, nb.x * W, nb.y * H, nb.rx * W * pulse);
      g.addColorStop(0, `rgba(${nb.color},0.18)`);
      g.addColorStop(0.5, `rgba(${nb.color},0.08)`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(nb.x * W, nb.y * H, nb.rx * W * pulse, nb.ry * H * pulse, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Stars
    this.stars.forEach(s => {
      const alpha = 0.3 + Math.sin(t * s.speed + s.phase) * 0.5;
      const size = s.r * (0.7 + Math.sin(t * s.speed + s.phase) * 0.4);
      ctx.fillStyle = `rgba(${s.color},${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Occasional meteors
    this.meteorTimer += 0.016;
    if (this.meteorTimer > 3 + Math.random() * 4) {
      this.meteorTimer = 0;
      this.meteors.push({ x: Math.random() * W, y: 0, vx: 3 + Math.random() * 4, vy: 2 + Math.random() * 3, life: 1 });
    }
    this.meteors = this.meteors.filter(m => {
      m.x += m.vx; m.y += m.vy; m.life -= 0.025;
      if (m.life <= 0) return false;
      ctx.strokeStyle = `rgba(200,220,255,${m.life * 0.8})`;
      ctx.lineWidth = m.life * 2;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * 8, m.y - m.vy * 8);
      ctx.stroke();
      return true;
    });

    // "Ground" — deep space floor
    const groundY = H * 0.65;
    const groundG = ctx.createLinearGradient(0, groundY, 0, H);
    groundG.addColorStop(0, '#0a0520');
    groundG.addColorStop(0.5, '#060310');
    groundG.addColorStop(1, '#020108');
    ctx.fillStyle = groundG;
    ctx.fillRect(0, groundY, W, H - groundY);

    // Asteroid/rock silhouettes on ground
    ctx.fillStyle = 'rgba(15,10,30,0.9)';
    [[0.05, 0.08], [0.15, 0.06], [0.78, 0.07], [0.88, 0.05], [0.95, 0.06]].forEach(([px, ph]) => {
      ctx.beginPath();
      ctx.ellipse(px * W, groundY, ph * W, ph * H * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Thunder storm effect (matches weather system)
    if (Math.random() < 0.002) {
      ctx.fillStyle = 'rgba(150,180,255,0.06)';
      ctx.fillRect(0, 0, W, H);
    }
  }
}

// ── CAMPO (Field) ────────────────────────────────────────
class ScenaCampo extends ScenarioCanvas {
  setupParticles() {
    this.clouds = Array.from({ length: 5 }, (_, i) => ({
      x: (i / 5) * (this.W || 400),
      y: (0.1 + Math.random() * 0.15) * (this.H || 600),
      w: 70 + Math.random() * 60,
      speed: 0.2 + Math.random() * 0.15,
      alpha: 0.85 + Math.random() * 0.15,
    }));
    this.grass = Array.from({ length: 40 }, () => ({
      x: Math.random() * (this.W || 400),
      h: 8 + Math.random() * 12,
      phase: Math.random() * Math.PI * 2,
    }));
    this.birds = Array.from({ length: 4 }, () => ({
      x: Math.random() * (this.W || 400),
      y: (0.15 + Math.random() * 0.2) * (this.H || 600),
      vx: 0.4 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  draw() {
    const { ctx, W, H, t } = this;
    ctx.clearRect(0, 0, W, H);

    // Sky
    const skyG = ctx.createLinearGradient(0, 0, 0, H * 0.65);
    skyG.addColorStop(0, '#4AA8D8');
    skyG.addColorStop(0.5, '#87CEEB');
    skyG.addColorStop(1, '#B0E0FF');
    ctx.fillStyle = skyG;
    ctx.fillRect(0, 0, W, H);

    // Sun
    const sunX = W * 0.75, sunY = H * 0.12;
    const sunG = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 40);
    sunG.addColorStop(0, 'rgba(255,255,200,0.9)');
    sunG.addColorStop(0.4, 'rgba(255,230,100,0.5)');
    sunG.addColorStop(1, 'transparent');
    ctx.fillStyle = sunG;
    ctx.beginPath(); ctx.arc(sunX, sunY, 40, 0, Math.PI * 2); ctx.fill();

    // Clouds
    this.clouds.forEach(cl => {
      cl.x += cl.speed;
      if (cl.x > W + cl.w * 1.5) cl.x = -cl.w;
      ctx.fillStyle = `rgba(255,255,255,${cl.alpha})`;
      [[0, 0, 1], [-0.35, 0.1, 0.7], [0.35, 0.1, 0.65], [-0.15, -0.25, 0.6], [0.2, -0.2, 0.55]].forEach(([dx, dy, s]) => {
        ctx.beginPath();
        ctx.ellipse(cl.x + dx * cl.w, cl.y + dy * cl.w * 0.4, cl.w * 0.38 * s, cl.w * 0.2 * s, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    // Trees on horizon
    const groundY = H * 0.62;
    [[0.02, 0.22], [0.08, 0.18], [0.88, 0.2], [0.94, 0.16], [0.98, 0.19]].forEach(([px, ph]) => {
      const tx = px * W, th = ph * H;
      ctx.fillStyle = '#1a5c1a';
      ctx.beginPath();
      ctx.ellipse(tx, groundY - th * 0.5, th * 0.28, th * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f3d0f';
      ctx.fillRect(tx - 4, groundY - th * 0.1, 8, th * 0.1);
    });

    // Ground
    const groundG = ctx.createLinearGradient(0, groundY, 0, H);
    groundG.addColorStop(0, '#3a7a3a');
    groundG.addColorStop(0.3, '#2d6a2d');
    groundG.addColorStop(0.7, '#1f5a1f');
    groundG.addColorStop(1, '#144a14');
    ctx.fillStyle = groundG;
    ctx.fillRect(0, groundY, W, H - groundY);

    // Grass blades
    ctx.strokeStyle = '#4a9a4a';
    ctx.lineWidth = 1.2;
    this.grass.forEach(g => {
      const sway = Math.sin(t * 1.2 + g.phase) * 3;
      ctx.beginPath();
      ctx.moveTo(g.x, groundY);
      ctx.quadraticCurveTo(g.x + sway, groundY - g.h * 0.6, g.x + sway * 1.5, groundY - g.h);
      ctx.stroke();
    });

    // Birds
    this.birds.forEach(b => {
      b.x += b.vx;
      b.phase += 0.1;
      if (b.x > W + 20) b.x = -20;
      const wy = Math.sin(b.phase) * 3;
      ctx.strokeStyle = 'rgba(20,20,20,0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(b.x - 6, b.y + wy);
      ctx.quadraticCurveTo(b.x, b.y - 3, b.x + 6, b.y + wy);
      ctx.stroke();
    });
  }
}

// ── ESTADIO (Stadium) ────────────────────────────────────
class ScenaEstadio extends ScenarioCanvas {
  setupParticles() {
    this.spotlights = [
      { x: 0.2, phase: 0 }, { x: 0.5, phase: Math.PI }, { x: 0.8, phase: Math.PI * 0.5 }
    ];
    this.crowd = Array.from({ length: 60 }, () => ({
      x: Math.random(),
      row: Math.floor(Math.random() * 4),
      phase: Math.random() * Math.PI * 2,
      color: `hsl(${Math.random() * 360},70%,60%)`,
    }));
    this.flashes = [];
    this.flashTimer = 0;
  }

  draw() {
    const { ctx, W, H, t } = this;
    ctx.clearRect(0, 0, W, H);

    // Dark stadium background
    const skyG = ctx.createLinearGradient(0, 0, 0, H * 0.65);
    skyG.addColorStop(0, '#060810');
    skyG.addColorStop(0.5, '#0a0f1e');
    skyG.addColorStop(1, '#0f1830');
    ctx.fillStyle = skyG;
    ctx.fillRect(0, 0, W, H);

    // Crowd stands (back)
    const rowH = H * 0.07;
    for (let row = 0; row < 4; row++) {
      const ry = H * (0.08 + row * 0.07);
      ctx.fillStyle = `rgba(15,20,40,0.8)`;
      ctx.fillRect(0, ry, W, rowH);
      // Crowd members
      this.crowd.filter(c => c.row === row).forEach(c => {
        const cx = c.x * W;
        const wave = Math.sin(t * 1.5 + c.phase) * 3;
        ctx.fillStyle = c.color.replace('60%', `${40 + Math.sin(t + c.phase) * 15}%`);
        ctx.beginPath();
        ctx.arc(cx, ry + rowH * 0.3 + wave, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Spotlights
    this.spotlights.forEach(sl => {
      sl.phase += 0.008;
      const sweep = Math.sin(sl.phase) * 0.15;
      const sx = (sl.x + sweep) * W;
      const g = ctx.createConicalGradient ? null : ctx.createLinearGradient(sx, 0, sx, H * 0.7);
      // Use radial approximation
      const lg = ctx.createRadialGradient(sx, 0, 0, sx, H * 0.6, H * 0.35);
      lg.addColorStop(0, 'rgba(220,230,255,0.12)');
      lg.addColorStop(0.3, 'rgba(180,200,255,0.06)');
      lg.addColorStop(1, 'transparent');
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx - H * 0.2, H * 0.6);
      ctx.lineTo(sx + H * 0.2, H * 0.6);
      ctx.closePath();
      ctx.fill();
    });

    // Photo flashes
    this.flashTimer += 0.016;
    if (this.flashTimer > 0.5 + Math.random() * 2) {
      this.flashTimer = 0;
      this.flashes.push({ x: Math.random() * W, y: Math.random() * H * 0.35, life: 1 });
    }
    this.flashes = this.flashes.filter(fl => {
      fl.life -= 0.08;
      if (fl.life <= 0) return false;
      ctx.fillStyle = `rgba(255,255,255,${fl.life * 0.6})`;
      ctx.beginPath();
      ctx.arc(fl.x, fl.y, fl.life * 4, 0, Math.PI * 2);
      ctx.fill();
      return true;
    });

    // Battle arena floor
    const groundY = H * 0.62;
    const floorG = ctx.createLinearGradient(0, groundY, 0, H);
    floorG.addColorStop(0, '#1a2040');
    floorG.addColorStop(0.4, '#101525');
    floorG.addColorStop(1, '#080d18');
    ctx.fillStyle = floorG;
    ctx.fillRect(0, groundY, W, H - groundY);

    // Arena circle
    ctx.strokeStyle = 'rgba(59,130,246,0.4)';
    ctx.lineWidth = 2;
    const glow = 0.3 + Math.sin(t * 2) * 0.1;
    ctx.shadowColor = '#3B82F6';
    ctx.shadowBlur = 8 * glow;
    ctx.beginPath();
    ctx.ellipse(W * 0.5, groundY + H * 0.06, W * 0.38, H * 0.05, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

// ── FÚTBOL (Football) ────────────────────────────────────
class ScenaFutbol extends ScenaCampo {
  // Extends campo but with football pitch instead of grass
  draw() {
    const { ctx, W, H, t } = this;
    ctx.clearRect(0, 0, W, H);

    // Sky (afternoon)
    const skyG = ctx.createLinearGradient(0, 0, 0, H * 0.65);
    skyG.addColorStop(0, '#1a3a6e');
    skyG.addColorStop(0.4, '#2e6db4');
    skyG.addColorStop(1, '#87CEEB');
    ctx.fillStyle = skyG;
    ctx.fillRect(0, 0, W, H);

    // Clouds
    this.clouds.forEach(cl => {
      cl.x += cl.speed * 0.7;
      if (cl.x > W + cl.w) cl.x = -cl.w;
      ctx.fillStyle = `rgba(255,255,255,${cl.alpha})`;
      ctx.beginPath();
      ctx.ellipse(cl.x, cl.y, cl.w * 0.45, cl.w * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cl.x - cl.w * 0.28, cl.y + 5, cl.w * 0.32, cl.w * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    const groundY = H * 0.62;

    // Football pitch stripes
    for (let i = 0; i < 8; i++) {
      const py = groundY + (i / 8) * (H - groundY);
      const ph = (H - groundY) / 8;
      ctx.fillStyle = i % 2 === 0 ? '#1a5c1a' : '#165016';
      ctx.fillRect(0, py, W, ph);
    }

    // Pitch markings
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1.5;
    // Center line
    ctx.beginPath();
    ctx.moveTo(W * 0.5, groundY);
    ctx.lineTo(W * 0.5, H);
    ctx.stroke();
    // Center circle
    ctx.beginPath();
    ctx.ellipse(W * 0.5, groundY + H * 0.12, W * 0.15, H * 0.07, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Penalty boxes
    ctx.strokeRect(W * 0.08, groundY, W * 0.18, H * 0.15);
    ctx.strokeRect(W * 0.74, groundY, W * 0.18, H * 0.15);
    // Goal areas
    ctx.strokeRect(W * 0.14, groundY, W * 0.06, H * 0.07);
    ctx.strokeRect(W * 0.8, groundY, W * 0.06, H * 0.07);
  }
}

// ── Dispatcher — replaces sceneSVG for canvas scenarios ─
const CANVAS_SCENES = {
  cueva: ScenaCueva,
  playa: ScenaPlaya,
  noche: ScenaNoche,
  galaxia: ScenaGalaxia,
  campo: ScenaCampo,
  estadio: ScenaEstadio,
  futbol: ScenaFutbol,
};

let _activeScene = null;

function initCanvasScene(sceneName) {
  // Destroy previous
  if (_activeScene) {
    _activeScene.destroy();
    _activeScene = null;
  }
  const SceneClass = CANVAS_SCENES[sceneName];
  if (!SceneClass) return;
  _activeScene = new SceneClass('scene-canvas', {});
  // Small delay to let canvas mount in DOM
  setTimeout(() => { if (_activeScene) _activeScene.init(); }, 50);
}

function destroyCanvasScene() {
  if (_activeScene) { _activeScene.destroy(); _activeScene = null; }
}
