/* =====================================================================
   BELMONT BALLERS: 1v1 basketball against the Roosevelt campus schools.
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

  /* ---------------- player look ---------------- */
  const SKIN = ["#F6D3B3", "#E7B48F", "#C68E62", "#A0663F", "#7A4A2A", "#4E2E1B"];
  const HAIR = [["bald", "Bald"], ["fade", "Fade"], ["afro", "Afro"], ["locs", "Locs"], ["braids", "Braids"], ["durag", "Durag"], ["curly", "Curls"]];
  const HAIRCOL = ["#111111", "#4A2C17", "#C9A227", "#7C3AED"];
  const SHOES = ["#5B21B6", "#FFFFFF", "#111111", "#C4B5FD", "#EF4444"];
  const BAD = /(fuck|shit|bitch|nigg|fag|cunt|dick|pussy|whore|slut|hoe\b|retard|nazi|kkk|sex|porn|cock|penis|vagina|ass\b|asshole|damn|bastard|rape)/i;
  const cleanName = s => String(s || "").replace(/[^A-Za-z0-9 ._-]/g, "").trim().slice(0, 12);
  const okName = s => s.length >= 2 && !BAD.test(s.replace(/[\s._-]/g, ""));

  let me = Object.assign({ name: "", skin: 2, hair: "fade", hairCol: 0, num: 7, shoes: 0 }, store.get("baller") || {});

  /* ---------------- drawing a player ---------------- */
  function drawPlayer(g, look, x, footY, o) {
    // o: { face, jersey, trim, run, jump, dribble, armUp, scale, num }
    const s = o.scale || 1, f = o.face || 1;
    g.save(); g.translate(x, footY); g.scale(s * f, s);
    const skin = SKIN[look.skin] || SKIN[2], hc = HAIRCOL[look.hairCol] || "#111";
    const ph = o.run || 0, air = o.jump;
    const legA = air ? 0.5 : Math.sin(ph) * 0.6, legB = air ? -0.2 : -Math.sin(ph) * 0.6;
    // legs
    g.lineCap = "round"; g.lineWidth = 9; g.strokeStyle = skin;
    const hip = -52;
    g.beginPath(); g.moveTo(-6, hip); g.lineTo(-6 + Math.sin(legA) * 26, hip + Math.cos(legA) * 44); g.stroke();
    g.beginPath(); g.moveTo(6, hip); g.lineTo(6 + Math.sin(legB) * 26, hip + Math.cos(legB) * 44); g.stroke();
    // shoes
    g.fillStyle = SHOES[look.shoes] || "#5B21B6"; g.strokeStyle = "#000"; g.lineWidth = 2;
    [[-6 + Math.sin(legA) * 26, hip + Math.cos(legA) * 44], [6 + Math.sin(legB) * 26, hip + Math.cos(legB) * 44]].forEach(([sx, sy]) => {
      g.beginPath(); g.roundRect(sx - 6, sy - 4, 17, 9, 4); g.fill(); g.stroke();
    });
    // shorts
    g.fillStyle = o.trim; g.beginPath(); g.roundRect(-16, hip - 6, 32, 24, 5); g.fill();
    g.fillStyle = o.jersey; g.fillRect(-16, hip + 12, 32, 4);
    // jersey
    g.fillStyle = o.jersey; g.strokeStyle = o.trim; g.lineWidth = 3;
    g.beginPath(); g.roundRect(-18, -100, 36, 50, 8); g.fill(); g.stroke();
    g.save(); g.scale(f, 1); g.fillStyle = o.trim; g.font = "400 22px Anton, Impact, sans-serif"; g.textAlign = "center";
    g.fillText(String(o.num ?? look.num ?? ""), 0, -66); g.restore();
    // arms
    g.lineWidth = 8; g.strokeStyle = skin;
    const sh = -94;
    if (o.armUp) {
      g.beginPath(); g.moveTo(10, sh); g.lineTo(18, sh - 42); g.stroke();
      g.beginPath(); g.moveTo(-10, sh); g.lineTo(-2, sh - 44); g.stroke();
    } else {
      const d = o.dribble || 0;
      g.beginPath(); g.moveTo(12, sh); g.lineTo(26, sh + 26 + d * 6); g.stroke();
      g.beginPath(); g.moveTo(-12, sh); g.lineTo(-20 + Math.sin(ph) * 6, sh + 34); g.stroke();
    }
    // neck + head
    g.fillStyle = skin; g.fillRect(-4, -110, 8, 12);
    g.beginPath(); g.arc(0, -124, 15, 0, Math.PI * 2); g.fill();
    // hair
    g.fillStyle = hc; g.strokeStyle = hc;
    switch (look.hair) {
      case "fade": g.beginPath(); g.arc(0, -126, 15.5, Math.PI * 1.05, Math.PI * 1.95); g.fill(); break;
      case "afro": g.beginPath(); g.arc(0, -132, 22, Math.PI * 0.85, Math.PI * 2.15); g.fill(); break;
      case "curly": for (let i = -2; i <= 2; i++) { g.beginPath(); g.arc(i * 6, -138 + Math.abs(i) * 2, 7, 0, Math.PI * 2); g.fill(); } break;
      case "locs":
        g.beginPath(); g.arc(0, -127, 16, Math.PI, Math.PI * 2); g.fill();
        g.lineWidth = 4; for (let i = -3; i <= 1; i++) { g.beginPath(); g.moveTo(i * 4 - 4, -128); g.lineTo(i * 5 - 8, -100); g.stroke(); }
        break;
      case "braids":
        g.beginPath(); g.arc(0, -126, 15.5, Math.PI, Math.PI * 2); g.fill();
        g.lineWidth = 2; g.strokeStyle = "rgba(255,255,255,.25)";
        for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 5, -140); g.lineTo(i * 6, -126); g.stroke(); }
        break;
      case "durag":
        g.fillStyle = HAIRCOL[look.hairCol] === "#111111" ? "#111" : hc;
        g.beginPath(); g.arc(0, -126, 16, Math.PI * 0.95, Math.PI * 2.05); g.fill();
        g.beginPath(); g.moveTo(-14, -124); g.quadraticCurveTo(-26, -112, -22, -98); g.lineTo(-16, -100); g.quadraticCurveTo(-18, -112, -10, -120); g.fill();
        break;
    }
    // eye
    g.fillStyle = "#000"; g.beginPath(); g.arc(7, -125, 2, 0, Math.PI * 2); g.fill();
    g.restore();
  }

  /* ---------------- sound ---------------- */
  let actx = null;
  const tone = (freq, dur, vol = 0.06, type = "sine", slide) => {
    if (C.alarmSound === false) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
      const t = actx.currentTime + 0.005, o = actx.createOscillator(), gn = actx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
      gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(0.0008, t + dur);
      o.connect(gn); gn.connect(actx.destination); o.start(t); o.stop(t + dur + 0.02);
    } catch {}
  };
  const sfx = {
    bounce: () => tone(120, 0.08, 0.09, "sine", 60),
    swish: () => { tone(900, 0.18, 0.03, "triangle", 300); },
    rim: () => tone(520, 0.15, 0.05, "square", 380),
    buzzer: () => tone(220, 0.7, 0.07, "sawtooth"),
    whoosh: () => tone(300, 0.12, 0.03, "triangle", 900),
    win: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.18, 0.06, "square"), i * 120)),
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
    pg.clearRect(0, 0, pv.width, pv.height);
    pg.fillStyle = "#1E0B3D"; pg.fillRect(0, 0, pv.width, pv.height);
    pg.fillStyle = "#2E1065"; pg.fillRect(0, pv.height - 60, pv.width, 60);
    drawPlayer(pg, me, pv.width / 2, pv.height - 34, { jersey: "#5B21B6", trim: "#FFFFFF", scale: 1.8, num: me.num, run: 0 });
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
  const W = 960, Hh = 540, FLOOR = 470, RIMX = 852, RIMY = 300, ARC = 330, LEFT = 40, RIGHT = 880;
  const GRAV = 1500, BGRAV = 980;
  let S = null, raf = 0, last = 0;
  const keys = {};
  const pads = { left: false, right: false };

  function mkPlayer(team, x, look, jersey, trim, num) {
    return { team, x, y: 0, vy: 0, face: 1, look, jersey, trim, num, run: 0, stun: 0, dash: 0, dashDir: 1, cd: 0, stealCd: 0, charging: false, meter: 0, shotTaken: false };
  }

  function startGame(opp) {
    const L = opp.level;
    const cpuLook = { skin: Math.floor(Math.random() * SKIN.length), hair: HAIR[1 + Math.floor(Math.random() * (HAIR.length - 1))][0], hairCol: Math.random() < 0.8 ? 0 : 1, shoes: 2, num: 1 + Math.floor(Math.random() * 30) };
    S = {
      opp, L,
      ai: { speed: 190 + 70 * L, shootSd: 0.2 - 0.12 * L, react: 0.35 - 0.22 * L, steal: 0.12 + 0.2 * L, block: 0.25 + 0.35 * L, ankle: 0.6 - 0.3 * L, aggress: 0.4 + 0.5 * L },
      p: [mkPlayer(0, 0, me, "#5B21B6", "#FFFFFF", me.num), mkPlayer(1, 0, cpuLook, opp.colors[0], opp.colors[1], cpuLook.num)],
      ball: { state: "held", owner: 0, x: 0, y: 0, vx: 0, vy: 0, dribble: 0 },
      off: 0, score: [0, 0], clock: GAME_SECS, live: false, pause: 0.9, msg: "", msgT: 0, over: false, sudden: false,
      pops: [], aiT: 0, aiPlan: null, shot: null, net: 0, sc: H.shotClock || 12,
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
    o.x = 430; d.x = 640; o.y = d.y = 0; o.vy = d.vy = 0; o.face = 1; d.face = -1;
    [o, d].forEach(q => { q.stun = 0; q.dash = 0; q.charging = false; q.meter = 0; q.shotTaken = false; });
    S.ball.state = "held"; S.ball.owner = team; S.shot = null; S.sc = H.shotClock || 12;
    S.live = false; S.pause = first ? 1.1 : 0.8;
    say(first ? `vs ${S.opp.name}` : team === 0 ? "Your ball" : `${S.opp.name} ball`, 0.9);
    setLabels();
  }

  function say(t, d = 0.9) { S.msg = t; S.msgT = d; }
  function pop(t, x, y, col = "#fff") { S.pops.push({ t, x, y, a: 1, col }); }

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
    if (h.stun > 0 || h.y > 0) return;
    if (humanHasBall()) { h.vy = 560; h.charging = true; h.meter = 0; h.shotTaken = false; }
    else { h.vy = 600; }
  }
  function releaseShoot() { if (S && human().charging) shoot(human(), human().meter); }
  function pressAction() {
    if (!S || !S.live || S.over) return; const h = human();
    if (h.stun > 0) return;
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
    b.addEventListener("pointerdown", e => { e.preventDefault(); b.setPointerCapture(e.pointerId); b.classList.add("on"); down(); });
    const end = e => { if (!b.classList.contains("on")) return; b.classList.remove("on"); up && up(); };
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
    o.cd = 1.1; o.dash = 0.28; o.dashDir = o.face; sfx.whoosh();
    const close = Math.abs(d.x - o.x) < 85 && d.y < 20 && d.stun <= 0;
    const chance = o.team === 0 ? S.ai.ankle : 0.25 + 0.25 * S.L;
    if (close && Math.random() < chance) { d.stun = 0.75; pop(o.team === 0 ? "ANKLES!" : "CROSSED!", d.x, FLOOR - 150, "#C4B5FD"); }
  }
  function tryStealBy(d, o, p) {
    if (d.stealCd > 0 || !(S.ball.state === "held" && S.ball.owner === o.team)) return;
    d.stealCd = 0.9;
    const close = Math.abs(d.x - o.x) < 55 && o.y < 10 && !o.charging;
    if (close && Math.random() < p) {
      S.ball.owner = d.team; pop("STOLEN!", d.x, FLOOR - 150, "#FACC15"); sfx.whoosh();
      S.live = false; S.pause = 0.6; setTimeout(() => S && !S.over && resetPossession(d.team), 600);
    } else if (!close || Math.random() < 0.5) { d.stun = 0.3; }
  }
  function shotChance(o, d, q) {
    const dist = Math.abs(RIMX - o.x);
    let base = dist < 90 ? 0.88 : dist < 140 ? 0.74 : dist <= ARC ? 0.62 - (dist - 140) * 0.0007 : Math.max(0.04, 0.44 - (dist - ARC) * 0.0009);
    let p = base * (0.35 + 0.65 * q);
    const contest = Math.abs(d.x - o.x) < 70 && d.stun <= 0 && ((RIMX - o.x) * (d.x - o.x) > 0 || Math.abs(d.x - o.x) < 30);
    if (contest) p *= d.y > 25 ? 0.45 : 0.68;
    if (q > 0.97 && !contest) p = Math.min(0.97, p + 0.12);
    return { p, dist, contest };
  }
  function shoot(o, m) {
    if (!o.charging || o.shotTaken) return;
    o.charging = false; o.shotTaken = true;
    const d = S.p[1 - o.team];
    const q = Math.max(0, 1 - Math.min(1, Math.abs(m - 0.81) * 2.6)) ** 0.8;
    const { p, dist, contest } = shotChance(o, d, q);
    // block?
    const blockable = Math.abs(d.x - o.x) < 58 && d.y > 30 && d.stun <= 0;
    const blockP = d.team === 0 ? 0.62 : S.ai.block;
    const b = S.ball;
    b.state = "air"; b.owner = -1; b.x = o.x + o.face * 18; b.y = o.y + 130;
    if (blockable && Math.random() < blockP) {
      b.vx = (o.x < d.x ? -1 : 1) * (220 + Math.random() * 120); b.vy = 260; b.state = "loose";
      pop("BLOCKED!", d.x, FLOOR - 190, "#EF4444"); sfx.rim(); S.shot = null; return;
    }
    const make = Math.random() < p;
    const pts = dist > ARC ? 3 : 2;
    const tx = make ? RIMX : RIMX + (Math.random() < 0.5 ? -1 : 1) * (14 + Math.random() * 12);
    const T = 0.55 + dist / 1500;
    b.vx = (tx - b.x) / T; b.vy = (RIMY + 6 - b.y + 0.5 * BGRAV * T * T) / T;
    S.shot = { team: o.team, make, pts, T, t: 0, perfect: q > 0.97, dunk: dist < 70 && make };
    if (o.team === 0) {
      const lbl = q > 0.97 ? "PERFECT" : q > 0.75 ? "GOOD" : q > 0.4 ? "OK" : "LATE";
      pop(lbl, o.x, FLOOR - o.y - 175, q > 0.97 ? "#22C55E" : q > 0.75 ? "#C4B5FD" : "#fff");
    }
    if (contest && o.team === 0 && q > 0.75) pop("CONTESTED", o.x, FLOOR - o.y - 200, "#FACC15");
  }

  /* ----- AI ----- */
  function aiOffense(o, d, dt) {
    const A = S.ai;
    if (o.stun > 0) return 0;
    S.aiT -= dt;
    const dist = RIMX - o.x;
    const gap = d.x - o.x;
    if (!o.charging && o.y === 0 && S.aiT <= 0) {
      S.aiT = A.react + Math.random() * 0.35;
      const open = Math.abs(gap) > 75 || d.stun > 0 || gap < 0;
      if (dist < 90) { startCpuShot(o); return 0; }
      if (open && dist < ARC + 40 && Math.random() < 0.55 + 0.3 * S.L) { startCpuShot(o); return 0; }
      if (open && dist > ARC && dist < ARC + 120 && Math.random() < 0.2 + 0.15 * S.L) { startCpuShot(o); return 0; }
      if (!open && gap > 0 && gap < 90 && o.cd <= 0 && Math.random() < A.aggress) { crossover(o, d); }
      if (!open && Math.random() < 0.18) { S.aiPlan = { back: 0.35 }; }
    }
    if (o.charging) return 0;
    if (S.aiPlan && S.aiPlan.back > 0) { S.aiPlan.back -= dt; return -1; }
    return dist > 40 ? 1 : 0;
  }
  function startCpuShot(o) {
    o.vy = 560; o.charging = true; o.meter = 0; o.shotTaken = false;
    o.target = Math.max(0.3, Math.min(1.15, 0.81 + (Math.random() * 2 - 1) * S.ai.shootSd * 1.6));
  }
  function aiDefense(d, o, dt) {
    const A = S.ai;
    if (d.stun > 0) return 0;
    const want = o.x + 52;
    const dx = want - d.x;
    if (o.charging && Math.abs(o.x - d.x) < 90 && d.y === 0 && Math.random() < A.block * dt * 14) d.vy = 600;
    if (Math.abs(o.x - d.x) < 55 && Math.random() < A.steal * dt * 1.4) tryStealBy(d, o, 0.32 + 0.15 * S.L);
    return Math.abs(dx) < 6 ? 0 : Math.sign(dx);
  }
  function aiLoose(q) {
    const b = S.ball; const dx = b.x - q.x;
    if (Math.abs(dx) < 40 && b.y > 120 && b.y < 230 && q.y === 0 && Math.random() < 0.08) q.vy = 600;
    return Math.abs(dx) < 8 ? 0 : Math.sign(dx);
  }

  /* ----- loop ----- */
  function loop(t) {
    raf = requestAnimationFrame(loop);
    const page = $("page-hoops");
    if (!page || !page.classList.contains("active")) { last = 0; return; }
    const dt = Math.min(0.033, last ? (t - last) / 1000 : 0); last = t;
    if (S) { update(dt); render(); }
  }

  function update(dt) {
    const p = S.p, b = S.ball, h = p[0], cpu = p[1];
    S.msgT -= dt; S.pops.forEach(q => { q.y -= 40 * dt; q.a -= dt * 1.1; }); S.pops = S.pops.filter(q => q.a > 0);
    if (S.net > 0) S.net -= dt;
    if (S.over) return;
    if (!S.live) { S.pause -= dt; if (S.pause <= 0) S.live = true; }
    if (S.live && S.ball.state !== "dead") {
      S.clock = Math.max(0, S.clock - dt);
      if (S.clock === 0 && !S.sudden && b.state === "held") return endByClock();
      if (b.state === "held" && !p[b.owner].charging && p[b.owner].y === 0) {
        S.sc -= dt;
        if (S.sc <= 0) { const to = 1 - b.owner; pop("SHOT CLOCK", W / 2, 200, "#EF4444"); sfx.buzzer(); S.live = false; S.sc = 99; setTimeout(() => S && !S.over && resetPossession(to), 700); return; }
      }
    }
    // movement intents
    let ih = 0, ic = 0;
    if (S.live) {
      ih = (keys.r || pads.right ? 1 : 0) - (keys.l || pads.left ? 1 : 0);
      if (b.state === "held") {
        if (S.off === 1) ic = aiOffense(cpu, h, dt); else ic = aiDefense(cpu, h, dt);
      } else if (b.state === "loose") ic = aiLoose(cpu);
      else if (b.state === "air") { const tx = RIMX - 110; ic = Math.abs(tx - cpu.x) < 10 ? 0 : Math.sign(tx - cpu.x); }
    }
    [[h, ih, 290], [cpu, ic, S.ai.speed]].forEach(([q, dir, sp]) => {
      q.cd -= dt; q.stealCd -= dt; if (q.stun > 0) { q.stun -= dt; dir = 0; }
      let v = dir * sp;
      if (q.dash > 0) { q.dash -= dt; v = q.dashDir * sp * 2.3; }
      if (q.charging) v *= 0.25;
      q.x = Math.max(LEFT, Math.min(RIGHT - 10, q.x + v * dt));
      const holder = b.state === "held" && b.owner === q.team;
      if (q.charging) q.face = 1;
      else if (dir) q.face = dir;
      else if (!holder && q.dash <= 0) q.face = b.x > q.x ? 1 : -1;
      q.run = dir || q.dash > 0 ? q.run + dt * 14 : 0;
      // jump
      if (q.y > 0 || q.vy > 0) { q.vy -= GRAV * dt; q.y += q.vy * dt; if (q.y <= 0) { q.y = 0; q.vy = 0; if (q.charging) shoot(q, q.meter); } }
      if (q.charging) {
        q.meter += dt / 0.55;
        if (q.team === 1 && q.meter >= q.target) shoot(q, q.meter);
        if (q.meter > 1.35) shoot(q, q.meter);
      }
    });
    // keep players from overlapping too much
    if (Math.abs(h.x - cpu.x) < 26 && h.y < 40 && cpu.y < 40) {
      const push = (26 - Math.abs(h.x - cpu.x)) / 2 * Math.sign(h.x - cpu.x || 1);
      h.x += push; cpu.x -= push;
    }
    // ball
    if (b.state === "held") {
      const o = p[b.owner];
      b.dribble += dt * (o.run ? 9 : 6);
      if (o.charging || o.y > 0) { b.x = o.x + o.face * 10; b.y = o.y + 140; }
      else { b.x = o.x + o.face * 26; b.y = 14 + Math.abs(Math.sin(b.dribble)) * 44; if (Math.abs(Math.sin(b.dribble)) < 0.08 && !b._b) { sfx.bounce(); b._b = 1; } else if (Math.abs(Math.sin(b.dribble)) > 0.3) b._b = 0; }
    } else if (b.state === "air") {
      const sh = S.shot;
      b.vy -= BGRAV * dt; b.x += b.vx * dt; b.y += b.vy * dt; sh.t += dt;
      if (sh.t >= sh.T) {
        if (sh.make) {
          S.score[sh.team] += sh.pts; S.net = 0.5; sfx.swish();
          pop(sh.dunk ? "SLAM!" : sh.pts === 3 ? "THREE!" : sh.perfect ? "SWISH!" : "BUCKET", RIMX - 30, FLOOR - RIMY - 40, sh.team === 0 ? "#C4B5FD" : S.opp.colors[0]);
          b.state = "dead"; b.x = RIMX; b.y = RIMY - 10; b.vx = 0; b.vy = -80;
          if (checkEnd()) return;
          S.live = false; setTimeout(() => S && !S.over && resetPossession(1 - sh.team), 900);
        } else {
          sfx.rim(); b.state = "loose"; b.vx = -(120 + Math.random() * 260); b.vy = 240 + Math.random() * 220;
          if (b.x > RIMX) b.vx *= 0.7;
        }
        S.shot = null;
      }
    } else if (b.state === "loose" || b.state === "dead") {
      b.vy -= BGRAV * dt; b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.x > RIGHT + 10) { b.x = RIGHT + 10; b.vx = -Math.abs(b.vx) * 0.6; }
      if (b.x < LEFT) { b.x = LEFT; b.vx = Math.abs(b.vx) * 0.6; }
      if (b.y <= 10) { b.y = 10; if (Math.abs(b.vy) > 60) { b.vy = -b.vy * 0.55; sfx.bounce(); } else b.vy = 0; b.vx *= 0.92; }
      if (b.state === "loose") {
        for (const q of [h, cpu]) {
          if (q.stun > 0) continue;
          if (Math.abs(q.x - b.x) < 30 && b.y < q.y + 150) {
            const wasOff = S.off;
            b.state = "held"; b.owner = q.team; q.charging = false;
            if (q.team !== wasOff) { pop("REBOUND", q.x, FLOOR - 170); S.live = false; setTimeout(() => S && !S.over && resetPossession(q.team), 500); }
            else { pop("O-BOARD", q.x, FLOOR - 170); S.sc = H.shotClock || 12; }
            break;
          }
        }
      }
    }
  }

  function checkEnd() {
    const [a, c] = S.score;
    if (S.sudden && a !== c) return finish();
    if (a >= TO_WIN || c >= TO_WIN) return finish();
    return false;
  }
  function endByClock() {
    const [a, c] = S.score;
    if (a === c) { S.sudden = true; say("Tied! Next bucket wins", 1.5); return; }
    finish();
  }
  function finish() {
    S.over = true; sfx.buzzer();
    const [a, c] = S.score, win = a > c;
    run.results[run.at] = { win, me: a, them: c };
    run.diff += a - c;
    if (win) { sfx.win(); run.at++; }
    setTimeout(() => showResult(win), 1100);
    say(win ? "YOU WIN" : "FINAL", 2);
    return true;
  }

  /* ----- render ----- */
  function render() {
    // gym
    const grd = g.createLinearGradient(0, 0, 0, Hh); grd.addColorStop(0, "#160A2E"); grd.addColorStop(0.62, "#2A1458"); grd.addColorStop(0.62, "#C9925B"); grd.addColorStop(1, "#A8743F");
    g.fillStyle = grd; g.fillRect(0, 0, W, Hh);
    // crowd dots
    g.fillStyle = "rgba(196,181,253,.10)"; for (let i = 0; i < 60; i++) { g.beginPath(); g.arc((i * 97) % W, 40 + ((i * 53) % 150), 10, 0, Math.PI * 2); g.fill(); }
    // banner
    g.fillStyle = "#5B21B6"; g.fillRect(0, 222, W, 32);
    g.fillStyle = "#fff"; g.font = "400 22px Anton, Impact, sans-serif"; g.textAlign = "left";
    const ban = `${(C.slogan || "MAKE THE ALARM WORTH IT.").toUpperCase()}   ★   VOTE ${(C.firstName || "JEREMIAH").toUpperCase()}   ★   `;
    const off = (performance.now() / 30) % g.measureText(ban).width;
    for (let x = -off; x < W; x += g.measureText(ban).width) g.fillText(ban, x, 246);
    // floor lines
    g.strokeStyle = "rgba(255,255,255,.85)"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(0, FLOOR + 2); g.lineTo(W, FLOOR + 2); g.stroke();
    g.beginPath(); g.moveTo(RIMX - ARC, FLOOR - 4); g.lineTo(RIMX - ARC, FLOOR + 50); g.stroke();
    g.fillStyle = "rgba(91,33,182,.35)"; g.fillRect(RIMX - 150, FLOOR + 3, 150 + 60, 60);
    g.fillStyle = "rgba(255,255,255,.5)"; g.font = "600 13px Archivo, sans-serif"; g.textAlign = "center"; g.fillText("3PT", RIMX - ARC, FLOOR + 66);
    // pole + backboard
    g.fillStyle = "#222"; g.fillRect(RIMX + 52, FLOOR - RIMY - 90, 10, RIMY + 90);
    g.fillStyle = "rgba(255,255,255,.92)"; g.fillRect(RIMX + 30, FLOOR - RIMY - 95, 10, 120);
    g.strokeStyle = "#5B21B6"; g.lineWidth = 3; g.strokeRect(RIMX + 30, FLOOR - RIMY - 95, 10, 120);
    g.fillStyle = "#333"; g.fillRect(RIMX + 22, FLOOR - RIMY - 2, 10, 5);
    // players (defender behind if needed)
    const b = S.ball;
    const order = [...S.p].sort((a, c) => a.team === S.off ? 1 : -1);
    order.forEach(q => {
      const holding = b.state === "held" && b.owner === q.team;
      drawPlayer(g, q.look, q.x, FLOOR - q.y, {
        face: q.face, jersey: q.jersey, trim: q.trim, num: q.num, run: q.run, jump: q.y > 0,
        armUp: (holding && (q.charging || q.y > 0)) || (!holding && q.y > 20), dribble: holding ? Math.sin(b.dribble) : 0, scale: 1,
      });
      if (q.stun > 0) { g.fillStyle = "#FACC15"; g.font = "400 22px Anton, Impact, sans-serif"; g.textAlign = "center"; g.fillText("✦ ✦", q.x, FLOOR - q.y - 152); }
      if (q.team === 0) { g.fillStyle = "#C4B5FD"; g.beginPath(); g.moveTo(q.x - 7, FLOOR - q.y - 168); g.lineTo(q.x + 7, FLOOR - q.y - 168); g.lineTo(q.x, FLOOR - q.y - 158); g.fill(); }
      if (q.charging && q.team === 0) {
        const mx = q.x - 40, my = FLOOR - q.y - 190;
        g.fillStyle = "#000"; g.fillRect(mx - 2, my - 2, 84, 14);
        g.fillStyle = "#333"; g.fillRect(mx, my, 80, 10);
        g.fillStyle = "#22C55E"; g.fillRect(mx + 80 * 0.72, my, 80 * 0.18, 10);
        g.fillStyle = "#fff"; g.fillRect(mx + Math.min(80, 80 * q.meter) - 2, my - 4, 4, 18);
      }
    });
    // rim front + net
    g.strokeStyle = "#F97316"; g.lineWidth = 5; g.beginPath(); g.moveTo(RIMX - 24, FLOOR - RIMY); g.lineTo(RIMX + 24, FLOOR - RIMY); g.stroke();
    g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = 2;
    const sw = S.net > 0 ? Math.sin(S.net * 30) * 4 : 0;
    for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(RIMX - 22 + i * 11, FLOOR - RIMY + 2); g.lineTo(RIMX - 14 + i * 7 + sw, FLOOR - RIMY + 36); g.stroke(); }
    g.beginPath(); g.moveTo(RIMX - 16 + sw, FLOOR - RIMY + 22); g.lineTo(RIMX + 16 + sw, FLOOR - RIMY + 22); g.stroke();
    // ball
    const by = FLOOR - b.y;
    g.fillStyle = "rgba(0,0,0,.25)"; g.beginPath(); g.ellipse(b.x, FLOOR + 4, 12, 4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#E8742A"; g.beginPath(); g.arc(b.x, by, 11, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#5A2A0C"; g.lineWidth = 1.6; g.beginPath(); g.arc(b.x, by, 11, 0, Math.PI * 2); g.moveTo(b.x - 11, by); g.lineTo(b.x + 11, by); g.moveTo(b.x, by - 11); g.lineTo(b.x, by + 11); g.stroke();
    // scoreboard
    g.fillStyle = "rgba(0,0,0,.85)"; g.beginPath(); g.roundRect(W / 2 - 220, 12, 440, 62, 14); g.fill();
    g.textAlign = "center"; g.font = "600 14px Archivo, sans-serif"; g.fillStyle = "#C4B5FD";
    g.fillText((me.name || "YOU").toUpperCase(), W / 2 - 140, 34); g.fillStyle = "#ddd"; g.fillText(S.opp.name.toUpperCase(), W / 2 + 140, 34);
    g.font = "400 34px Anton, Impact, sans-serif"; g.fillStyle = "#fff";
    g.fillText(S.score[0], W / 2 - 140, 68); g.fillText(S.score[1], W / 2 + 140, 68);
    g.fillStyle = S.clock < 10 ? "#EF4444" : "#FACC15";
    const cl = S.sudden ? "OT" : `${Math.floor(S.clock / 60)}:${String(Math.ceil(S.clock % 60) === 60 ? 0 : Math.floor(S.clock % 60)).padStart(2, "0")}`;
    g.fillText(cl, W / 2, 56);
    g.fillStyle = "#5B21B6"; g.fillRect(W / 2 - 200, 66, 8, 6); g.fillStyle = S.opp.colors[0]; g.fillRect(W / 2 + 192, 66, 8, 6);
    g.font = "600 11px Archivo, sans-serif"; g.fillStyle = "#aaa"; g.fillText(`FIRST TO ${TO_WIN}`, W / 2, 70);
    if (S.ball.state === "held" && S.sc < 99) { g.fillStyle = S.sc < 4 ? "#EF4444" : "#fff"; g.font = "400 18px Anton, Impact, sans-serif"; g.fillText(Math.ceil(Math.max(0, S.sc)), W / 2, 30); }
    // pops + message
    S.pops.forEach(q => { g.globalAlpha = Math.max(0, q.a); g.fillStyle = q.col; g.font = "400 30px Anton, Impact, sans-serif"; g.textAlign = "center"; g.strokeStyle = "#000"; g.lineWidth = 5; g.strokeText(q.t, q.x, q.y); g.fillText(q.t, q.x, q.y); });
    g.globalAlpha = 1;
    if (S.msgT > 0 || S.over) {
      g.font = "400 56px Anton, Impact, sans-serif"; g.textAlign = "center"; g.lineWidth = 8; g.strokeStyle = "#000"; g.fillStyle = "#fff";
      g.strokeText(S.msg.toUpperCase(), W / 2, 170); g.fillText(S.msg.toUpperCase(), W / 2, 170);
    }
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
    if (done || !win) { submitScore(wins, run.diff); if (done) window.CAMPAIGN_CONFETTI && window.CAMPAIGN_CONFETTI(140); }
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
  function localBoard() { return store.get("hoopsBoard") || []; }
  function submitScore(wins, diff) {
    const entry = { name: me.name, wins, diff: Math.max(-99, Math.min(99, diff)), skin: me.skin };
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

  // start on the right screen
  if (okName(cleanName(me.name))) { paintPick(); show("hpPick"); } else show("hpCreate");
})();
