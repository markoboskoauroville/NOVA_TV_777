/* NOVA TV 777 — one dictionary, two languages, no reload.
   Any element carrying data-i18n="key" gets its text swapped.
   data-i18n-html="key" swaps innerHTML (use only for keys with markup).
   data-i18n-ph="key" swaps a placeholder attribute. */

const DICT = {

  /* ── chrome ─────────────────────────────────────────── */
  nav_hub:       { hr: "Hub",              en: "Hub" },
  nav_songs:     { hr: "Pjesme",           en: "Songs" },
  songs_kick:    { hr: "Audio · pjesme",   en: "Audio · songs" },
  songs_h:       { hr: "Pjesme",           en: "Songs" },
  songs_lead:    { hr: "Pjesme napravljene za ovaj event. Svaka ima svoj player. Svira samo jedna odjednom.",
                   en: "Songs made for this event. Each has its own player. Only one plays at a time." },
  songs_empty:   { hr: "Još nema pjesama.", en: "No songs yet." },
  nav_apply:     { hr: "Prijava",          en: "Apply" },
  nav_back:      { hr: "Natrag na party",  en: "Back to party" },


  ident_skip:   { hr: "Preskoči uvod", en: "Skip intro" },
  ident_replay: { hr: "Ponovi uvod",   en: "Replay intro" },

  /* ── monitors, transport, meters ────────────────────── */
  src_head:   { hr: "Source · Himna ekipe",   en: "Source · Crew anthem" },
  rec_head:   { hr: "Record · Odbrojavanje",  en: "Record · Countdown" },
  cta_h:      { hr: "Pritisni play",          en: "Press play" },
  cta_d:      { hr: "Himna ekipe. Četiri minute i 58 sekundi. Pojačaj.",
                en: "The crew anthem. Four minutes fifty-eight. Turn it up." },
  tp_playing: { hr: "SVIRA",  en: "PLAYING" },
  tp_paused:  { hr: "PAUZA",  en: "PAUSED" },
  vu_track:   { hr: "Traka",    en: "Track" },
  vu_artist:  { hr: "Izvođač",  en: "Artist" },
  vu_len:     { hr: "Trajanje", en: "Length" },
  mock_tag:   { hr: "MAKETA", en: "MOCKUP" },
  mock_note:  { hr: "Ovo je maketa, ne radi. Polja i gumbi su tu samo da se vidi kako će izgledati. Kad skripte budu gotove, prijava će ići ravno u tablicu. Do tada mi javi na WhatsApp i upisat ću te ručno.",
                en: "This is a mockup and does not work. The fields and buttons are here only to show how it will look. Once the scripts are finished, an application will go straight into the spreadsheet. Until then, message me and I will add you by hand." },
  hub_tag:    { hr: "PRIVATNO", en: "PRIVATE" },

  /* ── hero ───────────────────────────────────────────── */
  hero_title:    { hr: "Dvanaest sati, dvanaest tajnih DJ-eva, jedna zgrada.",
                   en: "Twelve hours, twelve secret DJs, one building." },
  hero_sub:      { hr: "Interni DJ-evi Nove TV. Pseudonimi do zadnjeg trenutka. Otvoreno za javnost.",
                   en: "Nova TV's own staff behind the decks. Pseudonyms until the last moment. Open to the public." },
  hero_when:     { hr: "Petak 28. 5. 2027. · 19:00 → subota 07:00",
                   en: "Friday 28 May 2027 · 19:00 → Saturday 07:00" },

  cd_days:       { hr: "dana",     en: "days" },
  cd_hours:      { hr: "sati",     en: "hours" },
  cd_mins:       { hr: "minuta",   en: "minutes" },
  cd_secs:       { hr: "sekundi",  en: "seconds" },
  cd_foot:       { hr: "do prvog beata · 28. 5. 2027. u 19:00",
                   en: "until the first beat · 28 May 2027 at 19:00" },
  cd_live:       { hr: "party je u tijeku", en: "the party is running" },
  cd_over:       { hr: "bilo je dobro",     en: "it was good" },

  /* ── coincidences ───────────────────────────────────── */
  coin_kick:     { hr: "Colour bars · sedam", en: "Colour bars · seven" },
  coin_h:        { hr: "Zašto baš 777",  en: "Why 777" },
  coin_lead:     { hr: "Datum nije biran zbog simbolike. Biran je zato što je to rođendan kuće. Sve ostalo se poklopilo samo od sebe, i poklopilo se dovoljno puta da se isplati napisati.",
                   en: "The date was not chosen for its symbolism. It was chosen because it is the station's birthday. Everything else lined up on its own, and it lined up often enough to be worth writing down." },

  c1_t: { hr: "27 godina",            en: "27 years" },
  c1_d: { hr: "Nova TV je počela emitirati 28. svibnja 2000. Dvadeset sedmi rođendan pada 2027. Godina i broj rođendana dijele istu sedmicu.",
          en: "Nova TV began broadcasting on 28 May 2000. The twenty-seventh birthday falls in 2027. The year and the birthday number share the same seven." },
  c2_t: { hr: "7 katova",             en: "7 floors" },
  c2_d: { hr: "Zgrada ih ima sedam. Dvorana Amber je na dnu, pa se party doslovno održava ispod cijele kuće.",
          en: "The building has seven. The Amber hall sits at the bottom, so the party happens literally underneath the whole station." },
  c3_t: { hr: "Od 7 do 7",            en: "Seven to seven" },
  c3_d: { hr: "Početak u 19:00, kraj u 07:00. Dvanaest sati, dva puta sedam na satu.",
          en: "Start at 19:00, end at 07:00. Twelve hours, seven at both ends of the clock." },
  c4_t: { hr: "7 traka",              en: "7 bars" },
  c4_d: { hr: "SMPTE test slika ima točno sedam traka u boji. Svaka televizija na svijetu ih emitira, a nitko ih u kući nikad nije prebrojao. Ima ih sedam.",
          en: "The SMPTE test pattern has exactly seven colour bars. Every television station on earth broadcasts them, and nobody in the building has ever counted them. There are seven." },
  c5_t: { hr: "Pada u petak",         en: "It lands on a Friday" },
  c5_d: { hr: "28. svibnja 2027. je petak. Party završava u subotu ujutro, kad nitko ne mora raditi. Ovo je jedini podatak na popisu koji nitko nije mogao isplanirati.",
          en: "28 May 2027 is a Friday. The party ends on a Saturday morning, when nobody has to be at work. This is the one item on the list that nobody could have planned." },
  c6_t: { hr: "12 slotova",           en: "12 slots" },
  c6_d: { hr: "Dvanaest sati podijeljeno na dvanaest sati po DJ-u. Nitko ne svira dva puta i nitko ne svira kraće.",
          en: "Twelve hours split into twelve one-hour sets. Nobody plays twice and nobody plays short." },
  c7_t: { hr: "777",                  en: "777" },
  c7_d: { hr: "Tri sedmice: godine, katovi, sati. Ime se nije trebalo izmišljati, samo pročitati.",
          en: "Three sevens: the years, the floors, the hours. The name did not need inventing, only reading." },

  /* ── concept ────────────────────────────────────────── */
  con_kick: { hr: "Koncept", en: "The concept" },
  con_h:    { hr: "Ekipa iza kamere ide za pult",
              en: "The people behind the cameras step up to the decks" },
  con_p1:   { hr: "Montaža, redakcija, tehnika, produkcija. Tko god u kući pušta glazbu i želi sat vremena, dobije sat vremena. Bez audicije i bez uvjeta osim jednog: set mora izdržati punih šezdeset minuta.",
              en: "Editing, newsroom, engineering, production. Anyone in the building who plays music and wants an hour gets an hour. No audition and no conditions except one: the set has to hold for a full sixty minutes." },
  con_p2:   { hr: "Svi nastupaju pod pseudonimom. Lineup se objavljuje s umjetničkim imenima, žanrom i terminom, ali bez ijednog pravog imena. Tko je tko saznaje se tek te noći, kad osoba stane za pult.",
              en: "Everyone plays under a pseudonym. The lineup is published with artist names, genres and time slots, but not a single real name. Who is who is revealed only on the night, when the person steps up." },
  con_p3:   { hr: "Ulaznice se prodaju javno. Kuća zarađuje, DJ-evi su plaćeni, a team building se pretvara u event koji ima publiku.",
              en: "Tickets are sold publicly. The station earns, the DJs are paid, and a team-building night turns into an event with an actual audience." },

  /* ── lineup ─────────────────────────────────────────── */
  line_kick: { hr: "Lineup",  en: "Lineup" },
  line_h:    { hr: "Dvanaest slotova", en: "Twelve slots" },
  line_lead: { hr: "Termini se popunjavaju kako stižu prijave. Prazan slot znači da je još slobodan.",
               en: "Slots fill as applications come in. An empty slot means it is still free." },
  slot_open: { hr: "Tvoj slot?", en: "Your slot?" },
  st_confirmed: { hr: "potvrđen", en: "confirmed" },
  st_held:      { hr: "rezerviran", en: "held" },
  st_open:      { hr: "slobodan", en: "open" },

  /* ── venue ──────────────────────────────────────────── */
  ven_kick: { hr: "Lokacija", en: "Venue" },
  ven_h:    { hr: "Dvorana Amber", en: "Amber hall" },
  ven_p:    { hr: "Na dnu zgrade Nove TV u Zagrebu. Ulaz, garderoba i šank na istoj razini, bez stepenica između pulta i publike.",
              en: "At the bottom of the Nova TV building in Zagreb. Entrance, cloakroom and bar on one level, no stairs between the booth and the floor." },

  /* ── tickets ────────────────────────────────────────── */
  tic_kick: { hr: "Ulaznice", en: "Tickets" },
  tic_h:    { hr: "Prodaja još nije otvorena", en: "Sales are not open yet" },
  tic_p:    { hr: "Ulaznice idu u prodaju kad lineup bude zaključan. Ostavi mail i javljamo se prvog dana prodaje, bez ičega drugog u međuvremenu.",
              en: "Tickets go on sale once the lineup is locked. Leave an email and we will write on the first day of sales, and not before." },
  tic_email:{ hr: "Tvoj email", en: "Your email" },
  tic_btn:  { hr: "Javi mi kad krene", en: "Tell me when it starts" },

  /* ── apply ──────────────────────────────────────────── */
  app_kick: { hr: "Za ekipu iz kuće", en: "For staff" },
  app_h:    { hr: "Prijavi se za slot", en: "Apply for a slot" },
  f_name:   { hr: "Ime i prezime", en: "Name" },
  f_dept:   { hr: "Odjel", en: "Department" },
  f_pseu:   { hr: "DJ pseudonim", en: "DJ pseudonym" },
  f_genre:  { hr: "Žanr", en: "Genre" },
  f_slot:   { hr: "Željeni termin", en: "Preferred slot" },
  f_any:    { hr: "svejedno mi je", en: "no preference" },
  f_note:   { hr: "Napomena (oprema, gosti, bilo što)", en: "Note (gear, guests, anything)" },
  f_copy:   { hr: "Kopiraj prijavu", en: "Copy application" },
  f_mail:   { hr: "Pošalji mailom", en: "Send by email" },
  f_copied: { hr: "Kopirano", en: "Copied" },

  /* ── hub ────────────────────────────────────────────── */
  hub_eyebrow: { hr: "Radni prostor · Miro i Mislav", en: "Workspace · Miro and Mislav" },
  hub_h:       { hr: "Produkcijski hub", en: "Production hub" },
  hub_lead:    { hr: "Sve brojke na ovoj stranici dolaze iz jedne datoteke, data/event.json. Tko je izmijeni, izmijenio je i party stranicu i ovu, u istoj sekundi.",
                 en: "Every number on this page comes from one file, data/event.json. Whoever edits it has changed both the party page and this one, in the same second." },
  hub_gate_l:  { hr: "Lozinka", en: "Passphrase" },
  hub_gate_b:  { hr: "Otključaj", en: "Unlock" },
  hub_gate_n:  { hr: "Ovo je zavjesa, ne brava. Stranica je javna i lozinka je u kodu. Ne stavljaj ovdje ništa što ne smije procuriti.",
                 en: "This is a curtain, not a lock. The page is public and the passphrase is in the source. Do not put anything here that must not leak." },
  hub_wrong:   { hr: "Nije to.", en: "Not it." },

  s_apps:    { hr: "prijava",     en: "applications" },
  s_conf:    { hr: "potvrđeno",   en: "confirmed" },
  s_free:    { hr: "slobodnih slotova", en: "slots open" },
  s_days:    { hr: "dana do", en: "days to go" },

  tl_kick:   { hr: "Plan", en: "Plan" },
  tl_h:      { hr: "Od danas do 28. svibnja", en: "From today to 28 May" },
  tl_lead:   { hr: "Devet koraka unatrag od datuma. Svaki ima vlasnika i svaki mora biti gotov prije sljedećeg.",
               en: "Nine steps counted back from the date. Each has an owner and each has to be finished before the next." },
  ts_done:    { hr: "gotovo",  en: "done" },
  ts_active:  { hr: "u tijeku", en: "in progress" },
  ts_waiting: { hr: "čeka",    en: "waiting" },
  ts_blocked: { hr: "blokirano", en: "blocked" },

  dj_kick:  { hr: "Prijave", en: "Applications" },
  dj_h:     { hr: "Tko se javio", en: "Who has come forward" },
  dj_lead:  { hr: "Prava imena stoje samo ovdje. Na javnoj stranici izlazi isključivo pseudonim.",
              en: "Real names live only here. Only the pseudonym reaches the public page." },
  th_name:  { hr: "Ime", en: "Name" },
  th_dept:  { hr: "Odjel", en: "Dept" },
  th_pseu:  { hr: "Pseudonim", en: "Pseudonym" },
  th_genre: { hr: "Žanr", en: "Genre" },
  th_slot:  { hr: "Termin", en: "Slot" },
  th_stat:  { hr: "Status", en: "Status" },
  as_new:   { hr: "nova prijava", en: "new" },
  as_contacted: { hr: "kontaktiran", en: "contacted" },
  as_confirmed: { hr: "potvrđen", en: "confirmed" },
  as_scheduled: { hr: "raspoređen", en: "scheduled" },
  as_declined:  { hr: "odustao", en: "declined" },

  edit_kick: { hr: "Uređivanje", en: "Editing" },
  edit_h:    { hr: "Kako se ovo mijenja", en: "How this gets changed" },
  edit_p1:   { hr: "Miro i Mislav imaju GitHub račune i pisanje na ovaj repozitorij. To su njihovi računi: prava, povijest i potpis na svakoj izmjeni.",
               en: "Miro and Mislav have GitHub accounts with write access to this repository. Those are their accounts: permissions, history and a signature on every change." },
  edit_p2:   { hr: "Izmjena ide ovako: otvori data/event.json, uredi, spremi. Stranica se osvježi za minutu-dvije. Ako netko pokvari datoteku, prethodna verzija je jedan klik unatrag.",
               en: "A change goes like this: open data/event.json, edit, save. The page refreshes within a minute or two. If someone breaks the file, the previous version is one click back." },
  edit_btn:  { hr: "Otvori datoteku na GitHubu", en: "Open the file on GitHub" },

  budget_kick: { hr: "Brojke", en: "Numbers" },
  budget_h:    { hr: "Budžet", en: "Budget" },
  budget_lead: { hr: "Prazno dok Mislav ne da okvir. Popunjava se u istoj datoteci.",
                 en: "Empty until Mislav sets the frame. Filled in from the same file." },
  th_item:  { hr: "Stavka", en: "Item" },
  th_amount:{ hr: "Iznos", en: "Amount" },
  th_who:   { hr: "Vlasnik", en: "Owner" },

  /* ── footer ─────────────────────────────────────────── */
  foot_1: { hr: "Nova TV 777 · interni prijedlog, još nije odobren",
            en: "Nova TV 777 · internal proposal, not yet approved" },
  foot_2: { hr: "Stranica: Marko Boško · Mantra Productions · Zagreb",
            en: "Page: Marko Boško · Mantra Productions · Zagreb" },
  foot_3: { hr: "Logo i službeni brand Nove TV nisu na stranici dok marketing ne da materijale i dopuštenje.",
            en: "The Nova TV logo and official brand are absent until marketing supplies the assets and permission." }
};

/* ── the engine ───────────────────────────────────────── */
const LANGS = ["hr", "en"];
let LANG = "hr";

function t(key) {
  const e = DICT[key];
  if (!e) return "[" + key + "]";
  return e[LANG] || e.hr;
}

function applyLang(lang) {
  LANG = LANGS.includes(lang) ? lang : "hr";
  document.documentElement.lang = LANG;
  try { localStorage.setItem("nova777_lang", LANG); } catch (e) {}

  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-html]").forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(el => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  document.querySelectorAll(".langswitch button").forEach(b => {
    b.setAttribute("aria-pressed", String(b.dataset.lang === LANG));
  });

  // let the data-driven parts redraw themselves in the new language
  document.dispatchEvent(new CustomEvent("langchange", { detail: { lang: LANG } }));
}

function initLang() {
  // Croatian is the default. This is a Zagreb TV station's page and its first
  // audience is the building. English is chosen, never guessed from the browser.
  let saved = null;
  try { saved = localStorage.getItem("nova777_lang"); } catch (e) {}
  if (!LANGS.includes(saved)) saved = "hr";
  document.querySelectorAll(".langswitch button").forEach(b => {
    b.addEventListener("click", () => applyLang(b.dataset.lang));
  });
  applyLang(saved);
}
