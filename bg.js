(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');

  const SIZE = 38;
  const SQ3  = Math.sqrt(3);

  let hexes  = [];
  let W = 0, H = 0;
  let mouseX = -9999, mouseY = -9999;
  let t = 0;

  // ── Pulse events (expanding rings of light) ───────
  const pulses = [];
  function spawnPulse() {
    pulses.push({
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     0,
      speed: 1.8 + Math.random() * 1.5,
      max:   Math.max(W, H) * 0.7,
    });
  }
  setInterval(spawnPulse, 1800);
  spawnPulse();

  // ── Build grid ────────────────────────────────────
  function buildGrid() {
    hexes = [];
    const cols = Math.ceil(W / (SIZE * SQ3)) + 3;
    const rows = Math.ceil(H / (SIZE * 1.5))  + 3;
    for (let r = -1; r < rows; r++) {
      for (let c = -1; c < cols; c++) {
        const x = c * SIZE * SQ3 + (r % 2 !== 0 ? SIZE * SQ3 / 2 : 0);
        const y = r * SIZE * 1.5;
        hexes.push({
          x, y,
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 0.5,
          glow:  0,    // current brightness 0-1
          target: 0,   // target brightness
          activateAt: Math.random() * 4000,
        });
      }
    }
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildGrid();
  }

  // ── Hex path ──────────────────────────────────────
  function hexPath(x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      i === 0
        ? ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a))
        : ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
    }
    ctx.closePath();
  }

  // ── Animation ─────────────────────────────────────
  let lastTs = 0;
  function draw(ts) {
    const dt = Math.min((ts - lastTs) / 16, 3);
    lastTs = ts;
    t += 0.007 * dt;

    ctx.clearRect(0, 0, W, H);

    // update pulses
    for (let i = pulses.length - 1; i >= 0; i--) {
      pulses[i].r += pulses[i].speed * dt;
      if (pulses[i].r > pulses[i].max) pulses.splice(i, 1);
    }

    for (const h of hexes) {
      if (h.x < -SIZE * 2 || h.x > W + SIZE * 2) continue;
      if (h.y < -SIZE * 2 || h.y > H + SIZE * 2) continue;

      // base wave — stronger baseline so grid is always visible
      let glow = (Math.sin(t * h.speed + h.phase + h.x * 0.006 + h.y * 0.004) + 1) / 2 * 0.55;

      // pulse rings
      for (const p of pulses) {
        const dx   = h.x - p.x;
        const dy   = h.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const ring = Math.abs(dist - p.r);
        if (ring < 36) {
          const strength = (1 - ring / 36) * (1 - p.r / p.max);
          glow = Math.min(1, glow + strength * 1.0);
        }
      }

      // mouse glow
      const mdx = h.x - mouseX;
      const mdy = h.y - mouseY;
      const md  = Math.sqrt(mdx * mdx + mdy * mdy);
      if (md < 130) glow = Math.min(1, glow + (1 - md / 130) * 0.9);

      // smooth glow
      h.glow += (glow - h.glow) * 0.15;

      const fill   = h.glow * 0.45;
      const stroke = 0.15 + h.glow * 0.55;

      hexPath(h.x, h.y, SIZE - 1.5);

      // gradient fill
      if (h.glow > 0.3) {
        const grad = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, SIZE);
        grad.addColorStop(0, `rgba(255,210,60,${fill * 1.3})`);
        grad.addColorStop(1, `rgba(200,120,0,${fill * 0.5})`);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = `rgba(247,168,0,${fill})`;
      }
      ctx.fill();

      ctx.strokeStyle = `rgba(247,168,0,${stroke})`;
      ctx.lineWidth   = h.glow > 0.5 ? 1.8 : 1.2;
      ctx.stroke();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
  window.addEventListener('mouseleave', () => { mouseX = -9999; mouseY = -9999; });

  resize();
  requestAnimationFrame(ts => { lastTs = ts; requestAnimationFrame(draw); });
})();
