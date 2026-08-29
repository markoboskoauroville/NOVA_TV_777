# TEST 3 — the ugly cases. Sabotage on purpose, then confirm the degradation is the RIGHT one.
from playwright.sync_api import sync_playwright
import json, shutil, os, sys
R=os.environ.get("R777","/tmp/ugly"); fails=[]
def ck(n,c,g=""):
    print(("  PASS " if c else "  FAIL ")+n+(("  -> "+str(g)) if g else ""))
    if not c: fails.append(n)
orig = open(R+"/data/event.json").read()

def page(b, url="index.html"):
    pg=b.new_page(viewport={"width":390,"height":844})
    errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("http://localhost:8778/"+url); pg.wait_for_timeout(900)
    return pg, errs

with sync_playwright() as p:
    b=p.chromium.launch()

    print("ABSENT — event.json deleted")
    os.rename(R+"/data/event.json", R+"/data/_gone.json")
    pg,errs=page(b)
    ck("page still renders its text", "777" in pg.inner_text("body") and len(pg.inner_text("body"))>500)
    ck("countdown still runs from the fallback", pg.inner_text("#cd-d").isdigit(), pg.inner_text("#cd-d"))
    ck("slots degrade to empty, not to garbage", pg.locator("#slots .slot").count()==0)
    ck("no uncaught page error", not errs, errs[:2])
    pg.close(); os.rename(R+"/data/_gone.json", R+"/data/event.json")

    print("MALFORMED — truncated halfway")
    open(R+"/data/event.json","w").write(orig[:len(orig)//2])
    pg,errs=page(b)
    ck("page still renders", "777" in pg.inner_text("body"))
    ck("countdown still runs", pg.inner_text("#cd-d").isdigit(), pg.inner_text("#cd-d"))
    ck("no uncaught page error", not errs, errs[:2])
    pg.close()

    print("EMPTY — zero slots, zero applications")
    d=json.loads(orig); d["slots"]=[]; d["applications"]=[]; d["timeline"]=[]; d["budget"]=[]
    open(R+"/data/event.json","w").write(json.dumps(d))
    pg,errs=page(b)
    ck("no slots, no crash", pg.locator("#slots .slot").count()==0)
    ck("dropdown still has the no-preference option", pg.locator("#f-slot option").count()==1)
    ck("no uncaught page error", not errs, errs[:2])
    pg.close()
    pg,errs=page(b,"hub.html"); pg.fill("#gate-in","sedam"); pg.click("#gate-btn"); pg.wait_for_timeout(300)
    ck("hub stats read zero, not blank", pg.inner_text("#stats .stat-n").strip()=="0", pg.inner_text("#stats .stat-n"))
    ck("free-slot count of 0 is honest", "0" in pg.inner_text("#stats"))
    pg.close()

    print("ENORMOUS — a 300-character pseudonym")
    d=json.loads(orig); d["slots"][0]["pseudonym"]="DJ "+"X"*300
    d["slots"][0]["genre_hr"]="ž"*200; d["slots"][0]["genre_en"]="z"*200
    open(R+"/data/event.json","w").write(json.dumps(d))
    pg,errs=page(b)
    over=pg.evaluate("""()=>{const bad=[];const W=document.documentElement.clientWidth;
      document.querySelectorAll('body *').forEach(el=>{const r=el.getBoundingClientRect();
      if(r.width>0&&(r.right>W+1||r.left<-1))bad.push(el.tagName+'.'+el.className);});return bad.slice(0,4);}""")
    ck("a 300-char name still does not go off screen", not over, over)
    pg.close()

    print("PAST — the party has already happened")
    d=json.loads(orig)
    d["event"]["start"]="2020-05-28T19:00:00+02:00"; d["event"]["end"]="2020-05-29T07:00:00+02:00"
    open(R+"/data/event.json","w").write(json.dumps(d))
    pg,errs=page(b)
    ck("countdown floors at zero, no negatives", pg.inner_text("#cd-d")=="0", pg.inner_text("#cd-d"))
    ck("footer says it is over, not 'until'", "bilo je dobro" in pg.inner_text("#cd-foot").lower(), pg.inner_text("#cd-foot"))
    pg.close()

    print("DURING — the party is running right now")
    from datetime import datetime, timedelta, timezone
    n=datetime.now(timezone.utc)
    d["event"]["start"]=(n-timedelta(hours=2)).isoformat()
    d["event"]["end"]=(n+timedelta(hours=10)).isoformat()
    open(R+"/data/event.json","w").write(json.dumps(d))
    pg,errs=page(b)
    ck("says the party is running", "u tijeku" in pg.inner_text("#cd-foot").lower(), pg.inner_text("#cd-foot"))
    pg.close()

    open(R+"/data/event.json","w").write(orig)

    print("HOSTILE / TWICE — gate and language")
    pg,errs=page(b,"hub.html")
    pg.click("#gate-btn"); pg.wait_for_timeout(200)
    ck("empty passphrase does not unlock", "locked" in (pg.get_attribute("#vault","class") or ""))
    pg.fill("#gate-in","  SEDAM  "); pg.click("#gate-btn"); pg.wait_for_timeout(300)
    ck("whitespace and caps still unlock", "locked" not in (pg.get_attribute("#vault","class") or ""))
    for _ in range(12):
        pg.click('.langswitch button[data-lang="en"]'); pg.click('.langswitch button[data-lang="hr"]')
    pg.wait_for_timeout(500)
    ck("12 rapid language flips leave 10 timeline rows", pg.locator("#timeline .tl-row").count()==10,
       pg.locator("#timeline .tl-row").count())
    ck("no duplicated rows after flipping", pg.locator("#budget-body tr").count()==7,
       pg.locator("#budget-body tr").count())
    ck("no uncaught page error", not errs, errs[:2])
    pg.close()

    print("THE CHECK ITSELF — sabotage, to prove a red is possible")
    d=json.loads(orig); d["slots"]=d["slots"][:5]
    open(R+"/data/event.json","w").write(json.dumps(d))
    pg,_=page(b)
    saw = pg.locator("#slots .slot").count()
    ck("slot-count check goes RED when slots are removed (expect 5, not 12)", saw==5, saw)
    pg.close(); open(R+"/data/event.json","w").write(orig)
    b.close()

print("\nFAILURES:", len(fails), fails)
sys.exit(1 if fails else 0)
