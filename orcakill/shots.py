# Shot list for "Orcas Kill These Animals and Never Eat Them". Executed by build.py.
PI = 3.14159
def orc(p, len=700, path=None, **k): return dict(k="orca", path=path if path is not None else p, len=len, **k)
def por(p, len=260, kind="harbor", path=None, **k): return dict(k="porpoise", kind=kind, path=path if path is not None else p, len=len, **k)
def sal(p, len=200, path=None, **k): return dict(k="salmon", path=path if path is not None else p, len=len, **k)
def calf(p, len=300, path=None, **k): return dict(k="calf", path=path if path is not None else p, len=len, **k)
HEAD = [130, -96, -0.06, 480, 92]      # held on the orca's head
NOSE = [-80, 30, 0.0, 480, 0]            # pushed along in front of the snout
MOUTH = [30, 60, 0.15, 480, 0]          # held across the mouth
WL = 470
def surf(x0, x1, d, y=WL + 40, len=760, **k): return orc([[0, x0, y], [d, x1, y + 6]], len, beat=0.45, amp=0.025, **k)
PUSH = dict(z0=1.0, z1=1.1)
PULL = dict(z0=1.12, z1=1.0)
LOWC = dict(z0=1.08, z1=1.16, y0=-30, y1=-60)
TH_COL = ["#3fa9d6", "#7fe0c0", "#e8b04c", "#c58cf0"]
def TH(n, word, sub):
    def f(a, b):
        i, j, k = nid("tn"), nid("tt"), nid("ts")
        tw(f"#{i}", {"opacity": 1, "scale": 1}, a + 0.15, 0.5, {"opacity": 0, "scale": 0.7}, "back.out(2)")
        tw(f"#{j}", {"opacity": 1, "y": 0}, a + 0.45, 0.5, {"opacity": 0, "y": 40}, "back.out(2)")
        tw(f"#{k}", {"opacity": 1}, a + 1.0, 0.5, {"opacity": 0})
        c = TH_COL[(n - 1) % 4]
        return (f'<div id="{i}" class="chap" style="top:250px;font-size:110px;color:{c};opacity:0">THEORY {n}</div>'
                f'<div id="{j}" class="chap" style="top:400px;font-size:200px;opacity:0">{word}</div>'
                f'<div id="{k}" class="chapsub" style="top:650px;font-size:56px;opacity:0">{sub}</div>')
    return f
def TILES(names, times):
    def f(a, b):
        out = ""
        for n, (nm, t) in enumerate(zip(names, times)):
            i = nid("tl"); x = 160 + n * 560
            tw(f"#{i}", {"opacity": 1, "y": 0}, t, 0.5, {"opacity": 0, "y": 40}, "back.out(2)")
            out += f'<div id="{i}" style="position:absolute;left:{x}px;top:360px;width:500px;height:300px;border-radius:40px;background:#fffdf6;box-shadow:0 14px 0 rgba(10,40,70,.25);opacity:0;text-align:center"><div style="font-family:Fredoka;font-weight:700;font-size:44px;color:{TH_COL[n]};margin-top:46px">THEORY {n + 1}</div><div style="font-family:Fredoka;font-weight:700;font-size:96px;color:#173a55">{nm}</div></div>'
        return out
    return f

SHOTS = [
    # ===================== HOOK
    ("0:00.00", A("split", sky="dusk", actors=[surf(-300, 900, 3.4, len=820), surf(-700, 500, 3.4, y=WL + 60, len=600, ph0=2)], blow=[[1.0, 0]], cam=dict(z0=1.0, z1=1.08), ov=both(lambda a, b: fade_in_black(a, 1.2), ST_("THERE ARE 76 OF THESE ORCAS LEFT ON EARTH", "0:00.6", "0:03.2")))),
    ("0:03.42", A("dronemeasure", cam=dict(z0=1.0, z1=1.06, hand=True), ov=ST_("SO HUNGRY, SCIENTISTS MEASURE HOW THIN THEY ARE WITH DRONES", "0:03.8", "0:09.2", size=50))),
    ("0:09.38", A("split", sky="pnw", actors=[por([[0, 700, WL + 60], [5.6, 1900, WL + 40]], 300, beat=2.4), orc([[0, -200, WL + 80], [5.6, 1400, WL + 60]], 800, beat=1.0)], cam=dict(z0=1.0, z1=1.06, x0=-40, x1=60), ov=ST_("FOR 60 YEARS THEY'VE CHASED A FAT, WARM-BLOODED ANIMAL", "0:09.6", "0:14.9", size=50))),
    ("0:15.00", A("split", sky="pnw", actors=[orc([[0, 600, WL + 70], [4.98, 1300, WL + 90]], 820, beat=0.6), por(None, 300, heldBy=0, hold=HEAD, heldOn=[[0, 1], [2.6, 1], [2.8, 0]], path=[[2.8, 1180, WL - 40], [4.98, 900, WL + 160]], roll=[[2.8, 0], [3.6, PI]], limp=1)], cam=PUSH, ov=ST_("KILLED IT, AND SWAM AWAY WITHOUT A SINGLE BITE", "0:15.2", "0:19.8", size=50))),
    ("0:19.98", A("deep", tone="blue", actors=[por([[0, 960, 520], [1.5, 970, 560]], 520, roll=PI, limp=1), orc([[0, 1000, 300], [1.5, 1900, 260]], 700, fog=0.4)], cam=dict(z0=1.1, z1=1.16), ov=ST_("NOT ONE BITE", "0:20.0", "0:21.3", size=80))),
    ("0:21.46", PH("transient_3", zoom=(1.0, 1.1), ov=ST_("THE ORCAS NEXT DOOR EAT THIS ANIMAL ALL THE TIME", "0:21.8", "0:28.5"))),
    ("0:28.74", A("deep", tone="dark", actors=[orc([[0, -300, 540], [2.4, 900, 520]], 900, thin=1, beat=0.4)], cam=dict(z0=1.0, z1=1.06), ov=ST_("THESE ONES WOULD RATHER STARVE", "0:28.9", "0:31.0"))),
    ("0:31.12", A("split", sky="grey", actors=[orc([[0, 800, WL + 70], [2.7, 900, WL + 70]], 800, beat=0.5), por(None, 280, heldBy=0, hold=NOSE, wob=0.15)], cam=dict(z0=1.12, z1=1.2), ov=ST_("SO IF IT ISN'T FOOD, WHAT IS IT?", "0:31.3", "0:33.6"))),
    ("0:33.80", V("orcau_0", 0.8, ov=both(ST_("A GAME?", "0:33.9", "0:34.6", size=80), ST_("TRAINING?", "0:34.7", "0:35.5", size=80), ST_("OR SOMETHING SADDER?", "0:35.7", "0:38.1", size=80)))),
    ("0:38.32", V("pod_0", 0, ov=ST_("SCIENTISTS HAVE THREE THEORIES", "0:38.6", "0:40.6"))),
    ("0:40.76", V("orcau_1", 2, ov=ST_("THE THIRD CHANGES HOW YOU SEE IT ALL", "0:41.0", "0:43.8"))),
    # ===================== WHAT PEOPLE SEE
    ("0:43.98", V("boat_0", 0, ov=ST_("START WITH WHAT PEOPLE ACTUALLY SEE", "0:44.2", "0:46.5"))),
    ("0:46.74", A("salish", pins=[[1100, 560, 0.8]], cam=dict(z0=1.0, z1=1.1), ov=both(ST_("THE SALISH SEA", "0:47.0", "0:48.8", size=70), ST_("BETWEEN WASHINGTON STATE AND BRITISH COLUMBIA", "0:49.2", "0:53.6")))),
    ("0:53.80", A("split", sky="pnw", boat=dict(x=380, s=0.6, binoc=0.6, point=3.5), actors=[surf(600, 1300, 6.1, len=800), orc([[0, 300, WL + 90], [6.1, 1000, WL + 96]], 580, beat=0.5, fog=0.15), por(None, 220, heldBy=0, hold=[-40, 80, 0.05, 480, 0])], blow=[[1.2, 0]], cam=dict(z0=1.0, z1=1.06), ov=ST_("ONE OF THEM HAS SOMETHING SMALL AND GREY BESIDE IT", "0:54.4", "0:59.6", size=50))),
    ("0:59.86", A("split", sky="pnw", actors=[surf(900, 1050, 3.4, len=900), por(None, 260, heldBy=0, hold=[-40, 80, 0.05, 480, 0])], cam=dict(z0=1.25, z1=1.45, x0=-320, x1=-400, y0=-40, y1=-60), ov=both(ST_("AT FIRST YOU THINK IT'S A CALF", "1:00.0", "1:01.8"), ST_("IT ISN'T.", "1:02.1", "1:03.0", size=80)))),
    ("1:03.24", PH("hporp_0", zoom=(1.0, 1.12), ov=ST_("A HARBOUR PORPOISE · 1.5 M · ABOUT A TEENAGER'S WEIGHT", "1:03.6", "1:09.4", size=50))),
    ("1:09.68", A("split", sky="pnw", actors=[orc([[0, 500, WL + 70], [8.1, 1400, WL + 70]], 820, beat=0.6), por([[2.1, 1000, WL + 70], [3.3, 1250, WL - 20], [4.6, 1380, WL + 80]], 280, heldBy=0, hold=NOSE, heldOn=[[0, 1], [2.0, 1], [2.1, 0], [4.6, 0], [4.7, 1]])],
        cam=dict(z0=1.0, z1=1.06, x0=-60, x1=60), ov=ST_("PUSHED · LIFTED · CARRIED · DROPPED · CAUGHT AGAIN", "1:10.0", "1:17.5"))),
    ("1:17.78", A("deep", tone="blue", actors=[por([[0, 960, 500], [2, 1150, 420], [4, 820, 560], [5.78, 1000, 480]], 300, beat=2.6), orc([[0, 400, 300], [5.78, 1500, 340]], 760), orc([[0, 1600, 700], [5.78, 500, 680]], 700, ph0=2), orc([[0, -200, 600], [5.78, 900, 620]], 600, fog=0.25, ph0=4)], cam=dict(z0=1.0, z1=1.06), ov=ST_("MORE THAN ONE WHALE. NO REST AT ALL.", "1:18.2", "1:23.3"))),
    ("1:23.56", A("split", sky="pnw", actors=[orc([[0, 600, WL + 80], [4.7, 1200, WL + 80]], 820, beat=0.8), por([[0, 900, WL + 80], [1.5, 1000, WL + 100], [4.7, 2400, WL + 60]], 280, beat=3.0)], cam=dict(z0=1.0, z1=1.05), ov=both(ST_("IT ENDS ONE OF TWO WAYS", "1:23.8", "1:25.6"), ST_("THE PORPOISE FINDS A GAP AND BOLTS...", "1:25.8", "1:28.1")))),
    ("1:28.24", A("deep", tone="blue", actors=[por([[0, 960, 520], [6.06, 980, 580]], 520, roll=PI, limp=1), orc([[0, 900, 300], [6.06, 2200, 240]], 760, fog=[[0, 0], [6, 0.5]]), orc([[0, 700, 760], [6.06, 2100, 800]], 640, fog=[[0, 0.1], [6, 0.6]], ph0=2)], cam=dict(z0=1.05, z1=1.12), ov=both(ST_("...OR IT STOPS MOVING", "1:28.3", "1:29.9"), ST_("THEN THE WHALES LOSE INTEREST AND LEAVE", "1:30.2", "1:34.1")))),
    ("1:34.30", A("deep", tone="dark", actors=[por([[0, 960, 540], [1.56, 965, 560]], 640, roll=PI, limp=1)], cam=dict(z0=1.2, z1=1.26), ov=ST_("NOBODY EATS IT", "1:34.4", "1:35.7", size=80))),
    ("1:35.86", PH("sanjuan_3", zoom=(1.0, 1.1), ov=ST_("ONE RESEARCHER SUMMED IT UP IN FIVE WORDS", "1:36.2", "1:41.0"))),
    ("1:41.16", A("split", sky="grey", actors=[orc([[0, 900, WL + 70], [2.44, 960, WL + 70]], 820, beat=0.5), por(None, 280, heldBy=0, hold=HEAD)], cam=dict(z0=1.1, z1=1.16), ov=TT("WHAT ON EARTH<br>IS HAPPENING?", "1:41.2", "1:43.5", y=90, size=110))),
    # ===================== THE RECORDS
    ("1:43.60", PH("whalewatch_7", zoom=(1.0, 1.1), ov=ST_("THE FIRST WRITTEN RECORD: 1962", "1:43.8", "1:46.9"))),
    ("1:47.08", A("records", t0=0.5, dur=11.0, cam=dict(z0=1.06, z1=1.0), ov=ST_("LOGBOOKS · PHOTOGRAPHS · EYEWITNESSES · 12+ RESEARCH GROUPS", "1:47.3", "1:58.6", y=120, size=46))),
    ("1:58.88", A("records", t0=-20, dur=1, red=4.8, cam=dict(z0=1.0, z1=1.06), ov=both(ST_("78 SEPARATE INCIDENTS, 1962 TO 2020", "1:59.0", "2:03.8", y=120), ST_("IN 28, THE PORPOISE DIED", "2:04.1", "2:06.6", y=120), ST_("THE REST GOT AWAY, OR NOBODY SAW THE END", "2:07.0", "2:10.9", y=120)))),
    ("2:11.16", PH("hporp_1", zoom=(1.0, 1.1), ov=ST_("MOST VICTIMS WERE HARBOUR PORPOISES", "2:11.4", "2:13.3"))),
    ("2:13.52", A("deep", tone="blue", actors=[orc([[0, -200, 560], [7.26, 1300, 540]], 860, beat=0.6), por([[0, 300, 360], [7.26, 1700, 340]], 340, kind="dall", beat=1.6)], cam=dict(z0=1.0, z1=1.06), ov=both(ST_("13 WERE DALL'S PORPOISES", "2:13.8", "2:16.4"), ST_("BLACK AND WHITE, LIKE AN ORCA THAT SHRANK IN THE WASH", "2:16.6", "2:20.6", size=50)))),
    ("2:20.78", PH("dall_0", zoom=(1.0, 1.12), ov=ST_("WHICH SOMEHOW MAKES IT WORSE", "2:21.2", "2:24.0"))),
    ("2:24.26", A("records", t0=-20, dur=1, red=-1, eaten=0.6, cam=dict(z0=1.04, z1=1.1), ov=ST_("ACROSS ALL 78 CASES, PORPOISES EATEN: ZERO", "2:24.6", "2:29.9", y=120))),
    ("2:30.10", A("deep", tone="dark", actors=[por([[0, 960, 560], [5.82, 980, 580]], 700, roll=PI, limp=1, fog=0.1)], cam=dict(z0=1.0, z1=1.08), ov=TT("PHOCOENICIDE", "2:30.4", "2:35.7", y=330, size=130, sub="PORPOISE KILLING"))),
    ("2:35.92", V("orcau_1", 8, ov=ST_("WHEN SCIENTISTS NEED A NEW WORD FOR YOUR HOBBY...", "2:36.2", "2:41.5", size=50))),
    # ===================== THE SOUTHERN RESIDENTS
    ("2:41.76", PH("srkw_0", zoom=(1.0, 1.1), ov=ST_("WHO ARE THESE ORCAS?", "2:42.0", "2:47.3"))),
    ("2:47.54", A("salish", pods=[[0.2, 600, 900, 70, -60, 9]], cam=dict(z0=1.0, z1=1.08), ov=ST_("THE SOUTHERN RESIDENTS", "2:47.8", "2:49.9", size=70))),
    ("2:50.08", A("pods", cam=dict(z0=1.06, z1=1.0), ov=ST_("THREE FAMILIES: J POD · K POD · L POD", "2:50.3", "2:54.9", y=110))),
    ("2:55.10", PH("salish_2", zoom=(1.0, 1.1), ov=ST_("COUNTED EVERY YEAR SINCE 1976", "2:55.3", "3:03.3"))),
    ("3:03.54", PH("srkw_1", zoom=(1.0, 1.12), ov=ST_("EVERY WHALE: A NUMBER, A NAME, A FAMILY TREE", "3:03.8", "3:09.3"))),
    ("3:09.52", A("deep", tone="blue", actors=[sal([[0, 1300, 480], [4.8, 1900, 440]], 240, beat=2.4, dir=1), orc([[0, -300, 560], [4.8, 1300, 500]], 860, beat=1.0)], cam=dict(z0=1.0, z1=1.06), ov=ST_("ONE FISH ABOVE ALL: CHINOOK SALMON", "3:09.8", "3:14.1"))),
    ("3:14.32", PH("chinook_7", zoom=(1.0, 1.1), ov=ST_("THE BIGGEST, FATTIEST SALMON IN THE PACIFIC", "3:14.6", "3:17.4"))),
    ("3:17.64", A("diet", cam=dict(z0=1.0, z1=1.05), ov=ST_("UP TO 80% OF THEIR DIET", "3:17.9", "3:21.0", y=110))),
    ("3:21.22", V("orcau_2", 0, ov=ST_("FOR A LONG TIME, A BRILLIANT STRATEGY", "3:21.4", "3:24.7"))),
    ("3:24.88", A("river", dam=1.2, boats=3.0, town=4.4, cam=dict(z0=1.0, z1=1.05), ov=ST_("RIVERS DAMMED · OCEAN FISHED HARD · TOWNS OVER THE STREAMS", "3:25.1", "3:31.8", size=48))),
    ("3:32.06", A("line", icon="salmon", cam=dict(z0=1.0, z1=1.04), ov=ST_("CHINOOK FALLING SINCE THE 1980s, AND THE WHALES WITH THEM", "3:32.3", "3:38.0", y=110, size=48))),
    ("3:38.18", A("peanut", t0=2.6, cam=dict(z0=1.0, z1=1.04), ov=both(ST_("YOU CAN SEE IT ON THEIR BODIES", "3:38.4", "3:40.6", y=110), ST_("HEALTHY: A SMOOTH, ROUNDED NECK", "3:41.0", "3:44.1", y=110), ST_("STARVING: A DIP BEHIND THE SKULL. 'PEANUT HEAD'", "3:44.5", "3:50.8", y=110, size=50)))),
    ("3:51.00", A("dronemeasure", cam=dict(z0=1.1, z1=1.2, hand=True), ov=ST_("THAT'S WHAT THE DRONES ARE LOOKING FOR", "3:51.3", "3:55.7"))),
    ("3:55.92", A("calves", t0=1.6, cam=dict(z0=1.0, z1=1.05), ov=ST_("CLOSE TO 70% OF PREGNANCIES FAIL", "3:56.2", "4:02.6", y=110))),
    ("4:02.86", PH("srkw_5", zoom=(1.0, 1.1), ov=ST_("THE MOTHER ISN'T GETTING ENOUGH TO EAT", "4:03.0", "4:10.1"))),
    ("4:10.38", A("pods", counts=[["J", 25, 360], ["K", 14, 960], ["L", 34, 1560]], k14=1.2, cam=dict(z0=1.0, z1=1.06), ov=ST_("2025: K POD DOWN TO 14 · ONE CALF SINCE 2011", "4:10.7", "4:20.0", y=110))),
    ("4:20.26", PH("srkw_6", zoom=(1.0, 1.1), ov=ST_("LIKELY GONE WITHIN A CENTURY, IF NOTHING CHANGES", "4:20.6", "4:27.4"))),
    ("4:27.70", A("split", sky="grey", actors=[orc([[0, -300, WL + 80], [6.2, 1100, WL + 80]], 860, thin=1, beat=0.4), por([[0, 1500, WL + 90], [6.2, 500, WL + 110]], 300, beat=1.4)], cam=dict(z0=1.0, z1=1.06), ov=ST_("RIGHT PAST ITS NOSE: 60 KG OF MEAT AND BLUBBER", "4:28.0", "4:39.9"))),
    ("4:33.90", PH("hporp_3", zoom=(1.0, 1.1), ov=ST_("60 KG OF MEAT AND BLUBBER, EASY TO CATCH", "4:34.2", "4:39.9"))),
    ("4:40.18", A("deep", tone="blue", actors=[orc([[0, 700, 520], [7.68, 900, 520]], 880, thin=1, beat=0.5), por(None, 280, heldBy=0, hold=NOSE, heldOn=[[0, 1], [3.5, 1], [3.6, 0]], path=[[3.6, 560, 540], [7.68, 520, 640]], roll=[[3.6, 0], [4.4, PI]], limp=[[2.0, 0], [3.4, 1]])], cam=dict(z0=1.05, z1=1.12), ov=both(ST_("IT CATCHES IT · KILLS IT · LEAVES IT", "4:40.3", "4:44.0"), ST_("HARDER TO EXPLAIN WHEN YOU MEET THE NEIGHBOURS", "4:44.2", "4:47.6", size=50)))),
    # ===================== THE NEIGHBOURS
    ("4:47.86", PH("transient_2", zoom=(1.0, 1.1), ov=ST_("BIGG'S KILLER WHALES", "4:48.2", "4:53.8", size=70))),
    ("4:54.08", V("pod_1", 8, ov=both(ST_("SAME BLACK AND WHITE · SAME TALL FIN", "4:54.4", "4:59.4"), ST_("BUT BIGG'S ORCAS DON'T EAT FISH", "4:59.8", "5:02.7")))),
    ("5:02.92", A("menus", t1=0.3, t2=1.4, cam=dict(z0=1.0, z1=1.04), ov=ST_("SEALS · SEA LIONS · AND, YES, PORPOISES", "5:04.0", "5:08.8", y=980))),
    ("5:09.00", PH("transient_3", zoom=(1.12, 1.0), ov=ST_("FOR THEM, A PORPOISE IS AN ORDINARY LUNCH. THEY'RE THRIVING.", "5:09.3", "5:17.9", size=48))),
    ("5:18.10", A("split", sky="pnw", actors=[orc([[0, -400, WL + 80], [9.84, 1700, WL + 70]], 760, beat=0.6), orc([[0, -800, WL + 120], [9.84, 1300, WL + 110]], 560, beat=0.7, ph0=2), orc([[0, 2300, WL + 300], [9.84, 400, WL + 300]], 760, thin=1, beat=0.4, fog=0.15)], cam=dict(z0=1.0, z1=1.05), ov=ST_("ONE GROUP GETTING FAT ON PORPOISE, ONE GOING HUNGRY", "5:18.4", "5:27.7", size=50))),
    ("5:27.94", PH("whalewatch_3", zoom=(1.0, 1.1), ov=ST_("SAME SPECIES · SAME WATER · SAME PREY", "5:28.0", "5:32.0"))),
    ("5:32.28", PH("srkw_7", zoom=(1.0, 1.1), ov=ST_("THE QUESTION THE LEAD SCIENTIST HEARS MOST", "5:32.6", "5:37.0"))),
    ("5:37.24", A("deep", tone="blue", actors=[orc([[0, -300, 560], [4.32, 1300, 540]], 860, thin=1, beat=0.5), dict(k="porpoise", kind="harbor", path=[[0, 1300, 320], [4.32, 700, 340]], len=280, beat=1.4)], cam=dict(z0=1.0, z1=1.06), ov=ST_("WHY DON'T THEY JUST EAT A SEAL, OR A PORPOISE?", "5:37.4", "5:41.3"))),
    ("5:41.56", A("pod", cam=dict(z0=1.06, z1=1.0), ov=both(TT("CULTURE", "5:41.7", "5:43.7", y=360, size=170), ST_("SOUNDS SOFT. FOR ORCAS, IT'S AS SOLID AS BONE.", "5:44.0", "5:48.8")))),
    ("5:49.08", A("map", **{"from": [-40, 20, 1.0], "to": [-10, 0, 1.25]}, pins=[[18.0, 69.6, 1.2, "#ff5b4f"], [-63.8, -42.5, 2.4, "#ff5b4f"], [22.1, -34.2, 3.6, "#ff5b4f"]], ov=ST_("DIFFERENT FAMILIES LOCKED ON TO DIFFERENT FOODS", "5:49.4", "5:55.6"))),
    ("5:55.80", A("carousel", cam=dict(z0=1.0, z1=1.06), ov=ST_("NORWAY: HERRING, HERDED AND STUNNED WITH TAILS", "5:56.0", "6:00.2"))),
    ("6:00.46", A("beachhunt", go=1.0, cam=dict(z0=1.0, z1=1.05), ov=ST_("ARGENTINA: SEA LION PUPS, GRABBED OFF THE BEACH", "6:00.7", "6:05.0"))),
    ("6:05.20", A("deep", tone="dark", actors=[orc([[0, 600, 500], [4.42, 1700, 440]], 860, carry=0, beat=0.8), dict(k="shark", path=[[0, 700, 640], [4.42, 760, 900]], len=560, roll=PI, limp=1, z=-2)], cam=dict(z0=1.06, z1=1.0), ov=ST_("SOUTH AFRICA: GREAT WHITE SHARK LIVERS", "6:05.4", "6:09.4"))),
    ("6:09.62", A("pod", teach=0.6, cam=dict(z0=1.0, z1=1.06), ov=ST_("LEARNED FROM MOTHERS AND GRANDMOTHERS. MOST NEVER SWITCH.", "6:09.9", "6:16.2", size=48))),
    ("6:16.46", A("deep", tone="blue", actors=[calf([[0, -200, 600], [3.88, 1100, 580]], 420, beat=1.0), orc([[0, -500, 440], [3.88, 900, 420]], 860, beat=0.7), sal(None, 200, heldBy=1, hold=MOUTH, holdDir=-1)], cam=dict(z0=1.0, z1=1.06), ov=ST_("A YOUNG RESIDENT LEARNS: FOOD MEANS SALMON", "6:16.7", "6:20.1"))),
    ("6:20.34", A("kitchen", cam=dict(z0=1.0, z1=1.08), ov=both(ST_("A PORPOISE IS NOT ON THE MENU", "6:20.5", "6:22.4", y=80), ST_("LIKE YOUR NEIGHBOUR'S CAT ISN'T ON YOURS", "6:22.8", "6:28.0", y=80), ST_("IT DOESN'T REGISTER AS FOOD", "6:28.3", "6:31.2", y=80)))),
    ("6:31.46", A("deep", tone="blue", actors=[orc([[0, -300, 360], [8.58, 2200, 340]], 760, beat=0.6), orc([[0, -700, 420], [8.58, 1800, 400]], 560, beat=0.7, ph0=2), orc([[0, 2300, 720], [8.58, -300, 740]], 760, beat=0.6, ph0=4), orc([[0, 2700, 780], [8.58, 100, 800]], 600, beat=0.7, ph0=1)], cam=dict(z0=1.0, z1=1.05), ov=both(ST_("THEY DON'T HUNT, SOCIALISE OR INTERBREED", "6:31.7", "6:36.5"), ST_("THEY PASS LIKE STRANGERS ON A STREET", "6:36.8", "6:39.9")))),
    ("6:40.16", PH("srkw_1", zoom=(1.12, 1.0), ov=ST_("NO J, K OR L WHALE HAS EVER WATCHED A RELATIVE EAT A MAMMAL", "6:40.4", "6:45.8", size=46))),
    # ===================== THEORY 1: PLAY
    ("6:46.04", V("orcau_0", 24, ov=ST_("IF IT ISN'T FOOD, WHY BOTHER WITH IT AT ALL?", "6:48.3", "6:52.1"))),
    ("6:52.32", A("deep", tone="dark", actors=[], snow=40, ov=TH(1, "PLAY", "THEY'RE PLAYING"))),
    ("6:55.00", PH("srkw_3", zoom=(1.0, 1.1), ov=ST_("THE SOUTHERN RESIDENTS HAVE A RECORD", "6:55.3", "6:58.8"))),
    ("6:58.98", A("hat", copies=0, cam=dict(z0=1.12, z1=1.04), ov=ST_("1987: A K POD FEMALE WEARS A DEAD SALMON LIKE A HAT", "6:59.4", "7:08.5", size=50))),
    ("7:08.76", A("hat", copies=2, cam=dict(z0=1.0, z1=1.05), ov=both(ST_("SOON THE OTHER PODS WERE DOING IT TOO", "7:09.0", "7:12.0"), ST_("DEAD SALMON HATS, ALL OVER THE SALISH SEA", "7:12.3", "7:15.7")))),
    ("7:15.88", V("pod_0", 6, ov=ST_("BY THE END OF THE YEAR, IT WAS OVER", "7:16.0", "7:18.0"))),
    ("7:18.10", PH("sanjuan_3", zoom=(1.12, 1.0), ov=ST_("NOBODY KNOWS WHY IT STARTED, OR STOPPED", "7:18.3", "7:22.0"))),
    ("7:22.26", A("hat", copies=0, sky="pnw", cam=dict(z0=1.0, z1=1.1), ov=ST_("2024: ONE WHALE DID IT AGAIN", "7:22.5", "7:28.6"))),
    ("7:28.84", V("orcau_1", 20, ov=both(TT("ORCAS HAVE FADS", "7:28.9", "7:30.9", y=360, size=140), ST_("ONE INVENTS SOMETHING POINTLESS. IF IT'S FUN, OTHERS COPY.", "7:31.2", "7:36.0", size=48)))),
    ("7:36.22", A("salish", pods=[[0.2, 300, 900, 120, -80, 5], [2.2, 1700, 900, -110, -60, 5], [4.2, 1800, 200, -90, 60, 5]], cam=dict(z0=1.0, z1=1.06), ov=both(ST_("THE PORPOISE GAME FOLLOWS THE SAME PATTERN", "7:36.4", "7:39.0"), ST_("FIRST L POD, THEN J POD AND K POD", "7:39.3", "7:44.0")))),
    ("7:44.20", A("bars", bars=[["1990s", 0.35, "#7fd3ee"], ["2005", 1.0, "#ff8a6b"], ["2010s", 0.45, "#7fd3ee"]], t0=0.6, cam=dict(z0=1.0, z1=1.04), ov=ST_("IT RISES AND FALLS. PEAK: 2005, TEN TIMES.", "7:44.5", "7:50.8", y=120))),
    ("7:50.98", A("pod", teach=0.8, cam=dict(z0=1.0, z1=1.06), ov=both(ST_("IT HAS BEEN HANDED DOWN", "7:51.2", "7:53.0"), ST_("WHALES BORN AFTER 1962 ARE DOING IT NOW", "7:53.3", "7:56.8")))),
    ("7:57.04", A("split", sky="pnw", actors=[orc([[0, 300, WL + 90], [8.02, 1500, WL + 80]], 800, beat=0.9), por([[0, 800, WL + 80], [2, 1000, WL + 160], [4, 1200, WL + 60], [6, 1500, WL + 150], [8.02, 1900, WL + 90]], 280, beat=3.0)], cam=dict(z0=1.0, z1=1.05, x0=-60, x1=60), ov=ST_("QUICK · IT DODGES · IT REACTS TO EVERYTHING", "7:57.4", "8:04.8"))),
    ("8:05.06", A("split", sky="sun", actors=[por([[0, -200, WL + 6], [4.54, 2200, WL + 2]], 340, kind="dall", beat=3.4, amp=0.03)], cam=dict(z0=1.05, z1=1.0, hand=False), ov=ST_("A DALL'S PORPOISE THROWS SPRAY LIKE A SPEEDBOAT", "8:05.2", "8:09.4", size=50))),
    ("8:09.60", PH("dall_6", zoom=(1.0, 1.12), ov=both(ST_("A 4-TONNE ANIMAL, A HUGE BRAIN, NO HANDS", "8:09.9", "8:13.2"), ST_("MAYBE THE BEST TOY IN THE OCEAN", "8:13.5", "8:16.4")))),
    ("8:16.62", A("split", sky="grey", actors=[orc([[0, 600, WL + 80], [7.4, 1000, WL + 80]], 860, beat=0.5), por(None, 280, heldBy=0, hold=NOSE, wob=0.1)], cam=dict(z0=1.06, z1=1.16), ov=both(ST_("THE GAME DOESN'T NEED TO BE VIOLENT TO BE DEADLY", "8:16.9", "8:23.8", size=50), ST_("A PORPOISE BREATHES AIR, AND TIRES QUICKLY", "8:24.2", "8:27.7")))),
    ("8:27.90", A("deep", tone="dark", actors=[por([[0, 960, 520], [5.9, 990, 580]], 600, roll=[[0, 0], [2, PI]], limp=[[0, 0.3], [1.6, 1]]), orc([[0, 900, 300], [5.9, 2000, 260]], 760, fog=[[0, 0.1], [5, 0.5]])], cam=dict(z0=1.04, z1=1.12), ov=ST_("THE WHALE MAY NOT EVEN NOTICE WHEN THE TOY BREAKS", "8:28.2", "8:33.6", size=50))),
    # ===================== THEORY 2: SCHOOL
    ("8:33.80", A("deep", tone="dark", actors=[], snow=40, ov=TH(2, "SCHOOL", "IT'S PRACTICE"))),
    ("8:36.64", A("samesize", cam=dict(z0=1.0, z1=1.04), ov=both(ST_("THEY OFTEN PICKED YOUNG PORPOISES", "8:36.9", "8:41.6", y=110), ST_("A YOUNG PORPOISE ≈ AN ADULT CHINOOK", "8:42.0", "8:49.1", y=110)))),
    ("8:49.32", A("deep", tone="blue", actors=[calf([[0, -300, 560], [2.46, 900, 540]], 460, beat=1.4), sal([[0, 700, 520], [2.46, 1700, 480]], 220, beat=2.6, dir=1)], cam=dict(z0=1.0, z1=1.05), ov=ST_("WHAT A YOUNG ORCA HAS TO LEARN", "8:49.5", "8:51.6"))),
    ("8:51.78", PH("chinook_4", zoom=(1.0, 1.12), ov=ST_("CHINOOK: FAST, STRONG, SCARCER EVERY YEAR", "8:52.0", "8:56.0"))),
    ("8:56.18", V("under_2", 5, ov=ST_("YOU CAN'T PRACTISE ON A FISH THAT ISN'T THERE", "8:56.4", "9:01.6"))),
    ("9:01.80", A("deep", tone="blue", actors=[orc([[0, -400, 440], [13.5, 900, 460]], 860, beat=0.7), calf([[0, -600, 680], [13.5, 700, 640]], 440, beat=1.0), sal(None, 230, heldBy=0, hold=MOUTH, holdDir=-1, heldOn=[[0, 1], [8, 1], [8.1, 0]], path=[[8.1, 820, 540], [13.5, 760, 600]]), sal(None, 120, heldBy=1, hold=MOUTH, holdDir=-1, heldOn=[[0, 0], [9.5, 0], [9.6, 1]], show=[9.6, 99])], cam=dict(z0=1.0, z1=1.06), ov=both(ST_("A SECOND SKILL: SOUTHERN RESIDENTS SHARE", "9:02.0", "9:06.3"), ST_("A MOTHER CARRIES A SALMON TO HER SON AND SPLITS IT", "9:06.6", "9:11.2", size=50), ST_("HOLDING PREY WITHOUT SWALLOWING IS PART OF THE JOB", "9:11.5", "9:15.1", size=50)))),
    ("9:15.32", PH("hporp_5", zoom=(1.0, 1.1), ov=both(ST_("A PORPOISE CALF IS THE RIGHT SIZE", "9:15.5", "9:17.3"), ST_("A USEFUL SPEED, AND PLENTY AROUND", "9:17.6", "9:22.1")))),
    ("9:22.38", PH("srkw_0", zoom=(1.12, 1.0), ov=ST_("YOUNGER WHALES DO IT MOST, BUT ADULTS JOIN IN", "9:22.6", "9:28.9"))),
    ("9:29.14", A("split", sky="pnw", actors=[calf([[0, 200, WL + 80], [3, 900, WL + 90], [8.62, 1300, WL + 90]], 520, beat=1.0), por([[0, 700, WL + 80], [3, 1000, WL + 120], [5, 1100, WL + 90]], 260, beat=2.6, show=[0, 5.2]), por(None, 260, heldBy=0, hold=NOSE, heldOn=[[0, 0], [5.1, 0], [5.2, 1]], show=[5.2, 99])], cam=dict(z0=1.0, z1=1.06), ov=both(ST_("A TRAINING DUMMY", "9:29.4", "9:31.6", size=70), ST_("CHASE · CORNER · HOLD ON", "9:32.0", "9:37.5")))),
    ("9:37.76", V("orcau_0", 8.8, ov=both(ST_("A TIDY EXPLANATION, WITH A HOLE IN IT", "9:38.0", "9:40.6"), ST_("PRACTICE WOULD MEAN: CATCH, RELEASE, MOVE ON", "9:41.0", "9:45.8")))),
    ("9:45.98", A("split", sky="grey", actors=[orc([[0, 300, WL + 70], [4.76, 1200, WL + 70]], 860, beat=0.4), por(None, 280, heldBy=0, hold=HEAD, roll=PI, limp=1)], cam=dict(z0=1.0, z1=1.08), ov=ST_("BUT SOME CATCH A PORPOISE, AND CARRY IT. GENTLY.", "9:46.2", "9:50.5"))),
    # ===================== THEORY 3: TAHLEQUAH
    ("9:50.74", A("deep", tone="dark", actors=[], snow=40, ov=TH(3, "TAHLEQUAH", "A WHALE WHO WOULD NOT LET GO"))),
    ("9:57.96", A("deep", tone="blue", actors=[orc([[0, 400, 520], [8.06, 1100, 500]], 900, beat=0.4), calf([[0, 600, 700], [8.06, 1260, 680]], 300, beat=1.4)], cam=dict(z0=1.0, z1=1.08), ov=both(ST_("SUMMER 2018: TAHLEQUAH GIVES BIRTH TO A DAUGHTER", "9:58.2", "10:03.0", size=50), ST_("THE CALF LIVED ABOUT HALF AN HOUR", "10:03.4", "10:05.8")))),
    ("10:06.02", A("split", sky="grey", actors=[orc([[0, 500, WL + 60], [5.28, 1100, WL + 66]], 900, beat=0.3), calf(None, 320, heldBy=0, hold=HEAD, roll=0.2, limp=1)], cam=dict(z0=1.0, z1=1.1), ov=both(ST_("SHE DID NOT LEAVE HER", "10:06.2", "10:07.9"), ST_("SHE LIFTED THE BODY ONTO HER HEAD", "10:08.2", "10:11.1")))),
    ("10:11.30", A("split", sky="grey", actors=[orc([[0, 700, WL + 60], [4.38, 1100, WL + 60]], 900, beat=0.3), calf(None, 320, heldBy=0, hold=HEAD, roll=0.2, limp=1, heldOn=[[0, 1], [1.2, 1], [1.3, 0], [3.4, 0], [3.5, 1]], path=[[1.3, 820, WL + 60], [3.4, 820, WL + 240]])], cam=dict(z0=1.08, z1=1.14), ov=ST_("EACH TIME IT SLID OFF, SHE BROUGHT IT BACK", "10:11.5", "10:15.5"))),
    ("10:15.68", A("salish", route=0.4, routeDur=5.2, cam=dict(z0=1.0, z1=1.04), ov=ST_("17 DAYS · ROUGHLY 1,600 KM OF SEA", "10:15.9", "10:21.4"))),
    ("10:21.66", PH("sanjuan_7", zoom=(1.0, 1.1), ov=ST_("THE PICTURES WENT AROUND THE WORLD", "10:21.9", "10:23.8"))),
    ("10:24.06", A("split", sky="dusk", actors=[orc([[0, 300, WL + 60], [7.96, 1300, WL + 66]], 900, beat=0.3), calf(None, 300, heldBy=0, hold=HEAD, roll=0.2, limp=1)], cam=dict(z0=1.0, z1=1.08), ov=ST_("START OF 2025: ANOTHER NEWBORN, CARRIED AT LEAST 11 DAYS", "10:24.3", "10:31.8", size=48))),
    ("10:32.02", V("sunset_9", 14.4, ov=ST_("SCIENTISTS ARE CAREFUL WITH THE WORD GRIEF", "10:32.2", "10:34.9"))),
    ("10:35.08", A("deep", tone="dark", actors=[orc([[0, 500, 520], [6.54, 1100, 520]], 900, beat=0.3), calf([[0, 650, 690], [6.54, 1250, 690]], 300, beat=0, limp=1, roll=0.2)], cam=dict(z0=1.0, z1=1.06), ov=ST_("BUT THE URGE TO HOLD ON IS CLEARLY OVERWHELMING", "10:35.2", "10:41.4", size=50))),
    ("10:41.62", A("split", sky="grey", actors=[orc([[0, 400, WL + 60], [10.06, 1200, WL + 66]], 900, beat=0.3), por(None, 300, heldBy=0, hold=HEAD, roll=0.2, limp=1)], cam=dict(z0=1.0, z1=1.1), ov=both(ST_("ONE LINE IN THE PORPOISE STUDY", "10:41.9", "10:45.5"), ST_("FEMALES CARRY PORPOISES THE WAY THEY CARRY DEAD CALVES", "10:45.9", "10:51.5", size=48)))),
    ("10:51.68", A("morph", t0=2.4, cam=dict(z0=1.0, z1=1.06), ov=both(TT("MIS-MOTHERING", "10:51.9", "10:54.6", y=90, size=120), ST_("A POWERFUL INSTINCT TO CARE, WITH NOTHING TO AIM IT AT", "10:55.0", "10:59.5", size=50)))),
    ("10:59.74", PH("srkw_6", zoom=(1.12, 1.0), ov=both(ST_("MOST PREGNANCIES IN THIS GROUP FAIL", "11:00.0", "11:02.6"), ST_("SOME FEMALES HAVE LOST CALF AFTER CALF", "11:03.0", "11:05.9")))),
    ("11:06.16", A("split", sky="grey", actors=[orc([[0, -300, WL + 110], [8.32, 700, WL + 110]], 860, beat=0.4), por([[0, 1100, WL + 20], [8.32, 1150, WL + 30]], 300, beat=1.8, amp=0.06)], cam=dict(z0=1.0, z1=1.1, x0=0, x1=120), ov=both(ST_("SMALL, SMOOTH, GREY, STRUGGLING AT THE SURFACE", "11:06.4", "11:10.8"), ST_("SHAPED A LOT LIKE A BABY WHALE", "11:11.0", "11:14.3")))),
    ("11:14.48", A("split", sky="grey", actors=[orc([[0, 700, WL + 70], [7.62, 1000, WL + 64]], 900, beat=0.3), por(None, 300, heldBy=0, hold=HEAD, roll=0.1, wob=0.05)], cam=dict(z0=1.1, z1=1.2), ov=both(ST_("SO SHE DOES WHAT HER BODY TELLS HER", "11:14.7", "11:17.5"), ST_("SHE LIFTS IT · HOLDS IT UP · KEEPS IT CLOSE", "11:17.9", "11:21.9")))),
    ("11:22.10", A("deep", tone="blue", actors=[orc([[0, 760, 520], [6.5, 900, 520]], 1300, beat=0.3), por([[0, 1500, 520], [6.5, 1450, 520]], 200, beat=1.6)], cam=dict(z0=1.0, z1=1.04), ov=ST_("SOMETHING 50 TIMES ITS WEIGHT", "11:22.3", "11:28.4"))),
    ("11:28.60", A("four", fem=7.0, cam=dict(z0=1.0, z1=1.04), ov=both(ST_("FOUR WHALES APPEAR AGAIN AND AGAIN", "11:28.8", "11:34.6", y=110), ST_("THREE OF THE FOUR ARE FEMALE", "11:35.9", "11:38.4", y=110)))),
    ("11:38.66", A("split", sky="dusk", actors=[orc([[0, 400, WL + 60], [11.62, 1300, WL + 66]], 900, beat=0.3), por(None, 300, heldBy=0, hold=HEAD, roll=0.1)], cam=dict(z0=1.0, z1=1.1), ov=both(ST_("NOT CRUELTY. NOT EVEN CARELESSNESS.", "11:38.9", "11:45.0"), ST_("SOMETHING CLOSE TO LOVE, POINTED AT THE WRONG ANIMAL", "11:45.4", "11:50.0", size=50)))),
    # ===================== ALL THREE?
    ("11:50.28", A("deep", tone="dark", actors=[], snow=40, ov=both(TILES(["PLAY", "SCHOOL", "MOTHERING"], ["11:51.8", "11:53.0", "11:54.2"]), ST_("SO WHICH IS IT?", "11:50.4", "11:51.6", y=180)))),
    ("11:55.64", PH("sanjuan_1", zoom=(1.0, 1.1), ov=ST_("THEY CAN'T BE SURE. IT COULD BE ALL THREE AT ONCE.", "11:55.9", "12:02.1"))),
    ("12:02.34", A("split", sky="pnw", actors=[calf([[0, 200, WL + 80], [3.94, 1100, WL + 90]], 500, beat=1.2), por([[0, 700, WL + 80], [2, 1000, WL + 130], [3.94, 1400, WL + 80]], 260, beat=2.8)], cam=dict(z0=1.0, z1=1.05), ov=ST_("A JUVENILE STARTS IT FOR FUN", "12:02.6", "12:06.0"))),
    ("12:06.28", A("split", sky="pnw", actors=[orc([[0, -200, WL + 100], [3.62, 900, WL + 100]], 820, beat=0.7), calf([[0, 300, WL + 80], [3.62, 1100, WL + 80]], 500, beat=1.0), por([[0, 900, WL + 90], [3.62, 1300, WL + 110]], 260, beat=2.4)], cam=dict(z0=1.0, z1=1.05), ov=ST_("OLDER WHALES JOIN, AND IT BECOMES A LESSON", "12:06.5", "12:09.7"))),
    ("12:09.90", A("split", sky="dusk", actors=[orc([[0, 600, WL + 60], [7.64, 1100, WL + 64]], 900, beat=0.3), por(None, 280, heldBy=0, hold=HEAD, roll=0.1)], cam=dict(z0=1.0, z1=1.08), ov=ST_("AND A FEMALE WHO LOST HER CALF WON'T GIVE IT BACK", "12:10.1", "12:17.3", size=50))),
    # ===================== NOT ONLY ORCAS
    ("12:17.54", PH("bottlenose_3", zoom=(1.0, 1.1), ov=ST_("KILLING WITHOUT EATING ISN'T ONLY AN ORCA THING", "12:17.8", "12:20.9"))),
    ("12:21.12", A("deep", tone="blue", actors=[por([[0, 400, 500], [2, 800, 420], [4, 1200, 560], [5.74, 1600, 480]], 300, beat=2.6), por([[0, -200, 520], [5.74, 1300, 480]], 420, kind="bottlenose", beat=1.6), por([[0, -400, 640], [5.74, 1100, 600]], 380, kind="bottlenose", beat=1.6, ph0=2)], cam=dict(z0=1.0, z1=1.06), ov=ST_("BOTTLENOSE DOLPHINS BEAT PORPOISES TO DEATH", "12:21.4", "12:26.6"))),
    ("12:26.86", PH("lion_2", zoom=(1.0, 1.1), ov=ST_("LIONS KILL CHEETAH CUBS AND HYENAS", "12:27.1", "12:29.4"))),
    ("12:29.60", PH("cheetah_1", zoom=(1.0, 1.1), ov=ST_("...AND WALK AWAY WITHOUT A MOUTHFUL", "12:29.8", "12:31.3"))),
    ("12:31.46", A("split", sky="sun", sail=dict(x=900, s=1.0, snap=5.0), actors=[orc([[0, 1700, WL + 200], [4.6, 1120, WL + 170], [5.2, 1180, WL + 200], [11.2, 400, WL + 260]], 760, beat=0.9)], cam=dict(z0=1.0, z1=1.06), ov=both(ST_("SPAIN AND PORTUGAL: ORCAS RAMMING SAILBOATS", "12:31.7", "12:37.0"), ST_("SNAPPING RUDDERS · A FEW BOATS SUNK", "12:37.3", "12:42.4"), ST_("NOBODY IS EATING THE BOATS", "12:42.7", "12:45.6")))),
    ("12:45.80", V("boat_2", 0, ov=ST_("NO OBVIOUS PAYOFF, SPREADING BECAUSE WHALES LEARN FROM EACH OTHER", "12:46.0", "12:57.1", size=46))),
    # ===================== THE ANSWER
    ("12:57.34", A("records", t0=-20, dur=1, red=-1, eaten=0.4, cam=dict(z0=1.0, z1=1.06), ov=both(ST_("WERE THEY LEARNING TO EAT PORPOISE?", "12:57.6", "13:05.4", y=120), ST_("60 YEARS OF RECORDS: NO. NOT ONCE.", "13:05.8", "13:10.9", y=120)))),
    ("13:11.08", A("deep", tone="dark", actors=[por([[0, 960, 600], [2.82, 965, 620]], 520, roll=PI, limp=1), orc([[0, 300, 360], [2.82, 1500, 340]], 860, beat=0.6)], cam=dict(z0=1.0, z1=1.05), ov=ST_("NOT EVEN WITH A DEAD ONE IN FRONT OF THEM", "13:11.3", "13:13.7"))),
    ("13:13.90", V("orcau_2", 1, ov=ST_("AND THAT TURNS THE STORY UPSIDE DOWN", "13:14.2", "13:16.9"))),
    ("13:17.08", A("split", sky="dusk", actors=[orc([[0, -300, WL + 80], [6.12, 1200, WL + 80]], 900, beat=0.5)], cam=dict(z0=1.0, z1=1.08), ov=ST_("WE ASKED IT AS IF THE ORCA WERE THE VILLAIN", "13:17.3", "13:23.0"))),
    ("13:23.20", A("compare", t1=11.0, cam=dict(z0=1.0, z1=1.04), ov=both(ST_("HARBOUR PORPOISES: AMONG THE MOST COMMON MAMMALS HERE", "13:23.4", "13:28.2", y=980, size=46), ST_("28 DEATHS IN 60 YEARS BARELY TOUCHES THEM", "13:28.6", "13:32.4", y=980), ST_("THE PORPOISES WILL BE FINE", "13:32.7", "13:34.5", y=980), ST_("THE ORCAS ARE THE ONES IN DANGER: 76 LEFT", "13:34.8", "13:39.0", y=980)))),
    ("13:39.24", A("calves", n=4, lost=2, t0=2.4, cam=dict(z0=1.0, z1=1.04), ov=ST_("FOUR CALVES BORN IN THE LATEST CENSUS YEAR. TWO SURVIVED.", "13:39.5", "13:45.1", y=110, size=48))),
    ("13:45.36", V("orcau_1", 15, ov=ST_("WHAT SINKS THEM IS WHAT MAKES THEM EXTRAORDINARY", "13:45.6", "13:49.8", size=50))),
    ("13:50.06", PH("sanjuan_7", zoom=(1.0, 1.1), ov=ST_("TRADITIONS · GAMES · HABITS · TASTES: GRANDMOTHER TO MOTHER TO CALF", "13:50.3", "13:56.8", size=44))),
    ("13:57.04", A("hat", copies=0, cam=dict(z0=1.06, z1=1.12), ov=ST_("WHY ONE WEARS A SALMON AS A HAT...", "13:57.3", "14:00.6"))),
    ("14:00.80", A("split", sky="dusk", actors=[orc([[0, 600, WL + 60], [4.02, 1000, WL + 64]], 900, beat=0.3), calf(None, 300, heldBy=0, hold=HEAD, roll=0.2, limp=1)], cam=dict(z0=1.0, z1=1.06), ov=ST_("...AND ANOTHER CARRIES HER DAUGHTER 1,600 KM", "14:01.0", "14:04.6"))),
    ("14:04.82", A("split", sky="grey", actors=[orc([[0, -300, WL + 80], [7.4, 1300, WL + 80]], 880, thin=1, beat=0.4), por([[0, 1600, WL + 90], [7.4, 300, WL + 100]], 300, beat=1.4)], cam=dict(z0=1.0, z1=1.06), ov=ST_("WHY THEY SWIM PAST A MEAL THAT COULD SAVE THEM", "14:05.0", "14:12.0"))),
    ("14:12.22", PH("srkw_7", zoom=(1.12, 1.0), ov=ST_("A SIMPLER ANIMAL WOULD HAVE SWITCHED LONG AGO", "14:12.4", "14:15.6"))),
    ("14:15.86", A("split", sky="pnw", actors=[orc([[0, 500, WL + 70], [7.44, 1000, WL + 70]], 860, beat=0.4), por(None, 280, heldBy=0, hold=HEAD, roll=0.1)], cam=dict(z0=1.0, z1=1.08), ov=both(ST_("PLAY WITH IT · PRACTISE ON IT · TRY TO RAISE IT", "14:16.0", "14:21.4"), ST_("THEY WILL NOT EAT IT", "14:21.7", "14:23.1", size=76)))),
    ("14:23.30", V("pod_0", 4, ov=ST_("THE REAL STORY IS STRANGER", "14:23.6", "14:29.3"))),
    ("14:29.54", A("split", sky="dusk", actors=[orc([[0, -300, WL + 80], [4.5, 900, WL + 80]], 860, thin=1, beat=0.4), orc([[0, -600, WL + 120], [4.5, 600, WL + 116]], 460, calf=True, beat=0.8)], cam=dict(z0=1.0, z1=1.06), ov=ST_("A FAMILY GOING HUNGRY IN WATER FULL OF FOOD", "14:29.8", "14:33.8"))),
    ("14:34.04", A("river", cam=dict(z0=1.0, z1=1.06), ov=ST_("WAITING FOR ONE FISH TO COME HOME", "14:34.2", "14:37.6"))),
    ("14:37.88", A("endres", ov=both(ST_("WHETHER IT DOES IS NOT UP TO THEM", "14:38.0", "14:40.1", y=860), ST_("IT'S UP TO US", "14:40.4", "14:42.6", y=860, size=70), END_CARD, lambda a, b: fade_out_black(s("14:45.2"), 0.8)))),
]

SFX_EXTRA = [("0:01.0", "blow", 0.5), ("0:15.5", "splash", 0.5), ("0:54.9", "blow", 0.5), ("1:11.6", "splash", 0.5), ("1:41.3", "deep_boom", 0.6), ("1:58.9", "sonar_ping", 0.3),
    ("2:24.6", "thud", 0.5), ("2:30.4", "deep_boom", 0.7), ("3:44.5", "heartbeat", 0.4), ("3:56.3", "heartbeat", 0.4), ("4:10.6", "sonar_ping", 0.3), ("5:41.7", "deep_boom", 0.7),
    ("5:56.0", "thud", 0.5), ("6:01.6", "wave", 0.6), ("6:52.4", "deep_boom", 0.6), ("6:59.0", "splash", 0.4), ("7:28.9", "deep_boom", 0.5), ("8:05.1", "water_whoosh", 0.5),
    ("8:33.9", "deep_boom", 0.6), ("9:50.8", "deep_boom", 0.6), ("10:06.1", "breath", 0.4), ("10:12.5", "splash", 0.4), ("10:51.9", "deep_boom", 0.6), ("11:50.4", "deep_boom", 0.5),
    ("12:36.5", "thud", 0.7), ("12:57.4", "sonar_ping", 0.3), ("13:13.9", "deep_boom", 0.5), ("14:37.9", "deep_boom", 0.6)]
