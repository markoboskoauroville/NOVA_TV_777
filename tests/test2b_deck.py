# TEST 2, part two — the leader and the audio deck, in a real browser.
# Separate file so it can fail while the rest of test 2 passes.
from playwright.sync_api import sync_playwright
import sys, os
BASE = os.environ.get("B777", "http://localhost:8777")
fails = []
def ck(n, c, g=""):
    print(("  PASS " if c else "  FAIL ") + n + (("  -> " + str(g)) if g else ""))
    if not c: fails.append(n)

with sync_playwright() as p:
    b = p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])

    print("LEADER")
    ctx = b.new_context(viewport={"width":390,"height":844})
    pg = ctx.new_page(); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    # Record every value the counter takes, rather than sampling it. Polling raced
    # the 300ms window on "1" and failed about one run in three — a test that fails
    # at random teaches people to ignore it.
    # An init script runs before the document exists, so documentElement is null
    # and observe() throws. Attach on DOMContentLoaded instead, which still fires
    # before the first counter change.
    pg.add_init_script("""
      window.__seen = [];
      document.addEventListener('DOMContentLoaded', () => {
        const rec = () => {
          const n = document.querySelector('.leader-num');
          if (!n) return;
          const v = (n.textContent || '').trim();
          if (v && window.__seen[window.__seen.length-1] !== v) window.__seen.push(v);
        };
        rec();
        new MutationObserver(rec).observe(document.documentElement,
          {subtree:true, childList:true, characterData:true});
      });
    """)
    pg.goto(BASE + "/index.html")
    pg.wait_for_timeout(150)
    ck("leader was up on first visit", "gone" not in (pg.get_attribute("#leader","class") or ""),
       pg.get_attribute("#leader","class"))
    pg.wait_for_timeout(4300)          # 7 numbers x 600ms, plus slack
    seen = set(pg.evaluate("window.__seen") or [])
    ck("counts through all seven numbers", {"1","2","3","4","5","6","7"} <= seen, sorted(seen))
    pg.wait_for_timeout(900)
    ck("reaches the bar stage", "barring" in (pg.get_attribute("#leader","class") or "")
       or "collapsing" in (pg.get_attribute("#leader","class") or ""),
       pg.get_attribute("#leader","class"))
    pg.wait_for_timeout(4200)
    ck("leader finishes and gets out of the way", "gone" in (pg.get_attribute("#leader","class") or ""),
       pg.get_attribute("#leader","class"))
    ck("no page errors during leader", not errs, errs[:2])
    ck("page is usable underneath", pg.locator("#slots .clip").count()==12)

    print("LEADER — once per session")
    pg.reload(); pg.wait_for_timeout(700)
    ck("does not replay on reload", "gone" in (pg.get_attribute("#leader","class") or ""))
    pg.close()

    print("LEADER — skip")
    ctx2 = b.new_context(viewport={"width":390,"height":844})
    pg = ctx2.new_page(); pg.goto(BASE + "/index.html"); pg.wait_for_timeout(200)
    pg.click(".leader-skip"); pg.wait_for_timeout(200)
    ck("skip button ends it immediately", "gone" in (pg.get_attribute("#leader","class") or ""))
    pg.close()

    print("LEADER — reduced motion")
    ctx3 = b.new_context(viewport={"width":390,"height":844}, reduced_motion="reduce")
    pg = ctx3.new_page(); pg.goto(BASE + "/index.html"); pg.wait_for_timeout(350)
    ck("skipped entirely for reduced motion", "gone" in (pg.get_attribute("#leader","class") or ""),
       pg.get_attribute("#leader","class"))

    print("IDENT")
    ck("skip/replay control present", pg.locator("#ident-skip").count()==1)
    ck("the old top ident block is gone", pg.locator(".ident-rings").count()==0)


    print("FRAME STACK")
    ck("six frames present", pg.locator("#frames img").count()==6)
    vis = pg.evaluate("""() => [...document.querySelectorAll('#frames img')]
        .filter(im => parseFloat(getComputedStyle(im).opacity) > 0.05).length""")
    ck("exactly one frame is actually VISIBLE (opacity, not class)", vis==1, f"{vis} visible")
    ck("resting frame is the first one",
       pg.eval_on_selector("#frames img","e=>parseFloat(getComputedStyle(e).opacity)>0.05"))

    print("DECK")
    ck("waveform drew 120 real bars", pg.locator("#wave span").count()==120,
       pg.locator("#wave span").count())
    heights = pg.eval_on_selector_all("#wave span",
        "els => els.slice(0,40).map(e => parseFloat(e.style.height))")
    ck("waveform bars vary (a real signal, not a flat block)",
       max(heights) - min(heights) > 20, f"range {min(heights):.0f}-{max(heights):.0f}")
    ck("VU has two channels of 18 segments",
       pg.locator("#vu-l .vu-seg").count()==18 and pg.locator("#vu-r .vu-seg").count()==18,
       (pg.locator("#vu-l .vu-seg").count(), pg.locator("#vu-r .vu-seg").count()))
    ck("play icon shown, pause hidden, before first press",
       pg.eval_on_selector("#tp-play .ic-pause","e=>getComputedStyle(e).display")=="none")
    ck("tally is dark before play", "on" not in (pg.get_attribute(".tally","class") or ""))

    pg.click("#tp-play"); pg.wait_for_timeout(1800)
    ck("audio actually advances", pg.eval_on_selector("#anthem","a=>a.currentTime") > 0.4,
       round(pg.eval_on_selector("#anthem","a=>a.currentTime"),2))
    ck("button now offers pause, not play",
       pg.eval_on_selector("#tp-play .ic-play","e=>getComputedStyle(e).display")=="none")
    ck("tally lit while playing", "on" in (pg.get_attribute(".tally","class") or ""))
    ck("state label says playing", pg.inner_text("#tp-state").lower() in ("svira","playing"),
       pg.inner_text("#tp-state"))
    ck("source timecode is running", pg.inner_text("#src-tc") != "00:00:00:00", pg.inner_text("#src-tc"))
    ck("waveform marks what has played", pg.locator("#wave span.played").count() > 0,
       pg.locator("#wave span.played").count())
    lit = pg.locator("#vu-l .vu-seg.lit-g, #vu-l .vu-seg.lit-a, #vu-l .vu-seg.lit-r").count()
    ck("VU meters respond to real signal", lit > 0, f"{lit} segments lit")

    pg.click("#tp-play"); pg.wait_for_timeout(400)
    ck("pause stops it", pg.eval_on_selector("#anthem","a=>a.paused"))
    ck("button offers play again",
       pg.eval_on_selector("#tp-play .ic-pause","e=>getComputedStyle(e).display")=="none")
    ck("tally dark again", "on" not in (pg.get_attribute(".tally","class") or ""))

    can = pg.evaluate("() => AudioDeck.canSeek()")
    print("  ..  host serves byte ranges:", can)
    if can:
        pg.click("#tp-fwd"); pg.wait_for_timeout(300)
        t1 = pg.eval_on_selector("#anthem","a=>a.currentTime")
        pg.click("#tp-back"); pg.wait_for_timeout(300)
        t2 = pg.eval_on_selector("#anthem","a=>a.currentTime")
        ck("forward then back returns near the same spot", abs(t1-t2-10) < 1.5, (round(t1,1), round(t2,1)))
        pg.click("#tp-start"); pg.wait_for_timeout(300)
        ck("go to start rewinds", pg.eval_on_selector("#anthem","a=>a.currentTime") < 0.3)
        ck("skip buttons are live when seeking works",
           "inactive" not in (pg.get_attribute("#tp-fwd","class") or ""))
    else:
        ck("skip buttons are dimmed when the host cannot seek",
           "inactive" in (pg.get_attribute("#tp-fwd","class") or ""),
           pg.get_attribute("#tp-fwd","class"))
        ck("play still works without seeking", pg.eval_on_selector("#anthem","a=>a.currentTime") > 0.4)
    ck("no page errors across the deck", not errs, errs[:2])

    over = pg.evaluate("""()=>{const bad=[];const W=document.documentElement.clientWidth;
      document.querySelectorAll('body *').forEach(el=>{const r=el.getBoundingClientRect();
      if(r.width>0&&(r.right>W+1||r.left<-1))bad.push(el.tagName+'.'+el.className);});return bad.slice(0,5);}""")
    ck("deck fits 390px", not over, over)
    b.close()

print("\nFAILURES:", len(fails), fails)
sys.exit(1 if fails else 0)
