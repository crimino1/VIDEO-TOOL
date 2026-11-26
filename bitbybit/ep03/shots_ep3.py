# EP3 shot list, inserted into build.py at #SHOTS# (exec'd in build.py's namespace).
DIM = lambda kind, **o: dict(kind=kind, o=o)


def RX(kind, img, crop=None, hl=None, w=1240, h=780, cx=960, cy=540, ov=None, fx=(), op=0.62, **o):
    """Receipt (real screenshot / post) framed over a dimmed pixel backdrop scene."""
    o.setdefault("tin", "fade"); o.setdefault("tout", "zoom")
    def f(a, b):
        pxshot(a, b, kind, o)
        h_ = (s(hl[0]),) + tuple(hl[1:]) if hl else None
        layer(a, b, scrim(op) + shot_ss(a, b, img, crop, w=w, h=h, cx=cx, cy=cy, hl=h_) + (ov(a, b) if ov else ""))
        _fx(fx or [("whoosh", a - 0.05, 0.45)], a)
    return f


def Q(kind, head, sub_, parts, size=40, w=1300, ov=None, fx=(), **o):
    """Quote card with a real post's exact text over a dimmed pixel backdrop."""
    o.setdefault("tin", "fade"); o.setdefault("tout", "zoom")
    def f(a, b):
        pxshot(a, b, kind, o)
        layer(a, b, scrim(0.66) + quote(a, b, head, sub_, [(t_, None if h_ is None else s(h_)) for t_, h_ in parts], w=w, size=size) + (ov(a, b) if ov else ""))
        _fx(fx or [("whoosh", a - 0.05, 0.45)], a)
    return f


TAG = lambda name, role, t, **k: (lambda a, b: tag(name, role, t, **k))
CR = lambda text: (lambda a, b: credit(text))
KD = lambda text, t=None, **k: K(text, t, cls="dark", **k)

def LEMKIN(a, b):
    pxshot(a, b, "founder_desk", {"tin": "zoom", "tout": "zoom", "great": 99.0, "cam": {"z": [1.15, 1.08]}})
    layer(a, b, scrim(0.55) + photo(a, b, "lemkin", w=470, h=470, cx=560, cy=500, crop=(0.14, 0.0, 0.86, 0.62), zoom=(1.0, 1.06))
          + tag("Jason Lemkin", "Startup founder &middot; SaaStr", W("Jason") - 0.1, x=860, y=430)
          + K("A week into an experiment", W("week", 4), y=760, size=64)(a, b) + credit("Photo: @jasonlk on X"))
    _fx([("whoosh", a - 0.05, 0.45)], a)


def KARPATHY(a, b):
    clip = H / "stock" / "raw" / "yt_karpathy_seq.mp4"
    if clip.exists():
        video(a, b, "yt_karpathy_seq", 15.5, zoom=(1.0, 1.06), frame=(960, 470, 1460))
        layer(a, b, tag("Andrej Karpathy", "Co-founder, OpenAI", W("Carpathi", 85), x=110, y=820) + credit("Video: Sequoia Capital on YouTube"))
    else:
        pxshot(a, b, "vibe_couch", {"tin": "zoom", "tout": "zoom", "cam": {"z": [1.1, 1.0]}})
        layer(a, b, scrim(0.6) + photo(a, b, "karpathy", w=430, h=580, cx=600, cy=500) + tag("Andrej Karpathy", "Co-founder, OpenAI", W("Carpathi", 85), x=880, y=430)
              + credit("Photo: Gladwin Analytics, CC BY 3.0, via Wikimedia Commons"))
    _fx([("whoosh", a - 0.05, 0.45)], a)


def MB(kind, poses, side="left", sub_=None, op=0.8, **o):
    """Mascot over a dimmed pixel backdrop (no bare starfield frames)."""
    o.setdefault("tin", "fade"); o.setdefault("tout", "zoom")
    def f(a, b):
        pxshot(a, b, kind, o)
        layer(a, b, scrim(op))
        M(poses, side, sub_)(a, b)
    return f


ROLLBACK = [
    ("Replit assured me it's built it rollback did not support database rollbacks. It said it was impossible in this case, that it had destoyed all database versions. ", None),
    ("It turns out Replit was wrong, and the rollback did work.", W("Lemkin", 502.5)),
    (" JFC.", None),
]

KARP_FULL = [
    ("There's a new kind of coding I call \"vibe coding\", where you fully give in to the vibes, embrace exponentials, and ", None),
    ("forget that the code even exists.", None),
    (" &hellip; I \"Accept All\" always, I don't read the diffs anymore. &hellip; ", None),
    ("It's not too bad for throwaway weekend projects,", W("throwaway", 115)),
    (" but still quite amusing.", None),
]

SHOTS = [
    # ===================== COLD OPEN: the database =====================
    ("0:00.00", V("pxb_377880", 3.0, zoom=(1.14, 1.0), ov=OV(K("July 2025", 0.25, y=430, size=130)), fx=[("impact", 0.25, 0.5)])),
    (W("startup") - 0.2, LEMKIN),
    ("0:08.16", P("founder_desk", great=R("great", 15), tin="zoom", cam=CAM_IN(1.0, 1.16, 330, 178),
                  ov=OV(K("No code. Just an AI agent.", W("described", 12), y=70, size=70, end=W("great", 15) - 0.3)),
                  fx=[("pop", W("great", 15), 0.5)])),
    ("0:21.22", P("freeze", ice=R("freeze", 22, -0.3), caps=R("typed", 27, -0.2), tin="zoom",
                  fx=[("type", 21.6, 0.5, 2.0), ("click", W("freeze", 22), 0.6), ("type", W("capital", 26) - 0.2, 0.55, 1.4)])),
    (W("signed", 28) - 0.1, P("goodnight", off=R("signed", 28, 0.5), red=R("next", 31.5, -0.5), tin="fade")),
    ("0:32.72", P("db_gone", wipe=R("gone", 33, -0.2), count=R("Records", 34), countEnd=R("wiped", 39), cam={"z": [1.0, 1.12]},
                  ov=OV(K("Gone.", W("gone", 33), y=70, size=110, end=W("Records", 34))),
                  fx=[("glitch", W("gone", 33) - 0.1, 0.6), ("impact", W("gone", 33), 0.5)])),
    ("0:42.08", RX("db_gone", "chat_deleted", crop=(0, 0, 1115, 1030), hl=(W("admitted", 43), 0.05, 0.64, 0.97, 0.97), w=900, h=830, empty=True,
                   ov=CR("Screenshot: Jason Lemkin on X, July 2025"))),
    ("0:47.80", RX("db_gone", "chat_panicked", crop=(0, 0, 1115, 700), hl=(W("panicked", 47), 0.03, 0.42, 0.97, 0.66), w=1000, h=640, empty=True,
                   ov=CR("Screenshot: Jason Lemkin on X, July 2025"), fx=[("click", 47.75, 0.5)])),
    (W("rated", 49) - 0.15, RX("db_gone", "chat_95", crop=(0, 0, 1115, 820), hl=(W("95", 49), 0.05, 0.53, 0.47, 0.67), w=1000, h=740, empty=True,
                              ov=CR("Screenshot: Jason Lemkin on X, July 2025"), fx=[("click", 49.3, 0.5), ("impact", W("95", 49), 0.4)])),
    ("0:52.72", P("confession", m1=-8.0, m2=-8.0, score=-8.0, never=R("never", 52), tin="zoom", fx=[("impact", W("never", 52), 0.55)])),
    (W("Hold", 54), MB("confession", [(None, "point"), (W("coming", 57), "think")], "left", m1=-8.0, m2=-8.0, score=-8.0, never=-8.0,
                      sub_=[("Hold on to that.", ["\"It can never", "be recovered.\""], None, None)])),
    # ===================== INTRO =====================
    ("1:03.30", P("logo2", done=1.4, tin="glitch", fx=[("glitch", 63.3, 0.6), ("impact", 64.6, 0.55)])),
    ("1:05.60", V("pxb_215189", 4.0, zoom=(1.0, 1.08), ov=OV(KD("I use AI to write code almost every day.", W("use", 66), y=840, size=70)))),
    ("1:12.26", P("copilot_room", cam=CAM_IN(1.0, 1.12, 360, 165), ov=OV(K("Not about quitting.", W("isn't", 72), y=70, size=86)))),
    (W("trap", 74) - 0.3, P("trap", stop=R("inside", 80), cam={"z": [1.05, 1.15], "x": [300, 360], "y": [180, 185]},
                            ov=OV(K("One specific trap", W("one", 74), y=70, size=86, end=W("research", 78))), fx=[("whoosh", 75.8, 0.4)])),
    # ===================== PART 1: where vibe coding came from =====================
    ("1:23.98", SECP("Part 1:", "Where \"vibe coding\" came from")),
    (W("In", 85) - 0.2, KARPATHY),
    (W("posted", 90) - 0.2, RX("vibe_couch", "tw_karpathy_vibe", hl=(W("Vibe", 95), 0.42, 0.21, 0.76, 0.31), w=1100, h=700,
                              ov=CR("@karpathy on X, Feb 2025"))),
    (W("talk", 96) - 0.2, P("vibe_couch", unread=R("never", 99), forget=R("forget", 102), tin="zoom", cam={"z": [1.0, 1.1]},
                           ov=OV(K("\"Forget that the code even exists.\"", W("forget", 102), y=70, size=66)),
                           fx=[("click", 98.6, 0.45), ("click", 99.4, 0.45), ("click", 100.2, 0.45), ("pop", W("forget", 102), 0.5)])),
    ("1:47.88", P("viral", fx=[("notif", 108.4, 0.5), ("pop", 109.6, 0.45), ("pop", 110.6, 0.45)])),
    ("1:51.98", Q("vibe_couch", "Andrej Karpathy", "@karpathy &middot; X &middot; Feb 2025", KARP_FULL, size=40, forget=0.0, unread=0.0,
                  ov=OV(K("The rest of the post", W("rest", 112), y=60, size=72, end=W("throwaway", 115) - 0.2)))),
    (W("year", 120) - 0.5, P("shower", pop=R("shower", 123, 0.4), tin="zoom", fx=[("pop", W("shower", 123) + 0.4, 0.55)])),
    (W("said", 124) - 0.3, RX("shower", "tw_karpathy_2026", crop=(0, 0, 1096, 500), hl=(W("said", 124), 0.02, 0.80, 0.99, 0.99), w=1180, h=540,
                             pop=-5.0, ov=CR("@karpathy on X, Feb 2026"))),
    ("2:08.80", P("toys_vs_career", career=R("rest", 131), cam={"z": [1.0, 1.08]},
                  ov=OV(K("Scoped to toys.", W("toys", 131) - 0.6, y=60, size=80, end=W("rest", 131)), K("Turned into a career plan.", W("rest", 131), y=60, size=80)),
                  fx=[("whoosh", W("rest", 131), 0.45), ("impact", W("career", 133), 0.4)])),
    # ===================== the cost you can see =====================
    ("2:15.58", P("app_works", reveal=R("cares", 137, -0.6), tin="glitch",
                  ov=OV(K("Does it matter?", W("does", 136), y=880, size=80, end=W("If", 137), cls="dark"), K("If it works, who cares?", W("If", 137), y=880, size=80, cls="dark")),
                  fx=[("glitch", 135.5, 0.5), ("whoosh", W("cares", 137) - 0.6, 0.45)])),
    ("2:20.33", P("eighty_build", at=[R("Login", 146), R("forms", 146), R("dashboards", 146)], stall=R("Then", 152, -0.6),
                  ov=OV(K("The first 80%", W("80", 142), y=60, size=90)),
                  fx=[("pop", W("Login", 146), 0.45), ("pop", W("forms", 146), 0.45), ("pop", W("dashboards", 146), 0.45)])),
    ("2:32.42", P("support_email", phone=R("random", 154, -0.4), fx=[("notif", W("emails", 153), 0.6)])),
    (W("only", 156) - 0.3, V("pxb_42408", 6.0, zoom=(1.0, 1.08), ov=OV(KD("Only on their phone.", W("only", 156), y=840, size=80)))),
    ("2:38.34", P("code_wall", fx=[("whoosh", 158.6, 0.4)])),
    ("2:42.70", P("stranger", reveal=R("stranger", 163, 1.2), fx=[("impact", W("stranger", 163) + 1.2, 0.5)])),
    # ===================== PART 2: the speed illusion =====================
    ("2:47.50", P("iceberg", dive=R("another", 169), fx=[("whoosh", W("another", 169), 0.5)])),
    (W("lab", 172) - 1.6, V("rec_metr", 0.4, zoom=(1.0, 1.05), ov=OV(TAG("METR", "Non-profit AI research lab", W("Meta", 173))))),
    ("2:55.20", SECP("Part 2:", "The speed illusion")),
    (W("16", 177) - 0.4, P("sixteen_devs", count=[R("16", 177), R("open", 178)], cam={"z": [1.0, 1.1], "x": [320, 330]},
                           fx=[("pop", W("16", 177), 0.45)])),
    ("3:05.52", P("coin_flip", fx=[("whoosh", 186.0, 0.4), ("pop", 187.4, 0.4), ("pop", 188.6, 0.4)])),
    (W("Before", 189) - 0.1, P("speed_chart", pred=R("24", 194), actual=R("19", 198), cam={"z": [1.0, 1.08]},
                               fx=[("pop", W("24", 194), 0.5), ("impact", W("19", 198), 0.55)])),
    ("3:23.92", P("survey", answer=R("went", 205, 0.3), fx=[("pop", W("went", 205) + 0.3, 0.45)])),
    (W("20", 209) - 0.7, P("speed_chart", state="all", belief=R("20", 209), cam={"z": [1.12, 1.0]}, fx=[("notif", W("20", 209), 0.5)])),
    (W("Think", 212) - 0.1, RX("speed_chart", "ss_metr_chart", hl=(W("Think", 212) + 0.5, 0.62, 0.38, 0.79, 0.62), w=1300, h=830, state="all", belief=-5.0,
                              ov=CR("METR (2025), metr.org, CC-BY"))),
    ("3:34.60", P("compass", wobble=R("wrong", 219), fx=[("whoosh", W("wrong", 219), 0.4)])),
    ("3:40.70", P("feels_fast", fast=R("felt", 220), clock=R("clock", 227), cam={"z": [1.0, 1.1]},
                  ov=OV(K("Typing less feels like progress.", W("Typing", 221), y=60, size=70, end=W("clock", 227))),
                  fx=[("whoosh", 222.4, 0.45), ("impact", W("clock", 227), 0.55)])),
    (W("Now", 228) - 0.1, P("caveats", at=[R("small", 232), R("early", 232), R("experts", 237)],
                            fx=[("pop", W("small", 232), 0.45), ("pop", W("early", 232), 0.45), ("pop", W("experts", 237), 0.45)])),
    ("4:04.30", RX("caveats", "ss_metr_caveats", hl=(W("authors", 244), 0.03, 0.02, 0.97, 0.14), w=1260, h=720, at=[-9.0, -9.0, -9.0],
                   ov=CR("METR (2025), metr.org"))),
    (W("please", 245) - 0.3, MB("caveats", [(None, "shrug"), (W("physics", 251) - 0.6, "point")], "right", at=[-9.0, -9.0, -9.0],
                               sub_=[("Please don't say", ["\"AI makes you", "19% slower\""], None, W("physics", 251) - 0.6),
                                     ("Not a law", ["of physics."], W("physics", 251) - 0.6, None)])),
    ("4:13.24", P("broken_gauge", label=R("reliable", 258, -0.4),
                  ov=OV(K("Your gut is not a reliable instrument.", W("sense", 255), y=60, size=66, end=W("reliable", 258) - 0.4)),
                  fx=[("impact", W("reliable", 258) - 0.4, 0.45)])),
    # ===================== PART 3: the skill study =====================
    ("4:20.48", SECP("Part 3:", "What it does to your skill")),
    (W("January", 262) - 0.4, V("rec_anthropic", 0.3, zoom=(1.0, 1.05), ov=OV(TAG("Anthropic", "The company behind Claude", W("Anthropic", 265))))),
    (W("credit", 272) - 0.3, MB("classroom52", [(None, "shrug"), (W("awkward", 274), "tada")], "left", count=-9.0,
                               sub_=[("Credit to them.", ["Awkward thing", "to publish."], None, None)])),
    ("4:38.66", P("classroom52", count=R("52", 279), split=R("Half", 285), cam={"z": [1.0, 1.08]},
                  fx=[("pop", W("52", 279), 0.5), ("whoosh", W("Half", 285), 0.45)])),
    (W("Then", 287) - 0.1, P("quiz", fx=[("click", W("quiz", 290), 0.5)])),
    ("4:53.10", P("finish_race", meh=R("gap", 295), fx=[("whoosh", 293.4, 0.4)])),
    ("4:58.32", P("quiz_scores", hand=R("67", 300), ai=R("50", 302), fx=[("pop", W("67", 300), 0.5), ("pop", W("50", 302), 0.45)])),
    ("5:04.66", RX("quiz_scores", "ss_anth_results", hl=(W("debugging", 305), 0.02, 0.55, 0.99, 0.75), w=1500, h=420, hand=-9.0, ai=-9.0, debug=-9.0,
                   ov=CR("Anthropic (2026), anthropic.com/research"))),
    (W("which", 308) - 0.1, P("debug_gap", bug=R("supervise", 312, -1.5), label=R("supervise", 312),
                              fx=[("impact", W("supervise", 312), 0.45)])),
    ("5:15.42", P("calendar_gap", flip=R("month", 321, -0.6), fx=[("whoosh", W("month", 321) - 0.6, 0.45)])),
    (W("detail", 323) - 1.2, RX("calendar_gap", "ss_anth_chart", hl=(W("matters", 324), 0.53, 0.12, 0.99, 0.98), w=1360, h=800, flip=-9.0,
                               ov=CR("Anthropic (2026), anthropic.com/research"))),
    ("5:27.46", P("two_groups", left=R("40", 338), right=R("65", 344), same=R("Same", 346), cam={"z": [1.0, 1.1], "x": [320, 250]},
                  ov=OV(K("Not everyone did badly.", W("Not", 327), y=890, size=76, cls="dark", end=W("difference", 330))),
                  fx=[("impact", W("40", 338), 0.45)])),
    ("5:44.16", P("two_groups", left=-20.0, right=R("65", 344), same=R("Same", 346), cam={"z": [1.1, 1.0], "x": [390, 320]}, tin="cut",
                  
                  fx=[("notif", W("65", 344), 0.5)])),
    ("5:52.68", V("pxb_24125", 0.0, zoom=(1.0, 1.08), crop=(0.42, 0.08, 0.98, 0.64), ov=OV(KD("20 times. Still no map.", W("20", 355), y=840, size=80)))),
    ("5:58.72", P("no_map", lost=R("never", 360), fx=[("whoosh", W("never", 360), 0.4)])),
    # ===================== PART 4: the calculator objection =====================
    ("6:02.78", SECP("Part 4:", "\"Calculators rot brains\"")),
    (W("People", 365) - 0.2, V("pxb_286930", 1.0, zoom=(1.0, 1.08), ov=OV(KD("\"Calculators will rot our brains!\"", W("calculators", 366), y=840, size=72)))),
    (W("They", 369) - 0.1, P("moral_panic", at=[-0.5, R("compilers", 370), R("stack", 371)], fx=[("pop", W("compilers", 370), 0.45), ("pop", W("stack", 371), 0.45)])),
    ("6:16.60", P("assembly", fine=R("fine", 380), fx=[("pop", W("fine", 380), 0.45)])),
    ("6:21.40", P("compiler", ov=OV(K("A compiler is boring.", W("compiler", 383), y=60, size=80)))),
    ("6:31.62", P("new_hire", flip=R("Sometimes", 397), ov=OV(K("A very fast, very confident new hire", W("very", 392), y=60, size=66, end=W("Usually", 396))),
                  fx=[("impact", W("Sometimes", 397) + 0.6, 0.45)])),
    ("6:42.14", P("spot_diff", found=R("apart", 405, -0.3), fx=[("pop", W("apart", 405) - 0.3, 0.5)])),
    ("6:50.82", P("trap", lean=True, stop=R("shouldn't", 415), cam={"z": [1.0, 1.12], "x": [320, 380]},
                  ov=OV(K("That's the trap.", W("That's", 410), y=60, size=90, end=W("more", 412))))),
    # ===================== PART 5: three habits =====================
    ("6:56.64", P("copilot_room", cam={"z": [1.12, 1.0]}, tin="glitch", ov=OV(K("How I stay out of it", W("how", 416), y=70, size=86)))),
    (W("Three", 418) - 0.2, SECP("3 habits", "None of them mean giving up the tools")),
    ("7:02.92", P("explain_aloud", stop=R("If", 430, 2.0), hw=R("homework", 437), cam={"z": [1.0, 1.1]},
                  
                  fx=[("pop", W("If", 430) + 2.0, 0.45), ("impact", W("homework", 437), 0.45)])),
    (W("Two", 439) - 0.15, P("guess_first", timer=R("30", 443), ai=R("compare", 448), match=R("matches", 450), diff=R("different", 453), skip=R("Skip", 456),
                             ov=OV(K("2. Guess first.", W("Two", 439), y=60, size=80, end=W("30", 443))),
                             fx=[("click", W("30", 443), 0.5), ("whoosh", W("compare", 448), 0.45), ("notif", W("matches", 450), 0.5), ("pop", W("different", 453), 0.5), ("whoosh", W("Skip", 456), 0.45)])),
    (W("Three", 461) - 0.15, V("pxb_51016", 0.3, zoom=(1.0, 1.08), ov=OV(KD("3. Fly by hand sometimes.", W("Three", 461), y=840, size=80)))),
    (W("They", 468) - 0.2, V("pxb_47333", 20.0, zoom=(1.0, 1.06))),
    (W("hands", 472) - 0.6, P("autopilot", disc=R("hands", 472), steady=R("rusty", 476), tin="zoom", fx=[("notif", W("hands", 472), 0.6)])),
    ("7:57.22", P("assistants_off", humble=R("humbling", 482), fx=[("click", 477.9, 0.6), ("pop", W("humbling", 482), 0.45)])),
    (W("throwaway", 486) - 1.6, P("birthday_site", vibe=R("vibe", 491), fx=[("pop", 485.0, 0.45), ("whoosh", W("vibe", 491), 0.45)])),
    # ===================== ENDING: back to the database =====================
    ("8:12.44", P("db_gone", empty=True, cam={"z": [1.0, 1.1]}, tin="glitch",
                  ov=OV(K("Back to that database.", W("database", 494), y=60, size=76, end=W("gone", 500) - 0.2), K("\"Gone for good.\"", W("gone", 500) - 0.2, y=60, size=90)),
                  fx=[("glitch", 492.4, 0.55)])),
    (W("true", 502) - 0.6, Q("db_gone", "Jason Lemkin", "@jasonlk &middot; X &middot; July 18, 2025", ROLLBACK, size=42, w=1300, empty=True,
                            ov=OV(K("That wasn't true.", W("That", 501), y=60, size=86)))),
    (W("ran", 505) - 0.3, P("db_gone", empty=True, restore=R("rollback", 505), cam={"z": [1.1, 1.0]}, fx=[("whoosh", W("rollback", 505), 0.55), ("notif", W("came", 507), 0.55)])),
    (W("confident", 509) - 0.6, RX("db_gone", "chat_restored", crop=(0, 0, 1416, 330), w=1440, h=340, empty=True, restore=-9.0, op=0.7,
                                  ov=OV(K("Confident. And wrong.", W("confident", 509), y=780, size=96), CR("Screenshot: Jason Lemkin on X, July 2025")))),
    (W("person", 511) - 0.1, P("checker", ok=R("check", 512, 0.4), fx=[("type", 511.8, 0.5, 1.0), ("notif", W("check", 512) + 0.4, 0.55)])),
    ("8:36.12", P("typing_race", bug=R("know", 518, -0.6), win=R("wrong", 520), fx=[("type", 516.2, 0.5, 1.6), ("pop", W("wrong", 520), 0.5)])),
    ("8:41.04", MB("copilot_room", [(None, "point"), (W("bit", 524), "tada")], "left", sub_=[("Not in one prompt.", [], None, W("bit", 523.5)), ("Bit by bit.", [], W("bit", 523.5), None)])),
    (W("If", 525.5) - 0.1, P("outro", press=R("subscribe", 527), comment=R("comments", 529), text="WHAT CAN'T YOU DO WITHOUT AI?", fx=[("click", W("subscribe", 527), 0.6), ("notif", W("comments", 529), 0.5)])),
]
