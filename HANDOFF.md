# HANDOFF — NOVA_TV_777

**Live:** https://sedamsedamsedam.pages.dev
**Repository:** `markoboskoauroville/NOVA_TV_777` (public), branch `main`
**Also live at:** https://markoboskoauroville.github.io/NOVA_TV_777/ and
`sedamsedamsedam.marko-bosko-925.workers.dev` — three copies of one site, see *Open* below.

**The reasons live in [`MEMORY.md`](MEMORY.md).** Every bug, every rejected approach and every
measurement is there. This file is only what is true now.

---

## WHAT IT IS

Public page and private production hub for a proposed 12-hour DJ party marking Nova TV's 27th
birthday — **Friday 28. 5. 2027, 19:00 → Saturday 07:00, dvorana Amber, Zagreb.** Nova TV first
broadcast on 28. 5. 2000, so 2027 is the 27th year, and 28. 5. 2027 falls on a Friday.

It is **not an approved event.** It is Baba's proposal, and Mislav has not been pitched yet. The
footer says so in both languages and it must keep saying so until that changes.

## THE MODEL

**`data/event.json` is the single source of truth for the party.** Both pages read it. Twelve
slots, the applications, the ten-step plan, the budget rows, the start and end times. Editing that
one file changes both pages.

**`data/songs.json` is the catalogue for the songs page.** Append an object — title, credit, mp3,
square artwork, waveform — and a row appears. Credits carry `_hr` and `_en` variants.

**Miro and Mislav are meant to be GitHub collaborators**, editing `event.json` through the web
editor. That is the whole account system and it is deliberate: Pages serves static files and cannot
run a login, so the real login that already exists is used instead of drawing a fake one.

**The rule that protects the irreplaceable thing:** `build.sh` names the shipped files explicitly
rather than excluding unwanted ones. A new stray file in the repository cannot reach the public site
by accident. Tests, `MEMORY.md` and git history are never published.

## THE SCREENS

| Page | For | Holds |
|---|---|---|
| `index.html` | everyone | SMPTE leader, source/record monitors, the anthem deck, why 777, concept, lineup timeline, studio floor plan, tickets, application form |
| `songs.html` | everyone | one player per track, artwork left, waveform right |
| `hub.html` | Miro and Mislav | counts, the plan as a timeline, applications bin with real names, budget |

## THE DANGEROUS PARTS, AS THEY ARE NOW

**The hub passphrase is `sedam` and it is a curtain, not a lock.** The page is public and the
passphrase is in the source. Nothing may go in `event.json` that would matter if it leaked.

**The application form and the ticket email box are labelled mockups.** Fields are `disabled`,
handlers are gated behind `const MOCKUP = true`, and a **MAKETA / MOCKUP** badge sits on both
panels. They are inert on purpose — applications will go to a Google Sheet later. Do not
re-enable them without wiring the destination first.

**Neither Cloudflare Pages nor Workers serve HTTP Range.** Measured. So `<audio>` reports an empty
seekable range even when fully buffered, and every player asks `canSeek()` and dims its skip
buttons rather than showing four controls that silently do nothing. GitHub Pages does return 206.

**The frame cutter has a 300 ms floor between cuts.** These are high-contrast full-colour frames and
three changes a second is the ceiling before flashing becomes a photosensitivity risk. Do not remove
it to make the animation livelier.

**`assets/logo.png` is Baba's own 27/777 adaptation of the Nova TV mark.** It is a derivative of the
station's brand and needs marketing's sign-off before this is public with Nova TV's name on it.

## THE FILES

| File | Job |
|---|---|
| `index.html` | the party page; also holds the mockup gate and the form handlers |
| `songs.html` | the songs page |
| `hub.html` | the producer hub, passphrase gate |
| `style.css` | everything visual; Avid Media Composer furniture, SMPTE bars, mockup dimming |
| `app.js` | SMPTE leader, countdown, anthem deck, VU metering, frame cutter, timelines, bins |
| `songs.js` | multi-track decks for the songs page, one plays at a time |
| `i18n.js` | the HR/EN dictionary and the swap engine; every visible string has a key |
| `data/event.json` | the party: slots, applications, plan, budget |
| `data/songs.json` | the song catalogue |
| `build.sh` | assembles `dist/` from an explicit file list; fails loudly if the anthem is missing |
| `wrangler.jsonc` | static-assets Worker config (the older Workers deployment) |
| `_headers` | week-long cache on assets, `no-cache` on `data/` |
| `.github/workflows/deploy-pages.yml` | builds and deploys to Pages on every push to `main` |

## BUILDING

```bash
bash build.sh                       # produces dist/, 26 files
python3 -m http.server 8777         # then run the tests below
```

Deployment is automatic: **push to `main`** and the GitHub Action builds and runs
`wrangler pages deploy dist --project-name sedamsedamsedam`. About 40 seconds. `CLOUDFLARE_API_TOKEN`
and `CLOUDFLARE_ACCOUNT_ID` are encrypted repository secrets; neither is in the code.

The full sequence for publishing any repository this way is
`MANTRA_MANIFEST/apis/cloudflare.md`, with `scripts/cf-publish.sh` doing it in one command.

## THE TESTS

```bash
python3 tests/test1_dict.py        # dictionary both-languages, data shape
python3 tests/test2_browser.py     # the page at 390px, buttons pressed
python3 tests/test2b_deck.py       # SMPTE leader, transport, VU, frame cutter, speaker cone
python3 tests/test2c_songs.py      # the songs page
python3 tests/test3_ugly.py        # absent, malformed, empty, enormous, past, twice
python3 tests/test4_upgrade.py     # returning visitor, old-shaped data
```

`B777=https://sedamsedamsedam.pages.dev python3 tests/test2_browser.py` runs any of them against
the live site.

**Last full run, 3. 9. 2026: 8 / 38 / 38 / 15 / 22 / 15 passed, 0 failed.**

## WHAT HAS NEVER BEEN PROVEN

- **Chromium only.** No test has ever run in Safari or on iOS. Baba has explicitly declared iOS out
  of scope, so this is a statement of fact, not a task.
- **The Web Audio metering and the frame cutter have never run outside Chromium.** iOS Safari routes
  `AudioContext` differently and they may not run there at all. Playback does not depend on them.
- **No screen reader has ever been near this.**
- **Nobody has opened the site on the Nova TV office network.** If that network filters
  gambling-adjacent domains, `pages.dev` should be fine but has not been confirmed from inside.
- **The mockup form has never submitted anything anywhere**, because it is not meant to yet.

## OPEN

- **Three URLs serve this site.** The Workers deployment
  (`sedamsedamsedam.marko-bosko-925.workers.dev`) and GitHub Pages both still answer. Baba has
  approved deleting the Worker; it has not been done.
- **The Google Sheet wiring is postponed.** The sheet exists — `Dj_27N777`, empty, owned by
  `marko.bosko@auroville.community` — and the plan is an Apps Script web app that the existing form
  posts into. Deliberately paused, not forgotten.
- **`event.json` still carries `contact_email: marko.bosko@example.hr`.** Harmless while the form is
  a mockup. Baba has said no contact email is needed, since applications will go to the Sheet.
