/* NOVA TV 777 — leader, transport, meters, timeline.
   Everything renders from the first frame. Values fill in; nothing appears. */

const TARGET_FALLBACK = "2027-05-28T19:00:00+02:00";
let DATA = null;

/* ══ 1. THE SMPTE LEADER ═══════════════════════════════
   Seven numbers, full screen, one per colour bar. Then the seven bars
   fill the frame, then they compress into the 7px spine at the top.
   Plays once per session. Skippable at any moment. Skipped entirely for
   anyone who has asked their system for reduced motion — the design
   language says nothing animated that the eye has to follow, and a
   title card is the one deliberate exception, not a licence. */
function runLeader() {
  const L = document.getElementById("leader");
  if (!L) return;
  const numEl = L.querySelector(".leader-num");
  const bars = L.querySelectorAll(".leader-bars .lb");
  const COL = ["#FFFFFF","#FFFF00","#00FFFF","#00FF00","#FF00FF","#FF0000","#4040FF"];

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let seen = false;
  try { seen = sessionStorage.getItem("nova777_leader") === "1"; } catch (e) {}

  const finish = () => {
    L.classList.add("gone");
    try { sessionStorage.setItem("nova777_leader", "1"); } catch (e) {}
    syncIdentSkip();
  };

  if (reduced || seen) { finish(); return; }

  const timers = [];
  const skip = () => { timers.forEach(clearTimeout); finish(); };
  L.querySelector(".leader-skip").addEventListener("click", skip);
  document.addEventListener("keydown", function esc(e) {
    if (e.key === "Escape") { skip(); document.removeEventListener("keydown", esc); }
  });

  // 600ms per number: Baba asked for the count to run twice as long, so the
  // seven colours register as seven rather than flashing past.
  const STEP = 600;
  for (let i = 1; i <= 7; i++) {
    timers.push(setTimeout(() => {
      numEl.textContent = i;
      numEl.style.color = COL[i - 1];
    }, (i - 1) * STEP));
  }
  timers.push(setTimeout(() => {
    L.classList.add("barring");
    bars.forEach((b, i) => { b.style.transitionDelay = (i * 45) + "ms"; });
  }, 7 * STEP));
  timers.push(setTimeout(() => {
    bars.forEach(b => { b.style.transitionDelay = "0ms"; });
    L.classList.add("collapsing");
  }, 7 * STEP + 1240));
  timers.push(setTimeout(() => L.classList.add("fading"), 7 * STEP + 2520));
  timers.push(setTimeout(finish, 7 * STEP + 3160));
}

function leaderRunning() {
  const L = document.getElementById("leader");
  return !!L && !L.classList.contains("gone");
}

// Design language §5: the control says what pressing it will DO. While the
// leader is up it skips; once it has finished the same key replays it.
function syncIdentSkip() {
  const b = document.getElementById("ident-skip");
  if (!b) return;
  b.textContent = leaderRunning() ? t("ident_skip") : t("ident_replay");
}

function replayLeader() {
  const L = document.getElementById("leader");
  if (!L) return;
  try { sessionStorage.removeItem("nova777_leader"); } catch (e) {}
  L.className = "leader";
  L.querySelectorAll(".leader-bars .lb").forEach(b => { b.style.transitionDelay = "0ms"; });
  runLeader();
  syncIdentSkip();
}

/* ══ 2. TIMECODE ═══════════════════════════════════════ */
function pad(n, w) { return String(n).padStart(w || 2, "0"); }

function tcFromSeconds(s) {
  s = Math.max(0, s);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60), f = Math.floor((s % 1) * 25);
  return pad(h) + ":" + pad(m) + ":" + pad(sec) + ":" + pad(f);
}

/* ══ 3. COUNTDOWN (record monitor) ═════════════════════ */
function tickCountdown() {
  if (!document.getElementById("cd-d")) return;
  const target = new Date((DATA && DATA.event && DATA.event.start) || TARGET_FALLBACK);
  const end = new Date((DATA && DATA.event && DATA.event.end) || target.getTime() + 12 * 3600e3);
  const now = new Date();
  let diff = Math.floor((target - now) / 1000);

  const foot = document.getElementById("cd-foot");
  if (diff <= 0) { if (foot) foot.textContent = now < end ? t("cd_live") : t("cd_over"); diff = 0; }
  else if (foot) { foot.textContent = t("cd_foot"); }

  document.getElementById("cd-d").textContent = Math.floor(diff / 86400);
  document.getElementById("cd-h").textContent = pad(Math.floor((diff % 86400) / 3600));
  document.getElementById("cd-m").textContent = pad(Math.floor((diff % 3600) / 60));
  document.getElementById("cd-s").textContent = pad(diff % 60);

  const rtc = document.getElementById("rec-tc");
  if (rtc) {
    const dd = Math.floor(diff / 86400);
    rtc.textContent = pad(dd, 3) + ":" + pad(Math.floor((diff % 86400) / 3600)) +
                      ":" + pad(Math.floor((diff % 3600) / 60)) + ":" + pad(diff % 60);
  }
}

function daysLeft() {
  const target = new Date((DATA && DATA.event && DATA.event.start) || TARGET_FALLBACK);
  return Math.max(0, Math.floor((target - new Date()) / 86400e3));
}

/* ══ 4. THE ANTHEM: transport, waveform, real VU ════════ */
const AudioDeck = {
  el: null, ctx: null, anL: null, anR: null, bufL: null, bufR: null,
  anM: null, freq: null, ident: null,
  bars: [], wired: false, raf: 0,
  frame: 0, fluxAvg: 0, prevLow: null, lastCut: 0,
  // Speaker-cone model: a mass on a spring with damping, driven by impulses.
  // x is displacement from rest, v is velocity. Not a smoothing filter — a
  // filter only ever decays toward its input, so it cannot overshoot and
  // settle, which is exactly what makes a cone read as physical.
  x: 0, v: 0, lastT: 0,
  K: 300,        // stiffness  -> omega = sqrt(K) = 17.3 rad/s = 2.8 Hz
  C: 17,         // damping    -> zeta = C / (2*sqrt(K)) = 0.49, underdamped
  HIT: 16,       // impulse gain: tuned from measured peak displacement, not guessed
  MAX_X: 0.085,  // "not too much": at most 8.5% bigger than rest
  // 300ms floor: high-contrast full-colour frames must not exceed three
  // changes a second, whatever the track does.
  MIN_CUT_MS: 300,

  init() {
    this.el = document.getElementById("anthem");
    if (!this.el) return;
    this.ident = document.getElementById("ident");
    this.restIdent();
    this.buildWave();
    this.buildMeters();
    // the deck owns its own waveform. An earlier version left this to an inline
    // <script> that called window.AudioDeck — which is undefined, because AudioDeck
    // is a const and never lands on window. Every bar silently stayed at the 0.4
    // fallback and the waveform looked like a flat block.
    fetch("assets/waveform.json").then(r => r.json()).then(w => {
      window.WAVEFORM = w; this.buildWave(); this.paint();
    }).catch(() => {});

    document.getElementById("tp-play").addEventListener("click", () => this.toggle());
    document.getElementById("tp-start").addEventListener("click", () => this.seek(0));
    document.getElementById("tp-back").addEventListener("click", () => this.nudge(-10));
    document.getElementById("tp-fwd").addEventListener("click", () => this.nudge(10));
    document.getElementById("tp-end").addEventListener("click", () => this.seek(this.dur() - 0.2));

    this.el.addEventListener("timeupdate", () => this.paint());
    this.el.addEventListener("loadedmetadata", () => { this.paint(); this.reflectSeekable(); });
    this.el.addEventListener("progress", () => this.reflectSeekable());
    this.el.addEventListener("canplay", () => this.reflectSeekable());
    this.el.addEventListener("ended", () => { this.setPlaying(false); this.paint(); });
    this.el.addEventListener("play", () => this.setPlaying(true));
    this.el.addEventListener("pause", () => this.setPlaying(false));

    document.getElementById("wave").addEventListener("click", e => {
      const r = e.currentTarget.getBoundingClientRect();
      this.seek(((e.clientX - r.left) / r.width) * this.dur());
    });
    this.paint();
    this.reflectSeekable();
  },

  dur() { return (this.el && this.el.duration && isFinite(this.el.duration)) ? this.el.duration : 298.152; },

  buildWave() {
    const host = document.getElementById("wave");
    if (!host) return;
    const peaks = (window.WAVEFORM && window.WAVEFORM.bars) || new Array(120).fill(0.4);
    host.querySelectorAll("span").forEach(s => s.remove());
    peaks.forEach(v => {
      const b = document.createElement("span");
      b.style.height = Math.max(6, v * 100) + "%";
      host.appendChild(b);
    });
    this.bars = Array.from(host.querySelectorAll("span"));
  },

  buildMeters() {
    ["vu-l", "vu-r"].forEach(id => {
      const track = document.getElementById(id);
      if (!track) return;
      track.innerHTML = "";
      for (let i = 0; i < 18; i++) {
        const s = document.createElement("i"); s.className = "vu-seg"; track.appendChild(s);
      }
    });
  },

  wireAudio() {
    if (this.wired) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      const src = this.ctx.createMediaElementSource(this.el);
      const split = this.ctx.createChannelSplitter(2);
      this.anL = this.ctx.createAnalyser(); this.anR = this.ctx.createAnalyser();
      this.anL.fftSize = 1024; this.anR.fftSize = 1024;
      src.connect(split);
      split.connect(this.anL, 0); split.connect(this.anR, 1);
      src.connect(this.ctx.destination);
      this.bufL = new Float32Array(this.anL.fftSize);
      this.bufR = new Float32Array(this.anR.fftSize);
      // a third analyser on the summed signal, for the ident's bass reading
      this.anM = this.ctx.createAnalyser();
      this.anM.fftSize = 512; this.anM.smoothingTimeConstant = 0.75;
      src.connect(this.anM);
      this.freq = new Uint8Array(this.anM.frequencyBinCount);
      this.wired = true;
    } catch (e) { console.warn("meters unavailable:", e); }
  },

  toggle() {
    if (this.el.paused) {
      this.wireAudio();
      if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
      const p = this.el.play();
      if (p && p.catch) p.catch(e => console.warn("play blocked:", e));
    } else { this.el.pause(); }
  },

  // A server without HTTP Range support reports an empty seekable range, and the
  // browser silently snaps currentTime back to 0. Rather than ship four buttons
  // that look alive and do nothing, ask the element what it can actually do.
  seekEnd() {
    const el = this.el;
    return (el && el.seekable && el.seekable.length) ? el.seekable.end(el.seekable.length - 1) : 0;
  },
  canSeek() { return this.seekEnd() > 1; },

  reflectSeekable() {
    const ok = this.canSeek();
    ["tp-start","tp-back","tp-fwd","tp-end"].forEach(id => {
      const b = document.getElementById(id);
      if (b) b.classList.toggle("inactive", !ok);
    });
    const w = document.getElementById("wave");
    if (w) w.style.cursor = ok ? "pointer" : "default";
  },

  seek(s) {
    if (!this.canSeek()) return;
    this.el.currentTime = Math.max(0, Math.min(this.dur() - 0.05, s));
    this.paint();
  },
  nudge(d) { this.seek(this.el.currentTime + d); },

  setPlaying(on) {
    const b = document.getElementById("tp-play");
    b.classList.toggle("on", on);
    // the control says what the next press DOES, not what is happening
    b.querySelector(".ic-play").style.display = on ? "none" : "block";
    b.querySelector(".ic-pause").style.display = on ? "block" : "none";
    document.querySelectorAll(".tally").forEach(x => x.classList.toggle("on", on));
    const st = document.getElementById("tp-state");
    if (st) st.textContent = on ? t("tp_playing") : t("tp_paused");
    if (on) { this.loop(); }
    else { cancelAnimationFrame(this.raf); this.drawMeters(0, 0); this.restIdent(); }
  },

  paint() {
    const d = this.dur(), c = this.el ? this.el.currentTime : 0;
    const p = d ? c / d : 0, n = this.bars.length;
    for (let i = 0; i < n; i++) this.bars[i].classList.toggle("played", i / n <= p);
    const cur = document.getElementById("wave-cursor");
    if (cur) cur.style.left = (p * 100) + "%";
    const tc = document.getElementById("src-tc");
    if (tc) tc.textContent = tcFromSeconds(c);
    const rem = document.getElementById("src-rem");
    if (rem) rem.textContent = "-" + tcFromSeconds(Math.max(0, d - c));
  },

  rms(an, buf) {
    if (!an) return 0;
    an.getFloatTimeDomainData(buf);
    let s = 0; for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
    return Math.sqrt(s / buf.length);
  },

  drawMeters(l, r) {
    [["vu-l", l], ["vu-r", r]].forEach(([id, v]) => {
      const track = document.getElementById(id);
      if (!track) return;
      const segs = track.children, n = segs.length;
      const db = v > 0 ? 20 * Math.log10(v) : -60;
      const lit = Math.round(((db + 48) / 48) * n);   // -48 dBFS floor
      for (let i = 0; i < n; i++) {
        const s = segs[i];
        s.className = "vu-seg";
        if (i < lit) s.classList.add(i >= n - 2 ? "lit-r" : i >= n - 6 ? "lit-a" : "lit-g");
      }
    });
  },

  // ── the frame cutter ───────────────────────────────
  // Rests on frame 1 whenever nothing plays, so the cutting is itself the
  // signal that the anthem is running.
  restIdent() {
    this.fluxAvg = 0; this.prevLow = null; this.lastCut = 0;
    this.x = 0; this.v = 0; this.lastT = 0;
    const f = document.getElementById("frames");
    if (!f) return;
    f.style.setProperty("--pulse", "1");
    const imgs = f.querySelectorAll("img");
    imgs.forEach((im, i) => im.classList.toggle("on", i === 0));
    this.frame = 0;
  },

  cutTo(i) {
    const f = document.getElementById("frames");
    if (!f) return;
    const imgs = f.querySelectorAll("img");
    if (!imgs.length) return;
    this.frame = ((i % imgs.length) + imgs.length) % imgs.length;
    imgs.forEach((im, n) => im.classList.toggle("on", n === this.frame));
  },

  driveIdent() {
    const f = document.getElementById("frames");
    if (!f || !this.anM) return;
    this.anM.getByteFrequencyData(this.freq);
    const n = this.freq.length;
    const bEnd = Math.max(6, Math.floor(n * 0.10));

    let bass = 0;
    for (let i = 0; i < bEnd; i++) bass += this.freq[i];
    bass /= bEnd * 255;

    // SPECTRAL FLUX, not absolute level. This track is heavily limited — its
    // bass sits near the ceiling almost continuously, so "louder than average"
    // fired twice in twelve seconds. Flux measures how much the low end just
    // CHANGED, which is what a kick actually is.
    let flux = 0;
    if (this.prevLow) {
      for (let i = 0; i < bEnd; i++) {
        const d = this.freq[i] - this.prevLow[i];
        if (d > 0) flux += d;
      }
      flux /= bEnd * 255;
    }
    if (!this.prevLow) this.prevLow = new Uint8Array(bEnd);
    for (let i = 0; i < bEnd; i++) this.prevLow[i] = this.freq[i];

    this.fluxAvg += (flux - this.fluxAvg) * 0.20;
    const now = performance.now();
    const since = now - this.lastCut;
    const onset = flux > this.fluxAvg * 1.6 && flux > 0.012;

    // ── drive the cone ────────────────────────────────
    // Real elapsed time, clamped: a background tab hands back a huge dt and
    // an unclamped spring integrates straight to infinity.
    let dt = this.lastT ? (now - this.lastT) / 1000 : 0.016;
    this.lastT = now;
    dt = Math.min(0.05, Math.max(0.004, dt));

    if (onset) this.v += Math.min(2.2, flux * this.HIT);   // kick the cone
    this.v += (-this.K * this.x - this.C * this.v) * dt;   // spring + damping
    this.x += this.v * dt;
    if (this.x > this.MAX_X) { this.x = this.MAX_X; this.v = Math.min(this.v, 0); }
    if (this.x < -this.MAX_X * 0.5) { this.x = -this.MAX_X * 0.5; this.v = Math.max(this.v, 0); }

    f.style.setProperty("--pulse", (1 + this.x).toFixed(4));

    if ((onset || since > 1100) && since > this.MIN_CUT_MS) {
      this.lastCut = now;
      const imgs = f.querySelectorAll("img");
      const step = 1 + Math.floor(Math.random() * (imgs.length - 1));
      this.cutTo(this.frame + step);
    }
  },

  loop() {
    this.raf = requestAnimationFrame(() => this.loop());
    if (!this.wired || this.el.paused) return;
    this.drawMeters(this.rms(this.anL, this.bufL), this.rms(this.anR, this.bufR));
    this.driveIdent();
  }
};

/* ══ 5. DATA ═══════════════════════════════════════════ */
async function loadData() {
  try {
    const r = await fetch("data/event.json?v=" + Date.now());
    if (!r.ok) throw new Error("HTTP " + r.status);
    DATA = await r.json();
  } catch (e) { console.error("event.json unreadable:", e); DATA = null; }
  renderAll();
}

function pick(o, base) {
  if (!o) return "";
  return o[base + "_" + LANG] || o[base + "_hr"] || o[base] || "";
}

/* ══ 6. LINEUP AS A TIMELINE ═══════════════════════════ */
function renderTimelineTrack() {
  const host = document.getElementById("slots");
  const ruler = document.getElementById("tl-ruler");
  if (!host || !DATA) return;
  host.innerHTML = ""; if (ruler) ruler.innerHTML = "";
  DATA.slots.forEach(s => {
    if (ruler) { const r = document.createElement("span"); r.textContent = s.hour; ruler.appendChild(r); }
    const free = !s.pseudonym;
    const c = document.createElement("div");
    c.className = "clip" + (free ? " free" : "");
    c.innerHTML = '<span class="clip-tc"></span>' +
                  '<span><span class="clip-name"></span><span class="clip-genre"></span></span>' +
                  '<span class="pill s-' + (s.status || "open") + '"></span>';
    c.querySelector(".clip-tc").textContent = s.hour;
    c.querySelector(".clip-name").textContent = free ? t("slot_open") : s.pseudonym;
    c.querySelector(".clip-genre").textContent = pick(s, "genre");
    c.querySelector(".pill").textContent = t("st_" + (s.status || "open"));
    host.appendChild(c);
  });
}

function renderSlotOptions() {
  const sel = document.getElementById("f-slot");
  if (!sel || !DATA) return;
  const keep = sel.value; sel.innerHTML = "";
  const any = document.createElement("option");
  any.value = ""; any.textContent = t("f_any"); sel.appendChild(any);
  DATA.slots.filter(s => !s.pseudonym).forEach(s => {
    const o = document.createElement("option"); o.value = s.hour; o.textContent = s.hour;
    sel.appendChild(o);
  });
  sel.value = keep;
}

/* ══ 7. HUB ════════════════════════════════════════════ */
function renderStats() {
  const host = document.getElementById("stats");
  if (!host || !DATA) return;
  const apps = DATA.applications.length;
  const conf = DATA.applications.filter(a => a.status === "confirmed" || a.status === "scheduled").length;
  const free = DATA.slots.filter(s => !s.pseudonym).length;
  host.innerHTML = "";
  [[apps,"s_apps"],[conf,"s_conf"],[free,"s_free"],[daysLeft(),"s_days"]].forEach(([n,k]) => {
    const d = document.createElement("div"); d.className = "stat";
    d.innerHTML = '<div class="stat-n"></div><div class="stat-l"></div>';
    d.querySelector(".stat-n").textContent = n;
    d.querySelector(".stat-l").textContent = t(k);
    host.appendChild(d);
  });
}

function renderPlan() {
  const host = document.getElementById("timeline");
  if (!host || !DATA) return;
  host.innerHTML = "";
  DATA.timeline.forEach(m => {
    const [y, mo, d] = m.date.split("-");
    const day = LANG === "hr" ? m.day_hr : m.day_en;
    const c = document.createElement("div");
    c.className = "clip" + (m.status === "waiting" ? " free" : "");
    c.innerHTML = '<span class="clip-tc"></span>' +
                  '<span><span class="clip-name"></span><span class="clip-genre"></span></span>' +
                  '<span class="pill s-' + (m.status || "waiting") + '"></span>';
    c.querySelector(".clip-tc").textContent = Number(d) + "." + Number(mo) + ".";
    c.querySelector(".clip-name").textContent = pick(m, "title");
    c.querySelector(".clip-genre").textContent = day + " " + y + " · " + m.owner;
    c.querySelector(".pill").textContent = t("ts_" + (m.status || "waiting"));
    host.appendChild(c);
  });
}

function renderApplications() {
  const body = document.getElementById("apps-body");
  if (!body || !DATA) return;
  body.innerHTML = "";
  DATA.applications.forEach(a => {
    const tr = document.createElement("tr");
    tr.innerHTML = '<td></td><td class="hide-s"></td><td></td><td class="hide-s"></td>' +
                   '<td class="mono"></td><td><span class="pill"></span></td>';
    const c = tr.children;
    c[0].textContent = a.name; c[1].textContent = a.dept || "";
    c[2].textContent = a.pseudonym || ""; c[3].textContent = pick(a, "genre");
    c[4].textContent = a.slot || "—";
    const p = c[5].firstChild;
    p.textContent = t("as_" + (a.status || "new"));
    p.className = "pill " + (a.status === "confirmed" || a.status === "scheduled"
      ? "s-confirmed" : a.status === "contacted" ? "s-held" : "s-open");
    body.appendChild(tr);
  });
}

function renderBudget() {
  const body = document.getElementById("budget-body");
  if (!body || !DATA) return;
  body.innerHTML = "";
  DATA.budget.forEach(b => {
    const tr = document.createElement("tr");
    tr.innerHTML = '<td></td><td class="mono"></td><td class="hide-s"></td>';
    tr.children[0].textContent = pick(b, "item");
    tr.children[1].textContent = b.amount ? b.amount : "—";
    tr.children[2].textContent = b.owner || "";
    body.appendChild(tr);
  });
}

function renderAll() {
  renderTimelineTrack(); renderSlotOptions(); renderStats();
  renderPlan(); renderApplications(); renderBudget(); tickCountdown();
  const st = document.getElementById("tp-state");
  if (st && AudioDeck.el) st.textContent = AudioDeck.el.paused ? t("tp_paused") : t("tp_playing");
  syncIdentSkip();
}

/* ══ 8. BOOT ═══════════════════════════════════════════ */
document.addEventListener("langchange", renderAll);
document.addEventListener("DOMContentLoaded", () => {
  runLeader();
  initLang();
  AudioDeck.init();
  loadData();
  tickCountdown();
  setInterval(tickCountdown, 1000);
  const lg = document.getElementById("mb-logo");
  if (lg) lg.addEventListener("click", replayLeader);
  const sk = document.getElementById("ident-skip");
  if (sk) sk.addEventListener("click", (ev) => {
    ev.preventDefault();
    if (leaderRunning()) {
      const s = document.querySelector(".leader-skip");
      if (s) s.click();
      syncIdentSkip();
    } else { replayLeader(); }
  });
  syncIdentSkip();
});
