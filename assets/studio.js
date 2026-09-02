/* Studio hardware, drawn as line art. Original geometry, no traced marks.
   Monochrome so colour stays free to mean state. */

const STUDIO_SVG = {

  camera: `<svg viewBox="0 0 120 80" fill="none" stroke="#8C8C94" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="30" y="18" width="46" height="28" rx="2"/>
    <path d="M76 26 l16 -7 v30 l-16 -7 z"/>
    <circle cx="26" cy="24" r="6"/><circle cx="46" cy="14" r="5"/>
    <rect x="34" y="10" width="9" height="5" rx="1"/>
    <path d="M53 46 v10 M40 66 h26 M53 56 l-13 10 M53 56 l13 10 M53 56 v10"/>
    <rect x="20" y="20" width="7" height="9" rx="1" fill="#E8A64B" stroke="none"/>
  </svg>`,

  light: `<svg viewBox="0 0 120 80" fill="none" stroke="#8C8C94" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M14 10 h92"/>
    <path d="M60 10 v8"/>
    <rect x="42" y="18" width="36" height="26" rx="2"/>
    <path d="M42 22 l-9 -6 v34 l9 -6 M78 22 l9 -6 v34 l-9 -6"/>
    <circle cx="60" cy="31" r="6" fill="#E8A64B" stroke="none"/>
    <path d="M52 52 l-6 18 M68 52 l6 18 M60 52 v20"/>
  </svg>`,

  tally: `<svg viewBox="0 0 120 80" fill="none" stroke="#8C8C94" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="16" y="22" width="88" height="36" rx="3"/>
    <circle cx="34" cy="40" r="8" fill="#FF2A2A" stroke="none"/>
    <path d="M52 33 h36 M52 40 h28 M52 47 h36" stroke-width="2.5"/>
    <path d="M60 22 v-8 M60 58 v8"/>
  </svg>`,

  bars: `<svg viewBox="0 0 120 80" aria-hidden="true">
    <rect x="16" y="16" width="88" height="48" rx="2" fill="none" stroke="#8C8C94" stroke-width="2"/>
    <g>
      <rect x="19" y="19" width="12.3" height="42" fill="#BFBFBF"/>
      <rect x="31.3" y="19" width="12.3" height="42" fill="#BFBF00"/>
      <rect x="43.6" y="19" width="12.3" height="42" fill="#00BFBF"/>
      <rect x="55.9" y="19" width="12.3" height="42" fill="#00BF00"/>
      <rect x="68.2" y="19" width="12.3" height="42" fill="#BF00BF"/>
      <rect x="80.5" y="19" width="12.3" height="42" fill="#BF0000"/>
      <rect x="92.8" y="19" width="8.2" height="42" fill="#2222C8"/>
    </g>
  </svg>`
};

function paintStudio() {
  document.querySelectorAll("[data-studio]").forEach(el => {
    const k = el.dataset.studio;
    if (STUDIO_SVG[k]) el.innerHTML = STUDIO_SVG[k];
  });
}
