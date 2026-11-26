# Shot list for The Only Animal Orcas Won't Hunt. Executed inside build.py.
BC = (0.0, 0.0, 1.0, 0.86)
NG = (0.0, 0.1, 0.88, 1.0)
SC_ = (0.2, 0.28, 0.8, 0.86)
RAY = (0.15, 0.12, 1.0, 1.0)
WSH = (0.0, 0.1, 0.88, 0.9)
RUD = (0.0, 0.08, 0.9, 1.0)
KFR = (0.0, 0.0, 1.0, 0.88)
TAH = (0.1, 0.0, 0.9, 0.55)
HAH = (0.0, 0.1, 0.85, 1.0)

MENU1 = [("c_salmon", "SALMON", "0:03.30"), ("c_herring", "HERRING", "0:04.06"), ("c_seal", "SEALS", "0:05.04"), ("c_sealion", "SEA LIONS", "0:05.94"),
         ("c_penguin", "PENGUINS", "0:07.14"), ("c_seabird", "SEABIRDS", "0:08.16"), ("c_squid", "SQUID", "0:09.12"), ("c_dolphin", "DOLPHINS", "0:09.90"),
         ("c_porpoise", "PORPOISES", "0:10.94"), ("c_ray", "STINGRAYS", "0:13.92"), ("c_turtle", "SEA TURTLES", "0:16.42"), ("c_otter", "SEA OTTERS", "0:17.52"),
         ("c_deer", "SWIMMING DEER", "0:18.68"), ("c_wshark", "WHALE SHARKS", "0:21.04")]
MENU2 = [("c_white", "GREAT WHITE SHARKS", "0:24.57"), ("c_graycalf", "GRAY WHALE CALVES", "0:28.89"), ("c_humpcalf", "HUMPBACK CALVES", "0:30.51"),
         ("c_minke", "MINKE WHALES", "0:32.07"), ("c_sperm", "SPERM WHALES", "0:33.51"), ("c_blue", "A BLUE WHALE", "0:41.37")]
CARDS = [dict(img="img_" + i, label=l, t=t) for i, l, t in MENU1 + MENU2]


def CARDS_AT(start, n=None, only=None):
    """cards with times relative to the shot start (cards from earlier show at once)"""
    cs = CARDS if only is None else [c for c in CARDS if c["label"] in only]
    out = [dict(c, t=round(max(-1.0, s(c["t"]) - s(start)), 3)) for c in cs]
    return out[:n] if n else out


POD_ = [dict(v="b", len=900, x=1020, y=470), dict(v="a", len=640, x=560, y=630, z=-1), dict(v="c", len=560, x=1450, y=660)]


def LB_(text, t, x, y, end=None): return LB(text, t, x, y, end=end)


SURF = dict(kind="surfer", x=1060, s=1.0)
SEAL = dict(kind="seal", x=760, s=1.0)

SHOTS = [
    # ===================== THE MENU
    ("0:00.02", A("cards", cards=CARDS_AT("0:00.02", 9), ov=both(lambda a, b: fade_in_black(a, 1.0), ST_("THINGS ORCAS EAT", "0:00.4", "0:03.0", size=110)))),
    ("0:12.26", A("cards", cards=CARDS_AT("0:12.26", 14), zoom=1.15, ov=ST_("HERE'S A LONGER LIST", "0:12.4", "0:13.8"))),
    ("0:22.30", V("yt:wshark_compass", 52, crop=WSH, ov=ST_("THE BIGGEST FISH IN THE OCEAN", "0:22.4", "0:24.4"))),
    ("0:24.57", V("yt:portstar", 107, crop=(0.12, 0.09, 0.86, 0.86), ov=ST_("FLIPPED · TORN OPEN FOR THE LIVER", "0:25.4", "0:28.7"))),
    ("0:28.89", A("cards", cards=[c for c in CARDS_AT("0:28.89") if c["label"] != "A BLUE WHALE"], zoom=1.15)),
    ("0:35.09", V("yt:bremer", 126, crop=BC, ov=ST_("2019 · AUSTRALIA", "0:35.6", "0:38.5", size=100))),
    ("0:38.73", A("cards", cards=CARDS_AT("0:38.73"), zoom=1.15, wide="0:43.0",
                  ov=both(ST_("THE LARGEST ANIMAL THAT HAS EVER LIVED", "0:38.9", "0:43.0"), ST_("IF IT SWIMS, FLOATS OR BREATHES AT THE SURFACE...", "0:43.6", "0:51.0")))),
    ("0:51.24", V("yt:kayak_kundu", 9, ov=ST_("BUT ONE ANIMAL HAS BEEN IN THE WATER WITH ORCAS THOUSANDS OF TIMES", "0:51.6", "0:56.5"))),
    ("0:56.72", A("below", items=[dict(SURF, x=900)], orcas=[dict(v="a", len=600, path=[[0, 2200, 820], [7.5, -400, 760]], flip=True, fog=[20, 70, 95, 0.45])],
                  ov=both(ST_("SLOW", "0:56.8", "0:57.9", size=110), ST_("CLUMSY", "0:57.95", "0:59.5", size=110), ST_("CAN'T DIVE DEEP", "0:59.6", "1:00.7", size=110),
                          ST_("CAN'T SWIM FAST", "1:00.8", "1:02.2", size=110), ST_("CAN'T FIGHT BACK", "1:02.3", "1:04.1", size=110)))),
    ("1:04.27", V("yt:diver_cortez", 13, ov=ST_("WILD ORCAS HAVE NEVER ONCE HUNTED IT", "1:05.2", "1:09.0"))),
    ("1:09.10", A("cards", cards=CARDS_AT("1:09.10"), you="1:09.9", fall="1:10.2", zoom=1.0, wide=-1, ov=FX("deep_boom", "1:09.9", 0.8))),
    ("1:11.12", A("below", items=[dict(SURF, x=980)], orcas=[dict(v="b", len=900, path=[[0, -600, 900], [5, 960, 700], [10.7, 2500, 820]], fog=[20, 70, 95, 0.2])],
                  cam=dict(z0=1.0, z1=1.08), ov=both(ST_("WHY?", "1:11.3", "1:12.3", size=130), ST_("THE MOST ADAPTABLE PREDATOR IN THE OCEAN", "1:12.6", "1:17.8"),
                                                    ST_("LEAVES THE EASIEST PREY COMPLETELY ALONE", "1:18.0", "1:21.6")))),
    ("1:21.82", V("yt:res_super", 13, crop=(0.05, 0.02, 0.85, 0.82), ov=TT("THE ONLY ANIMAL ORCAS WON'T HUNT", "1:22.0", "1:28.8", size=130))),
    ("1:29.05", V("yt:car_devos", 15, crop=(0.0, 0.0, 1.0, 0.9), ov=ST_("FIRST: HOW GOOD ORCAS ARE AT EATING ALMOST EVERYTHING", "1:30.0", "1:35.6"))),
    # ===================== THE NAME
    ("1:35.84", A("eden", boat=[300, 700], whale0=1500, whale1=1250, ov=ST_("START WITH THE NAME", "1:36.0", "1:37.6"))),
    ("1:37.74", A("pod", members=[dict(v="b", len=1000, x=960, y=520)], ov=ST_("\"KILLER WHALES\"", "1:39.0", "1:43.8", size=110))),
    ("1:44.32", S(word_flip, "1:50.9")),
    ("1:55.60", A("pod", members=[dict(v="b", len=900, x=1000, y=480), dict(v="c", len=560, x=1450, y=660)], ov=ST_("THE LARGEST MEMBER OF THE DOLPHIN FAMILY", "1:59.4", "2:03.2"))),
    ("2:03.37", S(size_compare, [("diver_sil", 1.8, "DIVER", False), ("orca_a", 8.5, "BIG MALE · 8-9 M · SEVERAL TONNES", False)], ["2:03.5", "2:04.0"], 11.0)),
    ("2:08.00", A("swim", depth=0.18, heroes=[dict(v="a", len=1000, path=[[0, -700, 600], [2.2, 2400, 480]], beat=1.8, amp=0.08)],
                  ov=lambda a, b: depth_card(s("2:08.3"), s("2:11.4"), "50 KM/H", None))),
    ("2:11.56", V("yt:eden_skel", 113, ov=LB_("CONE-SHAPED TEETH THAT LOCK TOGETHER", "2:12.4", 820, 640))),
    ("2:18.28", A("pod", members=POD_,
                  ov=ST_("WHAT MAKES THEM DANGEROUS ISN'T SIZE", "2:18.6", "2:22.2"))),
    ("2:22.45", S(world_pins, [(174.8, -36.8, "NEW ZEALAND", "2:23.4"), (-111.0, 27.0, "GULF OF CALIFORNIA", "2:24.2"), (19.0, -34.6, "SOUTH AFRICA", "2:25.0"),
                               (-123.0, 48.6, "PACIFIC NORTHWEST", "2:25.8"), (-60.0, -64.0, "ANTARCTICA", "2:26.6")], None, 1.0)),
    # ===================== WHAT THEY EAT
    ("2:28.38", V("yt:ray_preston", 52, crop=RAY, ov=ST_("OFF NEW ZEALAND: STINGRAYS", "2:28.6", "2:32.0"))),
    ("2:32.15", V("yt:ray_drone", 14, ov=ST_("PULLED OUT OF THE SAND", "2:34.3", "2:37.5"))),
    ("2:37.69", V("yt:ray_preston", 82, crop=RAY, ov=ST_("VENOMOUS BARBS · STUCK IN SOME ORCAS' MOUTHS", "2:38.6", "2:44.0"))),
    ("2:44.23", V("yt:ray_massey", 2, ov=ST_("THEY KEEP HUNTING RAYS ANYWAY", "2:44.4", "2:46.3"))),
    ("2:46.45", S(world_pins, [(-111.0, 27.0, "GULF OF CALIFORNIA", "2:47.2")], (-111.0, 27.0), 3.0)),
    ("2:51.57", PH("c_wshark", zoom=(1.0, 1.1), ov=ST_("A WHALE SHARK CAN BE LONGER THAN A BUS", "2:51.8", "2:54.4"))),
    ("2:54.58", V("yt:wshark_compass", 24, crop=WSH, ov=ST_("THEY GO FOR THE BELLY", "2:55.0", "2:58.0"))),
    ("2:58.20", V("yt:wshark_compass", 59, crop=WSH, ov=ST_("UPSIDE DOWN, MANY SHARKS GO LIMP", "2:59.6", "3:03.6"))),
    ("3:03.82", V("yt:starboard", 64, crop=SC_, ov=ST_("SOUTH AFRICA · PORT AND STARBOARD", "3:04.3", "3:08.5"))),
    ("3:08.72", V("yt:starboard", 118, crop=SC_, ov=ST_("HUNTING GREAT WHITES FOR YEARS", "3:09.2", "3:13.0"))),
    ("3:13.23", V("yt:portstar", 107, crop=(0.12, 0.09, 0.86, 0.86), ov=ST_("ONLY THE LIVER · ENERGY-RICH OIL", "3:15.0", "3:19.3"))),
    ("3:19.47", PH("c_white", zoom=(1.08, 1.0), ov=ST_("GREAT WHITES BEGAN DISAPPEARING", "3:20.0", "3:23.9"))),
    ("3:24.11", V("yt:deer_malleson", 20, crop=(0.2, 0.15, 0.8, 0.7), ov=ST_("PACIFIC NORTHWEST: SWIMMING DEER", "3:24.4", "3:31.2"))),
    ("3:31.40", V("yt:wavewash", 42, crop=(0.0, 0.1, 0.88, 1.0), ov=ST_("ANTARCTICA: WAVES THAT WASH SEALS OFF THE ICE", "3:31.8", "3:37.7"))),
    ("3:37.90", V("yt:iceseal", 145, ov=ST_("CHOOSING THE EXACT SPECIES OF SEAL", "3:38.2", "3:41.6"))),
    ("3:41.81", A("cards", cards=CARDS_AT("3:41.81"), you="3:45.4", zoom=1.0, wide=-1, ov=ST_("SO WHY NOT US?", "3:45.6", "3:48.7", size=110))),
    # ===================== THINK HOW OFTEN IT COULD
    ("3:48.94", V("yt:kayak_kingfisher", 13, crop=KFR, ov=ST_("THOUSANDS OF KAYAKERS IN ORCA WATERS", "3:51.6", "3:57.9"))),
    ("3:58.14", V("yt:surfers_nz", 40, ov=ST_("SURFERS, WITH ORCAS PASSING", "3:58.5", "4:04.3"))),
    ("4:04.50", V("yt:car_wpe", 5)),
    ("4:08.34", V("yt:car_devos", 3, crop=(0.0, 0.0, 1.0, 0.9), ov=ST_("SWIMMING CLOSE TO WILD ORCAS ON PURPOSE", "4:08.6", "4:11.8"))),
    ("4:12.00", A("below", items=[dict(SEAL, x=620, t0=1.0), dict(SURF, x=1320, t0=2.4)], window=960, cam=dict(z0=1.0, z1=1.05),
                  ov=both(ST_("FROM BELOW...", "4:12.2", "4:13.7", size=110), LB_("SEAL", "4:13.6", 820, 300), LB_("SURFER", "4:15.0", 1560, 300)))),
    ("4:18.98", A("below", items=[dict(SURF, x=960)], orcas=[dict(v="a", len=700, path=[[0, 2300, 760], [6, 1000, 520], [11, -400, 700]], flip=True, fog=[20, 70, 95, 0.25])],
                  cam=dict(z0=1.0, z1=1.1), ov=both(ST_("AND ORCAS EAT SEALS", "4:19.1", "4:21.0"), ST_("MISTAKEN IDENTITY?", "4:24.0", "4:28.9")))),
    ("4:30.20", A("below", items=[dict(SURF, x=960)], orcas=[], ov=ST_("BUT THE RECORDS ARE ALMOST EMPTY", "4:30.4", "4:32.5"))),
    ("4:32.74", S(world_pins, [(-121.9, 36.3, "1972 · POINT SUR, CALIFORNIA", "4:33.6")], (-121.9, 36.3), 3.0)),
    ("4:38.66", PH("c_surfer", zoom=(1.0, 1.1), ov=ST_("A SURFER, HANS KRETSCHMER, WAS BITTEN ON THE LEG", "4:39.0", "4:45.9"))),
    ("4:46.14", A("below", items=[dict(SURF, x=1000)], orcas=[dict(v="a", len=700, path=[[0, 1700, 800], [1.6, 1150, 330], [2.4, 1250, 360], [6, 2400, 820]], flip=True)],
                  cam=dict(z0=1.05, z1=1.0, shake=[[1.6, 8, 0.6]]), ov=both(ST_("AROUND 100 STITCHES", "4:46.4", "4:48.4"), ST_("IT BIT HIM ONCE. THEN LET HIM GO.", "4:50.6", "4:54.7")))),
    ("4:54.90", V("yt:diver_cortez", 31, ov=ST_("THE BEST-KNOWN CASE IN THE WILD", "4:55.4", "5:02.2"))),
    ("5:02.42", V("yt:swimmer_hahei", 47, crop=HAH, ov=ST_("A FEW CLOSE ENCOUNTERS: BUMPED, GRABBED, LET GO", "5:03.0", "5:09.5"))),
    ("5:09.72", A("below", items=[dict(SURF, x=960)], orcas=[dict(v="b", len=800, path=[[0, -500, 820], [6.3, 2400, 780]], fog=[20, 70, 95, 0.35])],
                  ov=lambda a, b: depth_card(s("5:12.4"), s("5:16.0"), "0", "CONFIRMED CASES OF A WILD ORCA HUNTING A HUMAN", "5:13.4"))),
    ("5:16.04", V("yt:starboard", 118, crop=SC_, ov=ST_("FOR AN ANIMAL THAT EATS GREAT WHITES", "5:16.4", "5:20.3"))),
    # ===================== THE DARKER SIDE
    ("5:20.55", A("tank", ov=TT("THE DARKER SIDE", "5:21.0", "5:25.0", size=150))),
    ("5:25.26", A("tank", cam=dict(z0=1.05, z1=1.0), ov=ST_("ORCAS HAVE KILLED PEOPLE. JUST NOT IN THE WILD.", "5:26.6", "5:30.1"))),
    ("5:30.36", PH("c_tank", zoom=(1.0, 1.1), ov=ST_("IN MARINE PARKS: TRAINERS INJURED MANY TIMES, SEVERAL DEATHS", "5:31.0", "5:37.4"))),
    ("5:37.66", A("tank", v="a", speed=0.09, ov=both(ST_("TILIKUM", "5:41.6", "5:44.0", size=120), ST_("INVOLVED IN THREE HUMAN DEATHS OVER ALMOST 20 YEARS", "5:44.2", "5:47.2")))),
    ("5:47.36", A("tank", v="a", speed=0.09, cam=dict(z0=1.1, z1=1.15), ov=ST_("THE LAST IN 2010, AT SEAWORLD ORLANDO", "5:48.0", "5:55.1"))),
    ("5:55.36", A("pod", members=[dict(v="a", len=1200, x=960, y=540)], ov=ST_("ORCAS ARE CAPABLE OF KILLING A HUMAN", "5:59.6", "6:05.4"))),
    ("6:05.67", A("tank", cam=dict(z0=1.0, z1=0.92), ov=ST_("TANKS THAT ARE TINY, COMPARED TO THE OPEN OCEAN", "6:06.6", "6:12.4"))),
    ("6:12.67", A("tank", speed=0.15, ov=both(ST_("SEPARATED FROM FAMILY · MIXED WITH STRANGERS", "6:12.9", "6:17.3"), ST_("EXTREME STRESS AND FRUSTRATION", "6:20.0", "6:23.7")))),
    ("6:23.94", V("yt:res_jpod", 47, crop=(0.07, 0.0, 1.0, 0.9), ov=ST_("IN THE WILD, WITH THEIR FAMILIES...", "6:29.0", "6:34.4"))),
    ("6:34.50", A("below", items=[dict(SURF, x=900)], orcas=[dict(v="b", len=800, path=[[0, 2300, 760], [3.2, -400, 760]], flip=True)], ov=ST_("THEY DON'T TREAT US AS PREY", "6:34.6", "6:37.5"))),
    # ===================== THEORY 1: FOOD TRADITIONS
    ("6:37.66", V("yt:res_super", 20, crop=(0.05, 0.02, 0.85, 0.82), ov=ST_("SO WHAT'S GOING ON?", "6:37.9", "6:41.8"))),
    ("6:41.94", S(theory_card, 1, "FOOD", "WHAT AN ORCA THINKS FOOD IS")),
    ("6:50.21", A("pod", members=POD_, ov=ST_("SOME OF THE PICKIEST EATERS IN THE OCEAN", "6:53.6", "6:57.0"))),
    ("6:57.06", S(ecotypes, "6:57.6", "6:59.6")),
    ("7:05.66", V("yt:res_j16", 36, crop=(0.0, 0.15, 1.0, 1.0), ov=ST_("RESIDENTS: FISH, MOSTLY SALMON", "7:07.0", "7:11.2"))),
    ("7:11.36", V("yt:res_j16", 49, crop=(0.0, 0.15, 1.0, 1.0), ov=ST_("THEY SWIM RIGHT PAST SEALS AND SEA LIONS", "7:11.6", "7:15.4"))),
    ("7:15.62", V("yt:res_jpod", 25, crop=(0.07, 0.0, 1.0, 0.9), ov=ST_("AND PAY ALMOST NO ATTENTION", "7:16.0", "7:19.7"))),
    ("7:19.93", V("yt:tr_porpoise", 105, ov=ST_("BIGG'S ORCAS, SAME WATERS: THE OPPOSITE", "7:20.2", "7:29.9"))),
    ("7:30.23", S(menus, "7:30.4", "7:31.9")),
    ("7:35.77", A("pod", members=POD_, ov=ST_("ASTONISHING STUBBORNNESS", "7:37.4", "7:39.2"))),
    ("7:39.43", S(world_pins, [(-123.5, 49.0, "1970 · BRITISH COLUMBIA", "7:46.0")], (-123.5, 49.0), 3.0)),
    ("7:50.43", A("tank", v="c", speed=0.06, ov=both(ST_("OFFERED DEAD FISH. THEY REFUSED IT.", "7:51.0", "7:56.0"), lambda a, b: day_counter(a, b, s("7:56.2"), s("8:01.4"), 75, "ONE OF THEM DIED")))),
    ("8:04.28", A("tank", v="b", speed=0.1, ov=ST_("ONLY THEN DID ANOTHER BEGIN TO EAT", "8:04.6", "8:08.0"))),
    ("8:08.29", A("tank", v="a", speed=0.05, cam=dict(z0=1.0, z1=1.12), ov=ST_("STARVING, SURROUNDED BY FOOD, REFUSING IT", "8:09.6", "8:14.3"))),
    ("8:14.48", A("pod", members=POD_, ov=ST_("IN ITS FAMILY, THAT WASN'T FOOD", "8:14.8", "8:17.5"))),
    ("8:17.72", S(family_tree, ["8:18.0", "8:23.4", "8:24.4", "8:25.4"])),
    ("8:26.32", V("yt:res_super", 28, crop=(0.05, 0.02, 0.85, 0.82), ov=ST_("TECHNIQUES · PREY · PLACES: ALL PASSED DOWN", "8:27.4", "8:32.8"))),
    ("8:33.04", A("pod", members=[dict(v="b", len=1000, x=820, y=500), dict(v="c", len=480, x=1350, y=620)], ov=ST_("NO ORCA MOTHER HAS EVER TAUGHT HER CALF THAT A HUMAN IS FOOD", "8:33.4", "8:38.9"))),
    # ===================== THEORY 2: TOO STRANGE
    ("8:39.10", S(theory_card, 2, "TOO STRANGE", "ORCAS DON'T JUST SEE THE WORLD. THEY HEAR IT.")),
    ("8:47.27", A("sonar", target="seal", t0=0.2, ov=ST_("ECHOLOCATION", "8:52.2", "8:54.8", size=110))),
    ("8:55.02", A("sonar", target="seal", t0=0.1, ov=ST_("SHAPE · SIZE · MAYBE WHAT'S INSIDE", "8:55.4", "9:05.4"))),
    ("9:05.61", A("sonar", target="seal", t0=0.0, ov=both(ST_("A SEAL LOOKS LIKE A SEAL", "9:05.8", "9:08.9"), LB_("THICK BLUBBER", "9:09.2", 1500, 300)))),
    ("9:14.04", A("sonar", target="human", t0=0.0, ov=both(ST_("A HUMAN LOOKS LIKE NOTHING ELSE IN THE OCEAN", "9:14.2", "9:16.8"),
                  LB_("LONG, THIN LIMBS", "9:17.6", 1380, 760, end="9:20.9"), LB_("AIR IN STRANGE PLACES", "9:21.2", 1340, 360, end="9:24.0"), LB_("HARD, DENSE BONES", "9:24.1", 1350, 560)))),
    ("9:26.71", A("below", items=[dict(SURF, x=520, t0=0.0), dict(kind="kayak", x=1380, s=0.9, t0=1.4)], ov=ST_("A SURFBOARD · A WETSUIT · A KAYAK", "9:27.0", "9:30.4"))),
    ("9:30.62", V("yt:diver_cortez", 57, ov=ST_("AS CONFUSING AS A STRANGE MACHINE IS TO US", "9:31.6", "9:36.8"))),
    ("9:37.02", A("pod", members=POD_, ov=ST_("CAUTIOUS ABOUT UNFAMILIAR PREY", "9:39.4", "9:48.5"))),
    # ===================== THEORY 3: NOT WORTH IT
    ("9:48.77", S(theory_card, 3, "NOT WORTH IT", "HUNTING COSTS ENERGY")),
    ("9:56.13", A("swim", depth=0.2, heroes=[dict(v="b", len=1000, path=[[0, -600, 560], [4.6, 2400, 520]], beat=1.0)], ov=ST_("A BIG ORCA NEEDS A HUGE AMOUNT OF FOOD EVERY DAY", "9:56.4", "10:00.6"))),
    ("10:00.84", S(fuel, "10:01.4", every=2.6)),
    ("10:19.22", A("below", items=[dict(SURF, x=960)], ov=both(ST_("WE MAY SIMPLY BE A POOR MEAL", "10:20.0", "10:23.4"), ST_("NOT THE MOST FLATTERING REASON TO SURVIVE", "10:23.6", "10:30.0")))),
    # ===================== THEORY 4: SOMETHING ELSE
    ("10:30.19", S(theory_card, 4, "INTELLIGENCE", "HARDER TO PROVE")),
    ("10:36.92", A("pod", members=POD_, ov=ST_("BRAINS AMONG THE LARGEST OF ANY ANIMAL", "10:40.4", "10:50.3"))),
    ("10:50.55", A("pod", members=POD_, calls=[[0.5, 0], [1.2, 1], [2.0, 2], [3.4, 0], [4.6, 1], [6.0, 2]], ov=ST_("FAMILIES · DIALECTS · TEACHING · SHARING · GRIEF", "10:51.0", "10:59.7"))),
    ("10:59.96", V("yt:tahlequah", 15, crop=TAH, ov=ST_("2018 · TAHLEQUAH CARRIED HER DEAD CALF · 17 DAYS · ~1,500 KM", "11:01.0", "11:09.9"))),
    ("11:10.11", A("below", items=[dict(SURF, x=960)], orcas=[dict(v="c", len=700, path=[[0, 2200, 700], [5.5, 1150, 470], [11.5, -400, 650]], flip=True)],
                  ov=both(ST_("NOT THREATS. NOT PREY. SOMETHING ELSE.", "11:12.0", "11:17.6"), ST_("SOMETHING TO BE CURIOUS ABOUT", "11:18.6", "11:21.6")))),
    ("11:21.80", V("yt:diver_cortez", 75, ov=ST_("APPROACHING · CIRCLING · WATCHING · SWIMMING AWAY", "11:22.4", "11:32.4"))),
    ("11:32.62", V("yt:swimmer_hahei", 87, crop=HAH, ov=ST_("WE CAN'T KNOW WHAT AN ORCA IS THINKING", "11:33.4", "11:36.0"))),
    ("11:36.63", A("eden", boat=[300, 500], ov=ST_("BUT HISTORY SUGGESTS SOMETHING", "11:37.6", "11:43.1"))),
    ("11:43.28", V("yt:eden_1975", 122, ov=ST_("EDEN, AUSTRALIA · LATE 1800S TO EARLY 1900S", "11:44.0", "11:53.9"))),
    ("11:54.09", A("eden", whale0=1700, whale1=1250, ov=ST_("ORCAS HERDED WHALES AND ALERTED THE WHALERS", "11:55.0", "12:01.6"))),
    ("12:01.79", A("eden", boat=[600, 900], whale0=1250, whale1=1150, rope=1, ov=TT("THE LAW OF THE TONGUE", "12:07.9", "12:10.6", size=140))),
    ("12:10.82", V("yt:eden_1975", 41, ov=ST_("SURROUNDED BY WILD ORCAS · NOT HUNTED · PARTNERS", "12:12.0", "12:19.9"))),
    # ===================== THE ANSWER, AND WHY IT CAN CHANGE
    ("12:20.12", S(four_tiles, ["12:24.3", "12:26.0", "12:30.0", "12:31.7"])),
    ("12:35.54", V("yt:res_jpod", 40, crop=(0.07, 0.0, 1.0, 0.9), ov=both(ST_("NOT A LAW OF NATURE", "12:38.9", "12:41.4", size=100), ST_("A HABIT. AND HABITS CAN CHANGE.", "12:41.6", "12:44.6", size=100)))),
    ("12:44.86", S(world_pins, [(-176.0, 52.0, "1990S · ALEUTIAN ISLANDS", "12:45.6")], (-176.0, 52.0), 2.6)),
    ("12:48.94", V("yt:otter_play", 29, ov=ST_("SEA OTTERS SUDDENLY CRASHING", "12:49.2", "12:52.7"))),
    ("12:52.94", V("yt:otter_npl", 0, ov=ST_("SOMETHING WAS EATING THEM: ORCAS", "12:53.4", "12:57.0"))),
    ("12:57.16", PH("c_otter", zoom=(1.0, 1.1), ov=ST_("TINY, WITH VERY LITTLE FAT · IGNORED BEFORE", "12:57.6", "13:04.3"))),
    ("13:04.51", S(otter_crash, "13:05.0", "13:13.4")),
    ("13:17.63", V("yt:otter_sitka", 1, ov=ST_("IGNORED FOR GENERATIONS · SUDDENLY FOOD", "13:18.0", "13:22.3"))),
    ("13:22.55", S(world_pins, [(-8.5, 37.5, "SPAIN AND PORTUGAL · SINCE 2020", "13:23.6")], (-8.5, 38.5), 3.4)),
    ("13:26.74", V("yt:rudder_reuters", 17, crop=RUD, ov=ST_("RAMMING AND BITING RUDDERS", "13:30.6", "13:33.8"))),
    ("13:34.00", V("yt:rudder_ap", 8, ov=ST_("HUNDREDS OF BOATS DAMAGED · SOME SUNK", "13:34.4", "13:38.2"))),
    ("13:38.46", A("below", items=[dict(kind="boat", x=960, s=1.0, rud=1.0)], orcas=[dict(v="c", len=520, path=[[0, 1900, 520], [3, 1350, 430]], flip=True), dict(v="a", len=480, path=[[0, 2200, 640], [3.4, 1450, 560]], flip=True)],
                  sy=210, ov=both(ST_("PLAY? A FAD AMONG YOUNG ORCAS?", "13:41.4", "13:46.0"), ST_("A BAD EXPERIENCE WITH A BOAT?", "13:46.2", "13:49.6")))),
    ("13:51.64", A("below", items=[dict(kind="boat", x=960, s=1.0, rud=0.5)], orcas=[dict(v="c", len=520, x=1330, y=420, flip=True), dict(v="a", len=480, x=1480, y=560, flip=True)], sy=210,
                  ov=both(ST_("THE BOATS. NOT THE PEOPLE ON THEM.", "13:54.0", "13:59.8"), LB_("THE RUDDER", "13:55.0", 1380, 300)))),
    ("14:00.02", V("yt:rudder_reuters", 37, crop=RUD, ov=ST_("THEY STILL LEAVE US ALONE", "14:05.6", "14:09.8"))),
    # ===================== BACK TO THE KAYAK
    ("14:10.06", A("below", items=[dict(kind="kayak", x=960, vx=12)], cam=dict(z0=1.0, z1=1.06), ov=ST_("A KAYAKER, A CALM BAY", "14:12.8", "14:17.9"))),
    ("14:18.31", V("yt:kayak_kundu", 12, ov=ST_("A TALL BLACK FIN... THEN ANOTHER... THEN ANOTHER", "14:20.2", "14:25.4"))),
    ("14:25.62", A("below", items=[dict(kind="kayak", x=960, vx=10)], orcas=[dict(v="b", len=800, path=[[0, -600, 640], [13, 2500, 600]], seed=1), dict(v="a", len=560, path=[[0, -900, 820], [13, 2200, 780]], seed=2, fog=[20, 70, 95, 0.35]),
                  dict(v="c", len=460, path=[[0, -300, 900], [13, 2600, 880]], seed=3, fog=[20, 70, 95, 0.45])],
                  ov=both(ST_("FISH EATERS?", "14:28.5", "14:31.2", size=100), ST_("MAMMAL HUNTERS?", "14:31.4", "14:34.4", size=100), ST_("SHARK OR WHALE HUNTERS?", "14:34.6", "14:38.6", size=100)))),
    ("14:38.73", V("yt:kayak_under", 7, ov=ST_("CLOSE ENOUGH TO HEAR THEIR BREATH", "14:39.4", "14:42.8"))),
    ("14:42.99", V("yt:kayak_under", 12, ov=ST_("AND THEN THEY'RE GONE", "14:43.4", "14:44.8"))),
    ("14:44.99", PH("c_white", zoom=(1.0, 1.08), ov=ST_("GREAT WHITE SHARKS", "14:45.1", "14:46.9", size=100))),
    ("14:47.13", PH("c_wshark", zoom=(1.0, 1.08), ov=ST_("WHALE SHARKS", "14:47.2", "14:49.0", size=100))),
    ("14:49.19", PH("c_blue", zoom=(1.0, 1.08), ov=ST_("BLUE WHALES", "14:49.3", "14:51.4", size=100))),
    ("14:51.62", V("yt:eden_1975", 130, ov=ST_("THE ONE THEY LEAVE ALONE SPENT CENTURIES HUNTING THEM", "14:52.0", "14:58.9"))),
    ("14:59.08", PH("c_tank", zoom=(1.0, 1.06), ov=ST_("CAPTURING THEM. FILLING THEIR OCEANS WITH NOISE.", "14:59.3", "15:03.1"))),
    ("15:03.33", A("pod", members=POD_, ov=both(ST_("MAYBE IT'S TRADITION", "15:03.4", "15:04.8", size=100), ST_("MAYBE IT'S CONFUSION", "15:04.95", "15:06.7", size=100),
                  ST_("MAYBE WE'RE NOT WORTH THE EFFORT", "15:06.85", "15:09.9", size=100), ST_("OR MAYBE, WE'RE NOT PREY", "15:10.0", "15:15.8", size=100)))),
    ("15:15.98", A("below", items=[dict(kind="kayak", x=960, vx=8)], orcas=[dict(v="b", len=800, path=[[0, 2500, 650], [11, -500, 620]], flip=True)], cam=dict(z0=1.06, z1=1.0),
                  ov=both(ST_("IT'S A CHOICE", "15:17.2", "15:18.3", size=110), ST_("EVERY SINGLE TIME WE SHARE THE WATER WITH THEM", "15:19.0", "15:24.2")))),
    ("15:24.32", V("yt:kayak_sully", 85, ov=ST_("IT IS A CHOICE", "15:26.0", "15:27.3", size=110))),
    ("15:27.40", A("pod", members=POD_, path=[[0, 0, 0], [14, -300, 0]], cam=dict(z0=1.0, z1=1.1), ov=lambda a, b: endcard(a, b, s("15:31.3")))),
]
