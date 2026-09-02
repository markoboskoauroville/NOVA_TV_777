# TEST 2 — the real thing, in a real browser, driven the way a person drives it.
from playwright.sync_api import sync_playwright
import re, sys
fails=[]
def ck(name, cond, got=""):
    print(("  PASS " if cond else "  FAIL ")+name+(("  -> "+str(got)) if got else ""))
    if not cond: fails.append(name)

with sync_playwright() as p:
    b = p.chromium.launch()
    # 390px phone, the width the design language says to measure at
    pg = b.new_page(viewport={"width":390,"height":844})
    errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append(m.text) if m.type=="error" else None)
    pg.goto("http://localhost:8777/index.html"); pg.wait_for_timeout(1400)

    print("INDEX")
    ck("no console/page errors", not errs, errs[:3])
    d = pg.inner_text("#cd-d"); h = pg.inner_text("#cd-h")
    ck("countdown days is a number", d.isdigit(), d)
    from datetime import datetime, timezone, timedelta
    exp = (datetime(2027,5,28,19,0,tzinfo=timezone(timedelta(hours=2)))
           - datetime.now(timezone.utc)).days
    ck(f"countdown days matches the real date ({exp})", abs(int(d)-exp) <= 1, d)
    ck("hours zero-padded 2 chars", len(h)==2, h)
    ck("12 slots rendered", pg.locator("#slots .clip").count()==12, pg.locator("#slots .clip").count())
    ck("7 spine bands", pg.locator(".spine i").count()==7)
    ck("7 leader bars", pg.locator(".leader-bars .lb").count()==7)
    ck("7 coincidence rows", pg.locator(".lrow").count()==7)

    # language starts HR, swaps to EN, swaps back — in place
    hr_title = pg.inner_text('[data-i18n="hero_title"]').lower()
    ck("HR default", "dvanaest sati" in hr_title, hr_title[:40])
    pg.click('.langswitch button[data-lang="en"]'); pg.wait_for_timeout(500)
    en_title = pg.inner_text('[data-i18n="hero_title"]').lower()
    ck("EN swapped, no reload", "twelve hours" in en_title, en_title[:40])
    ck("html lang=en", pg.get_attribute("html","lang")=="en")
    ck("EN slot status word", "open" in pg.inner_text("#slots .clip:first-child .pill").lower(),
       pg.inner_text("#slots .clip:first-child .pill"))
    ck("EN countdown label", pg.inner_text("[data-i18n=\"cd_days\"]").lower()=="days", pg.inner_text("[data-i18n=\"cd_days\"]"))
    pg.click('.langswitch button[data-lang="hr"]'); pg.wait_for_timeout(400)
    ck("back to HR", "dvanaest sati" in pg.inner_text('[data-i18n="hero_title"]').lower())
    ck("no untranslated [key] markers", "[" not in pg.inner_text("body").replace("[","",0) or
       not re.search(r'\[[a-z0-9_]{3,}\]', pg.inner_text("body")),
       re.findall(r'\[[a-z0-9_]{3,}\]', pg.inner_text("body"))[:5])

    # NOTHING GOES OFF THE SCREEN — measured, not reasoned about
    over = pg.evaluate("""() => {
      const bad=[]; const W=document.documentElement.clientWidth;
      document.querySelectorAll('body *').forEach(el=>{
        const r=el.getBoundingClientRect();
        if(r.width>0 && (r.right>W+1 || r.left<-1)) bad.push(el.tagName+'.'+el.className+' r='+Math.round(r.right));
      }); return bad.slice(0,6);
    }""")
    ck("nothing off screen at 390px", not over, over)

    # the apply form, driven by pressing the button a person presses
    pg.fill("#f-name","Test Testić"); pg.fill("#f-pseu","DJ Proba")
    pg.click("#f-copy"); pg.wait_for_timeout(300)
    ck("copy button confirms", pg.inner_text("#f-copy").lower() in ("kopirano","copied"), pg.inner_text("#f-copy"))
    pg.click("#f-mail"); pg.wait_for_timeout(200)
    href = pg.get_attribute("#f-mail","href")
    ck("mailto composed with the typed name", href.startswith("mailto:") and "Testi" in href, href[:60])

    print("HUB")
    errs.clear()
    pg.goto("http://localhost:8777/hub.html"); pg.wait_for_timeout(1200)
    ck("no console/page errors", not errs, errs[:3])
    ck("vault starts locked", "locked" in (pg.get_attribute("#vault","class") or ""))
    pg.fill("#gate-in","krivo"); pg.click("#gate-btn"); pg.wait_for_timeout(250)
    ck("wrong passphrase keeps it locked", "locked" in (pg.get_attribute("#vault","class") or ""))
    ck("wrong passphrase says so", pg.inner_text("#gate-msg").strip() in ("Nije to.","Not it."), pg.inner_text("#gate-msg"))
    pg.fill("#gate-in","sedam"); pg.click("#gate-btn"); pg.wait_for_timeout(400)
    ck("right passphrase unlocks", "locked" not in (pg.get_attribute("#vault","class") or ""))
    ck("4 stat cells", pg.locator("#stats .stat").count()==4)
    ck("10 plan clips", pg.locator("#timeline .clip").count()==10)
    ck("7 budget rows", pg.locator("#budget-body tr").count()==7)
    ck("1 application row", pg.locator("#apps-body tr").count()==1)
    ck("timeline shows weekday", "petak" in pg.inner_text("#timeline"), pg.inner_text("#timeline .clip-genre").split("\n")[0])
    ck("edit link points at event.json", "edit/main/data/event.json" in (pg.get_attribute("#edit-link","href") or ""),
       pg.get_attribute("#edit-link","href"))
    over2 = pg.evaluate("""() => { const bad=[]; const W=document.documentElement.clientWidth;
      document.querySelectorAll('body *').forEach(el=>{const r=el.getBoundingClientRect();
      if(r.width>0 && (r.right>W+1||r.left<-1)) bad.push(el.tagName+'.'+el.className);}); return bad.slice(0,6);}""")
    ck("nothing off screen at 390px", not over2, over2)
    pg.click('.langswitch button[data-lang="en"]'); pg.wait_for_timeout(400)
    ck("hub timeline redraws in EN", "Friday" in pg.inner_text("#timeline"), "")
    ck("vault stays open across language change", "locked" not in (pg.get_attribute("#vault","class") or ""))
    b.close()
print("\nFAILURES:", len(fails), fails)
sys.exit(1 if fails else 0)
