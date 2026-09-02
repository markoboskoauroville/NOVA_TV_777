/* NOVA TV 777 — songs page.
   One deck per track, built from data/songs.json. Everything renders from the
   first frame; a deck that has not been played is idle, not absent. */

let SONGS = null;

function pad2(n) { return String(n).padStart(2, "0"); }
function mmss(s) {
  s = Math.max(0, Math.floor(s || 0));
  return pad2(Math.floor(s / 60)) + ":" + pad2(s % 60);
}
function pickL(o, base) {
  if (!o) return "";
  return o[base + "_" + LANG] || o[base + "_hr"] || o[base] || "";
}

const Decks = {
  list: [],

  async load() {
    try {
      const r = await fetch("data/songs.json?v=" + Date.now());
      if (!r.ok) throw new Error("HTTP " + r.status);
      SONGS = await r.json();
    } catch (e) { console.error("songs.json unreadable:", e); SONGS = null; }
    this.render();
  },

  render() {
    const host = document.getElementById("songs");
    if (!host) return;
    host.innerHTML = "";
    this.list = [];
    if (!SONGS || !SONGS.songs || !SONGS.songs.length) {
      const empty = document.createElement("p");
      empty.className = "dek"; empty.textContent = t("songs_empty");
      host.appendChild(empty);
      return;
    }
    SONGS.songs.forEach((s, i) => host.appendChild(this.buildRow(s, i)));
  },

  buildRow(song, idx) {
    const panel = document.createElement("div");
    panel.className = "panel song";
    panel.innerHTML =
      '<div class="panel-head">' +
        '<span class="panel-name"></span>' +
        '<span class="panel-tag"></span>' +
      '</div>' +
      '<div class="song-row">' +
        '<div class="song-art"><img alt=""></div>' +
        '<div class="song-body">' +
          '<span class="song-title"></span>' +
          '<span class="song-artist"></span>' +
          '<div class="song-wave"><div class="song-cursor"></div></div>' +
          '<div class="song-foot">' +
            '<button class="mcbtn play" type="button">' +
              '<svg class="ic-play" viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg>' +
              '<svg class="ic-pause" viewBox="0 0 24 24" style="display:none"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>' +
            '</button>' +
            '<span class="tc song-tc">00:00</span>' +
            '<span class="tc dim song-rem"></span>' +
          '</div>' +
        '</div>' +
      '</div>';

    panel.querySelector(".panel-name").textContent = pickL(song, "label") || song.title;
    panel.querySelector(".panel-tag").textContent = mmss(song.duration);
    panel.querySelector(".song-art img").src = song.art;
    panel.querySelector(".song-title").textContent = song.title;
    panel.querySelector(".song-artist").textContent = pickL(song, "artist");
    panel.querySelector(".song-rem").textContent = "-" + mmss(song.duration);

    const audio = document.createElement("audio");
    audio.preload = "metadata";
    audio.src = song.file;
    panel.appendChild(audio);

    const deck = {
      song, audio, panel,
      btn:  panel.querySelector(".play"),
      wave: panel.querySelector(".song-wave"),
      cur:  panel.querySelector(".song-cursor"),
      tc:   panel.querySelector(".song-tc"),
      rem:  panel.querySelector(".song-rem"),
      bars: []
    };
    this.list.push(deck);

    this.drawWave(deck);
    deck.btn.addEventListener("click", () => this.toggle(idx));
    audio.addEventListener("timeupdate", () => this.paint(deck));
    audio.addEventListener("loadedmetadata", () => { this.paint(deck); this.reflect(deck); });
    audio.addEventListener("canplay", () => this.reflect(deck));
    audio.addEventListener("play",  () => this.setPlaying(deck, true));
    audio.addEventListener("pause", () => this.setPlaying(deck, false));
    audio.addEventListener("ended", () => { this.setPlaying(deck, false); this.paint(deck); });
    deck.wave.addEventListener("click", e => {
      if (!this.canSeek(deck)) return;
      const r = e.currentTarget.getBoundingClientRect();
      audio.currentTime = ((e.clientX - r.left) / r.width) * this.dur(deck);
      this.paint(deck);
    });
    this.paint(deck);
    return panel;
  },

  dur(d) {
    const a = d.audio;
    return (a.duration && isFinite(a.duration)) ? a.duration : (d.song.duration || 0);
  },

  // Same honesty as the front page: a host that does not serve HTTP Range
  // leaves the element unseekable, so the waveform stops pretending to scrub.
  canSeek(d) {
    const s = d.audio.seekable;
    return !!(s && s.length && s.end(s.length - 1) > 1);
  },
  reflect(d) {
    const ok = this.canSeek(d);
    d.wave.style.cursor = ok ? "pointer" : "default";
    d.wave.classList.toggle("nodrag", !ok);
  },

  async drawWave(d) {
    let peaks = null;
    if (d.song.waveform) {
      try {
        const r = await fetch(d.song.waveform);
        if (r.ok) peaks = (await r.json()).bars;
      } catch (e) {}
    }
    if (!peaks) peaks = new Array(120).fill(0.35);
    d.wave.querySelectorAll("span").forEach(s => s.remove());
    peaks.forEach(v => {
      const b = document.createElement("span");
      b.style.height = Math.max(6, v * 100) + "%";
      d.wave.appendChild(b);
    });
    d.bars = Array.from(d.wave.querySelectorAll("span"));
    this.paint(d);
  },

  toggle(idx) {
    const d = this.list[idx];
    if (!d) return;
    if (d.audio.paused) {
      // one at a time: starting a track stops whatever else was running
      this.list.forEach(o => { if (o !== d && !o.audio.paused) o.audio.pause(); });
      const p = d.audio.play();
      if (p && p.catch) p.catch(e => console.warn("play blocked:", e));
    } else { d.audio.pause(); }
  },

  setPlaying(d, on) {
    d.btn.classList.toggle("on", on);
    d.btn.querySelector(".ic-play").style.display  = on ? "none" : "block";
    d.btn.querySelector(".ic-pause").style.display = on ? "block" : "none";
    d.panel.classList.toggle("is-playing", on);
  },

  paint(d) {
    const dur = this.dur(d), c = d.audio.currentTime || 0;
    const p = dur ? c / dur : 0, n = d.bars.length;
    for (let i = 0; i < n; i++) d.bars[i].classList.toggle("played", i / n <= p);
    d.cur.style.left = (p * 100) + "%";
    d.tc.textContent  = mmss(c);
    d.rem.textContent = "-" + mmss(dur - c);
  }
};

document.addEventListener("langchange", () => Decks.render());
document.addEventListener("DOMContentLoaded", () => {
  initLang();
  Decks.load();
});
