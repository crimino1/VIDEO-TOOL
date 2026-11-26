"""Film list for the Maxwell video. Times come from the user's voiceover transcript (assets/vo.mp3).
One source of truth: Manim scenes and the HyperFrames root both read it.

kinds
  "m" Manim scene (navy glow stage) -> assets/manim/<Name>.mp4. dict(b=brief for the scene author)
  "k" keyword card on pure black, built in HTML. items: (type, content, time, pos, opts)
        type t=text  e=emoji (Noto codepoint)  i=framed image  a=doodle arrow+label  x=coral cross  lab=section label
        pos  "c" "up" "low" "top" "l" "r" or (x, y) centre in px. Text items at the same pos replace each other.
  "p" full-screen photo, Ken Burns. caps [(text, time)] bottom centre, each replaces the last
  "q" portrait card on navy: img, who, yrs, lines [(text, time)], side l|r
"""
FILM_END = 520.94


def sec(s):
    if isinstance(s, (int, float)):
        return float(s)
    m, x = s.split(":")
    return int(m) * 60 + float(x)


S = [
    # ---------------- HOOK
    ("0:00.00", "p", "hand", dict(img="hand", kb="in", caps=[("hold your hand up ✋", "0:00.06"), ("right in front of your face", "0:01.84")])),
    ("0:04.02", "m", "Invisible", dict(b="""Navy stage. A big ✋ emoji (assets/emoji/270b.png) centre-left, softly lit.
'invisible waves' (0:05.00): glowing sine waves stream left->right THROUGH the hand, each its own colour and wavelength, each gets a small label as it is named:
Wi-Fi 0:08.06 (cyan, medium wave), radio 0:08.96 (long slow wave, pale blue), text message 0:10.02 (a little 💬 icon riding a wave, 1f4ac.png), light 0:12.78 (gold, short wave, the hand brightens as the gold wave hits it).
Labels in Inter white 34px with a small glow. End: all waves keep flowing.""")),
    ("0:16.08", "m", "FourLines", dict(b="""The four Maxwell equations (helper maxwell_eqs) fade in one per beat at 0:16.08, 0:17.08, 0:17.98, 0:18.90 in a 2x2 grid, E terms gold, B terms cyan, rest white, with a soft glow.
Small caps label at top 'FOUR SHORT LINES' at 0:18.90. At 0:20.20 a tag '150+ years ago' (Kalam hand font, white) with a hand-drawn arrow to the grid. Slow push-in (camera scale 1 -> 1.04) across the shot.""")),
    ("0:22.36", "k", "pen", dict(items=[("e", "270d", "0:22.36", "c", {}), ("t", "one guy.", "0:22.36", "low", {}), ("t", "with a pen.", "0:24.36", "low", {})])),
    ("0:25.43", "q", "maxwell1", dict(img="maxwell", who="James Clerk Maxwell", yrs="1831 – 1879", lines=[("Scotland", "0:25.43")])),
    ("0:27.67", "k", "show", dict(items=[("t", "today:", "0:27.67", "up", {}), ("t", "those 4 lines 👀", "0:28.65", "c", {"size": 110}), ("t", "you don't need", "0:30.19", "up", {}), ("t", "to be good at math", "0:31.11", "c", {"size": 96}),
                                           ("e", "1f9f2", "0:32.76", (960, 520), {"size": 300}), ("t", "played with a magnet?", "0:32.76", "up", {}), ("t", "", "0:32.76", "c", {}),
                                           ("a", "you already get half of this ✔", "0:34.54", (1180, 880, 1060, 660), {})])),
    # ---------------- 1820, TWO CLUBS
    ("0:37.09", "m", "TwoThings", dict(b="""Big gold year '1820' centre at 0:37.09 (Inter Bold 160px, glow), label 'THE YEAR 1820' small caps top.
0:41.45 year moves up and shrinks; two glowing circles appear: left GOLD 'ELECTRICITY' with a jagged lightning spark inside (spark flickers at 0:45.17 'zappy stuff'), right CYAN 'MAGNETISM' with a compass whose needle swings to N at 0:47.45-0:50.07.
0:51.19 'different stuff' 0:52.29 'different rules' (white small lines under each circle), 0:53.49 'end of story': a coral vertical wall slams down between them.""")),
    ("0:55.03", "q", "oersted", dict(img="oersted", who="Hans Christian Ørsted", yrs="1777 – 1851", lines=[("a Danish teacher", "0:55.03"), ("doing a class demo", "0:57.63")])),
    ("0:59.05", "m", "Oersted", dict(b="""Label 'THE CLASS DEMO' top. A table-top seen in the fixed 3D projection (proj helper): a battery (gold +, cyan -) wired to a long straight wire; a compass sits beside the wire, needle pointing N along the wire.
0:59.05 wire+battery draw on, 1:00.83 compass appears. 1:03.63 'when the electricity started flowing': gold dots stream along the wire (current). 1:07.35 the needle swings 90 degrees with a small overshoot wobble; coral doodle arrow + Kalam 'it moved!' at 1:08.07. 1:09.17-1:11.81 hold, needle trembles slightly.""")),
    ("1:11.81", "k", "touch", dict(items=[("e", "1f47b", "1:11.81", "c", {}), ("t", "nobody touched it.", "1:11.81", "low", {})])),
    ("1:13.52", "k", "how", dict(items=[("e", "26a1", "1:13.52", (700, 500), {}), ("t", "+", "1:13.52", (960, 500), {"size": 140}), ("e", "1f9f2", "1:13.52", (1220, 500), {}),
                                          ("t", "connected somehow", "1:13.52", "low", {}), ("t", "...but HOW?", "1:16.68", "low", {"color": "coral", "wait": True})])),
    ("1:18.12", "q", "faraday1", dict(img="faraday", who="Michael Faraday", yrs="1791 – 1867", lines=[("left school at 13", "1:19.86")])),
    ("1:22.64", "p", "books", dict(img="books", kb="in", caps=[("worked in a bookshop 📚", "1:22.64"), ("binding books", "1:24.34")])),
    ("1:25.66", "k", "nomath", dict(items=[("t", "∂²B/∂t² ∮ ∇×", "1:25.66", "c", {"size": 120, "font": "math"}), ("x", "", "1:26.30", (960, 540, 720), {"out": "1:27.36"}),
                                             ("t", "couldn't do fancy math", "1:25.66", "low", {}), ("e", "1f913", "1:27.36", (960, 540), {"size": 300}), ("t", "", "1:27.36", "c", {}), ("t", "but OBSESSED", "1:28.24", "low", {"color": "gold"})])),
    ("1:29.30", "m", "FaradayLines", dict(b="""Faraday's notebook look on navy: a bar magnet (coral N / cyan S) appears 1:29.30 'poking at magnets'.
1:31.54 a copper coil (gold) draws on beside it 'wrapping wires into coils'.
1:33.44 curvy field lines are drawn on around the magnet one by one like pencil strokes (white, slightly hand-wobbly, Create with lag), 'drawing curvy lines to show where the invisible push was'; tiny iron-filing dashes fill in along them at 1:35.10.""")),
    ("1:37.27", "m", "ToMath", dict(b="""Faraday's curvy field lines (same as previous scene ending) on the left; Maxwell's portrait (portrait('maxwell')) fades in at right edge small with name 'James Clerk Maxwell' at 1:37.27.
1:38.95 the lines morph (Transform) into the four equations (maxwell_eqs) 'turned Faraday's pictures into real math', 1:39.83 equations glow up. Hold.""")),
    ("1:42.03", "k", "four", dict(items=[("t", "Maxwell's 4 rules", "1:42.03", "c", {"size": 120}), ("t", "one at a time", "1:44.71", "low", {}),
                                           ("e", "1f645", "1:45.97", (960, 500), {"size": 300}), ("t", "", "1:45.97", "c", {}), ("t", "no scary symbols", "1:45.97", "low", {}), ("t", "just the idea 💡", "1:47.25", "low", {"color": "gold"})])),
    # ---------------- RULE 1
    ("1:48.90", "k", "r1", dict(items=[("lab", "RULE 1", "1:48.90", "top", {"color": "gold"}), ("t", "electric charges", "1:50.14", "up", {}), ("t", "push out an invisible field", "1:51.74", "c", {"size": 96, "color": "gold"})])),
    ("1:53.22", "p", "balloon", dict(img="balloon", kb="in", caps=[("rub a balloon on your hair 🎈", "1:53.22"), ("why?", "1:57.48")])),
    ("1:59.06", "m", "Rule1", dict(b="""Label 'RULE 1 · ELECTRIC FIELD' top (gold). A glowing balloon shape (gold outline ellipse with knot) centre; 2:00.06 small '+' charges pop onto it ('extra electric charge').
2:02.16 gold field arrows grow outward radially in every direction (20 arrows), 'electric field' label at 2:03.82.
2:05.62 sprinkler analogy: the arrows turn into streams of little gold droplets spraying outward continuously (particles moving out and fading), Kalam doodle 'charge = sprinkler' at 2:09.36 pointing to the balloon, 'field = spray' at 2:11.08 pointing to the droplets.
2:14.82 'More charge?' more + signs pop on; 2:16.14 'Stronger spray' droplets denser, faster, brighter.
2:17.48 everything slides left/shrinks and the equation \\nabla\\cdot\\mathbf{E}=\\rho/\\varepsilon_0 appears right (E gold), tag 'rule 1' under it.""")),
    # ---------------- RULE 2
    ("2:20.13", "k", "r2", dict(items=[("lab", "RULE 2", "2:20.13", "top", {"color": "cyan"}), ("t", "my favourite 😍", "2:20.13", "c", {"size": 110}), ("t", "because it's kind of weird 🤨", "2:22.61", "low", {})])),
    ("2:23.83", "m", "Snap", dict(b="""Label 'RULE 2 · NO LONELY NORTH' top (cyan). A glowing bar magnet centre: left half coral 'N', right half cyan 'S' (3D-ish with proj, slight tilt). 2:25.31 'N' label pulses, 2:26.53 'S' pulses.
2:28.11 'snap it in half': a white crack flash down the middle and the halves fly apart (with a little rotation).
2:30.85 above each half a Kalam guess: 'north piece?' over the left, 'south piece?' over the right. Hold until shot end (2:33.38).""")),
    ("2:33.38", "k", "nope", dict(items=[("t", "NOPE.", "2:33.38", "c", {"size": 200, "color": "coral", "wait": True})])),
    ("2:34.60", "m", "Snap2", dict(b="""Continuation of Snap: the two halves are now each a full small magnet: each gets its own coral N and cyan S labels (2:34.60 'two smaller magnets', 2:36.80 'each with its own north and its own south').
2:39.78 'keep cutting': they split again and again rapidly into 4, 8, 16, 32 tiny magnets arranged in a grid, every one still N|S coloured, 2:41.76 shrinking to tiny dots 'down to tiny atoms'.
2:42.92 'never, ever a magnet with just a north end': a single coral 'N' alone appears with a coral X crossed over it.""")),
    ("2:45.56", "m", "Loops", dict(b="""Label 'RULE 2 · FIELD LINES LOOP' top (cyan). One big bar magnet (coral N right, cyan S left) centre; 2:47.38 cyan magnetic field lines draw on as closed loops around it (out of N, around, into S, continuing through the magnet), 6-8 loops.
2:51.52 'they always loop around': small glowing particles flow along every loop continuously.
2:57.22 'like a racetrack': one loop highlights gold and a little 🏎 dot races around it; Kalam doodles 'no start line' and 'no finish line' at 2:58.08 and 2:58.98.
At end 2:59.72 the equation \\nabla\\cdot\\mathbf{B}=0 (B cyan) fades in bottom.""")),
    # ---------------- RULES 3 + 4
    ("3:00.99", "k", "r34", dict(items=[("t", "rules 3 & 4", "3:00.99", "up", {}), ("t", "where it gets GOOD 🍿", "3:02.97", "c", {"size": 110, "color": "gold"}),
                                          ("e", "26a1", "3:04.61", (620, 860), {"size": 160}), ("e", "1f4ac", "3:06.45", (960, 840), {"size": 140}), ("e", "1f9f2", "3:04.61", (1300, 860), {"size": 160})])),
    ("3:09.30", "m", "Rule3", dict(b="""Label 'RULE 3 · CHANGING MAGNET → ELECTRICITY' top (gold). 3:10.94 Inter line at top-centre 'a changing magnetic field makes electricity'.
3:13.86 a glowing copper coil (gold helix in proj 3D, 6 turns) draws on, wired to a small meter (dial with needle at 0) at bottom right.
3:17.78 a bar magnet (coral N / cyan S) slides INTO the coil: 3:20.32-3:24.54 while it moves, gold dots flow along the wire and the meter needle swings right; cyan field lines of the magnet sweep through the coil.
3:24.54 magnet stops: current dots stop, needle back to 0 (3:26.38).
3:27.84 magnet pulls out: dots flow the OTHER way, needle swings left (3:30.92 'the other way').
3:32.31 magnet just sits there: nothing; Kalam doodle 'still = nothing' 3:33.87.
3:35.37 big text 'it has to be MOVING' then 3:36.79 equation \\nabla\\times\\mathbf{E}=-\\partial\\mathbf{B}/\\partial t with the ∂B/∂t term underlined coral and Kalam 'change!' arrow.""")),
    ("3:38.62", "p", "plant", dict(img="plant", kb="in", caps=[("how most of your electricity is made", "3:40.36")])),
    ("3:43.60", "m", "Generator", dict(b="""Label 'EVERY POWER PLANT' top (gold). A big magnet (coral/cyan) between two copper coils (gold), seen in proj 3D. 3:44.38 the magnet starts to spin.
3:48.48 'spin' 3:49.20 'spin' 3:50.10 'spin' : the spin speeds up on each word and Inter 'spin' words pop in sequence (white, then bigger).
3:51.16 'Electricity': gold current pulses run out of the coils to a light bulb that lights up with a gold glow burst.""")),
    ("3:52.32", "p", "charger", dict(img="charger", kb="in", caps=[("your phone charger? 🔌", "3:52.32"), ("rule 3.", "3:53.68")])),
    ("3:55.04", "q", "faraday2", dict(img="faraday", who="Michael Faraday", yrs="1831", lines=[("figured this out", "3:55.04"), ("we still run the planet on it 🌍", "3:58.10")], side="l")),
    ("4:00.44", "m", "Rule4", dict(b="""Label 'RULE 4 · ELECTRICITY → MAGNETISM' top (cyan). 4:01.32 'the flip side': Kalam doodle.
4:02.86 a vertical glowing wire (proj 3D) through a horizontal disk; gold current dots flow up it.
4:05.66 'remember Ørsted's compass?': a compass on the disk next to the wire, needle turns.
4:09.92 cyan magnetic field circles appear around the wire one by one (concentric, rotating arrows show direction) 'swirls around the wire'.
4:13.26 the wire morphs into a coil (helix) and the loops merge into a bar-magnet-like field: label 'electromagnet' 4:15.76.
4:17.20 a little switch icon: OFF -> field disappears, ON -> field returns (toggle at 4:18.10 and 4:19.04).""")),
    ("4:20.06", "p", "crane", dict(img="crane", kb="in", caps=[("junkyard cranes lift whole cars 🚗", "4:20.06")])),
    ("4:23.60", "k", "secret", dict(items=[("e", "1f92b", "4:23.60", "c", {}), ("t", "the part nobody tells you", "4:23.60", "low", {"wait": True})])),
    ("4:25.94", "m", "Missing", dict(b="""Label 'THE MISSING PIECE' top (coral). Equation \\nabla\\times\\mathbf{B}=\\mu_0\\mathbf{J} centre-left (B cyan).
4:28.04 'something was missing': a dashed coral empty box appears after it with a '?' inside.
4:29.88 'the math didn't quite balance': a small balance scale icon above tilts to one side.
4:31.58 'he added one extra piece': the box fills with '+\\mu_0\\varepsilon_0\\,\\partial\\mathbf{E}/\\partial t' in GOLD with a glow burst; the scale levels.
4:37.82 'a changing electric field does it too': the new term pulses. 4:39.40 below: a gold E arrow in EMPTY space growing/shrinking, and cyan B loops appear around it; Kalam doodle 'no wire!' at 4:42.36.""")),
    ("4:44.52", "k", "everything", dict(items=[("t", "that tiny addition", "4:44.52", "up", {}), ("t", "changed EVERYTHING", "4:45.48", "c", {"size": 120, "color": "gold"}), ("e", "1f92f", "4:46.42", (960, 820), {"size": 220})])),
    # ---------------- THE WAVE
    ("4:47.80", "m", "SideBySide", dict(b="""Rules 3 and 4 side by side: left \\nabla\\times\\mathbf{E}=-\\partial\\mathbf{B}/\\partial t, right \\nabla\\times\\mathbf{B}=\\mu_0\\mathbf{J}+\\mu_0\\varepsilon_0\\partial\\mathbf{E}/\\partial t.
4:50.78 under the left one Inter 'changing B → makes E' (B cyan, E gold) and the ∂B/∂t term highlights; 4:54.12 under the right 'changing E → makes B'.
4:57.32 'See it?': a gold curved arrow left→right and a cyan curved arrow right→left form a loop between them; 4:58.10 label 'they feed each other' with the loop spinning.""")),
    ("4:59.52", "m", "Feed", dict(b="""Chain reaction, left to right on navy: 4:59.52 a gold E arrow wiggles (grows/shrinks); 5:01.66 a cyan B loop appears around it; 5:03.02 that loop pulses and a new gold E arrow appears further right 5:04.92; 5:07.16 new cyan loop; 5:09.20 new E... each step 1.3s, the chain marching right and accelerating, leaving a faint trail. Kalam labels 'E' and 'B' on the first two.""")),
    ("5:11.38", "k", "leapfrog", dict(items=[("e", "1f438", "5:11.38", (760, 520), {"size": 260}), ("e", "1f438", "5:11.90", (1160, 420), {"size": 260}), ("t", "two kids playing leapfrog", "5:11.38", "low", {}),
                                               ("a", "E", "5:12.16", (560, 340, 700, 450), {"color": "gold"}), ("a", "B", "5:12.16", (1400, 260, 1230, 350), {"color": "cyan"})])),
    ("5:13.52", "m", "Wave", dict(b="""Label 'AN ELECTROMAGNETIC WAVE' top. A 3D (proj) travelling EM wave along the x axis: gold E arrows vertical, cyan B arrows horizontal (perpendicular), sampled every 0.25 units, travelling right continuously; a faint floor grid.
5:16.12 Inter 'no wire needed' with a small coral X wire icon; 5:17.32 'no air needed'; 5:18.64 'through empty space, all by themselves' as the camera (scale) pulls back to show the wave going off into black space with a few dim stars.""")),
    ("5:27.16", "k", "fast", dict(items=[("t", "so he did the obvious thing", "5:27.16", "c", {}), ("e", "23f1", "5:28.80", (960, 480), {"size": 260}), ("t", "", "5:28.80", "c", {}), ("t", "how FAST would it go?", "5:28.80", "low", {"color": "gold"})])),
    ("5:30.90", "m", "Speed", dict(b="""Label 'HOW FAST' top (gold). 5:30.90 two lab numbers appear: left \\mu_0 (cyan) with a little magnet icon and Kalam 'measured with magnets', right \\varepsilon_0 (gold) with a charged sphere icon and 'measured with charges' (5:33.12-5:35.68).
5:37.41 'plugged them in': both fly into v = \\frac{1}{\\sqrt{\\mu_0\\varepsilon_0}} centre.
5:40.03 a counter '≈ 300,000 km/s' counts up from 0 (white). 5:43.24 'speed of light': v turns into a big gold glowing c, with a white flash and a light beam streaking across.""")),
    ("5:45.49", "k", "felt", dict(items=[("t", "imagine how that felt 😳", "5:45.49", "c", {}), ("e", "1f9f2", "5:47.55", (700, 480), {"size": 200}), ("e", "1f50b", "5:49.81", (960, 480), {"size": 200}),
                                           ("t", "", "5:47.55", "c", {}), ("t", "doing math about magnets & batteries", "5:47.55", "low", {}), ("e", "1f4a1", "5:51.89", (1220, 480), {"size": 220}), ("t", "...out pops the speed of light", "5:51.89", "low", {"color": "gold"})])),
    ("5:53.59", "k", "bike", dict(items=[("e", "1f6b2", "5:53.59", (660, 500), {"size": 300}), ("t", "math about your bicycle", "5:53.59", "low", {}), ("t", "=", "5:55.97", (960, 500), {"size": 160}),
                                           ("e", "1f4f1", "5:56.77", (1260, 500), {"size": 300}), ("t", "= your best friend's phone number", "5:56.77", "low", {"color": "gold"})])),
    ("5:59.81", "k", "coinc", dict(items=[("t", "not a coincidence.", "5:59.81", "c", {"size": 120})])),
    ("6:01.51", "q", "maxwell2", dict(img="maxwell", who="James Clerk Maxwell", yrs="1865", lines=[("light itself is made of", "6:03.97"), ("electricity & magnetism", "6:06.47")], side="l")),
    ("6:08.71", "p", "sun", dict(img="sun", kb="in", caps=[("sunlight ☀️", "6:08.71")])),
    ("6:09.67", "p", "screen", dict(img="screen", kb="in", caps=[("the light from your screen", "6:09.67")])),
    ("6:11.95", "m", "LightWave", dict(b="""Same 3D travelling EM wave as Wave (reuse its code: subclass), but closer, warmer: gold E and cyan B arrows, label top 'LIGHT', Inter 'electric + magnetic fields' at 6:11.95 and Kalam 'playing leapfrog through space' at 6:13.63 with an arrow. Wave travels right.""")),
    # ---------------- SPECTRUM
    ("6:16.51", "k", "bigger", dict(items=[("t", "and it gets BIGGER", "6:16.51", "c", {"size": 120, "color": "gold"})])),
    ("6:17.67", "m", "Spectrum", dict(b="""Label 'ANY SIZE' top. 6:17.67 three waves of different wavelengths stacked, 'any size' 6:20.29; 6:21.53 'not just the ones our eyes can see': a small eye 👀 (1f440.png) and a coloured visible strip.
6:23.90 'make the waves really long': one long wave across the screen, label 'RADIO' + 📻 (1f4fb.png) at 6:25.84.
Then the wave gets shorter at each step, label + emoji replacing: 6:27.36 'MICROWAVES' 🍲 (1f372) 'heating up your leftovers' 6:29.86; 6:32.58 'INFRARED' 🔥 (1f525) 'warmth from a campfire'; 6:36.09 'VISIBLE LIGHT' — the wave becomes a rainbow-coloured strip 🌈 (1f308) 6:37.41; 6:39.15 'ULTRAVIOLET' violet, 🏖 (1f3d6) 'sunburn' 6:40.39. Hold till 6:42.46.""")),
    ("6:42.46", "p", "xray", dict(img="xray", kb="in", caps=[("X-rays 🦴", "6:42.46"), ("right through your skin", "6:43.58")])),
    ("6:47.60", "m", "Spectrum2", dict(b="""The full electromagnetic spectrum as one horizontal band, long waves left to short right, wave drawn along it shrinking in wavelength, labels radio · micro · infrared · visible · UV · X-ray.
6:47.60 'all the same thing', 6:48.88 'every one of them', 6:50.02 'just different sizes of the same wave' (Inter line top).
6:52.71 'the rainbow you've seen your whole life': zoom IN on the visible part, it fills the screen as a rainbow; 6:55.26 'just a tiny slice': zoom OUT far, the rainbow becomes a thin sliver in a huge dim band; Kalam doodle 'you are here 👀' at 6:57.66 pointing at the sliver, 6:59.56 'all the time'.""")),
    # ---------------- THE SAD PART + HERTZ
    ("7:00.85", "k", "sad", dict(items=[("t", "here's the sad part", "7:00.85", "c", {}), ("e", "1f622", "7:00.85", (960, 300), {"size": 180}), ("t", "nobody had made one of these waves", "7:02.68", "low", {}),
                                          ("t", "just math on paper 📝", "7:07.30", "low", {})])),
    ("7:09.26", "q", "maxwell3", dict(img="maxwell", who="James Clerk Maxwell", yrs="1831 – 1879", lines=[("got sick", "7:09.94"), ("died at only 48", "7:13.15")], dim=True)),
    ("7:15.62", "q", "hertz", dict(img="hertz", who="Heinrich Hertz", yrs="1887", lines=[("about 9 years later", "7:15.62"), ("a German scientist", "7:17.48")], side="l")),
    ("7:19.22", "m", "Hertz", dict(b="""Label 'HERTZ 1887 · ACROSS THE ROOM' top. Left: spark-gap transmitter (two brass balls on rods, proj 3D on a table); 7:21.14 a bright white-blue spark jumps across the gap (flicker).
Right, a few metres away: a small open wire loop with a tiny gap. 7:23.70 'a few metres away' Kalam measure arrow between them; 7:25.18 the loop sparks too (small flash).
7:28.08 'nothing connected them': Kalam doodle 'no wire!' pointing to the empty space. 7:29.96 'Radio waves': faint gold/cyan wave rings travel from left device to right, repeating, label 'RADIO WAVES' 7:31.22 'exactly like Maxwell said'.""")),
    ("7:34.00", "k", "never", dict(items=[("i", "maxwell", "7:34.00", (960, 470, 420), {"gray": True}), ("t", "he never got to see it.", "7:34.00", "low", {})])),
    ("7:36.03", "k", "after", dict(items=[("t", "but look what came after", "7:36.03", "c", {}), ("t", "", "7:37.73", "c", {}),
                                            ("e", "1f4fb", "7:37.73", "c", {}), ("t", "radio", "7:37.73", "low", {}), ("e", "1f4fa", "7:38.11", "c", {}), ("t", "TV", "7:38.11", "low", {}),
                                            ("e", "1f4e1", "7:39.37", "c", {}), ("t", "radar", "7:39.37", "low", {}), ("e", "1f4f1", "7:40.21", "c", {}), ("t", "mobile phones", "7:40.21", "low", {}),
                                            ("e", "1f6f0", "7:41.31", "c", {}), ("t", "GPS", "7:41.31", "low", {}), ("e", "1f4f6", "7:42.33", "c", {}), ("t", "Wi-Fi", "7:42.33", "low", {})])),
    ("7:43.35", "k", "reached", dict(items=[("t", "this video reached you", "7:43.35", "up", {}), ("t", "because of 4 rules", "7:45.09", "c", {"size": 110, "color": "gold"})])),
    ("7:46.49", "k", "einstein", dict(items=[("i", "einstein", "7:46.49", (520, 500, 470), {}), ("t", "Albert Einstein", "7:46.49", (520, 930), {"size": 48}),
                                               ("i", "maxwell", "7:48.95", (1180, 470, 300), {}), ("i", "newton", "7:50.83", (1560, 470, 300), {}),
                                               ("a", "on his study wall", "7:48.95", (1370, 800, 1250, 660), {})])),
    # ---------------- RECAP
    ("7:52.93", "m", "Recap", dict(b="""Label 'ONE MORE TIME' top. Four rows build one by one, each: big number, a tiny icon, the short idea in Inter, and its equation small on the right (glow):
7:54.47 '1' + charges spray 'charges push out an electric field' (∇·E=ρ/ε0, gold);
7:58.25 '2' + magnet loop 'magnetic field lines always loop' (∇·B=0, cyan);
8:03.85 '3' + moving magnet 'a changing magnetic field makes electricity' (∇×E=−∂B/∂t);
8:07.69 '4' + wire 'electricity & a changing electric field make magnetism' (∇×B=μ0J+μ0ε0∂E/∂t).
Each row slides in from left with a soft pop.""")),
    ("8:12.96", "k", "simple", dict(items=[("t", "4 simple ideas", "8:12.96", "c", {"size": 120})])),
    ("8:14.46", "p", "lightning", dict(img="lightning", kb="in", caps=[("lightning ⚡", "8:14.46")])),
    ("8:16.00", "p", "plant2", dict(img="plant", kb="out", caps=[("power plants", "8:16.00")])),
    ("8:17.00", "p", "rainbow", dict(img="rainbow", kb="in", caps=[("rainbows 🌈", "8:17.00")])),
    ("8:17.78", "p", "stars", dict(img="stars", kb="in", caps=[("every star in the sky ✨", "8:17.78")])),
    # ---------------- OUTRO
    ("8:20.29", "k", "next", dict(items=[("t", "next time you", "8:20.29", "up", {}), ("e", "1f4f1", "8:21.23", "c", {}), ("t", "pick up your phone", "8:21.23", "low", {}),
                                           ("e", "1f4a1", "8:22.85", "c", {}), ("t", "flip on a light", "8:22.85", "low", {}), ("e", "2600", "8:23.77", "c", {}), ("t", "feel the sun on your face", "8:23.77", "low", {})])),
    ("8:25.53", "m", "Final", dict(b="""Maxwell's portrait (portrait('maxwell'), h about 4.2) centre in a thin gold frame, 'a man from Scotland' 8:26.41 Kalam doodle; the four equations fade in around him one by one (8:27.09, 8:28.03, 8:28.97, 8:29.60) glowing, slowly orbiting / drifting; 8:28.97 'who saw it all coming': a soft gold light wave passes across the frame. Slow push-in.""")),
    ("8:30.67", "k", "end", dict(items=[("t", "did it click? 🤔", "8:30.67", "up", {}), ("e", "1f44d", "8:33.19", "c", {}), ("t", "like & subscribe", "8:33.19", "low", {"color": "gold"}),
                                          ("t", "which rule surprised you most?", "8:35.51", "up", {}), ("e", "", "8:35.51", "c", {}), ("t", "1 · 2 · 3 · 4 💬", "8:36.55", "c", {"size": 130}), ("t", "", "8:35.51", "low", {}), ("t", "", "8:39.81", "c", {}),
                                          ("e", "1f44b", "8:39.81", (960, 860), {"size": 160}), ("t", "see you in the next one", "8:39.81", "up", {})])),
]

SHOTS = []
for i, s in enumerate(S):
    t, kind, name = s[:3]
    d = dict(s[3]) if len(s) > 3 else {}
    end = sec(S[i + 1][0]) if i + 1 < len(S) else FILM_END
    SHOTS.append(dict(start=sec(t), end=end, kind=kind, name=name, **d))
BY_NAME = {s["name"]: s for s in SHOTS}
