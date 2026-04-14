(function () {

  // ── Create bee element ─────────────────────────────
  const wrap = document.createElement('div');
  wrap.id = 'flying-bee';
  wrap.innerHTML = `
    <svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
      <!-- Left wing -->
      <ellipse class="wing wing-l" cx="10" cy="26" rx="17" ry="8"/>
      <!-- Right wing -->
      <ellipse class="wing wing-r" cx="54" cy="26" rx="17" ry="8"/>
      <!-- Body -->
      <ellipse cx="32" cy="50" rx="12" ry="17" fill="#F7A800"/>
      <!-- Stripes -->
      <rect x="20" y="45" width="24" height="5.5" rx="2.5" fill="#111" opacity="0.85"/>
      <rect x="20" y="53" width="24" height="5.5" rx="2.5" fill="#111" opacity="0.85"/>
      <!-- Shine on body -->
      <ellipse cx="27" cy="40" rx="4" ry="7" fill="white" opacity="0.12"/>
      <!-- Head -->
      <circle cx="32" cy="29" r="11" fill="#F7A800"/>
      <!-- Eyes -->
      <circle cx="27.5" cy="27.5" r="3.5" fill="#111"/>
      <circle cx="36.5" cy="27.5" r="3.5" fill="#111"/>
      <circle cx="28.4" cy="26.4" r="1.4" fill="white"/>
      <circle cx="37.4" cy="26.4" r="1.4" fill="white"/>
      <!-- Smile -->
      <path d="M27 33 Q32 37 37 33" stroke="#111" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <!-- Antennae -->
      <path d="M27 19 Q23 12 18 10" stroke="#111" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M37 19 Q41 12 46 10" stroke="#111" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="18" cy="10" r="3" fill="#F7A800" stroke="#111" stroke-width="1"/>
      <circle cx="46" cy="10" r="3" fill="#F7A800" stroke="#111" stroke-width="1"/>
      <!-- Stinger -->
      <path d="M29 67 Q32 73 35 67" fill="#F7A800"/>
    </svg>`;
  document.body.appendChild(wrap);

  // ── Physics state ──────────────────────────────────
  let px = Math.random() * window.innerWidth;
  let py = Math.random() * window.innerHeight;
  let vx = (Math.random() - 0.5) * 3;
  let vy = (Math.random() - 0.5) * 3;
  let angle  = 0;
  let tAngle = 0;
  let tx = px, ty = py;
  let mouseX = -999, mouseY = -999;
  let lastTs = 0;
  let bobT = 0;

  // ── Pick new random target ─────────────────────────
  function newTarget() {
    const m = 100;
    tx = m + Math.random() * (window.innerWidth  - m * 2);
    ty = m + Math.random() * (window.innerHeight - m * 2);
  }
  newTarget();
  setInterval(newTarget, 2500 + Math.random() * 2000);

  window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
  window.addEventListener('mouseleave', () => { mouseX = -999; mouseY = -999; });

  // ── Update loop ────────────────────────────────────
  function update(ts) {
    const dt = Math.min((ts - lastTs) / 16, 3);
    lastTs = ts;
    bobT  += 0.06 * dt;

    let ftx = tx, fty = ty;

    // flee mouse
    const mdx = px - mouseX;
    const mdy = py - mouseY;
    const md  = Math.sqrt(mdx * mdx + mdy * mdy);
    if (md < 160) {
      const flee = (1 - md / 160) * 280;
      ftx += (mdx / md) * flee;
      fty += (mdy / md) * flee;
    }

    // steer toward target
    const dx = ftx - px;
    const dy = fty - py;
    const d  = Math.sqrt(dx * dx + dy * dy);

    const maxSpeed = 2.2;
    const steer    = 0.055;

    if (d > 4) {
      vx += (dx / d) * steer * dt;
      vy += (dy / d) * steer * dt;
    }

    // if near target — pick new one
    if (d < 40) newTarget();

    // limit speed
    const spd = Math.sqrt(vx * vx + vy * vy);
    if (spd > maxSpeed) { vx = (vx / spd) * maxSpeed; vy = (vy / spd) * maxSpeed; }

    // apply velocity + bob
    px += vx * dt;
    py += vy * dt + Math.sin(bobT) * 0.6;

    // keep on screen
    const pad = 40;
    if (px < pad)                       { px = pad;                       vx = Math.abs(vx); }
    if (px > window.innerWidth  - pad)  { px = window.innerWidth  - pad;  vx = -Math.abs(vx); }
    if (py < pad)                       { py = pad;                       vy = Math.abs(vy); }
    if (py > window.innerHeight - pad)  { py = window.innerHeight - pad;  vy = -Math.abs(vy); }

    // smooth rotation toward velocity
    if (spd > 0.3) {
      tAngle = Math.atan2(vy, vx) * 180 / Math.PI + 90;
    }
    let da = tAngle - angle;
    if (da >  180) da -= 360;
    if (da < -180) da += 360;
    angle += da * 0.07;

    // wing speed scales with movement speed
    const flapMs = Math.max(60, 160 - spd * 40);
    wrap.style.setProperty('--flap', flapMs + 'ms');

    const isMobile = window.innerWidth <= 860;
    const cx = isMobile ? 18 : 32;
    const cy = isMobile ? 22 : 40;
    wrap.style.transform =
      `translate(${(px - cx).toFixed(1)}px, ${(py - cy).toFixed(1)}px) rotate(${angle.toFixed(1)}deg)`;

    requestAnimationFrame(update);
  }

  requestAnimationFrame(ts => { lastTs = ts; requestAnimationFrame(update); });

})();
