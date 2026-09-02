# MEMORY — NOVA_TV_777

**What this repo is.** Public page and producer hub for a proposed 12-hour DJ party marking
Nova TV's 27th birthday. Friday 28. 5. 2027, 19:00 → Saturday 07:00, dvorana Amber, Zagreb.

## Decisions that cost something

- **SMPTE colour bars replaced the rainbow.** The test pattern has exactly seven bars, which is
  a stronger tie to the building than a rainbow was. The leader animation counts them.
- **The leader is the one sanctioned exception to "nothing animated the eye has to follow".**
  It is a title card, not UI. Once per session, skippable with the button or Escape, and skipped
  entirely under `prefers-reduced-motion`. Clicking the logo replays it.
- **Avid Media Composer furniture.** Source monitor = the anthem. Record monitor = the countdown.
  Lineup = a timeline with a ruler and twelve one-hour clips. Applications and budget = bins.
  The audience edits in Avid all day; the layout should need no explaining.
- **VU meters are real.** Web Audio `AnalyserNode` split to two channels, RMS → dBFS, -48 floor.
  Not a decoration loop. `createMediaElementSource` can only be called once per element, so the
  graph is wired lazily on first press and reused.
- **Waveform is the real signal.** 120 peaks extracted with ffmpeg from the actual mp3. The track
  is heavily limited (raw peaks 0.64–1.0), so the range is stretched or it renders as a flat block.

## Bugs that were found by testing, not by looking

- A grid child defaults to `min-width: auto`, so one long DJ name pushed the whole row off a
  390px screen no matter what `overflow-wrap` said. Fixed with `minmax(0,1fr)` and `min-width:0`.
- The hub said 273 days while the hero said 272 — `ceil` against `floor`. One fact, two numbers.
- `window.AudioDeck` is undefined because `AudioDeck` is a `const`. The inline script that was
  meant to rebuild the waveform after the fetch never ran, and every bar silently sat at the 0.4
  fallback. The deck now owns its own waveform load.
- `python3 -m http.server` does not serve HTTP Range, so `seekable.end` is 0 and the browser snaps
  `currentTime` back to zero. The transport now asks the element what it can do and dims the four
  skip buttons when the host cannot seek. GitHub Pages does serve ranges.
- A countdown of 268 days rendered as a timecode read `6433:31:47:00`. Now `DDD:HH:MM:SS`.

## Session note, 2. 9. 2026

Partway through this session the working tree contained an `i18n.js` that was not the one written
here, plus an untracked `ident.css`. The committed version at HEAD was intact, so the dictionary
and tests were restored with `git checkout HEAD --` and the changes reapplied with assertions on
every anchor. Cause not established. **If a future session finds unexplained working-tree edits,
check `git status` before trusting the files.**

## Live on Cloudflare Workers, 2. 9. 2026

`https://sedamsedamsedam.marko-bosko-925.workers.dev`

Pages creation is gone from the dashboard on this account — only Workers remains —
so the site deploys as a **static-assets Worker**: `wrangler.jsonc` points at
`./dist`, and `build.sh` assembles the 15 shipped files so tests, docs and git
metadata cannot reach the public site. Verified live: 60 checks, 0 failures.

**Workers Assets does not serve HTTP Range.** A request for 1000 bytes of the mp3
returns all 6.8 MB with a 200 and no `accept-ranges`. Measured: 208 s buffered and
`seekable.end` still 0, so the browser refuses to expose a seekable range even
when the file is fully downloaded. Play, pause, meters and the waveform all work;
the four skip buttons stay dimmed by `canSeek()`, which is the correct
degradation. GitHub Pages *does* serve ranges (206 confirmed), so the same code
has working transport there. Fixing it here would need a Worker script that
implements Range over the assets binding.

`/hub.html` 307-redirects to `/hub` — Workers Assets drops the extension by
default. Harmless; links follow it.

## Live on Cloudflare Pages, 2. 9. 2026

**`https://sedamsedamsedam.pages.dev`** — no account name, no GitHub anywhere in
the response. Created with `wrangler pages project create`, which still works
from the CLI even though the dashboard no longer offers Pages at all.

A CLI-created Pages project is **Direct Upload**, and Git integration can only be
attached at creation time in the dashboard. So auto-deploy is restored by
`.github/workflows/deploy-pages.yml`, which builds and runs `wrangler pages deploy`
on every push to main. `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are
encrypted repo secrets; neither is in the repo.

**Pages does not serve HTTP Range either.** Measured, not assumed: a request for
1000 bytes of the mp3 returned all 6,829,542 with a 200. So moving off Workers did
*not* bring the transport buttons back — they stay correctly dimmed on both hosts.
Only GitHub Pages returns 206. If scrubbing ever matters, the fix is a Worker that
implements Range over the assets binding, not a change of host.

### A test that lied, 2. 9. 2026

`GET /user/tokens/verify` returned `1000 Invalid API Token` for a perfectly good
token. That endpoint needs **User**-scope read, which a correctly-narrow
account-scoped token does not have. The token worked on `/accounts` and
`/accounts/{id}/pages/projects` immediately. **Verify a token against the endpoint
you actually intend to use**, never against `/user/tokens/verify`, or a correctly
minimal token looks broken.

Also: Cloudflare tokens are **not** always 40 characters — this one is 53. Shape
extraction using `{40}` silently produced an empty file. Use `{40,80}`.

## Not proven

- Chromium only. Safari on iPhone is code inspection.
- Web Audio metering was exercised in headless Chromium; iOS Safari routes `AudioContext`
  differently and the meters may stay dark there. Playback itself does not depend on them.
- mailto: composes a correct URL; whether a mail client opens is the operating system's business.
- No ticketing exists. The email field composes a message and nothing more.

## The name

**`sedamsedamsedam`** — 777 written as words. Chosen 2. 9. 2026 after
`nova777.pages.dev` turned out to be an Indonesian online-slots site
(canonical `nova777.org`), and the wider `word777` pattern — `inova777`,
`mpo777`, `live777`, `kilat777`, `mc777` — turned out to be saturated with
gambling brands. Two risks that mattered: searching the name returns casinos,
and gambling-adjacent domains are commonly blocked by corporate DNS filters,
possibly including Nova TV's own network. Prefixing a digit (`25nova777`) would
have made it look *more* like a slot brand, not less. Spelling the sevens as
words escapes the pattern entirely.

`777` stays the event name. It is only a bad **web handle**.

## Branding

`assets/logo.png` is Baba's own 27/777 adaptation of the Nova TV mark, supplied by him. It is a
derivative of the station's brand and needs marketing's sign-off before this is public with the
station's name on it. Nothing here was drawn from the official brand kit.
