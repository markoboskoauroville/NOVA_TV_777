# Deploying

The site is plain static files with no build step. Every path in the HTML is
relative, so it works at a domain root and inside a subdirectory without edits.

## Cloudflare Pages (the one that hides the origin)

1. dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git** → pick `markoboskoauroville/NOVA_TV_777`
2. Settings:

       Project name        sedamsedamsedam        → sedamsedamsedam.pages.dev
       Production branch   main
       Framework preset    None
       Build command       (leave empty)
       Output directory    /

3. **Save and Deploy.** First build takes about a minute.

Pushing to `main` redeploys automatically. GitHub Pages keeps working in
parallel; the two are independent and serve the same commit.

### Why Cloudflare rather than a custom domain on GitHub Pages

A custom domain pointed at GitHub Pages still resolves to GitHub's IP addresses
and still returns `server: GitHub.com` in the response headers. Anyone who looks
sees where it is hosted. Served from Cloudflare Pages the origin genuinely is
Cloudflare and nothing in the response mentions GitHub.

Cloudflare Pages will also build from a **private** repository on the free plan.
GitHub Pages will not — that needs a paid plan. So private repo + Cloudflare
Pages leaves nothing public pointing at GitHub, and collaborators still edit
`data/event.json` exactly as before.

## Naming: avoid `nova777`

`nova777.pages.dev` is taken by an Indonesian online-slots site whose canonical
domain is `nova777.org`. Checked 2. 9. 2026. The wider pattern — `inova777`,
`mpo777`, `live777`, `kilat777`, `mc777` — is saturated with gambling brands, so
searching the name returns casinos, and gambling-adjacent domains are commonly
blocked by corporate DNS filters. That could include Nova TV's own office
network, which would be an awkward way to lose a pitch.

`777` is fine as the **event** name. It is a poor **web handle**.

### The name, decided 2. 9. 2026

**`sedamsedamsedam`** — Baba's choice, and it solves the problem better than any
of the alternatives did. It is 777 spelled as words, so it carries the whole
concept while containing no digits at all, which is what puts it completely
outside the `word777` gambling pattern. It is also speakable: "sedam sedam
sedam" can be read aloud in a promo, where a numeral cannot.

Checked free and valid on 2. 9. 2026: 15 characters, lowercase alphanumeric,
well inside the 58-character project-name limit.

## A custom domain later

Add a file named `CNAME` at the repo root containing only the bare domain
(`sedamdosedam.hr`, no scheme, no trailing slash) for GitHub Pages; for
Cloudflare Pages add it under the project's **Custom domains** tab instead.
Register it in Nova TV's name, not a personal one, once the event is approved.
