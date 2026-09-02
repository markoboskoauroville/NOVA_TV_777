# TEST 2, part three — the songs page in a real browser.
from playwright.sync_api import sync_playwright
import sys, os
BASE = os.environ.get("B777", "http://localhost:8777")
fails = []
def ck(n, c, g=""):
    print(("  PASS " if c else "  FAIL ") + n + (("  -> " + str(g)) if g else ""))
    if not c: fails.append(n)

with sync_playwright() as p:
    b = p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
    pg = b.new_page(viewport={"width":390,"height":844})
    errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(BASE + "/songs.html"); pg.wait_for_timeout(1800)

    ck("two songs listed", pg.locator(".song").count()==2, pg.locator(".song").count())
    ck("miro credited to DJ Maniac i buraz",
       "buraz" in pg.inner_text(".song:nth-child(2) .song-artist").lower(),
       pg.inner_text(".song:nth-child(2) .song-artist"))
    ck("mantreshvar appears nowhere on the page",
       "mantreshvar" not in pg.inner_text("body").lower())
    ck("both artworks actually load",
       pg.evaluate("() => [...document.querySelectorAll(\'.song-art img\')].every(i => i.naturalWidth > 10)"))
    ck("artwork is square",
       abs(pg.eval_on_selector(".song-art","e=>e.getBoundingClientRect().width")
         - pg.eval_on_selector(".song-art","e=>e.getBoundingClientRect().height")) < 2)
    ck("each song has its own 120-bar waveform",
       pg.locator(".song:nth-child(1) .song-wave span").count()==120 and
       pg.locator(".song:nth-child(2) .song-wave span").count()==120)
    w1 = pg.eval_on_selector_all(".song:nth-child(1) .song-wave span","e=>e.slice(0,30).map(x=>x.style.height)")
    w2 = pg.eval_on_selector_all(".song:nth-child(2) .song-wave span","e=>e.slice(0,30).map(x=>x.style.height)")
    ck("the two waveforms differ, so each is its own signal", w1 != w2)

    pg.click(".song:nth-child(1) .play"); pg.wait_for_timeout(1500)
    ck("first song plays", pg.eval_on_selector(".song:nth-child(1) audio","a=>!a.paused && a.currentTime>0.3"))
    pg.click(".song:nth-child(2) .play"); pg.wait_for_timeout(1200)
    ck("starting the second stops the first", pg.eval_on_selector(".song:nth-child(1) audio","a=>a.paused"))
    ck("only one play button lit at a time", pg.locator(".play.on").count()==1)
    pg.click(".song:nth-child(2) .play"); pg.wait_for_timeout(500)
    ck("pause works", pg.eval_on_selector(".song:nth-child(2) audio","a=>a.paused"))

    pg.click('.langswitch button[data-lang="en"]'); pg.wait_for_timeout(600)
    ck("EN credit reads and brother",
       "brother" in pg.inner_text(".song:nth-child(2) .song-artist").lower(),
       pg.inner_text(".song:nth-child(2) .song-artist"))
    ck("still two songs after a language swap", pg.locator(".song").count()==2)

    over = pg.evaluate("""()=>{const bad=[];const W=document.documentElement.clientWidth;
      document.querySelectorAll('body *').forEach(el=>{const r=el.getBoundingClientRect();
      if(r.width>0&&(r.right>W+1||r.left<-1))bad.push(el.tagName+'.'+el.className);});return bad.slice(0,5);}""")
    ck("nothing off screen at 390px", not over, over)
    ck("no page errors", not errs, errs[:2])
    b.close()
print("\nFAILURES:", len(fails), fails)
sys.exit(1 if fails else 0)
