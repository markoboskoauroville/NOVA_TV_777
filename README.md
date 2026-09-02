# NOVA TV 777

Organisation hub and public page for a proposed 12-hour DJ party marking Nova TV's
27th birthday.

**Friday 28. 5. 2027., 19:00 → Saturday 07:00. Dvorana Amber, Zagreb.**

Nova TV began broadcasting on 28. 5. 2000, so the 27th birthday falls in 2027, and
28. 5. 2027 lands on a Friday.

Two pages, no framework, no build step, no server.

| Page | For | What it holds |
|---|---|---|
| `index.html` | everyone | countdown, why 777, concept, lineup, venue, tickets, DJ application |
| `hub.html` | Miro and Mislav | counts, timeline, applications with real names, budget |

---

## The one file that matters

**`data/event.json`.** Both pages read it. Change it and both pages change.

Nothing else needs editing to run the event. The date, the twelve slots, the
applications, the ten timeline steps and the budget rows are all in there.

To change something:

1. Open `data/event.json` on GitHub
2. Press the pencil
3. Edit, then **Commit changes**
4. Wait a minute or two and reload the page

If the file gets broken, GitHub keeps every previous version and restoring one is
two clicks. Keep it valid JSON: every string in double quotes, no trailing comma
after the last item in a list.

## Accounts

Miro and Mislav each need a **GitHub account**, added to this repository as
collaborators under Settings → Collaborators. That gives each of them a real login,
real write access, and their name on every change they make, with full history.

That is the whole account system, and it is deliberate. GitHub Pages serves static
files and cannot run a login or a database. Rather than draw a fake login box, the
real one that already exists is used.

## What the passphrase on the hub is not

It is a curtain, not a lock. The page is public and the passphrase is in the source.
It keeps the task board out of the way of someone who wanders in from the party page.
It does not protect anything.

**So: no personal data in `event.json` beyond what a colleague would happily see on a
noticeboard.** If real privacy is needed later, the answer is a private repository
plus a host that does password-protection properly, not a better passphrase here.

## Language

Croatian and English from one dictionary in `i18n.js`. Every visible string carries a
`data-i18n` key; pressing HR or EN swaps the text in place with no reload and no
navigation. Croatian is the default and is never guessed from the browser.

Adding a string means adding one entry with both languages. `tests/test1_dict.py`
fails if either language is missing, or if a key is referenced but not defined.

## Tests

    python3 -m http.server 8777
    python3 tests/test1_dict.py      # dictionary and data shape
    python3 tests/test2_browser.py   # real browser at 390px, buttons pressed
    python3 tests/test2b_deck.py     # SMPTE leader, transport, real VU metering
    python3 tests/test3_ugly.py      # absent, malformed, empty, enormous, past, twice
    python3 tests/test4_upgrade.py   # returning visitor, old-shaped data

Last run 2. 9. 2026: **8, 32, 28, 22, 15 passed, 0 failed.**

## Not tested

- No browser other than Chromium. Safari on iPhone is code inspection only.
- The mailto: buttons compose a correct URL; whether a mail client opens is the
  operating system's business and cannot be reached from here.
- Clipboard copy is tested in Chromium, where permission is granted automatically.
- Ticket sales do not exist. The email box composes a message and nothing more.

## The anthem

`assets/nova777-anthem.mp3` — DJ Maniac, "Nova TV — ekipa (remix)", 4:58. The waveform under the
transport is 120 real peaks pulled from that file with ffmpeg, not decoration. Regenerate with
`ffmpeg -i assets/nova777-anthem.mp3 -ac 1 -ar 8000 -f s16le -` piped through the peak script in
MEMORY.md. The file sits on GitHub Pages, so it is world-readable by anyone with the URL.

## Branding

The Nova TV logo and official brand assets are deliberately **not** in this
repository. The identity here is original: seven colours, the numeral, the typography.
Before this goes public with the station's name on it, the logo and the colours have
to come from Nova TV marketing, with permission.

---

Marko Boško · Mantra Productions · Zagreb
Built to `MANTRA_MANIFEST` conventions: four tests, nine gates, colour carries state,
nothing goes off the screen.
