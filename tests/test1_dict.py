# TEST 1 — the mechanism alone. No browser, no server.
import re, json, sys, os
os.chdir(os.path.join(os.path.dirname(__file__), ".."))
fails=[]
def ck(n,c,g=""):
    print(("  PASS " if c else "  FAIL ")+n+(("  -> "+str(g)) if g else ""))
    if not c: fails.append(n)

d=json.load(open("data/event.json"))
ck("event.json parses", True)
ck("12 slots", len(d["slots"])==12, len(d["slots"]))
ck("slots run 19:00 to 06:00", d["slots"][0]["hour"]=="19:00" and d["slots"][-1]["hour"]=="06:00")
ck("no duplicate slot hours", len({s["hour"] for s in d["slots"]})==12)
ck("start is a Friday 19:00", d["event"]["start"].startswith("2027-05-28T19:00"), d["event"]["start"])

src=open("i18n.js").read()
body=src.split("const DICT = {",1)[1].split("\n};",1)[0]
keys=set(re.findall(r'^\s{2}([a-z0-9_]+):\s*\{', body, re.M))
missing=[m.group(1) for m in re.finditer(r'^\s{2}([a-z0-9_]+):\s*\{(.*?)\}\s*,?\s*$', body, re.M|re.S)
         if "hr:" not in m.group(2) or "en:" not in m.group(2)]
ck("every key has both languages", not missing, missing)

used=set()
for f in ("index.html","hub.html","songs.html"):
    used |= set(re.findall(r'data-i18n(?:-html|-ph)?="([a-z0-9_]+)"', open(f).read()))
runtime={f"st_{s}" for s in ("confirmed","held","open")} | \
        {f"ts_{s}" for s in ("done","active","waiting","blocked")} | \
        {f"as_{s}" for s in ("new","contacted","confirmed","scheduled","declined")} | \
        {"s_apps","s_conf","s_free","s_days","cd_foot","cd_live","cd_over","slot_open",
         "f_any","f_copied","hub_wrong","tp_playing","tp_paused","ident_replay","ident_skip","songs_empty","app_h","f_name","f_dept","f_pseu","f_genre","f_slot","f_note"}
used |= runtime
ck("no key referenced but undefined", not (used-keys), sorted(used-keys))
ck("no key defined but unused", not (keys-used), sorted(keys-used))
print("\nFAILURES:", len(fails), fails)
sys.exit(1 if fails else 0)
