# TEST 4 — the person who already had the old one.
from playwright.sync_api import sync_playwright
import json, sys
fails=[]
def ck(n,c,g=""):
    print(("  PASS " if c else "  FAIL ")+n+(("  -> "+str(g)) if g else ""))
    if not c: fails.append(n)
orig=open("/tmp/ugly/data/event.json").read()

with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={"width":390,"height":844})

    print("RETURNING VISITOR — language preference already on disk")
    pg=ctx.new_page(); pg.goto("http://localhost:8778/index.html"); pg.wait_for_timeout(700)
    pg.click('.langswitch button[data-lang="en"]'); pg.wait_for_timeout(400)
    ck("chose EN", "Twelve hours" in pg.inner_text("h1.hero-title"))
    pg.reload(); pg.wait_for_timeout(900)
    ck("EN survives a reload (value, not default)", "Twelve hours" in pg.inner_text("h1.hero-title"),
       pg.inner_text("h1.hero-title")[:34])
    ck("switch shows EN as pressed", pg.get_attribute('.langswitch button[data-lang="en"]',"aria-pressed")=="true")
    pg.goto("http://localhost:8778/hub.html"); pg.wait_for_timeout(800)
    ck("preference carries across pages", pg.get_attribute("html","lang")=="en")
    pg.close()

    print("CORRUPT SAVED STATE — a value the new code never wrote")
    pg=ctx.new_page()
    pg.goto("http://localhost:8778/index.html")
    pg.evaluate("localStorage.setItem('nova777_lang','klingon')")
    pg.reload(); pg.wait_for_timeout(900)
    ck("falls back to HR, does not render [key] markers", "Dvanaest sati" in pg.inner_text("h1.hero-title"),
       pg.inner_text("h1.hero-title")[:34])
    import re
    ck("no untranslated markers anywhere", not re.search(r'\[[a-z0-9_]{3,}\]', pg.inner_text("body")))
    pg.close()

    print("OLD DATA, NEW CODE — event.json from before genre_en and status existed")
    old=json.loads(orig)
    for s in old["slots"]:
        s.pop("genre_en",None); s.pop("status",None)
    for m in old["timeline"]:
        m.pop("day_en",None); m.pop("title_en",None); m.pop("status",None)
    for x in old["budget"]: x.pop("item_en",None)
    old["event"].pop("contact_email",None); old["event"].pop("repo",None)
    open("/tmp/ugly/data/event.json","w").write(json.dumps(old))
    pg=ctx.new_page(); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("http://localhost:8778/index.html"); pg.wait_for_timeout(900)
    ck("12 slots still render from the old shape", pg.locator("#slots .slot").count()==12,
       pg.locator("#slots .slot").count())
    ck("missing genre_en falls back to Croatian, not to blank-with-error", not errs, errs[:2])
    pg.click('.langswitch button[data-lang="en"]'); pg.wait_for_timeout(400)
    ck("EN on old data does not crash", pg.locator("#slots .slot").count()==12)
    ck("missing status defaults to a real pill, not undefined",
       "undefined" not in pg.inner_text("#slots").lower(), "")
    pg.close()
    pg=ctx.new_page(); errs2=[]; pg.on("pageerror", lambda e: errs2.append(str(e)))
    pg.goto("http://localhost:8778/hub.html"); pg.wait_for_timeout(600)
    pg.fill("#gate-in","sedam"); pg.click("#gate-btn"); pg.wait_for_timeout(400)
    ck("hub renders old-shape timeline", pg.locator("#timeline .tl-row").count()==10,
       pg.locator("#timeline .tl-row").count())
    ck("missing repo falls back to a real edit URL",
       "NOVA_TV_777/edit/main/data/event.json" in (pg.get_attribute("#edit-link","href") or ""),
       pg.get_attribute("#edit-link","href"))
    ck("no page errors on old data", not errs2, errs2[:2])
    pg.close()
    open("/tmp/ugly/data/event.json","w").write(orig)

    print("SECOND TIME — doing it again changes nothing")
    pg=ctx.new_page(); pg.goto("http://localhost:8778/hub.html"); pg.wait_for_timeout(700)
    pg.fill("#gate-in","sedam"); pg.click("#gate-btn"); pg.wait_for_timeout(250)
    pg.fill("#gate-in","sedam"); pg.click("#gate-btn"); pg.wait_for_timeout(250)
    ck("unlocking twice leaves 10 rows, not 20", pg.locator("#timeline .tl-row").count()==10,
       pg.locator("#timeline .tl-row").count())
    ck("still unlocked", "locked" not in (pg.get_attribute("#vault","class") or ""))
    b.close()
print("\nFAILURES:", len(fails), fails)
sys.exit(1 if fails else 0)
