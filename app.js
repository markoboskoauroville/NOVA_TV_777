/* NOVA TV 777 — countdown, data, rendering.
   Everything is rendered from the first frame. Values fill in; nothing appears. */

const TARGET_FALLBACK = "2027-05-28T19:00:00+02:00";
let DATA = null;

/* ── countdown ────────────────────────────────────────── */
function pad(n) { return String(n).padStart(2, "0"); }

function tickCountdown() {
  const el = document.getElementById("cd");
  if (!el) return;
  const target = new Date((DATA && DATA.event && DATA.event.start) || TARGET_FALLBACK);
  const end = new Date((DATA && DATA.event && DATA.event.end) || target.getTime() + 12 * 3600e3);
  const now = new Date();
  let diff = Math.floor((target - now) / 1000);

  const foot = document.getElementById("cd-foot");
  if (diff <= 0) {
    if (foot) foot.textContent = now < end ? t("cd_live") : t("cd_over");
    diff = 0;
  } else if (foot) {
    foot.textContent = t("cd_foot");
  }

  const d = Math.floor(diff / 86400);
  const h = Math.floor((diff % 86400) / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;

  document.getElementById("cd-d").textContent = d;
  document.getElementById("cd-h").textContent = pad(h);
  document.getElementById("cd-m").textContent = pad(m);
  document.getElementById("cd-s").textContent = pad(s);
}

function daysLeft() {
  const target = new Date((DATA && DATA.event && DATA.event.start) || TARGET_FALLBACK);
  return Math.max(0, Math.ceil((target - new Date()) / 86400e3));
}

/* ── data ─────────────────────────────────────────────── */
async function loadData() {
  try {
    const r = await fetch("data/event.json?v=" + Date.now());
    if (!r.ok) throw new Error("HTTP " + r.status);
    DATA = await r.json();
  } catch (e) {
    console.error("event.json could not be read:", e);
    DATA = null;
  }
  renderAll();
}

function pick(o, base) {
  if (!o) return "";
  return o[base + "_" + LANG] || o[base + "_hr"] || o[base] || "";
}

/* ── slots (public page) ──────────────────────────────── */
function renderSlots() {
  const host = document.getElementById("slots");
  if (!host || !DATA) return;
  host.innerHTML = "";
  DATA.slots.forEach(s => {
    const open = !s.pseudonym;
    const row = document.createElement("div");
    row.className = "slot" + (open ? " is-open" : "");
    const name = open ? t("slot_open") : s.pseudonym;
    const genre = pick(s, "genre");
    const st = s.status || "open";
    row.innerHTML =
      '<span class="slot-h"></span>' +
      '<span><span class="slot-name"></span><span class="slot-genre"></span></span>' +
      '<span class="pill s-' + st + '"></span>';
    row.querySelector(".slot-h").textContent = s.hour;
    row.querySelector(".slot-name").textContent = name;
    row.querySelector(".slot-genre").textContent = genre;
    row.querySelector(".pill").textContent = t("st_" + st);
    host.appendChild(row);
  });
}

/* ── slot dropdown on the apply form ──────────────────── */
function renderSlotOptions() {
  const sel = document.getElementById("f-slot");
  if (!sel || !DATA) return;
  const keep = sel.value;
  sel.innerHTML = "";
  const any = document.createElement("option");
  any.value = ""; any.textContent = t("f_any");
  sel.appendChild(any);
  DATA.slots.filter(s => !s.pseudonym).forEach(s => {
    const o = document.createElement("option");
    o.value = s.hour; o.textContent = s.hour;
    sel.appendChild(o);
  });
  sel.value = keep;
}

/* ── hub: stats ───────────────────────────────────────── */
function renderStats() {
  const host = document.getElementById("stats");
  if (!host || !DATA) return;
  const apps = DATA.applications.length;
  const conf = DATA.applications.filter(a => a.status === "confirmed" || a.status === "scheduled").length;
  const free = DATA.slots.filter(s => !s.pseudonym).length;
  const vals = [[apps, "s_apps"], [conf, "s_conf"], [free, "s_free"], [daysLeft(), "s_days"]];
  host.innerHTML = "";
  vals.forEach(([n, k]) => {
    const d = document.createElement("div");
    d.className = "stat";
    d.innerHTML = '<div class="stat-n"></div><div class="stat-l"></div>';
    d.querySelector(".stat-n").textContent = n;
    d.querySelector(".stat-l").textContent = t(k);
    host.appendChild(d);
  });
}

/* ── hub: timeline ────────────────────────────────────── */
function renderTimeline() {
  const host = document.getElementById("timeline");
  if (!host || !DATA) return;
  host.innerHTML = "";
  DATA.timeline.forEach(m => {
    const [y, mo, d] = m.date.split("-");
    const day = LANG === "hr" ? m.day_hr : m.day_en;
    const row = document.createElement("div");
    row.className = "tl-row";
    row.innerHTML =
      '<span><span class="tl-date"></span><span class="tl-title"></span>' +
      '<span class="tl-owner"></span></span><span class="pill s-' + (m.status || "waiting") + '"></span>';
    row.querySelector(".tl-date").textContent =
      day + " " + Number(d) + ". " + Number(mo) + ". " + y + ".";
    row.querySelector(".tl-title").textContent = pick(m, "title");
    row.querySelector(".tl-owner").textContent = m.owner;
    row.querySelector(".pill").textContent = t("ts_" + (m.status || "waiting"));
    host.appendChild(row);
  });
}

/* ── hub: applications table ──────────────────────────── */
function renderApplications() {
  const body = document.getElementById("apps-body");
  if (!body || !DATA) return;
  body.innerHTML = "";
  DATA.applications.forEach(a => {
    const tr = document.createElement("tr");
    tr.innerHTML = '<td></td><td class="hide-s"></td><td></td><td class="hide-s"></td>' +
                   '<td class="mono"></td><td><span class="pill"></span></td>';
    const c = tr.children;
    c[0].textContent = a.name;
    c[1].textContent = a.dept || "";
    c[2].textContent = a.pseudonym || "";
    c[3].textContent = pick(a, "genre");
    c[4].textContent = a.slot || "—";
    const p = c[5].firstChild;
    p.textContent = t("as_" + (a.status || "new"));
    p.className = "pill " + (a.status === "confirmed" || a.status === "scheduled"
      ? "s-confirmed" : a.status === "contacted" ? "s-held" : "s-open");
    body.appendChild(tr);
  });
}

/* ── hub: budget ──────────────────────────────────────── */
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
  renderSlots();
  renderSlotOptions();
  renderStats();
  renderTimeline();
  renderApplications();
  renderBudget();
  tickCountdown();
}

/* ── boot ─────────────────────────────────────────────── */
document.addEventListener("langchange", renderAll);
document.addEventListener("DOMContentLoaded", () => {
  initLang();
  loadData();
  tickCountdown();
  setInterval(tickCountdown, 1000);
});
