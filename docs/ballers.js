/* =====================================================================
   BELMONT BALLERS: 1v1 arcade basketball against the Roosevelt campus.
   Make your player, then beat every school in a row ("Campus Run").
   Opponents and their colors live in config.js under `hoops`.
   ===================================================================== */
(function () {
  const C = window.CONFIG || {};
  const $ = id => document.getElementById(id);
  const root = $("hoops");
  if (!root) return;
  const CAMP = window.CAMPAIGN || {};
  const toast = CAMP.toast || (t => alert(t));
  const esc = CAMP.esc || (s => String(s));
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- opponents ---------------- */
  const H = C.hoops || {};
  const OPP = (H.opponents && H.opponents.length ? H.opponents : [
    { name: "Leadership", colors: ["#1E3A8A", "#FACC15"] },
    { name: "Fordham Arts", colors: ["#B91C1C", "#111111"] },
    { name: "KAPPA", colors: ["#90C787", "#111111"] },
    { name: "Law", colors: ["#15803D", "#FFFFFF"] },
  ]).map((o, i, a) => ({ ...o, level: (i + 1) / a.length }));
  const TO_WIN = H.pointsToWin || 11;
  const GAME_SECS = H.gameSeconds || 90;
  const SHOT_CLOCK = H.shotClock || 12;

  /* ---------------- player look ---------------- */
  const SKIN = ["#F6D3B3", "#E7B48F", "#C68E62", "#A0663F", "#7A4A2A", "#4E2E1B"];
  const HAIR = [["bald", "Bald"], ["fade", "Fade"], ["afro", "Afro"], ["locs", "Locs"], ["braids", "Braids"], ["durag", "Durag"], ["curly", "Curls"]];
  const HAIRCOL = ["#16110E", "#4A2C17", "#C9A227", "#7C3AED"];
  const SHOES = ["#5B21B6", "#FFFFFF", "#111111", "#C4B5FD", "#EF4444"];
  const BAD = /(fuck|shit|bitch|nigg|fag|cunt|dick|pussy|whore|slut|hoe\b|retard|nazi|kkk|sex|porn|cock|penis|vagina|ass\b|asshole|damn|bastard|rape)/i;
  const cleanName = s => String(s || "").replace(/[^A-Za-z0-9 ._-]/g, "").trim().slice(0, 12);
  const okName = s => s.length >= 2 && !BAD.test(s.replace(/[\s._-]/g, ""));

  let me = Object.assign({ name: "", skin: 2, hair: "fade", hairCol: 0, num: 7, shoes: 0 }, store.get("baller") || {});

  /* ---------------- drawing: big-head player ---------------- */
  const OUT = "#0B0712";
  function limb(g, x1, y1, x2, y2, w, col) {
    g.lineCap = "round";
    g.strokeStyle = OUT; g.lineWidth = w + 5; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
  }
  function blob(g, path, fill) { g.fillStyle = fill; g.strokeStyle = OUT; g.lineWidth = 3.5; path(); g.fill(); g.stroke(); }

  // pose: "idle" | "run" | "shoot" | "dunk" | "hang" | "defend" | "jump" | "stun"
  function drawPlayer(g, look, x, footY, o) {
    const s = o.scale || 1, f = o.face || 1, pose = o.pose || "idle";
    const skin = SKIN[look.skin] ?? SKIN[2], hc = HAIRCOL[look.hairCol] ?? HAIRCOL[0];
    const ph = o.run || 0;
    g.save(); g.translate(x, footY); g.scale(s * f, s);
    // shadow
    if (!o.noShadow) { g.fillStyle = "rgba(0,0,0,.28)"; g.beginPath(); g.ellipse(0, (o.lift || 0) + 2, 26 - Math.min(14, (o.lift || 0) / 10), 6, 0, 0, Math.PI * 2); g.fill(); }
    const air = pose === "shoot" || pose === "dunk" || pose === "hang" || pose === "jump";
    // legs (short, chunky)
    const hip = -44;
    let la, lb;
    if (air) { la = pose === "hang" ? 0.15 : 0.55; lb = pose === "hang" ? -0.15 : -0.35; }
    else if (pose === "run") { la = Math.sin(ph) * 0.75; lb = -Math.sin(ph) * 0.75; }
    else if (pose === "defend") { la = 0.45; lb = -0.45; }
    else { la = 0.08; lb = -0.08; }
    const knee = pose === "defend" ? 6 : 0;
    const legEnd = a => [Math.sin(a) * 30, hip + Math.cos(a) * 40 - knee];
    const [ax, ay] = legEnd(la), [bx, by] = legEnd(lb);
    limb(g, -7, hip, -7 + bx, by, 11, skin);
    // back shoe
    blob(g, () => { g.beginPath(); g.roundRect(-7 + bx - 7, by - 5, 22, 11, 5); }, SHOES[look.shoes] ?? SHOES[0]);
    limb(g, 7, hip, 7 + ax, ay, 11, skin);
    blob(g, () => { g.beginPath(); g.roundRect(7 + ax - 7, ay - 5, 22, 11, 5); }, SHOES[look.shoes] ?? SHOES[0]);
    g.fillStyle = "#fff"; g.fillRect(7 + ax - 4, ay + 1, 15, 2.5); g.fillRect(-7 + bx - 4, by + 1, 15, 2.5);
    // shorts
    blob(g, () => { g.beginPath(); g.roundRect(-19, hip - 10, 38, 24, 6); }, o.jersey);
    g.fillStyle = o.trim; g.fillRect(-19, hip + 8, 38, 4); g.fillRect(14, hip - 9, 4, 20);
    // back arm
    const sh = -84;
    const armBack = pose === "shoot" ? [[-8, sh], [-2, sh - 48]] : pose === "dunk" || pose === "hang" ? [[-8, sh], [-20, sh + 20]] : pose === "defend" ? [[-8, sh], [-36, sh - 6]] : pose === "jump" ? [[-8, sh], [-14, sh - 50]] : [[-8, sh], [-18 - Math.sin(ph) * 8, sh + 30]];
    limb(g, armBack[0][0], armBack[0][1], armBack[1][0], armBack[1][1], 9, skin);
    // torso / jersey
    blob(g, () => { g.beginPath(); g.moveTo(-20, -96); g.quadraticCurveTo(0, -102, 20, -96); g.lineTo(18, -50); g.lineTo(-18, -50); g.closePath(); }, o.jersey);
    g.strokeStyle = o.trim; g.lineWidth = 3; g.beginPath(); g.moveTo(-10, -98); g.quadraticCurveTo(0, -88, 10, -98); g.stroke();
    g.save(); g.scale(f, 1); g.fillStyle = o.trim; g.strokeStyle = OUT; g.lineWidth = 3; g.font = "400 24px Anton, Impact, sans-serif"; g.textAlign = "center";
    g.strokeText(String(o.num ?? look.num ?? ""), 0, -60); g.fillText(String(o.num ?? look.num ?? ""), 0, -60); g.restore();
    // front arm
    let af;
    if (pose === "shoot") af = [[8, sh], [10, sh - 50]];
    else if (pose === "dunk") af = [[8, sh], [26, sh - 52]];
    else if (pose === "hang") af = [[8, sh], [20, sh - 54]];
    else if (pose === "jump") af = [[8, sh], [18, sh - 52]];
    else if (pose === "defend") af = [[8, sh], [38, sh - 10]];
    else if (o.hasBall) af = [[8, sh], [28, sh + 26 + (o.dribble || 0) * 6]];
    else af = [[8, sh], [18 + Math.sin(ph) * 8, sh + 30]];
    limb(g, af[0][0], af[0][1], af[1][0], af[1][1], 9, skin);
    // head (big)
    const hy = -128, R = 31;
    blob(g, () => { g.beginPath(); g.ellipse(-27, hy + 4, 6, 9, 0, 0, Math.PI * 2); }, skin); // ear (back side)
    // hair behind head
    g.fillStyle = hc; g.strokeStyle = OUT; g.lineWidth = 3.5;
    if (look.hair === "afro") { g.beginPath(); g.arc(-2, hy - 8, R + 12, 0, Math.PI * 2); g.fill(); g.stroke(); }
    if (look.hair === "locs") { for (let i = 0; i < 6; i++) { limb(g, -24 + i * 3, hy - 10, -30 + i * 2, hy + 34 - (i % 2) * 6, 6, hc); } }
    if (look.hair === "durag") { blob(g, () => { g.beginPath(); g.moveTo(-26, hy - 4); g.quadraticCurveTo(-46, hy + 20, -40, hy + 46); g.lineTo(-30, hy + 44); g.quadraticCurveTo(-34, hy + 18, -18, hy + 2); g.closePath(); }, hc === HAIRCOL[0] ? "#1a1a1a" : hc); }
    blob(g, () => { g.beginPath(); g.arc(0, hy, R, 0, Math.PI * 2); }, skin);
    // hair on top
    switch (look.hair) {
      case "fade": blob(g, () => { g.beginPath(); g.arc(0, hy, R, Math.PI * 1.08, Math.PI * 1.92); g.quadraticCurveTo(0, hy - R + 12, -R * 0.97, hy - 8); g.closePath(); }, hc); break;
      case "afro": g.fillStyle = hc; g.beginPath(); g.arc(-2, hy - 8, R + 10, Math.PI * 0.95, Math.PI * 2.08); g.fill(); break;
      case "curly": for (let i = -3; i <= 3; i++) blob(g, () => { g.beginPath(); g.arc(i * 8, hy - R + 2 + Math.abs(i) * 3, 9, 0, Math.PI * 2); }, hc); break;
      case "locs": blob(g, () => { g.beginPath(); g.arc(0, hy, R + 1, Math.PI * 0.95, Math.PI * 2.02); g.quadraticCurveTo(4, hy - 18, -R, hy + 2); g.closePath(); }, hc); break;
      case "braids":
        blob(g, () => { g.beginPath(); g.arc(0, hy, R + 1, Math.PI * 1.0, Math.PI * 2.0); g.quadraticCurveTo(0, hy - 14, -R, hy); g.closePath(); }, hc);
        g.strokeStyle = "rgba(255,255,255,.28)"; g.lineWidth = 2;
        for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 9, hy - R + 2); g.quadraticCurveTo(i * 10 + 2, hy - 18, i * 11, hy - 8); g.stroke(); }
        break;
      case "durag": blob(g, () => { g.beginPath(); g.arc(0, hy, R + 1, Math.PI * 0.92, Math.PI * 2.06); g.quadraticCurveTo(0, hy - 10, -R - 1, hy + 4); g.closePath(); }, hc === HAIRCOL[0] ? "#1a1a1a" : hc);
        g.fillStyle = "rgba(255,255,255,.18)"; g.beginPath(); g.ellipse(6, hy - 22, 12, 5, -0.3, 0, Math.PI * 2); g.fill(); break;
    }
    // face
    const look2 = pose === "stun";
    g.fillStyle = "#fff"; g.strokeStyle = OUT; g.lineWidth = 2.5;
    g.beginPath(); g.ellipse(13, hy + 2, 6.5, 8, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(27, hy + 2, 4.5, 7.5, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = OUT;
    if (look2) { g.font = "700 12px sans-serif"; g.textAlign = "center"; g.fillText("x", 13, hy + 6); g.fillText("x", 27, hy + 6); }
    else { const py = air ? -2 : 1; g.beginPath(); g.arc(15, hy + 2 + py, 3.2, 0, Math.PI * 2); g.arc(28, hy + 2 + py, 2.6, 0, Math.PI * 2); g.fill(); }
    g.lineWidth = 3; g.lineCap = "round";
    g.beginPath(); g.moveTo(7, hy - 9 - (air ? 2 : 0)); g.lineTo(19, hy - 11); g.stroke();
    g.beginPath(); g.moveTo(23, hy - 11); g.lineTo(31, hy - 9); g.stroke();
    g.lineWidth = 2.5; g.beginPath();
    if (pose === "dunk" || pose === "hang") { g.ellipse(22, hy + 17, 5, 4, 0, 0, Math.PI * 2); g.fillStyle = "#4a1020"; g.fill(); g.stroke(); }
    else if (look2) { g.moveTo(16, hy + 18); g.quadraticCurveTo(22, hy + 14, 28, hy + 18); g.stroke(); }
    else { g.moveTo(15, hy + 15); g.quadraticCurveTo(22, hy + 20, 28, hy + 15); g.stroke(); }
    g.restore();
  }

  /* ---------------- sound ---------------- */
  let actx = null;
  const ac = () => { if (C.alarmSound === false) return null; try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === "suspended") actx.resume(); return actx; } catch { return null; } };
  const tone = (freq, dur, vol = 0.06, type = "sine", slide) => {
    const a = ac(); if (!a) return;
    const t = a.currentTime + 0.005, o = a.createOscillator(), gn = a.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(gn); gn.connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
  };
  const noise = (dur, vol = 0.05, freq = 1200) => {
    const a = ac(); if (!a) return;
    const n = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate), d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = a.createBufferSource(), fl = a.createBiquadFilter(), gn = a.createGain();
    src.buffer = n; fl.type = "bandpass"; fl.frequency.value = freq; fl.Q.value = 0.7; gn.gain.value = vol;
    src.connect(fl); fl.connect(gn); gn.connect(a.destination); src.start();
  };
  const sfx = {
    bounce: () => tone(110, 0.09, 0.1, "sine", 55),
    swish: () => noise(0.25, 0.08, 3000),
    rim: () => { tone(560, 0.18, 0.05, "square", 420); tone(840, 0.12, 0.03, "triangle"); },
    board: () => tone(180, 0.12, 0.08, "square", 120),
    slam: () => { tone(90, 0.3, 0.14, "square", 40); noise(0.3, 0.1, 400); },
    buzzer: () => tone(220, 0.7, 0.07, "sawtooth"),
    whoosh: () => noise(0.14, 0.05, 900),
    cheer: () => noise(0.9, 0.06, 1400),
    win: () => [523, 659, 784, 1046].forEach((fq, i) => setTimeout(() => tone(fq, 0.18, 0.06, "square"), i * 120)),
  };

  /* ---------------- screens ---------------- */
  const screens = ["hpCreate", "hpPick", "hpGame", "hpResult"];
  const show = id => screens.forEach(s => { $(s).hidden = s !== id; });

  /* ----- character creator ----- */
  const pv = $("hpPreview"), pg = pv.getContext("2d");
  const chips = (id, items, key, render) => {
    $(id).innerHTML = items.map((it, i) => render(it, i)).join("");
    $(id).addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      me[key] = key === "hair" ? b.dataset.v : +b.dataset.v; paintCreate();
    });
  };
  chips("hpSkin", SKIN, "skin", (c, i) => `<button type="button" class="sw" data-v="${i}" style="background:${c}" aria-label="Skin tone ${i + 1}"></button>`);
  chips("hpHair", HAIR, "hair", ([v, l]) => `<button type="button" class="pill" data-v="${v}">${l}</button>`);
  chips("hpHairCol", HAIRCOL, "hairCol", (c, i) => `<button type="button" class="sw" data-v="${i}" style="background:${c}" aria-label="Hair color ${i + 1}"></button>`);
  chips("hpShoes", SHOES, "shoes", (c, i) => `<button type="button" class="sw" data-v="${i}" style="background:${c}" aria-label="Shoe color ${i + 1}"></button>`);
  function paintCreate() {
    [["hpSkin", "skin"], ["hpHairCol", "hairCol"], ["hpShoes", "shoes"]].forEach(([id, k]) =>
      $(id).querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", +b.dataset.v === me[k])));
    $("hpHair").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.v === me.hair));
    const w = pv.width, h = pv.height;
    const gr = pg.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#2A1458"); gr.addColorStop(1, "#0E0620");
    pg.fillStyle = gr; pg.fillRect(0, 0, w, h);
    pg.fillStyle = "rgba(196,181,253,.18)"; pg.beginPath(); pg.arc(w / 2, h * 0.42, 120, 0, Math.PI * 2); pg.fill();
    pg.fillStyle = "#C9925B"; pg.fillRect(0, h - 56, w, 56);
    drawPlayer(pg, me, w / 2, h - 30, { jersey: "#5B21B6", trim: "#FFFFFF", scale: 1.5, num: me.num, pose: "idle" });
  }
  $("hpName").value = me.name; $("hpNum").value = me.num;
  $("hpNum").addEventListener("input", e => { me.num = Math.max(0, Math.min(99, parseInt(e.target.value || "0", 10) || 0)); paintCreate(); });
  $("hpName").addEventListener("input", e => { me.name = e.target.value; });
  $("hpSave").addEventListener("click", () => {
    const n = cleanName($("hpName").value);
    if (!okName(n)) { toast(n.length < 2 ? "Give your player a name (2+ letters)." : "Pick a different name."); $("hpName").focus(); return; }
    me.name = n; $("hpName").value = n; store.set("baller", me); paintPick(); show("hpPick");
  });
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(paintCreate); paintCreate();

  /* ----- campus run ladder ----- */
  let run = { at: 0, diff: 0, results: [] };
  function paintPick() {
    $("hpWho").textContent = me.name;
    $("hpLadder").innerHTML = OPP.map((o, i) => {
      const r = run.results[i];
      const st = r ? (r.win ? "won" : "lost") : i === run.at ? "next" : "locked";
      return `<li class="rung ${st}"><span class="dot" style="background:${o.colors[0]};border-color:${o.colors[1]}"></span>
        <span class="nm">${esc(o.name)}</span>
        <span class="rtag">${r ? `${r.me}–${r.them}` : st === "next" ? "Up next" : `Level ${i + 1}`}</span></li>`;
    }).join("");
    const o = OPP[run.at];
    $("hpGo").textContent = run.at === 0 ? `Start: vs ${o.name}` : `Next: vs ${o.name}`;
  }
  $("hpEdit").addEventListener("click", () => { show("hpCreate"); paintCreate(); });
  $("hpGo").addEventListener("click", () => startGame(OPP[run.at]));

  /* =================== GAME ENGINE =================== */
  const cv = $("hpCanvas"), g = cv.getContext("2d");
  const W = 960, Hh = 540, FLOOR = 462, RIMX = 840, RIMY = 300, ARC = 330, LEFT = 50, RIGHT = 870, BOARDX = RIMX + 34;
  const GRAV = 1650, BGRAV = 1000, JUMP = 660;
  let S = null, raf = 0, last = 0;
  const keys = {};
  const pads = { left: false, right: false };
  // crowd: fixed seats
  const CROWD = Array.from({ length: 70 }, (_, i) => ({ x: 20 + (i % 18) * 54 + (Math.floor(i / 18) % 2) * 27, row: Math.floor(i / 18), c: i % 3, ph: Math.random() * 6 }));

  function mkPlayer(team, look, jersey, trim, num) {
    return { team, x: 0, y: 0, vy: 0, face: 1, look, jersey, trim, num, run: 0, stun: 0, dash: 0, dashDir: 1, cd: 0, stealCd: 0, charging: false, meter: 0, shotTaken: false, dunk: null, hang: 0 };
  }

  function startGame(opp) {
    const L = opp.level;
    const cpuLook = { skin: Math.floor(Math.random() * SKIN.length), hair: HAIR[1 + Math.floor(Math.random() * (HAIR.length - 1))][0], hairCol: Math.random() < 0.8 ? 0 : 1, shoes: 2, num: 1 + Math.floor(Math.random() * 30) };
    S = {
      opp, L,
      ai: { speed: 200 + 80 * L, shootSd: 0.2 - 0.12 * L, react: 0.35 - 0.22 * L, steal: 0.12 + 0.2 * L, block: 0.25 + 0.35 * L, ankle: 0.6 - 0.3 * L, aggress: 0.4 + 0.5 * L, dunk: 0.3 + 0.5 * L },
      p: [mkPlayer(0, me, "#5B21B6", "#FFFFFF", me.num), mkPlayer(1, cpuLook, opp.colors[0], opp.colors[1], cpuLook.num)],
      ball: { state: "held", owner: 0, x: 0, y: 0, vx: 0, vy: 0, dribble: 0, spin: 0, trail: [] },
      off: 0, score: [0, 0], clock: GAME_SECS, live: false, pause: 0.9, msg: "", msgT: 0, over: false, sudden: false,
      pops: [], parts: [], aiT: 0, aiPlan: null, shot: null, net: 0, sc: SHOT_CLOCK,
      shake: 0, slow: 0, cheer: 0, streak: 0, fire: false, flash: 0,
    };
    resetPossession(0, true);
    show("hpGame"); $("hpOppName").textContent = opp.name;
    $("hpOppName").style.setProperty("--c", opp.colors[0]);
    setLabels(); cancelAnimationFrame(raf); last = 0; raf = requestAnimationFrame(loop);
    setTimeout(() => cv.focus({ preventScroll: true }), 50);
  }

  function resetPossession(team, first) {
    const p = S.p, o = p[team], d = p[1 - team];
    S.off = team;
    o.x = 420; d.x = 630; o.face = 1; d.face = -1;
    [o, d].forEach(q => { q.y = 0; q.vy = 0; q.stun = 0; q.dash = 0; q.charging = false; q.meter = 0; q.shotTaken = false; q.dunk = null; q.hang = 0; });
    const b = S.ball; b.state = "held"; b.owner = team; b.trail = []; S.shot = null; S.sc = SHOT_CLOCK;
    S.live = false; S.pause = first ? 1.1 : 0.8;
    say(first ? `vs ${S.opp.name}` : team === 0 ? "Your ball" : `${S.opp.name} ball`, 0.9);
    setLabels();
  }

  const say = (t, d = 0.9) => { S.msg = t; S.msgT = d; };
  const pop = (t, x, y, col = "#fff", big) => S.pops.push({ t, x, y, a: 1, col, big: !!big });
  const burst = (x, y, n, cols) => { for (let i = 0; i < n; i++) S.parts.push({ x, y, vx: (Math.random() - 0.5) * 420, vy: -Math.random() * 380 - 60, life: 0.7 + Math.random() * 0.5, c: cols[i % cols.length], r: 3 + Math.random() * 3 }); };
  const shake = t => { if (!reduceMotion) S.shake = Math.max(S.shake, t); };

  /* ----- input ----- */
  const human = () => S.p[0];
  const humanHasBall = () => S.ball.state === "held" && S.ball.owner === 0;
  function setLabels() {
    const off = !S || S.off === 0;
    $("hpBtnA").textContent = off ? "Crossover" : "Steal";
    $("hpBtnB").textContent = off ? "Shoot" : "Block";
  }
  function pressShoot() {
    if (!S || !S.live || S.over) return; const h = human();
    if (h.stun > 0 || h.y > 0 || h.dunk) return;
    if (humanHasBall()) {
      const dist = RIMX - h.x;
      const toward = (keys.r || pads.right) || h.dash > 0;
      if (dist > 0 && (dist < 95 || (dist < 175 && toward))) return startDunk(h);
      h.vy = JUMP; h.charging = true; h.meter = 0; h.shotTaken = false;
    } else { h.vy = JUMP + 40; }
  }
  function releaseShoot() { if (S && human().charging) shoot(human(), human().meter); }
  function pressAction() {
    if (!S || !S.live || S.over) return; const h = human();
    if (h.stun > 0 || h.dunk) return;
    if (humanHasBall()) crossover(h, S.p[1]);
    else tryStealBy(h, S.p[1], 0.38);
  }
  const KEYMAP = { ArrowLeft: "l", a: "l", A: "l", ArrowRight: "r", d: "r", D: "r", ArrowUp: "s", w: "s", W: "s", " ": "s", j: "x", J: "x", Shift: "x", k: "x", K: "x" };
  cv.addEventListener("keydown", e => {
    const k = KEYMAP[e.key]; if (!k) return; e.preventDefault(); if (e.repeat) return;
    if (k === "l" || k === "r") keys[k] = true; else if (k === "s") pressShoot(); else pressAction();
  });
  cv.addEventListener("keyup", e => {
    const k = KEYMAP[e.key]; if (!k) return; e.preventDefault();
    if (k === "l" || k === "r") keys[k] = false; else if (k === "s") releaseShoot();
  });
  cv.addEventListener("blur", () => { keys.l = keys.r = false; });
  const hold = (id, down, up) => {
    const b = $(id);
    b.addEventListener("pointerdown", e => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch {} b.classList.add("on"); down(); });
    const end = () => { if (!b.classList.contains("on")) return; b.classList.remove("on"); up && up(); };
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(ev => b.addEventListener(ev, end));
    b.addEventListener("contextmenu", e => e.preventDefault());
  };
  hold("hpLeft", () => pads.left = true, () => pads.left = false);
  hold("hpRight", () => pads.right = true, () => pads.right = false);
  hold("hpBtnA", pressAction);
  hold("hpBtnB", pressShoot, releaseShoot);

  /* ----- actions ----- */
  function crossover(o, d) {
    if (o.cd > 0) return;
    o.cd = 1.0; o.dash = 0.26; o.dashDir = o.face; sfx.whoosh();
    const close = Math.abs(d.x - o.x) < 90 && d.y < 20 && d.stun <= 0;
    const chance = o.team === 0 ? S.ai.ankle : 0.25 + 0.25 * S.L;
    if (close && Math.random() < chance) { d.stun = 0.8; pop(o.team === 0 ? "ANKLES!" : "CROSSED!", d.x, FLOOR - 190, "#C4B5FD", true); S.cheer = 0.8; }
  }
  function tryStealBy(d, o, p) {
    if (d.stealCd > 0 || !(S.ball.state === "held" && S.ball.owner === o.team) || o.dunk) return;
    d.stealCd = 0.9;
    const close = Math.abs(d.x - o.x) < 60 && o.y < 10 && !o.charging;
    if (close && Math.random() < p) {
      S.ball.owner = d.team; pop("STOLEN!", d.x, FLOOR - 190, "#FACC15", true); sfx.whoosh(); S.cheer = 0.6;
      S.live = false; S.pause = 0.6; setTimeout(() => S && !S.over && resetPossession(d.team), 600);
    } else if (!close || Math.random() < 0.5) { d.stun = 0.3; }
  }
  function startDunk(o) {
    o.dunk = { t: 0, T: 0.5, x0: o.x, tx: RIMX - 30 }; o.face = 1; o.charging = false;
    sfx.whoosh();
  }
  function shotChance(o, d, q) {
    const dist = Math.abs(RIMX - o.x);
    let base = dist < 140 ? 0.76 : dist <= ARC ? 0.64 - (dist - 140) * 0.0007 : Math.max(0.04, 0.46 - (dist - ARC) * 0.0009);
    let p = base * (0.35 + 0.65 * q);
    const contest = Math.abs(d.x - o.x) < 72 && d.stun <= 0 && ((RIMX - o.x) * (d.x - o.x) > 0 || Math.abs(d.x - o.x) < 30);
    if (contest) p *= d.y > 25 ? 0.45 : 0.68;
    if (q > 0.97 && !contest) p = Math.min(0.97, p + 0.14);
    if (o.team === 0 && S.fire) p = Math.min(0.98, p + 0.15);
    return { p, dist, contest };
  }
  function perfectWin(o) { return o.team === 0 && S.fire ? [0.6, 0.98] : [0.72, 0.9]; }
  function shoot(o, m) {
    if (!o.charging || o.shotTaken) return;
    o.charging = false; o.shotTaken = true;
    const d = S.p[1 - o.team];
    const [w0, w1] = perfectWin(o), mid = (w0 + w1) / 2, half = (w1 - w0) / 2;
    const q = Math.abs(m - mid) <= half ? 1 : Math.max(0, 1 - (Math.abs(m - mid) - half) * 3.2) ** 0.8;
    const { p, dist, contest } = shotChance(o, d, q);
    const blockable = Math.abs(d.x - o.x) < 62 && d.y > 30 && d.stun <= 0;
    const blockP = d.team === 0 ? 0.62 : S.ai.block;
    const b = S.ball;
    b.state = "air"; b.owner = -1; b.x = o.x + o.face * 8; b.y = o.y + 178; b.trail = [];
    if (blockable && Math.random() < blockP) {
      b.vx = (o.x < d.x ? -1 : 1) * (240 + Math.random() * 120); b.vy = 300; b.state = "loose";
      pop("REJECTED!", d.x, FLOOR - 230, "#EF4444", true); sfx.board(); shake(0.2); S.cheer = 0.8; S.shot = null;
      if (o.team === 0) endStreak();
      return;
    }
    const make = Math.random() < p;
    const pts = dist > ARC ? 3 : 2;
    const tx = make ? RIMX : RIMX + (Math.random() < 0.55 ? -1 : 1) * (12 + Math.random() * 14);
    const T = 0.62 + dist / 1500;
    b.vx = (tx - b.x) / T; b.vy = (RIMY + 6 - b.y + 0.5 * BGRAV * T * T) / T;
    const winner = make && S.score[o.team] + pts >= TO_WIN;
    S.shot = { team: o.team, make, pts, T, t: 0, perfect: q > 0.97, near: !make && q > 0.55, winner };
    if (winner) S.slow = T * 0.9;
    if (o.team === 0) {
      const lbl = q > 0.97 ? "PERFECT" : q > 0.75 ? "GOOD" : q > 0.4 ? (m < mid ? "EARLY" : "LATE") : (m < mid ? "WAY EARLY" : "WAY LATE");
      pop(lbl, o.x, FLOOR - o.y - 225, q > 0.97 ? "#22C55E" : q > 0.75 ? "#C4B5FD" : "#fff");
      if (contest && q > 0.75) pop("CONTESTED", o.x, FLOOR - o.y - 250, "#FACC15");
    }
  }
  function score(team, pts, how) {
    S.score[team] += pts; S.net = 0.6; S.cheer = 1.4; S.flash = 0.25; sfx.cheer();
    const col = team === 0 ? "#C4B5FD" : S.opp.colors[0];
    pop(how, RIMX - 60, FLOOR - RIMY - 60, col, true);
    burst(RIMX, FLOOR - RIMY + 10, 26, team === 0 ? ["#5B21B6", "#C4B5FD", "#FFFFFF"] : [S.opp.colors[0], S.opp.colors[1], "#FFFFFF"]);
    if (team === 0) { S.streak++; if (S.streak >= 3 && !S.fire) { S.fire = true; pop("ON FIRE!", W / 2, 200, "#F97316", true); } }
    else endStreak();
  }
  function endStreak() { if (S.fire) pop("Fire's out", W / 2, 210, "#aaa"); S.streak = 0; S.fire = false; }

  /* ----- AI ----- */
  function aiOffense(o, d, dt) {
    const A = S.ai;
    if (o.stun > 0 || o.dunk) return 0;
    S.aiT -= dt;
    const dist = RIMX - o.x;
    const gap = d.x - o.x;
    if (!o.charging && o.y === 0 && S.aiT <= 0) {
      S.aiT = A.react + Math.random() * 0.35;
      const open = Math.abs(gap) > 75 || d.stun > 0 || gap < 0;
      if (dist < 170 && (open || dist < 100) && Math.random() < A.dunk) { startDunk(o); return 0; }
      if (dist < 100) { startCpuShot(o); return 0; }
      if (open && dist < ARC + 40 && Math.random() < 0.5 + 0.3 * S.L) { startCpuShot(o); return 0; }
      if (open && dist > ARC && dist < ARC + 120 && Math.random() < 0.2 + 0.15 * S.L) { startCpuShot(o); return 0; }
      if (!open && gap > 0 && gap < 95 && o.cd <= 0 && Math.random() < A.aggress) crossover(o, d);
      if (!open && Math.random() < 0.18) S.aiPlan = { back: 0.35 };
    }
    if (o.charging) return 0;
    if (S.aiPlan && S.aiPlan.back > 0) { S.aiPlan.back -= dt; return -1; }
    return dist > 40 ? 1 : 0;
  }
  function startCpuShot(o) {
    o.vy = JUMP; o.charging = true; o.meter = 0; o.shotTaken = false;
    o.target = Math.max(0.3, Math.min(1.15, 0.81 + (Math.random() * 2 - 1) * S.ai.shootSd * 1.6));
  }
  function aiDefense(d, o, dt) {
    const A = S.ai;
    if (d.stun > 0) return 0;
    const want = o.x + 56;
    const dx = want - d.x;
    if ((o.charging || o.dunk) && Math.abs(o.x - d.x) < 100 && d.y === 0 && Math.random() < A.block * dt * 14) d.vy = JUMP + 40;
    if (Math.abs(o.x - d.x) < 58 && Math.random() < A.steal * dt * 1.4) tryStealBy(d, o, 0.32 + 0.15 * S.L);
    return Math.abs(dx) < 6 ? 0 : Math.sign(dx);
  }
  function aiLoose(q) {
    const b = S.ball; const dx = b.x - q.x;
    if (Math.abs(dx) < 45 && b.y > 140 && b.y < 280 && q.y === 0 && Math.random() < 0.08) q.vy = JUMP + 40;
    return Math.abs(dx) < 8 ? 0 : Math.sign(dx);
  }

  /* ----- loop ----- */
  function loop(t) {
    raf = requestAnimationFrame(loop);
    const page = $("page-hoops");
    if (!page || !page.classList.contains("active")) { last = 0; return; }
    let dt = Math.min(0.033, last ? (t - last) / 1000 : 0); last = t;
    if (!S) return;
    const real = dt;
    if (S.slow > 0) { S.slow -= real; dt *= 0.35; }
    update(dt, real); render();
  }

  function update(dt, real) {
    const p = S.p, b = S.ball, h = p[0], cpu = p[1];
    S.msgT -= real; S.shake = Math.max(0, S.shake - real); S.cheer = Math.max(0, S.cheer - real); S.flash = Math.max(0, S.flash - real);
    S.pops.forEach(q => { q.y -= 40 * real; q.a -= real * 1.0; }); S.pops = S.pops.filter(q => q.a > 0);
    S.parts.forEach(q => { q.vy += 900 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt; }); S.parts = S.parts.filter(q => q.life > 0);
    if (S.net > 0) S.net -= dt;
    if (S.over) return;
    if (!S.live) { S.pause -= dt; if (S.pause <= 0) S.live = true; }
    if (S.live && b.state !== "dead") {
      S.clock = Math.max(0, S.clock - dt);
      if (S.clock === 0 && !S.sudden && b.state === "held") return endByClock();
      const hol = b.state === "held" ? p[b.owner] : null;
      if (hol && !hol.charging && hol.y === 0 && !hol.dunk) {
        S.sc -= dt;
        if (S.sc <= 0) { const to = 1 - b.owner; pop("SHOT CLOCK", W / 2, 210, "#EF4444", true); sfx.buzzer(); if (b.owner === 0) endStreak(); S.live = false; S.sc = 99; setTimeout(() => S && !S.over && resetPossession(to), 700); return; }
      }
    }
    // intents
    let ih = 0, ic = 0;
    if (S.live) {
      ih = (keys.r || pads.right ? 1 : 0) - (keys.l || pads.left ? 1 : 0);
      if (b.state === "held") ic = S.off === 1 ? aiOffense(cpu, h, dt) : aiDefense(cpu, h, dt);
      else if (b.state === "loose") ic = aiLoose(cpu);
      else if (b.state === "air") { const tx = RIMX - 110; ic = Math.abs(tx - cpu.x) < 10 ? 0 : Math.sign(tx - cpu.x); }
    }
    const spH = S.fire ? 340 : 310;
    [[h, ih, spH], [cpu, ic, S.ai.speed]].forEach(([q, dir, sp]) => {
      q.cd -= dt; q.stealCd -= dt; if (q.stun > 0) { q.stun -= dt; dir = 0; }
      // dunk flight
      if (q.dunk) {
        const D = q.dunk; D.t += dt; const k = Math.min(1, D.t / D.T);
        q.x = D.x0 + (D.tx - D.x0) * k; q.y = Math.sin(k * Math.PI * 0.5) * (RIMY - 150) + (1 - k) * 0;
        q.face = 1; q.run = 0;
        if (k >= 1 && !D.done) {
          D.done = true;
          const d = p[1 - q.team];
          const canBlock = Math.abs(d.x - q.x) < 70 && d.y > 60 && d.stun <= 0;
          const bp = d.team === 0 ? 0.5 : S.ai.block * 0.55;
          if (canBlock && Math.random() < bp) {
            b.state = "loose"; b.owner = -1; b.x = q.x; b.y = q.y + 170; b.vx = -300; b.vy = 200;
            pop("DENIED!", d.x, FLOOR - 260, "#EF4444", true); sfx.board(); shake(0.25); S.cheer = 1;
            q.dunk = null; q.vy = -50; if (q.team === 0) endStreak();
          } else {
            b.state = "dead"; b.owner = -1; b.x = RIMX; b.y = RIMY - 14; b.vx = 0; b.vy = -260;
            sfx.slam(); shake(0.4); S.slow = 0.35; q.hang = 0.45; q.dunk = null; q.vy = 0;
            score(q.team, 2, "SLAM!");
            if (!checkEnd()) { S.live = false; setTimeout(() => S && !S.over && resetPossession(1 - q.team), 1100); }
          }
        }
        return;
      }
      if (q.hang > 0) { q.hang -= dt; q.x = RIMX - 30; q.y = RIMY - 150; if (q.hang <= 0) q.vy = -80; return; }
      let v = dir * sp;
      if (q.dash > 0) { q.dash -= dt; v = q.dashDir * sp * 2.3; }
      if (q.charging) v *= 0.25;
      q.x = Math.max(LEFT, Math.min(RIGHT - 20, q.x + v * dt));
      const holder = b.state === "held" && b.owner === q.team;
      if (q.charging) q.face = 1;
      else if (dir) q.face = dir;
      else if (!holder && q.dash <= 0) q.face = b.x > q.x ? 1 : -1;
      q.run = dir || q.dash > 0 ? q.run + dt * 15 : 0;
      if (q.y > 0 || q.vy !== 0) { q.vy -= GRAV * dt; q.y += q.vy * dt; if (q.y <= 0) { q.y = 0; q.vy = 0; if (q.charging) shoot(q, q.meter); } }
      if (q.charging) {
        q.meter += dt / 0.55;
        if (q.team === 1 && q.meter >= q.target) shoot(q, q.meter);
        if (q.meter > 1.35) shoot(q, q.meter);
      }
    });
    if (!h.dunk && !cpu.dunk && h.hang <= 0 && cpu.hang <= 0 && Math.abs(h.x - cpu.x) < 44 && h.y < 50 && cpu.y < 50) {
      const push = (44 - Math.abs(h.x - cpu.x)) / 2 * Math.sign(h.x - cpu.x || 1);
      h.x += push; cpu.x -= push;
    }
    // ball
    b.spin += dt * 10;
    if (b.state === "held") {
      const o = p[b.owner];
      b.dribble += dt * (o.run ? 9.5 : 6.5);
      if (o.dunk) { b.x = o.x + 22; b.y = o.y + 190; }
      else if (o.charging || o.y > 0) { b.x = o.x + o.face * 6; b.y = o.y + 182; }
      else {
        const sn = Math.abs(Math.sin(b.dribble));
        b.x = o.x + o.face * 30; b.y = 12 + sn * 46;
        if (sn < 0.08 && !b._b) { sfx.bounce(); b._b = 1; } else if (sn > 0.3) b._b = 0;
      }
    } else if (b.state === "air") {
      const sh = S.shot;
      b.vy -= BGRAV * dt; b.x += b.vx * dt; b.y += b.vy * dt; sh.t += dt;
      b.trail.push([b.x, b.y]); if (b.trail.length > 12) b.trail.shift();
      if (sh.t >= sh.T) {
        if (sh.make) {
          sfx.swish(); b.state = "dead"; b.x = RIMX; b.y = RIMY - 6; b.vx = 0; b.vy = -120;
          score(sh.team, sh.pts, sh.winner ? "GAME!" : sh.pts === 3 ? "THREE!" : sh.perfect ? "SWISH!" : "BUCKET");
          if (sh.winner) shake(0.3);
          if (!checkEnd()) { S.live = false; setTimeout(() => S && !S.over && resetPossession(1 - sh.team), 900); }
        } else if (sh.near) {
          // rattle on the rim
          sfx.rim(); b.state = "rim"; b.hops = 1 + Math.floor(Math.random() * 2); b.rollIn = Math.random() < 0.28;
          b.y = RIMY + 4; b.vy = 190; b.vx = (RIMX - b.x) * 2.2;
          S.rimShot = sh;
        } else {
          sfx.rim(); b.state = "loose"; b.vx = -(130 + Math.random() * 260); b.vy = 260 + Math.random() * 220;
          if (b.x > RIMX) { b.vx = 220; sfx.board(); }
          if (sh.team === 0) endStreak();
        }
        S.shot = null;
      }
    } else if (b.state === "rim") {
      b.vy -= BGRAV * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.vx *= 0.96;
      if (b.y <= RIMY + 4 && b.vy < 0) {
        if (b.hops > 0) { b.hops--; b.vy = 150 + Math.random() * 60; b.vx = (Math.random() - 0.5) * 120; sfx.rim(); }
        else if (b.rollIn) {
          const sh = S.rimShot; sfx.swish(); b.state = "dead"; b.x = RIMX; b.y = RIMY - 6; b.vx = 0; b.vy = -100;
          const win = S.score[sh.team] + sh.pts >= TO_WIN;
          score(sh.team, sh.pts, win ? "GAME!" : "ROLLED IN!");
          if (!checkEnd()) { S.live = false; setTimeout(() => S && !S.over && resetPossession(1 - sh.team), 900); }
        } else {
          b.state = "loose"; b.vx = -(140 + Math.random() * 200); b.vy = 220; sfx.rim();
          if (S.rimShot && S.rimShot.team === 0) endStreak();
        }
      }
    } else if (b.state === "loose" || b.state === "dead") {
      b.vy -= BGRAV * dt; b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.state === "loose" && b.x > BOARDX - 8 && b.y > RIMY - 10 && b.y < RIMY + 120) { b.x = BOARDX - 8; b.vx = -Math.abs(b.vx) * 0.7; sfx.board(); }
      if (b.x > RIGHT + 30) { b.x = RIGHT + 30; b.vx = -Math.abs(b.vx) * 0.6; }
      if (b.x < LEFT) { b.x = LEFT; b.vx = Math.abs(b.vx) * 0.6; }
      if (b.y <= 12) { b.y = 12; if (Math.abs(b.vy) > 70) { b.vy = -b.vy * 0.58; sfx.bounce(); } else b.vy = 0; b.vx *= 0.9; }
      if (b.state === "loose") {
        for (const q of [h, cpu]) {
          if (q.stun > 0 || q.dunk) continue;
          if (Math.abs(q.x - b.x) < 34 && b.y < q.y + 200) {
            const wasOff = S.off;
            b.state = "held"; b.owner = q.team; q.charging = false;
            if (q.team !== wasOff) { pop("REBOUND", q.x, FLOOR - 210); S.live = false; setTimeout(() => S && !S.over && resetPossession(q.team), 500); }
            else { pop("O-BOARD", q.x, FLOOR - 210); S.sc = SHOT_CLOCK; }
            break;
          }
        }
      }
    }
  }

  function checkEnd() {
    const [a, c] = S.score;
    if ((S.sudden && a !== c) || a >= TO_WIN || c >= TO_WIN) return finish();
    return false;
  }
  function endByClock() {
    const [a, c] = S.score;
    if (a === c) { S.sudden = true; say("Tied! Next bucket wins", 1.5); return; }
    finish();
  }
  function finish() {
    S.over = true; setTimeout(() => sfx.buzzer(), 300);
    const [a, c] = S.score, win = a > c;
    run.results[run.at] = { win, me: a, them: c };
    run.diff += a - c;
    if (win) { setTimeout(() => sfx.win(), 500); run.at++; }
    setTimeout(() => showResult(win), 1600);
    say(win ? "YOU WIN" : "FINAL", 3);
    return true;
  }

  /* ----- render ----- */
  function render() {
    g.save();
    if (S.shake > 0) g.translate((Math.random() - 0.5) * 16 * S.shake / 0.4, (Math.random() - 0.5) * 12 * S.shake / 0.4);
    const tNow = performance.now() / 1000;
    // arena backdrop
    const bg = g.createLinearGradient(0, 0, 0, 300); bg.addColorStop(0, "#0C0618"); bg.addColorStop(1, "#22104A");
    g.fillStyle = bg; g.fillRect(-20, -20, W + 40, 320);
    // spotlights
    g.fillStyle = "rgba(196,181,253,.06)";
    [[180, -0.25], [780, 0.25]].forEach(([x, a]) => { g.save(); g.translate(x, -10); g.rotate(a); g.beginPath(); g.moveTo(-30, 0); g.lineTo(30, 0); g.lineTo(140, 420); g.lineTo(-140, 420); g.fill(); g.restore(); });
    // crowd (3 rows), bounce on cheer
    const crowdCols = ["#5B21B6", "#C4B5FD", S.opp.colors[0]];
    CROWD.forEach(c => {
      const yb = 70 + c.row * 46, j = S.cheer > 0 ? Math.abs(Math.sin(tNow * 12 + c.ph)) * 10 * Math.min(1, S.cheer) : Math.sin(tNow * 2 + c.ph) * 1.5;
      g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(c.x - 16, yb + 6 - j, 32, 30);
      g.fillStyle = crowdCols[c.c]; g.globalAlpha = 0.55; g.beginPath(); g.roundRect(c.x - 15, yb + 4 - j, 30, 28, 8); g.fill();
      g.fillStyle = "#3a2a4a"; g.beginPath(); g.arc(c.x, yb - 8 - j, 11, 0, Math.PI * 2); g.fill();
      if (S.cheer > 0 && c.ph > 3) { g.strokeStyle = "#3a2a4a"; g.lineWidth = 5; g.beginPath(); g.moveTo(c.x - 12, yb + 6 - j); g.lineTo(c.x - 18, yb - 20 - j); g.moveTo(c.x + 12, yb + 6 - j); g.lineTo(c.x + 18, yb - 20 - j); g.stroke(); }
      g.globalAlpha = 1;
    });
    // LED banner
    g.fillStyle = "#000"; g.fillRect(-20, 236, W + 40, 38);
    g.fillStyle = S.flash > 0 ? "#7C3AED" : "#5B21B6"; g.fillRect(-20, 240, W + 40, 30);
    g.fillStyle = "#fff"; g.font = "400 22px Anton, Impact, sans-serif"; g.textAlign = "left";
    const ban = `${(C.slogan || "MAKE THE ALARM WORTH IT.").toUpperCase()}   ★   VOTE ${(C.firstName || "JEREMIAH").toUpperCase()}   ★   BELMONT BALLERS   ★   `;
    const bw = g.measureText(ban).width, off = (tNow * 60) % bw;
    for (let x = -off; x < W; x += bw) g.fillText(ban, x, 263);
    // floor with perspective
    const fl = g.createLinearGradient(0, 274, 0, Hh); fl.addColorStop(0, "#9C6A3A"); fl.addColorStop(1, "#D9A066");
    g.fillStyle = fl; g.fillRect(-20, 274, W + 40, Hh);
    g.strokeStyle = "rgba(90,50,20,.18)"; g.lineWidth = 1;
    for (let i = 0; i < 26; i++) { const y = 274 + i * i * 0.42; g.beginPath(); g.moveTo(-20, y); g.lineTo(W + 20, y); g.stroke(); }
    // paint + arc
    g.fillStyle = "rgba(91,33,182,.55)";
    g.beginPath(); g.moveTo(RIMX - 170, FLOOR + 24); g.lineTo(RIMX + 120, FLOOR + 24); g.lineTo(RIMX + 90, 330); g.lineTo(RIMX - 140, 330); g.closePath(); g.fill();
    g.strokeStyle = "rgba(255,255,255,.85)"; g.lineWidth = 3;
    g.stroke();
    g.beginPath(); g.ellipse(RIMX, 400, ARC, 92, 0, Math.PI * 0.52, Math.PI * 1.48); g.stroke();
    g.beginPath(); g.moveTo(-20, 330); g.lineTo(W + 20, 330); g.stroke();
    // center logo
    g.save(); g.globalAlpha = 0.22; g.fillStyle = "#5B21B6"; g.beginPath(); g.ellipse(170, 400, 120, 40, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#fff"; g.font = "400 34px Anton, Impact, sans-serif"; g.textAlign = "center"; g.fillText("BELMONT", 170, 412); g.restore();
    // stanchion + backboard
    g.fillStyle = "#1b1b1f"; g.beginPath(); g.roundRect(RIMX + 70, FLOOR - 40, 70, 46, 8); g.fill();
    g.fillRect(RIMX + 92, FLOOR - RIMY - 70, 14, RIMY + 40);
    g.fillRect(BOARDX, FLOOR - RIMY - 62, RIMX + 100 - BOARDX, 10);
    g.fillStyle = "rgba(255,255,255,.82)"; g.strokeStyle = "#111"; g.lineWidth = 3;
    g.beginPath(); g.roundRect(BOARDX - 6, FLOOR - RIMY - 110, 14, 150, 4); g.fill(); g.stroke();
    g.fillStyle = "#5B21B6"; g.fillRect(BOARDX - 3, FLOOR - RIMY - 80, 8, 50);
    // rim back
    g.strokeStyle = "#C2410C"; g.lineWidth = 4; g.beginPath(); g.ellipse(RIMX, FLOOR - RIMY, 26, 7, 0, Math.PI, Math.PI * 2); g.stroke();
    // players
    const b = S.ball;
    const order = [...S.p].sort((a, c) => (a.team === S.off) - (c.team === S.off));
    order.forEach(q => {
      const holding = b.state === "held" && b.owner === q.team;
      let pose = "idle";
      if (q.stun > 0) pose = "stun";
      else if (q.dunk) pose = "dunk";
      else if (q.hang > 0) pose = "hang";
      else if (holding && (q.charging || q.y > 0)) pose = "shoot";
      else if (q.y > 0) pose = "jump";
      else if (q.run) pose = "run";
      else if (!holding && b.state === "held" && Math.abs(q.x - S.p[b.owner].x) < 160) pose = "defend";
      // fire aura
      if (q.team === 0 && S.fire) { for (let i = 0; i < 2; i++) S.parts.push({ x: q.x + (Math.random() - 0.5) * 40, y: FLOOR - q.y - Math.random() * 150, vx: 0, vy: -120, life: 0.35, c: Math.random() < 0.5 ? "#F97316" : "#FACC15", r: 3 + Math.random() * 3 }); }
      drawPlayer(g, q.look, q.x, FLOOR - q.y, { face: q.face, jersey: q.jersey, trim: q.trim, num: q.num, run: q.run, pose, hasBall: holding, dribble: holding ? Math.sin(b.dribble) : 0, lift: q.y });
      if (q.stun > 0) { g.fillStyle = "#FACC15"; g.font = "400 22px Anton, Impact, sans-serif"; g.textAlign = "center"; const a = tNow * 8; g.fillText("★", q.x + Math.cos(a) * 26, FLOOR - q.y - 178 + Math.sin(a) * 6); g.fillText("★", q.x + Math.cos(a + 3) * 26, FLOOR - q.y - 178 + Math.sin(a + 3) * 6); }
      if (q.team === 0) { g.fillStyle = S.fire ? "#F97316" : "#C4B5FD"; g.beginPath(); g.moveTo(q.x - 8, FLOOR - q.y - 200); g.lineTo(q.x + 8, FLOOR - q.y - 200); g.lineTo(q.x, FLOOR - q.y - 189); g.fill(); }
      if (q.charging && q.team === 0) {
        const mx = q.x - 50, my = FLOOR - q.y - 222, [w0, w1] = perfectWin(q);
        g.fillStyle = OUT; g.beginPath(); g.roundRect(mx - 4, my - 4, 108, 20, 10); g.fill();
        g.fillStyle = "#3b3247"; g.beginPath(); g.roundRect(mx, my, 100, 12, 6); g.fill();
        g.fillStyle = "#22C55E"; g.fillRect(mx + 100 * w0, my, 100 * (w1 - w0), 12);
        g.fillStyle = "#fff"; g.fillRect(mx + Math.min(100, 100 * q.meter) - 2, my - 5, 4, 22);
      }
    });
    // ball trail + ball
    if (b.state === "air" && b.trail.length) b.trail.forEach(([x, y], i) => { g.globalAlpha = (i / b.trail.length) * (S.fire && S.shot && S.shot.team === 0 ? 0.8 : 0.3); g.fillStyle = S.fire && S.shot && S.shot.team === 0 ? "#F97316" : "#fff"; g.beginPath(); g.arc(x, FLOOR - y, 4 + i * 0.6, 0, Math.PI * 2); g.fill(); });
    g.globalAlpha = 1;
    const behindRim = (b.state === "dead" || b.state === "rim") && Math.abs(b.x - RIMX) < 30;
    const drawBall = () => {
      const by = FLOOR - b.y;
      { g.fillStyle = "rgba(0,0,0,.22)"; g.beginPath(); g.ellipse(b.x, FLOOR + 4, 12 - Math.min(8, b.y / 40), 4, 0, 0, Math.PI * 2); g.fill(); }
      g.save(); g.translate(b.x, by); g.rotate(b.spin);
      g.fillStyle = "#E8742A"; g.strokeStyle = OUT; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 12, 0, Math.PI * 2); g.fill(); g.stroke();
      g.lineWidth = 1.8; g.beginPath(); g.moveTo(-12, 0); g.lineTo(12, 0); g.moveTo(0, -12); g.lineTo(0, 12); g.stroke();
      g.beginPath(); g.arc(-14, 0, 9, -1, 1); g.stroke(); g.beginPath(); g.arc(14, 0, 9, Math.PI - 1, Math.PI + 1); g.stroke();
      g.restore();
    };
    if (behindRim) drawBall();
    // net + rim front
    const sw = S.net > 0 ? Math.sin(S.net * 30) * 5 : 0, st = S.net > 0 ? S.net * 14 : 0;
    g.strokeStyle = "rgba(255,255,255,.95)"; g.lineWidth = 2;
    for (let i = 0; i <= 5; i++) { const x0 = RIMX - 24 + i * 9.6; g.beginPath(); g.moveTo(x0, FLOOR - RIMY + 2); g.quadraticCurveTo(x0 + sw, FLOOR - RIMY + 22 + st, RIMX - 13 + i * 5.2 + sw, FLOOR - RIMY + 40 + st); g.stroke(); }
    for (let r = 1; r <= 2; r++) { g.beginPath(); g.moveTo(RIMX - 22 + r * 3 + sw * r / 2, FLOOR - RIMY + r * 14 + st / 2); g.lineTo(RIMX + 22 - r * 3 + sw * r / 2, FLOOR - RIMY + r * 14 + st / 2); g.stroke(); }
    g.strokeStyle = "#F97316"; g.lineWidth = 5; g.beginPath(); g.ellipse(RIMX, FLOOR - RIMY, 26, 7, 0, 0, Math.PI); g.stroke();
    if (!behindRim) drawBall();
    // particles
    S.parts.forEach(q => { g.globalAlpha = Math.max(0, Math.min(1, q.life * 2)); g.fillStyle = q.c; g.fillRect(q.x - q.r / 2, q.y - q.r / 2, q.r, q.r); });
    g.globalAlpha = 1;
    // jumbotron scoreboard
    g.fillStyle = OUT; g.beginPath(); g.roundRect(W / 2 - 250, 8, 500, 70, 14); g.fill();
    g.fillStyle = "#5B21B6"; g.beginPath(); g.roundRect(W / 2 - 246, 12, 150, 62, 10); g.fill();
    g.fillStyle = S.opp.colors[0]; g.beginPath(); g.roundRect(W / 2 + 96, 12, 150, 62, 10); g.fill();
    g.textAlign = "center"; g.font = "700 13px Archivo, sans-serif";
    g.fillStyle = "#fff"; g.fillText((me.name || "YOU").toUpperCase(), W / 2 - 171, 30);
    g.fillStyle = S.opp.colors[1] === "#111111" || S.opp.colors[1] === "#000000" ? "#fff" : S.opp.colors[1]; g.fillText(S.opp.name.toUpperCase(), W / 2 + 171, 30);
    g.font = "400 34px Anton, Impact, sans-serif"; g.fillStyle = "#fff";
    g.fillText(S.score[0], W / 2 - 171, 66); g.fillStyle = S.opp.colors[1] === "#111111" ? "#fff" : S.opp.colors[1]; g.fillText(S.score[1], W / 2 + 171, 66);
    g.fillStyle = S.clock < 10 ? "#EF4444" : "#FACC15";
    const secs = Math.ceil(S.clock), cl = S.sudden ? "OT" : `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
    g.font = "400 32px Anton, Impact, sans-serif"; g.fillText(cl, W / 2, 50);
    g.font = "700 11px Archivo, sans-serif"; g.fillStyle = "#999"; g.fillText(`FIRST TO ${TO_WIN}`, W / 2, 68);
    if (b.state === "held" && S.sc < 99) { g.fillStyle = S.sc < 4 ? "#EF4444" : "#fff"; g.font = "400 15px Anton, Impact, sans-serif"; g.fillText(`SHOT ${Math.ceil(Math.max(0, S.sc))}`, W / 2, 24); }
    if (S.fire) { g.font = "400 16px Anton, Impact, sans-serif"; g.fillStyle = "#F97316"; g.fillText("🔥 ON FIRE", W / 2 - 171, 92); }
    // pops + message
    S.pops.forEach(q => { g.globalAlpha = Math.max(0, Math.min(1, q.a * 1.5)); g.fillStyle = q.col; g.font = `400 ${q.big ? 40 : 28}px Anton, Impact, sans-serif`; g.textAlign = "center"; g.strokeStyle = OUT; g.lineWidth = 6; g.lineJoin = "round"; g.strokeText(q.t, q.x, q.y); g.fillText(q.t, q.x, q.y); });
    g.globalAlpha = 1;
    if (S.msgT > 0 || S.over) {
      g.font = "400 64px Anton, Impact, sans-serif"; g.textAlign = "center"; g.lineWidth = 10; g.strokeStyle = OUT; g.fillStyle = "#fff"; g.lineJoin = "round";
      g.strokeText(S.msg.toUpperCase(), W / 2, 180); g.fillText(S.msg.toUpperCase(), W / 2, 180);
    }
    if (S.flash > 0) { g.fillStyle = `rgba(255,255,255,${S.flash * 0.5})`; g.fillRect(-20, -20, W + 40, Hh + 40); }
    g.restore();
  }

  /* ----- results + leaderboard ----- */
  function showResult(win) {
    const done = run.at >= OPP.length;
    const r = run.results[run.results.length - 1];
    const wins = run.results.filter(x => x.win).length;
    $("hpResTitle").textContent = done ? "Campus champion!" : win ? `You beat ${OPP[run.at - 1].name}` : `${S.opp.name} got you`;
    $("hpResText").textContent = done
      ? `You ran through all ${OPP.length} schools. Point differential: ${run.diff >= 0 ? "+" : ""}${run.diff}.`
      : win ? `${r.me}–${r.them}. ${OPP[run.at].name} is up next.` : `${r.me}–${r.them}. Your run ends with ${wins} ${wins === 1 ? "win" : "wins"}.`;
    $("hpNext").hidden = !win || done;
    $("hpNext").textContent = win && !done ? `Play ${OPP[run.at].name}` : "";
    $("hpAgain").textContent = done || !win ? "New campus run" : "Start over";
    show("hpResult");
    if (done || !win) { submitScore(wins, run.diff); if (done && window.CAMPAIGN_CONFETTI) window.CAMPAIGN_CONFETTI(140); }
  }
  $("hpNext").addEventListener("click", () => startGame(OPP[run.at]));
  $("hpAgain").addEventListener("click", () => { run = { at: 0, diff: 0, results: [] }; paintPick(); show("hpPick"); });
  $("hpShare").addEventListener("click", async () => {
    const wins = run.results.filter(x => x.win).length;
    const text = `I went ${wins}-${run.results.length - wins} on the Roosevelt campus in Belmont Ballers. Think you can beat me? ${C.slogan || ""}`;
    const url = location.href.split("#")[0] + "#/hoops";
    try { if (navigator.share) await navigator.share({ title: "Belmont Ballers", text, url }); else { await navigator.clipboard.writeText(`${text} ${url}`); toast("Copied. Paste it anywhere."); } } catch {}
  });
  $("hpQuit").addEventListener("click", () => { if (!S) return; S.over = true; cancelAnimationFrame(raf); paintPick(); show("hpPick"); });

  // leaderboard: live (Firebase) when connected, otherwise this device only
  const scoreVal = (w, d) => w * 1000 + Math.max(-99, Math.min(99, d)) + 100;
  const localBoard = () => store.get("hoopsBoard") || [];
  function submitScore(wins, diff) {
    const entry = { name: me.name, wins, diff: Math.max(-99, Math.min(99, diff)) };
    const lb = localBoard().filter(e => e.name !== entry.name || scoreVal(e.wins, e.diff) > scoreVal(wins, diff));
    if (!lb.find(e => e.name === entry.name)) lb.push(entry);
    lb.sort((a, c) => scoreVal(c.wins, c.diff) - scoreVal(a.wins, a.diff));
    store.set("hoopsBoard", lb.slice(0, 20));
    if (window.CAMPAIGN_HOOPS && window.CAMPAIGN_HOOPS.submit) window.CAMPAIGN_HOOPS.submit(entry).catch(() => toast("Leaderboard didn't save. Try again later."));
    else paintBoard(localBoard(), false);
  }
  function paintBoard(list, live) {
    $("hpBoardNote").textContent = live ? "Live for everyone. Best campus run per player." : "Scores on this device. The school-wide board turns on when the site's live features are connected.";
    $("hpBoard").innerHTML = list.length ? list.slice(0, 10).map((e, i) =>
      `<li${e.name === me.name ? ' class="mine"' : ""}><b>${i + 1}</b><span class="nm">${esc(e.name)}</span><span class="w">${e.wins}/${OPP.length} schools</span><span class="d">${e.diff >= 0 ? "+" : ""}${e.diff}</span></li>`).join("")
      : `<li class="empty-row">No runs yet. Be the first name up here.</li>`;
  }
  window.HOOPS_paintBoard = list => paintBoard(list.sort((a, c) => scoreVal(c.wins, c.diff) - scoreVal(a.wins, a.diff)), true);
  paintBoard(localBoard(), false);

  if (okName(cleanName(me.name))) { paintPick(); show("hpPick"); } else show("hpCreate");
})();
