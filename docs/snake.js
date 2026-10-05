/* =====================================================================
   SNOOZE SNAKE: eat alarm clocks, grow, don't crash.
   Daily + all-time leaderboards, combos, golden clocks, unlockable skins.
   ===================================================================== */
(function () {
  const C = window.CONFIG || {};
  const $ = id => document.getElementById(id);
  if (!$("snake")) return;
  const CAMP = window.CAMPAIGN || {};
  const toast = CAMP.toast || (t => alert(t));
  const esc = CAMP.esc || (s => String(s));
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  const BAD = /(fuck|shit|bitch|nigg|fag|cunt|dick|pussy|whore|slut|hoe\b|retard|nazi|kkk|sex|porn|cock|penis|vagina|ass\b|asshole|damn|bastard|rape)/i;
  const cleanName = s => String(s || "").replace(/[^A-Za-z0-9 ._-]/g, "").trim().slice(0, 12);
  const okName = s => s.length >= 2 && !BAD.test(s.replace(/[\s._-]/g, ""));
  const today = () => new Date().toLocaleDateString("en-CA");

  /* ---------------- skins ---------------- */
  const SKINS = [
    { id: "classic", name: "Belmont", need: 0, a: "#5B21B6", b: "#7C3AED" },
    { id: "lilac", name: "Lilac", need: 10, a: "#A78BFA", b: "#C4B5FD" },
    { id: "midnight", name: "Midnight", need: 20, a: "#111111", b: "#3F3F46" },
    { id: "gold", name: "Gold", need: 35, a: "#B8860B", b: "#FACC15" },
    { id: "fire", name: "Fire", need: 50, a: "#DC2626", b: "#F97316" },
    { id: "rainbow", name: "Wake Up", need: 75, rainbow: true },
  ];
  let prof = Object.assign({ name: "", best: 0, skin: "classic", dayBest: 0, day: "" }, store.get("snakeProfile") || {});
  if (prof.day !== today()) { prof.day = today(); prof.dayBest = 0; }
  const saveProf = () => store.set("snakeProfile", prof);

  /* ---------------- sound ---------------- */
  let actx = null;
  const tone = (f, d, v = 0.06, type = "square", slide) => {
    if (C.alarmSound === false) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
      const t = actx.currentTime + 0.005, o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0008, t + d);
      o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + d + 0.02);
    } catch {}
  };
  const sfx = {
    eat: c => tone(520 + Math.min(c, 6) * 90, 0.08, 0.05),
    gold: () => [1320, 1760, 2093].forEach((f, i) => setTimeout(() => tone(f, 0.09, 0.05, "sine"), i * 60)),
    ring: () => { for (let i = 0; i < 4; i++) setTimeout(() => tone(1760, 0.05, 0.03), i * 70); },
    die: () => tone(300, 0.45, 0.07, "sawtooth", 70),
    best: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.15, 0.05), i * 110)),
  };

  /* ---------------- board ---------------- */
  const COLS = 17, ROWS = 15, CELL = 40;
  const cv = $("snCanvas"), g = cv.getContext("2d");
  cv.width = COLS * CELL; cv.height = ROWS * CELL;
  let S = null, raf = 0, lastT = 0;

  function fresh() {
    const mid = Math.floor(ROWS / 2);
    return {
      snake: [{ x: 5, y: mid }, { x: 4, y: mid }, { x: 3, y: mid }],
      prev: null, dir: { x: 1, y: 0 }, queue: [], step: 150, acc: 0,
      food: null, gold: null, goldNext: 8 + Math.floor(Math.random() * 6), eaten: 0,
      score: 0, combo: 1, lastEat: -99, t: 0, state: "ready", pops: [], dead: 0, grow: 0,
    };
  }
  const occupied = (x, y) => S.snake.some(s => s.x === x && s.y === y);
  function spawn() {
    let x, y, n = 0;
    do { x = Math.floor(Math.random() * COLS); y = Math.floor(Math.random() * ROWS); n++; }
    while ((occupied(x, y) || (S.food && S.food.x === x && S.food.y === y) || (S.gold && S.gold.x === x && S.gold.y === y)) && n < 500);
    return { x, y, born: S.t };
  }

  function reset() {
    S = fresh(); S.food = spawn();
    overlay("ready"); paintHud(); render();
  }

  function turn(dx, dy) {
    if (!S) return;
    if (S.state === "ready" || S.state === "over") { if (S.state === "over") reset(); start(); }
    if (S.state !== "play") return;
    const last = S.queue.length ? S.queue[S.queue.length - 1] : S.dir;
    if (last.x === -dx && last.y === -dy) return;
    if (last.x === dx && last.y === dy) return;
    if (S.queue.length < 3) S.queue.push({ x: dx, y: dy });
  }
  function start() {
    if (!S || S.state === "play") return;
    if (!prof.name) { $("snName").focus(); toast("Enter a name first so your score counts."); return; }
    S.state = "play"; overlay(null); lastT = 0;
    cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
    cv.focus({ preventScroll: true });
  }

  function loop(t) {
    raf = requestAnimationFrame(loop);
    const page = $("page-snake");
    if (!page || !page.classList.contains("active")) { if (S && S.state === "play") pause(); return; }
    const dt = Math.min(0.05, lastT ? (t - lastT) / 1000 : 0); lastT = t;
    if (!S) return;
    S.t += dt;
    S.pops.forEach(p => { p.y -= 30 * dt; p.a -= dt * 1.2; }); S.pops = S.pops.filter(p => p.a > 0);
    if (S.state === "play") {
      S.acc += dt * 1000;
      while (S.acc >= S.step && S.state === "play") { S.acc -= S.step; tick(); }
      if (S.gold && S.t - S.gold.born > 5) { S.gold = null; }
      if (S.combo > 1 && S.t - S.lastEat > 2.5) { S.combo = 1; paintHud(); }
    } else if (S.state === "over") S.dead += dt;
    render();
  }
  function pause() { if (S.state !== "play") return; S.state = "ready"; overlay("paused"); }

  function tick() {
    if (S.queue.length) S.dir = S.queue.shift();
    const head = S.snake[0];
    const nx = head.x + S.dir.x, ny = head.y + S.dir.y;
    S.prev = S.snake.map(s => ({ ...s }));
    const tailWillMove = S.grow === 0;
    const hitSelf = S.snake.some((s, i) => s.x === nx && s.y === ny && !(tailWillMove && i === S.snake.length - 1));
    if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS || hitSelf) return die();
    S.snake.unshift({ x: nx, y: ny });
    if (S.grow > 0) S.grow--; else S.snake.pop();
    if (S.food && nx === S.food.x && ny === S.food.y) eat(1, S.food), S.food = spawn();
    if (S.gold && nx === S.gold.x && ny === S.gold.y) { eat(5, S.gold, true); S.gold = null; }
  }
  function eat(base, at, gold) {
    S.combo = S.t - S.lastEat <= 2.5 ? Math.min(5, S.combo + 1) : 1;
    S.lastEat = S.t;
    const pts = base * S.combo;
    S.score += pts; S.grow += gold ? 2 : 1; S.eaten++;
    S.step = Math.max(68, 150 - S.eaten * 2.6);
    S.pops.push({ t: `+${pts}${S.combo > 1 ? ` x${S.combo}` : ""}`, x: (at.x + 0.5) * CELL, y: at.y * CELL, a: 1, gold });
    gold ? sfx.gold() : sfx.eat(S.combo);
    if (!gold && --S.goldNext <= 0) { S.gold = spawn(); S.goldNext = 7 + Math.floor(Math.random() * 6); sfx.ring(); }
    paintHud();
  }
  function die() {
    S.state = "over"; S.dead = 0; S.combo = 1; sfx.die();
    if (navigator.vibrate) try { navigator.vibrate(120); } catch {}
    const newBest = S.score > prof.best, newDay = S.score > prof.dayBest;
    const before = unlockedCount();
    if (newBest) prof.best = S.score;
    if (prof.day !== today()) { prof.day = today(); prof.dayBest = 0; }
    if (newDay) prof.dayBest = S.score;
    saveProf();
    if (newBest && S.score > 0) setTimeout(sfx.best, 350);
    const unlocked = unlockedCount() > before ? SKINS[unlockedCount() - 1] : null;
    if (S.score > 0 && (newBest || newDay)) submit();
    paintSkins(); paintHud();
    overlay("over", { newBest, unlocked });
  }

  /* ---------------- drawing ---------------- */
  const skinOf = () => SKINS.find(s => s.id === prof.skin) || SKINS[0];
  function segColor(i, n) {
    const sk = skinOf();
    if (sk.rainbow) { const cols = ["#5B21B6", "#7C3AED", "#A78BFA", "#C4B5FD", "#FFFFFF", "#111111"]; return cols[i % cols.length]; }
    const k = n > 1 ? i / (n - 1) : 0;
    return mix(sk.a, sk.b, k);
  }
  function mix(a, b, k) {
    const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    const [r1, g1, b1] = p(a), [r2, g2, b2] = p(b);
    return `rgb(${Math.round(r1 + (r2 - r1) * k)},${Math.round(g1 + (g2 - g1) * k)},${Math.round(b1 + (b2 - b1) * k)})`;
  }
  function clock(cx, cy, r, gold, t) {
    g.save(); g.translate(cx, cy);
    const wob = Math.sin(t * 18) * (gold ? 0.18 : 0.1);
    g.rotate(wob);
    const body = gold ? "#FACC15" : "#5B21B6";
    g.fillStyle = gold ? "#B8860B" : "#111"; g.beginPath(); g.arc(-r * 0.55, -r * 0.75, r * 0.32, 0, Math.PI * 2); g.arc(r * 0.55, -r * 0.75, r * 0.32, 0, Math.PI * 2); g.fill();
    g.strokeStyle = gold ? "#B8860B" : "#111"; g.lineWidth = r * 0.16; g.lineCap = "round";
    g.beginPath(); g.moveTo(-r * 0.5, r * 0.75); g.lineTo(-r * 0.75, r * 1.0); g.moveTo(r * 0.5, r * 0.75); g.lineTo(r * 0.75, r * 1.0); g.stroke();
    g.fillStyle = body; g.beginPath(); g.arc(0, 0, r * 0.85, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#fff"; g.beginPath(); g.arc(0, 0, r * 0.62, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#111"; g.lineWidth = r * 0.12; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -r * 0.45); g.moveTo(0, 0); g.lineTo(r * 0.3, r * 0.18); g.stroke();
    g.restore();
  }
  function render() {
    // checkerboard
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      g.fillStyle = (x + y) % 2 ? "#E9E1FB" : "#F4EFFD"; g.fillRect(x * CELL, y * CELL, CELL, CELL);
    }
    if (!S) return;
    const k = S.state === "play" ? Math.min(1, S.acc / S.step) : 1;
    const pos = i => {
      const cur = S.snake[i], pr = S.prev && S.prev[i] ? S.prev[i] : (S.prev ? S.prev[S.prev.length - 1] : cur);
      const a = S.state === "play" && pr ? pr : cur;
      return { x: (a.x + (cur.x - a.x) * k + 0.5) * CELL, y: (a.y + (cur.y - a.y) * k + 0.5) * CELL };
    };
    // food
    if (S.food) clock((S.food.x + 0.5) * CELL, (S.food.y + 0.5) * CELL, CELL * 0.42, false, S.t);
    if (S.gold) {
      const left = 1 - (S.t - S.gold.born) / 5, cx = (S.gold.x + 0.5) * CELL, cy = (S.gold.y + 0.5) * CELL;
      g.strokeStyle = "rgba(184,134,11,.85)"; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, CELL * 0.55, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left); g.stroke();
      if (left > 0.3 || Math.floor(S.t * 8) % 2) clock(cx, cy, CELL * 0.42, true, S.t);
    }
    // snake body as thick rounded path, colored per segment
    const n = S.snake.length, pts = S.snake.map((_, i) => pos(i));
    const shakeX = S.state === "over" && S.dead < 0.3 ? (Math.random() - 0.5) * 8 : 0;
    g.save(); g.translate(shakeX, 0);
    g.lineCap = "round"; g.lineJoin = "round";
    for (let i = n - 1; i > 0; i--) {
      g.strokeStyle = segColor(i, n); g.lineWidth = CELL * (0.78 - 0.18 * (i / n));
      g.beginPath(); g.moveTo(pts[i].x, pts[i].y); g.lineTo(pts[i - 1].x, pts[i - 1].y); g.stroke();
    }
    // head
    const h = pts[0], d = S.dir;
    g.fillStyle = segColor(0, n); g.beginPath(); g.arc(h.x, h.y, CELL * 0.44, 0, Math.PI * 2); g.fill();
    const ex = -d.y, ey = d.x; // perpendicular
    [-1, 1].forEach(sd => {
      const cx = h.x + d.x * CELL * 0.12 + ex * sd * CELL * 0.2, cy = h.y + d.y * CELL * 0.12 + ey * sd * CELL * 0.2;
      g.fillStyle = "#fff"; g.beginPath(); g.arc(cx, cy, CELL * 0.14, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#111"; g.beginPath();
      if (S.state === "over") { g.lineWidth = 3; g.strokeStyle = "#111"; g.moveTo(cx - 4, cy - 4); g.lineTo(cx + 4, cy + 4); g.moveTo(cx + 4, cy - 4); g.lineTo(cx - 4, cy + 4); g.stroke(); }
      else { g.arc(cx + d.x * 3, cy + d.y * 3, CELL * 0.07, 0, Math.PI * 2); g.fill(); }
    });
    g.restore();
    // pops
    S.pops.forEach(p => {
      g.globalAlpha = Math.max(0, p.a); g.font = "400 26px Anton, Impact, sans-serif"; g.textAlign = "center";
      g.lineWidth = 5; g.strokeStyle = "#fff"; g.strokeText(p.t, p.x, p.y); g.fillStyle = p.gold ? "#B8860B" : "#5B21B6"; g.fillText(p.t, p.x, p.y);
    });
    g.globalAlpha = 1;
  }

  /* ---------------- HUD + overlay ---------------- */
  function paintHud() {
    $("snScore").textContent = S ? S.score : 0;
    $("snBest").textContent = prof.best;
    $("snCombo").textContent = S && S.combo > 1 ? `x${S.combo} combo` : "";
  }
  function overlay(kind, info = {}) {
    const ov = $("snOverlay");
    if (!kind) { ov.hidden = true; return; }
    ov.hidden = false;
    $("snNameRow").hidden = !!prof.name;
    if (kind === "ready" || kind === "paused") {
      $("snOvTitle").textContent = kind === "paused" ? "Paused" : "Snooze Snake";
      $("snOvText").textContent = prof.name ? "Use the arrow keys or swipe to start. Eat alarm clocks, grab the gold ones fast, and don't hit the wall or yourself." : "Pick a name for the leaderboard, then swipe or press an arrow key to start.";
      $("snPlay").textContent = kind === "paused" ? "Resume" : "Play";
      $("snShare").hidden = true; $("snRival").textContent = "";
    } else {
      $("snOvTitle").textContent = info.newBest && S.score > 0 ? "New best!" : "Game over";
      $("snOvText").textContent = `${S.score} ${S.score === 1 ? "point" : "points"}. Best: ${prof.best}.${info.unlocked ? ` You unlocked the ${info.unlocked.name} skin!` : ""}`;
      $("snPlay").textContent = "Play again"; $("snShare").hidden = S.score === 0;
      $("snRival").textContent = rivalLine();
    }
  }
  $("snPlay").addEventListener("click", () => { if (S.state === "over") reset(); start(); });
  $("snShare").addEventListener("click", async () => {
    const text = `I got ${S.score} on Snooze Snake. Beat that. ${C.slogan || ""}`;
    const url = location.href.split("#")[0] + "#/snake";
    try { if (navigator.share) await navigator.share({ title: "Snooze Snake", text, url }); else { await navigator.clipboard.writeText(`${text} ${url}`); toast("Copied. Send it to someone."); } } catch {}
  });
  $("snSaveName").addEventListener("click", () => {
    const n = cleanName($("snName").value);
    if (!okName(n)) { toast(n.length < 2 ? "Name needs 2+ letters." : "Pick a different name."); return; }
    prof.name = n; saveProf(); $("snNameRow").hidden = true; $("snWho").textContent = n; overlay("ready"); cv.focus({ preventScroll: true });
  });
  $("snName").addEventListener("keydown", e => { if (e.key === "Enter") $("snSaveName").click(); });
  $("snRename").addEventListener("click", () => { $("snNameRow").hidden = false; $("snName").value = prof.name; $("snName").focus(); $("snOverlay").hidden = false; if (S.state === "play") pause(); });

  /* ---------------- skins ---------------- */
  const unlockedCount = () => SKINS.filter(s => prof.best >= s.need).length;
  function paintSkins() {
    $("snSkins").innerHTML = SKINS.map(s => {
      const open = prof.best >= s.need, sw = s.rainbow ? "linear-gradient(90deg,#5B21B6,#A78BFA,#fff,#111)" : `linear-gradient(90deg,${s.a},${s.b})`;
      return `<button type="button" data-id="${s.id}" ${open ? "" : "disabled"} aria-pressed="${prof.skin === s.id}" title="${open ? s.name : `Score ${s.need} to unlock`}">
        <i style="background:${sw}"></i><span>${open ? esc(s.name) : `🔒 ${s.need}`}</span></button>`;
    }).join("");
  }
  $("snSkins").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b || b.disabled) return;
    prof.skin = b.dataset.id; saveProf(); paintSkins(); render();
  });

  /* ---------------- controls ---------------- */
  const KEYS = { ArrowUp: [0, -1], w: [0, -1], W: [0, -1], ArrowDown: [0, 1], s: [0, 1], S: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0], ArrowRight: [1, 0], d: [1, 0], D: [1, 0] };
  document.addEventListener("keydown", e => {
    if (!$("page-snake").classList.contains("active")) return;
    if (e.target.matches("input, textarea, select")) return;
    const k = KEYS[e.key];
    if (k) { e.preventDefault(); turn(k[0], k[1]); }
    else if ((e.key === " " || e.key === "Enter") && S && S.state !== "play" && document.activeElement === cv) { e.preventDefault(); if (S.state === "over") reset(); start(); }
    else if (e.key === "p" || e.key === "P" || e.key === "Escape") { if (S && S.state === "play") pause(); }
  });
  let sw0 = null;
  cv.addEventListener("touchstart", e => { const t = e.touches[0]; sw0 = { x: t.clientX, y: t.clientY }; }, { passive: true });
  cv.addEventListener("touchmove", e => {
    if (!sw0) return; e.preventDefault();
    const t = e.touches[0], dx = t.clientX - sw0.x, dy = t.clientY - sw0.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    Math.abs(dx) > Math.abs(dy) ? turn(Math.sign(dx), 0) : turn(0, Math.sign(dy));
    sw0 = { x: t.clientX, y: t.clientY };
  }, { passive: false });
  cv.addEventListener("touchend", () => { sw0 = null; });
  document.querySelectorAll("#snPad [data-d]").forEach(b => b.addEventListener("pointerdown", e => {
    e.preventDefault(); const [x, y] = b.dataset.d.split(",").map(Number); turn(x, y);
  }));

  /* ---------------- leaderboards ---------------- */
  let board = { day: [], all: [], live: false }, tab = "day";
  function localLists() {
    const l = store.get("snakeBoard") || [];
    const d = today();
    return { day: l.filter(e => e.day === d).map(e => ({ name: e.name, score: e.dayBest })).sort((a, b) => b.score - a.score),
             all: l.map(e => ({ name: e.name, score: e.best })).sort((a, b) => b.score - a.score) };
  }
  function submit() {
    const entry = { name: prof.name, best: prof.best, dayBest: prof.dayBest, day: prof.day };
    const l = (store.get("snakeBoard") || []).filter(e => e.name !== entry.name); l.push(entry);
    store.set("snakeBoard", l.slice(-50));
    if (window.CAMPAIGN_SNAKE && window.CAMPAIGN_SNAKE.submit) window.CAMPAIGN_SNAKE.submit(entry).catch(() => toast("Leaderboard didn't save. Try again in a bit."));
    else { const ll = localLists(); board = { ...ll, live: false }; paintBoard(); }
  }
  function rivalLine() {
    const list = tab === "all" ? board.all : board.day;
    const mine = tab === "all" ? prof.best : prof.dayBest;
    if (!list.length || !mine) return "";
    const idx = list.findIndex(e => e.name === prof.name);
    const rank = idx >= 0 ? idx + 1 : list.filter(e => e.score > mine).length + 1;
    if (rank === 1) return `You're #1 ${tab === "all" ? "all-time" : "today"}. Defend it.`;
    const ahead = list[rank - 2];
    return ahead ? `You're #${rank} ${tab === "all" ? "all-time" : "today"}. ${ahead.score - mine + 1} ${ahead.score - mine + 1 === 1 ? "point" : "points"} to pass ${ahead.name}.` : "";
  }
  function paintBoard() {
    const list = tab === "all" ? board.all : board.day;
    $("snBoardNote").textContent = board.live ? (tab === "all" ? "Best score ever, per player." : "Resets every day. Anyone can be #1 today.") : "Scores on this device for now. The school-wide board turns on when the site's live features are connected.";
    $("snBoard").innerHTML = list.length ? list.slice(0, 10).map((e, i) =>
      `<li${e.name === prof.name ? ' class="mine"' : ""}><b>${i + 1}</b><span class="nm">${i === 0 ? "👑 " : ""}${esc(e.name)}</span><span class="d">${e.score}</span></li>`).join("")
      : `<li class="empty-row">${tab === "all" ? "No scores yet." : "No one's played today. Be #1."}</li>`;
    document.querySelectorAll("#snTabs button").forEach(b => b.setAttribute("aria-selected", b.dataset.tab === tab));
  }
  document.querySelectorAll("#snTabs button").forEach(b => b.addEventListener("click", () => { tab = b.dataset.tab; paintBoard(); if (S && S.state === "over") $("snRival").textContent = rivalLine(); }));
  window.SNAKE_paintBoard = (entries) => {
    const d = today();
    board = {
      live: true,
      all: entries.filter(e => e.name).map(e => ({ name: e.name, score: e.best || 0 })).sort((a, b) => b.score - a.score),
      day: entries.filter(e => e.name && e.day === d).map(e => ({ name: e.name, score: e.dayBest || 0 })).sort((a, b) => b.score - a.score),
    };
    paintBoard();
  };

  /* ---------------- init ---------------- */
  $("snWho").textContent = prof.name || "(pick a name)";
  board = { ...localLists(), live: false };
  paintSkins(); paintBoard(); reset();
})();
