"""Film list: "Nobody Explained String Theory Like THIS!" (13:50). Style v2.1 documentary 3D (channels/physics.md).
Times are film seconds from words.json. One source of truth for tools/build.py.

Shot kinds
  ("3d", kind, mode, ov)      3D scene from assets/js/k_*.js (LABK[kind] with opts {mode, FT0=film start})
  ("p", img, ov)              full-screen photo, slow push-in, bottom fade
  ("q", [imgs], [(name, meta)], ov)   portrait card(s) on dark
  ("card", ov)                black card, text only
Overlay items (t1 None = until shot end)
  ("line", text, t0, t1)      serif statement, lower left
  ("cap", text, t0, t1)       small caps caption, lower left      ("capt", ...) same at top left
  ("eq", html, sub, t0, t1)   one formula, serif italic, centred low
  ("big", html, small, t0, t1) big serif centred (cards / numbers)
  ("title", t1, t2, t3, t0, t1)
"""
FILM_END = 830.19

S = [
    # ---------------- HOOK
    (0.00, "3d", "atomzoom", "nucleus", [("capt", "1968", 0.4, 3.5)]),
    (3.70, "q", ["veneziano"], [("Gabriele Veneziano", "Physicist · CERN · 1968")], []),
    (9.12, "3d", "oldpage", "write", [("cap", "A formula from the 1700s", 10.6, 13.6)]),
    (13.70, "q", ["euler"], [("Leonhard Euler", "Mathematician · 1707–1783")], []),
    (17.58, "3d", "oldpage", "close", [("eq", "B(x, y) = <span class='frac'><span>Γ(x) Γ(y)</span><span>Γ(x + y)</span></span>", "Euler's beta function", 17.9, 21.4)]),
    (21.58, "3d", "rubberband", "full", [("line", "The answer sounded ridiculous.", 26.92, 29.6),
                                          ("title", "Nobody explained", "String Theory", "like this", 36.3, 41.2)]),
    (41.42, "3d", "notes", "one", [("line", "“Everything is made of tiny vibrating strings.”", 43.88, 47.3)]),
    (47.52, "card", [("big", "And that sentence explains nothing.", "", 47.7, 50.0),
                     ("big", "<span style='font-size:76px'>What does string theory claim —<br>and is there any reason to think it's right?</span>", "", 50.3, 58.6)]),
    # ---------------- TWO RULE BOOKS
    (58.80, "3d", "books", "intro", [("cap", "Two rule books", 62.5, 65.0)]),
    (65.12, "q", ["einstein1915"], [("Albert Einstein", "General relativity · 1915")], []),
    (70.28, "3d", "trampoline", "full", []),
    (79.50, "3d", "orbitgps", "full", []),
    (87.08, "3d", "books", "quantum", []),
    (90.04, "3d", "jitter", "atom", [("cap", "Quantum mechanics · the small stuff", 90.4, 94.6)]),
    (98.92, "p", "chip", [("cap", "Every chip depends on quantum mechanics", 99.3, None)]),
    (102.42, "3d", "books", "clash", []),
    (107.48, "p", "galaxy", [("cap", "Big things · general relativity", 110.0, None)]),
    (115.40, "3d", "jitter", "electron", [("cap", "Small things · quantum mechanics", 115.6, None)]),
    (117.16, "3d", "blackhole", "hole", []),
    (125.24, "3d", "blackhole", "bang", [("cap", "The first instant of the Big Bang", 125.5, None)]),
    (127.74, "3d", "blackhole", "infinity", [("eq", "<span style='font-size:150px;font-style:normal'>∞</span>", "", 131.9, 133.5),
                                              ("line", "In physics, infinity means the math has broken.", 133.62, 137.8)]),
    (138.02, "q", ["einstein_old"], [("Albert Einstein", "1879–1955")], [("line", "One theory to cover everything.", 141.0, 143.9)]),
    (144.14, "p", "princeton", [("cap", "Princeton · 1955", 144.4, 151.4), ("line", "He never found it.", 151.68, None)]),
    # ---------------- STRINGS
    (153.38, "3d", "particles17", "dots", [("line", "Why 17?", 171.48, 172.9), ("line", "Why does each weigh what it weighs?", 173.04, 177.9)]),
    (178.28, "3d", "atomzoom", "full", []),
    (190.90, "3d", "guitar", "full", [("line", "One string, many notes.", 199.5, 202.1)]),
    (202.30, "3d", "notes", "particles", [("line", "Seventeen things become one thing playing seventeen tunes.", 214.26, 219.0)]),
    (219.20, "3d", "notes", "energy", [("eq", "E = mc<sup>2</sup>", "Energy is mass", 223.58, 226.5)]),
    (230.32, "3d", "scale", "full", []),
    # ---------------- WHY ANYONE BELIEVED IT
    (240.46, "card", [("big", "Why did anyone believe it?", "At first, almost nobody did", 242.3, 249.6)]),
    (249.80, "3d", "fluxtube", "glue", [("cap", "The strong force", 252.6, None)]),
    (258.92, "q", ["nambu", "nielsen", "susskind"], [("Yoichiro Nambu", "1921–2015"), ("Holger Nielsen", "b. 1941"), ("Leonard Susskind", "b. 1940")], [("capt", "Around 1970", 259.2, None)]),
    (270.06, "3d", "fluxtube", "string", [("line", "It was the math of tiny strings.", 270.3, None)]),
    (273.08, "3d", "notes", "ghost", []),
    (285.02, "3d", "fluxtube", "quarks", []),
    (290.72, "p", "empty_hall", [("cap", "By 1973, most physicists had walked away", 291.0, None)]),
    (296.34, "q", ["schwarz", "scherk"], [("John Schwarz", "b. 1941"), ("Joël Scherk", "1946–1980")], [("capt", "1974", 299.3, None)]),
    (309.32, "3d", "graviton", "fit", [("line", "It fit, line for line.", 317.38, 319.8)]),
    (323.96, "3d", "graviton", "insist", [("line", "Nobody put gravity into string theory.", 323.96, 329.9), ("line", "The theory insisted.", 331.36, 335.9)]),
    (336.18, "3d", "fluxtube", "glue", []),
    (339.68, "p", "drawer", []),
    (344.76, "card", [("big", "For ten years, hardly anyone listened.", "", 344.9, 349.6)]),
    # ---------------- EXTRA DIMENSIONS
    (349.86, "3d", "dims", "count", [("eq", "P &lt; 0", "A probability below zero", 371.2, 375.7)]),
    (375.98, "q", ["kaluza"], [("Theodor Kaluza", "Mathematician · 1885–1954")], [("capt", "1919", 379.3, None)]),
    (386.78, "3d", "dims", "kaluza", []),
    (396.90, "q", ["einstein1915"], [("Albert Einstein", "intrigued")], []),
    (398.96, "3d", "hose", "full", []),
    (418.52, "3d", "curled", "grid", [("line", "The hidden shape would write the laws of physics.", 435.34, 438.3)]),
    # ---------------- REVIVAL, FIVE THEORIES, M-THEORY
    (438.54, "q", ["schwarz", "green"], [("John Schwarz", "b. 1941"), ("Michael Green", "b. 1946")], [("capt", "Summer 1984", 439.3, None)]),
    (452.60, "p", "full_hall", [("cap", "Hundreds of physicists switched to strings", 455.3, None)]),
    (460.62, "3d", "five", "five", []),
    (482.12, "p", "usc", [("cap", "University of Southern California · 1995", 484.4, None)]),
    (490.88, "q", ["witten"], [("Edward Witten", "Physicist · b. 1951")], []),
    (496.60, "3d", "five", "merge", []),
    (499.74, "3d", "soupcan", "full", [("line", "Same can, different shadows.", 508.42, 511.0)]),
    (511.26, "3d", "brane", "full", [("cap", "M-theory · 11 dimensions", 512.9, 518.2), ("line", "Magic, mystery, or membrane.", 528.44, 532.8)]),
    (533.00, "3d", "puzzle", "full", [("line", "The middle is still blank.", 543.3, None)]),
    # ---------------- THE LANDSCAPE
    (545.14, "3d", "curled", "one", []),
    (558.44, "3d", "landscape", "count", [("big", "10<sup style='font-size:.5em'>500</sup>", "possible shapes", 565.5, 568.7),
                                           ("big", "10<sup style='font-size:.5em'>80</sup>", "atoms in the visible universe", 569.0, 575.3)]),
    (582.86, "3d", "landscape", "which", [("line", "Which one is ours?", 582.86, 585.5), ("line", "Nobody knows who's right.", 600.44, None)]),
    # ---------------- CAN WE SEE THEM?
    (602.38, "card", [("big", "Can't we just look for the strings?", "", 602.5, 604.7), ("big", "No.", "", 604.84, None)]),
    (605.70, "3d", "collision", "full", []),
    (613.08, "p", "lhc", [("cap", "Large Hadron Collider · 27 km", 613.3, 618.2), ("cap", "Higgs boson · 2012", 618.3, None)]),
    (621.80, "3d", "lhc", "galaxy", []),
    (632.60, "3d", "particles17", "partners", [("cap", "Supersymmetry", 639.2, None)]),
    (647.94, "p", "lhc_tunnel", [("line", "It hasn't found one.", 648.1, 650.8)]),
    # ---------------- BLACK HOLES AND THE HOLOGRAM
    (658.62, "3d", "blackhole", "slow", [("line", "A beautiful idea with no evidence?", 660.0, 662.8), ("line", "Not quite.", 662.98, 665.6)]),
    (668.94, "q", ["bekenstein", "hawking"], [("Jacob Bekenstein", "1947–2015"), ("Stephen Hawking", "1942–2018")], [("capt", "1970s", 669.2, None)]),
    (679.16, "3d", "bhinfo", "bits", [("eq", "S = <span class='frac'><span>A</span><span>4</span></span>", "Hidden information on a black hole's surface", 679.4, 684.5)]),
    (688.44, "q", ["strominger", "vafa"], [("Andrew Strominger", "b. 1955"), ("Cumrun Vafa", "b. 1960")], [("capt", "1996", 688.8, None)]),
    (696.40, "3d", "bhinfo", "strings", [("line", "The count matched Hawking's formula exactly.", 702.22, None)]),
    (705.68, "q", ["maldacena"], [("Juan Maldacena", "Physicist · b. 1968")], [("capt", "1997", 706.0, None)]),
    (712.02, "3d", "hologram", "ads", [("line", "Two descriptions, one reality.", 724.52, 727.4)]),
    (727.68, "3d", "hologram", "card", []),
    (734.66, "3d", "hologram", "project", []),
    (744.28, "p", "papers", [("cap", "One of the most cited papers in physics", 744.6, None)]),
    (751.00, "p", "heavyion", [("cap", "Hot particle soup from colliders", 755.3, None)]),
    (757.60, "p", "metal", [("cap", "Exotic metals", 758.9, None)]),
    (761.68, "3d", "hologram", "curved", []),
    # ---------------- THE PLAIN ANSWER
    (767.88, "3d", "finale", "answer", []),
    (789.20, "card", [("big", "Is it true?", "", 789.3, 790.7), ("big", "Nobody knows.", "", 790.84, None)]),
    (792.46, "p", "lhc2", [("cap", "50+ years · no confirmed prediction", 793.0, None)]),
    (802.27, "p", "chalkboard", [("cap", "Rival ideas · also untested", 802.6, None)]),
    (806.51, "3d", "bhinfo", "bits", []),
    (814.03, "card", [("big", "Wrong ideas rarely do that.", "", 814.1, 816.4)]),
    (816.59, "3d", "finale", "out", []),
    (823.63, "3d", "oldpage", "end", []),
]

# ---------------------------------------------------------------- briefs for the 3D scene authors
# Times are FILM seconds; inside a kind use ft = o.T0 + t (film time). Modes listed per kind; each shot passes {mode}.
KINDS = {
    # ===== group A: the microscopic world and strings =====
    "atomzoom": """Continuous zoom into matter, real-looking, documentary. Electron cloud = soft translucent shells/points (pale blue, P.electron), nucleus = clustered spheres (protons P.proton warm red-brown, neutrons P.neutron grey, satin material), proton = 3 quarks (P.quarkR/G/B muted) in a soft translucent bag, quark close-up → a single tiny luminous strand (warm white M.light, thin tube) that vibrates.
mode "nucleus" (0.00-3.70): opening shot: slow drift around a nucleus inside a faint electron cloud, dust, nothing else; slow dolly-in.
mode "full" (178.28-190.90): from a whole atom (178.3) zoom continuously: 180.96 'zoom in far enough' accelerate in through the cloud to the nucleus, then into one proton (~183.5), to one quark (~184.6), 'the dot turns out to be a tiny strand of energy' (184.98-187.4) the quark resolves into a small closed loop of string, 188.36 'that strand vibrates' it starts vibrating (standing-wave wobble), hold till end. Pins: 'atom', 'nucleus', 'proton', 'quark', 'string' as each level arrives (fade).""",
    "fluxtube": """Proton interior with the strong force as glowing-but-calm flux tubes (thin warm tubes, not neon) between quarks.
mode "glue" (249.80-258.92 and 336.18-339.68): three quarks (muted R/G/B satin spheres) inside a faint proton bag, joined by tubes in a Y shape; slow orbit. Pin 'quarks' and 'the glue'.
mode "string" (270.06-273.08): one quark pulled away, its tube stretches into a long line that begins to vibrate like a string (camera follows).
mode "quarks" (285.02-290.72): the rival picture: quarks exchanging small gluon particles (tiny beads hopping between them), pin 'quarks and gluons'.""",
    "particles17": """The standard model as 17 small satin spheres arranged in the familiar table layout (4 columns of 3 fermions + bosons), floating in a void stage, each a point-like dot, with small caps pins.
mode "dots" (153.38-178.28): 156.2 the 17 dots fade in one by one; pins 161.9 'electron', 162.7 'quark', 165.5 'photon'; 166.44 camera pushes in on one dot: it stays a perfect dot, no structure (pin 'a point · no size'); 171.48 pull back to all 17; 173.04 each dot gets a thin vertical bar showing its mass (very different heights).
mode "partners" (632.60-647.94): the 17 again; 636.3 each gets a larger, heavier, semi-transparent 'partner' sphere beside it (ghostly, frosted glass); 641.9 a slow searchlight sweep passes over the partners, finding nothing; 646.1 partners fade to dashed outlines (pin 'not found').""",
    "notes": """One string = many particles. A luminous string (warm white tube, slightly thick, soft sprite glow allowed but subtle) floating in void, vibrating as a standing wave.
mode "one" (41.42-47.52): a single open string vibrating gently, slow orbit, dust.
mode "particles" (202.30-219.20): the same closed loop string changes its vibration pattern: 204.7 pattern A (2 lobes) pin 'electron'; 208.4 pattern B (3 lobes) pin 'quark'; 212.5 pattern C (5 lobes) pin 'photon'; 214.26 camera pulls back: 17 small loops in a grid, each vibrating differently.
mode "energy" (219.20-230.32): one loop; amplitude and frequency rise (219.5-222.7); a weight/mass readout as a small lab scale or a growing satin sphere beside it labelled pin 'mass'; 226.6 'wilder vibration = heavier particle' the sphere grows.
mode "ghost" (273.08-285.02): string vibrating, then 276.5 an unexpected small closed loop pops out and floats away spinning (pin 'mass: zero'); 281 it hangs alone in the void with pin '?'.""",
    "guitar": """Close-up of a real acoustic guitar neck and one steel string, studio stage: wooden fretboard (warm wood colour via canvas texture with grain), metal frets, steel string (M.steel), a soundhole edge visible.
190.90 slow dolly along the string; 192.68 'pluck it open' the string vibrates in its fundamental (big blur envelope + moving standing wave); pin 'one note'; 195.70 a fingertip (simple rounded capsule, skin tone matte) presses at a fret; 196.98 the string vibrates again with a shorter vibrating length, higher frequency; pin 'another note'; 199.5 camera rises to show the whole string.""",
    "rubberband": """21.58-41.42. Studio tabletop: a real tan rubber band (torus-ish loop, matte rubber material #b98a5a) lying on the dark table, slow dolly. 29.78 it lifts off and stretches into a long oval, wiggling like a plucked band (32.9 'wiggles'). 35.68 'that rubber band grew into string theory': it shrinks, loses its rubber look and becomes a thin luminous strand floating above the table in darkness; the table fades out by 37.5; 36.3-41.2 the strand hangs quietly vibrating, lower part of frame kept darker (a centred title sits over it).""",
    # ===== group B: gravity, cosmos, rule books =====
    "books": """Studio tabletop, two real hardcover books standing or lying, embossed titles via canvas textures: left 'GENERAL RELATIVITY' (dark green cloth, gold type), right 'QUANTUM MECHANICS' (oxblood cloth, gold type), worn edges.
mode "intro" (58.80-65.12): dolly across the table, 62.38 both books in frame, 65.0 left book slightly lit.
mode "quantum" (87.08-90.04): close on the right book, its cover opens a little.
mode "clash" (102.42-107.48): both books side by side; 105.1 'they contradict each other' they slide apart and a thin crack opens in the table between them.""",
    "trampoline": """70.28-79.50. A stretched fabric sheet with a fine grid (space-time) in a void/studio; 72.3 a heavy real bowling ball (glossy dark blue resin, finger holes) drops in and bends the sheet into a deep well (sheet deformation by a smooth function); 76.36 a small marble rolls around the well in an orbit. Pin 'space-time' at 74.7, 'gravity' at 77.6.""",
    "orbitgps": """79.50-87.08. Space stage. 79.5 planets orbiting a sun (sun texture 2k_sun.jpg, small textured planets) with thin orbit lines, slow; 82.68 cut-in (or fast move) to Earth (2k_earth_daymap.jpg + clouds) with 4-6 GPS satellites (small metal bodies with solar panels) on tilted orbits; pin 'GPS satellites' at 83.7.""",
    "jitter": """Quantum uncertainty, void stage.
mode "atom" (90.04-98.92): an atom: small nucleus, the electron shown as a cloud of thousands of faint points (probability cloud, deterministic seeded), plus a single bright dot that jumps unpredictably (seeded per time step) inside it; 97.0 'jittery and uncertain' pin 'uncertain'.
mode "electron" (115.40-117.16): close on a single electron's fuzzy cloud, quick.""",
    "blackhole": """Space stage, documentary realism: black sphere with a thin bright photon ring, an accretion disk (warm orange-white, procedural rings texture, slightly lensed look via a second tilted disk behind), stars.
mode "hole" (117.16-125.24): 119.36 a star (sun texture) is pulled in and squashed down into a tiny point; pin 'whole stars' then 'smaller than an atom' at 123.4.
mode "bang" (125.24-127.74): white-hot point expanding into a cloud of hot matter (seeded particles), quick.
mode "infinity" (127.74-138.02): slow push toward the black hole centre; at 131.9 the view darkens (lower frame kept clear for the ∞ symbol and a line of text).
mode "slow" (658.62-668.94): a calm wide orbit around the black hole.""",
    "graviton": """A closed string loop (warm white) floating above a large fine-grid space-time sheet.
mode "fit" (309.32-323.96): 310.56 the loop vibrates and sends ripples through the grid (gravitational waves: concentric sheet deformations moving outward); pin 'graviton' 310.6; 313.4 the ripples gently tug a small sphere elsewhere on the sheet.
mode "insist" (323.96-336.18): wider view, many loops, each sending ripples; 329.04 'pull it out like a weed': one loop is pulled up out of the sheet by an invisible force but springs back; 331.36 'the theory insisted' ripples everywhere.""",
    "scale": """230.32-240.46. How small: 231.66 an atom (nucleus + cloud) grows and grows while the camera pulls back until it fills a star-filled universe (stars appear, galaxies as faint smudges), pin 'one atom = the visible universe' at 234.5; 236.52 cut-in to a single small tree (simple stylised 3D tree, trunk + foliage blobs, matte) standing in that universe beside a tiny luminous string loop of the same height; pin 'a string' 237.8, 'about as tall as a tree' 238.98.""",
    # ===== group C: dimensions and shapes =====
    "dims": """Void stage, clean lab look.
mode "count" (349.86-375.98): 353.3 a point in space; 358.22 three arrows (x, y, z, steel) grow from it, pins 'one, two, three'; 361.34 six more arrows try to grow but have nowhere to point: they curl into small loops around the point (count pins 4..9 quickly); 364.26 a slow pulse = time; small caps pin '9 + time = 10' at 365.5; 368.02 the extra loops shudder/jitter (nonsense), keep the lower centre clear for an equation 371-376.
mode "kaluza" (386.78-396.90): a grid of points in space, each with a tiny circle loop attached (the 5th dimension); 390.5 gravity ripples across the grid and at the same time small charges on the circles spin (electricity & magnetism), pins 'gravity' and 'electromagnetism'.""",
    "hose": """398.96-418.52. Outdoor-ish studio: a green garden hose (ribbed tube, glossy rubber) stretched across a large grass-coloured ground plane (matte dark green), soft daylight.
398.96 high aerial view, the hose is a thin line, pin 'a line' at 406.6; 410.2 camera swoops down close to the hose; an ant (small 3D ant: 3 dark glossy body segments, 6 thin legs animating, antennae) walks along it (pin 'one way'), then 412.84 walks around the hose's circumference in a small circle (pin 'and around'). 416.2 pull up again: the circle disappears from view.""",
    "curled": """Calabi-Yau-like shapes: use the standard parametric quintic cross-section (Hanson's formula, n=5 or n=3) as a smooth surface, satin/pearl material (pale grey-blue), soft light.
mode "grid" (418.52-438.54): a grid of points in space; 420.4 at every point a tiny curled shape appears; 425.84 camera pushes into one, which becomes large and slowly turns; 428.82 a luminous string loop wraps and vibrates around it, its vibration changing as the shape's form shifts slightly (pin 'shape'), 431.5 pin 'particles', 433.9 pin 'masses'.
mode "one" (545.14-558.44): one shape alone, slowly rotating; 553.98 'that single shape would give our universe': it sits inside a faint star field; pin 'our universe'.""",
    "five": """Five different string objects in a pentagon, void stage: each a distinct small form (open string, closed loop, a loop with a twist, two linked loops, a loop with beads), satin/luminous, small caps pins 'Type I', 'Type IIA', 'Type IIB', 'Heterotic SO(32)', 'Heterotic E8×E8'.
mode "five" (460.62-482.12): 467.92 they appear one by one (467.9, 469.0, 469.5, 470.0, 470.3); 473.1 each sits in its own small bubble 'universe'; slow orbit.
mode "merge" (496.60-499.74): the five drift to the edges and become shadows cast by one larger hidden object in the centre (soft volumetric shape), pin 'one deeper thing'.""",
    "soupcan": """499.74-511.26. Studio: a real soup can (steel cylinder, ribbed sides, plain cream paper label with a thin red band, no brand), a white floor and a white back wall. 501.54 a spotlight from directly above: the shadow on the floor is a circle (pin 'circle'); 504.96 the light swings to the side: the shadow on the wall is a rectangle (pin 'rectangle'); 508.42 both shadows visible, camera orbits.""",
    "brane": """511.26-533.00. M-theory: void/space stage. A large thin translucent membrane sheet (brane, gently undulating, frosted pale surface) with open strings whose ends are stuck to it (short luminous arcs sliding on the sheet) and closed loops drifting free; 514.76 pin '11 dimensions'; 518.38 a second brane appears in parallel; pins 'membrane' and 'string'; 528.44 slow pull-back; lower frame kept calm.""",
    "puzzle": """533.00-545.14. Studio tabletop: a large jigsaw puzzle (thick pieces, matte card with a faint printed pattern) with only its edge and corner pieces assembled; the middle is empty table. 538.7 camera glides along the border, 541.5 pin 'edges and corners', 543.3 rises to look down on the blank middle.""",
    # ===== group D: big ideas and finale =====
    "oldpage": """Old parchment page on a dark wooden desk, candle-like warm key light (still calm palette), studio stage.
mode "write" (9.12-13.70): a quill-ink formula appears stroke by stroke on the page (canvas texture redrawn by progress): Euler's beta integral  B(x,y) = ∫₀¹ t^(x−1)(1−t)^(y−1) dt  in old handwriting style; slow dolly.
mode "close" (17.58-21.58): close, shallow-angle on the finished formula; lower third kept clear (an overlay formula appears).
mode "end" (823.63-830.19): the same page, camera slowly pulls back into darkness; fade toward black by 829.8.""",
    "landscape": """The string landscape: a vast terrain of hills and valleys (procedural, matte grey-blue, fog), each valley holding a tiny bubble universe.
mode "count" (558.44-582.86): camera flies low over an endless terrain; 561.2 valleys light up softly one after another, faster and faster, beyond the horizon; middle of the frame kept calm for big numbers at 565.5-575.3; 577.42 close on a few valleys: each bubble shows a different tiny universe (different colours of points).
mode "which" (582.86-602.38): high wide view of endless bubbles; 593.06 bubbles float up from valleys like a foam (multiverse), one bubble highlighted with pin 'atoms and stars can form'.""",
    "collision": """605.70-613.08. Two particle beams (thin bright streaks) racing toward each other inside a beam pipe (steel, cutaway), collide at 608.08 'smash' into a spray of tracks (thin curved lines spiralling, seeded); 610.6 pin 'far more energy than any machine'.""",
    "lhc": """mode "galaxy" (621.80-632.60): a thin ring (the collider) drawn on the ground of an Earth seen from orbit (earth texture), pin 'LHC · 27 km' 622; 624.04 the ring grows enormously while the camera pulls back past the Earth, the solar system, until the ring wraps around a spiral galaxy (seeded star particles, soft); pin 'a collider the size of our galaxy' at 629.5.""",
    "bhinfo": """A black hole whose surface (event horizon) is covered with tiny tiles, each tile a bit (light or dark), information on the surface.
mode "bits" (679.16-688.44 and 806.51-814.03): slow orbit; tiles flicker in seeded patterns; pin 'information on the surface'; keep lower centre clear for a formula at 679.4-684.5.
mode "strings" (696.40-705.68): the black hole is assembled from strings and branes (loops and small sheets flying in and joining); 698.76 a counter of arrangements spins up (digits on a small panel or pins); 702.22 it locks: pin 'count = Hawking's formula'.""",
    "hologram": """Holography.
mode "ads" (712.02-727.68): a tall translucent cylinder (a universe with gravity inside: a small black hole and orbiting bodies inside), its outer surface a fine glowing grid; 718.5 the surface lights up with a pattern (the no-gravity theory on the edge) that matches what happens inside; pins 'gravity inside' and 'no gravity · on the edge'.
mode "card" (727.68-734.66): a bank card (dark blue plastic, chip) with a holographic sticker; as the card tilts, a 3D shape appears to float out of the flat sticker (pin 'flat sticker · picture with depth').
mode "project" (734.66-744.28): the cylinder again; light streams inward from the surface and builds the interior picture (pin 'projected from the surface').
mode "curved" (761.68-767.88): the universe in his math is curved: a saddle-shaped (hyperbolic) grid inside the cylinder vs a flat grid beside it, pins 'his universe' and 'ours'.""",
    "finale": """mode "answer" (767.88-789.20): one luminous string vibrating; 771.44 'every particle': around it many strings in different patterns; 773.6 'gravity included' one closed loop sends a ripple; 778.98 'inside hidden dimensions' each sits on a tiny curled shape; 782.58 the camera pulls back to show two rule-book outlines (green and oxblood rectangles) on each side merging; slow.
mode "out" (816.59-823.63): from a single string the camera pulls back through atom, Earth, stars (quick cosmic zoom-out), a ladder of light hints upward at 819.4 (subtle).""",
}

SHOTS = []
for i, s in enumerate(S):
    d = dict(start=s[0], end=S[i + 1][0] if i + 1 < len(S) else FILM_END, kind=s[1])
    if s[1] == "3d":
        d.update(k=s[2], mode=s[3], ov=s[4])
    elif s[1] == "p":
        d.update(img=s[2], ov=s[3])
    elif s[1] == "q":
        d.update(imgs=s[2], names=s[3], ov=s[4])
    else:
        d.update(ov=s[2])
    SHOTS.append(d)

if __name__ == "__main__":
    used = sorted({s["k"] for s in SHOTS if s["kind"] == "3d"})
    print(len(SHOTS), "shots;", len(used), "3D kinds;", "missing briefs:", [k for k in used if k not in KINDS])
    print("3D share: %.0f%%" % (100 * sum(s["end"] - s["start"] for s in SHOTS if s["kind"] == "3d") / FILM_END))
