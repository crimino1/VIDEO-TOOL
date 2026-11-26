"""Briefs for the 3D scene authors — "The Dirac Equation" (how an equation predicted antimatter). Times are FILM seconds (ft = o.T0 + t).
Read transcript.txt for the exact words so visuals land on them. Overlay windows (shots.py ov) must stay clear (see BUILDERS.md).
THESIS: relativity's energy formula is a Pythagorean triangle, E² = (mc²)² + (pc)². Dirac insisted on a first-power equation, so he had to take a square root
inside the equation; ordinary numbers can't do it, 4x4 matrices (order matters) can. So the electron's wave has 4 parts: 2 = spin up/down (spin falls out by itself),
2 = negative energy (the square root's second answer). Negative energy should make atoms collapse; Dirac said the negative levels are already full (a "sea",
Pauli: one electron per seat). A hole in the sea acts like a positive electron -> anti-electron -> positron, seen by Anderson in a cloud chamber in 1932.
Matter + antimatter annihilate into light; the Big Bang made them almost equally; one extra in a billion survived -> everything.
SHARED PROPS: every electron, positron, nucleon/nucleus, droplet trail, paper page and balance MUST come from window.X3 in assets/js/k_0shared.js (read its header).
Electrons are always the pale steel-blue satin sphere, positrons the warm ivory-amber twin. Do not edit k_0shared.js; if you need a change there, say so in your report.
Groups (one file each): A k_chamber.js = chamber, anti. B k_math.js = triangle, matrix, roots. C k_sea.js = sea. D k_desk.js = eqpaper, stone.
E k_cosmos.js = spin, ladder, cosmos, bang. F k_theory.js = theories, gold.
REPORT: every helper ends its report with an EVENT TIMES list (film seconds + what happens: flash, impact, lock, slide, drop...) — the sound pass is built from it."""

KINDS = {
    # ===== group A -> assets/js/k_chamber.js =====
    "chamber": """Carl Anderson's 1932 cloud chamber at Caltech, Pasadena — the film's opening and its proof. Physically right: a short, wide cylindrical chamber
(~17 cm across, 4 cm deep) with a glass front window, its interior a dark velvet-black back with a soft mist of supersaturated vapour (slowly drifting, lit from the side
by a strong arc-lamp beam), inside the gap of a huge water-cooled electromagnet (two massive copper coil stacks wrapped in dark insulation, iron yoke, brass fittings,
pipes) standing vertically in a dim 1930s lab (brick/plaster wall, bench with glass plates, a large plate camera on a stand facing the window). No people, no hands.
Tracks are X3.trail droplet lines (thin white bead strings that APPEAR along their path quickly, like a jet contrail forming, then slowly diffuse/fade).
DIRECTION (match the REAL photo, assets/img/positron.jpg): in it the positron enters at the bottom, travels UPWARD, crosses a horizontal lead plate across the
middle and turns LEFT (counter-clockwise as seen by the camera); below the plate the arc is gentle (radius ~2.7x larger), above it clearly tighter. So in this film:
a positive particle moving up turns LEFT (counter-clockwise); electrons moving the same way turn RIGHT (clockwise). Keep this consistent in every mode. Arc radius ~5-12 cm at chamber scale. Black-and-white
feel inside the chamber (cool neutral light) but the lab around it warm tungsten.
mode "photo" (0.00-8.16): opening shot: an old glass photographic plate (B/W negative-look, Anderson's track image: chamber disc with one curved track crossing a
horizontal lead plate) standing in a wooden frame in front of a lamp / on a lightbox in a dark lab, the light glowing through it; slow push-in from a low angle as
if it is being held up to the light; dust in the lamp beam. Lower-left kept dark 0.8-7.4 for a caption.
mode "rays" (11.50-14.98): cosmic rays: Earth's limb from high altitude at night-ish (thin blue atmosphere glow, use L3.tex 2k_earth_daymap/nightmap) with a few
faint thin warm-white streaks slanting down into the atmosphere, slow; calm, not sci-fi. Lower-left dark 12.2-14.8.
mode "box" (14.98-21.84): reveal the apparatus: slow dolly from the plate camera toward the glass window of the chamber between the coils; the mist inside
swirls in the side light; lower-left dark 17.6-21.6.
mode "trail" (21.84-25.54): close on the chamber window: a single straight-ish droplet trail streaks across (forms in ~0.4 s), then a second, beads glinting.
mode "bend" (28.60-32.60): the magnet comes on (coils hum: a faint warm glow on the copper, pointer of an ammeter rises) and new trails now BEND in circles.
mode "bend2" (32.60-36.62): several electron trails, all curving the same way (pins: "electron" on one); lower-left dark 33.0-36.4.
mode "other" (36.62-42.62): one new trail, same thickness and size, curves the OTHER way (the camera pushes slowly toward it; it can carry a soft warm tint
very subtly); lower-left dark 37.0-41.0.
mode "ambig" (670.56-682.88): the puzzle, chamber seen face-on: one curved track (the shape of the real one, but no plate yet). A NEUTRAL soft white point of light
(no charge colour!) travels along it downward (672-676), then the same arc again upward (678-682) — 'which way did it go?'. Charge colours appear only in "up".
mode "lead" (682.88-695.20): a thin dark-grey lead plate (6 mm) slides horizontally across the middle of the chamber; then a bead passes through it and visibly
slows (droplets denser after the plate); 691.5: 'slower particles curve more tightly'. lower-left dark 683.4-688.0.
mode "track" (695.20-707.10): recreate the real photograph in 3D: the famous track: gently curved below the plate, more tightly curved above it (it came up from
below, lost energy in the lead). Camera tilts from the lower part to the upper part; pins "gentle curve" (lower) 697-701, "tighter curve" (upper) 701-706.
mode "up" (707.10-712.76): a warm ivory bead (X3.positron) travels the track upward through the plate, curving; lower-left dark 707.4-712.6.
mode "plates" (722.80-726.74): a stack of glass photo plates on the lab bench by the window light, slow pan.
mode "real" (745.26-751.00): the chamber again, calm, one positron track glowing faint warm then fading; lower-left dark 747.9-750.8.
mode "proof" (1001.44-1006.94): the final proof: one perfect curved track forms across the misty chamber and lingers; slow pull back; lower-left dark 1001.6-1006.8.""",
    "anti": """Particles and their antiparticles: satin spheres floating in a calm dark 'void' stage with soft key light and rim light (no grids).
mode "pairs" (781.48-794.46): a row of pairs appearing one by one, each particle beside its mirror twin across a faint vertical sheet of glass (a real mirror-like
plane): electron + positron (X3), proton + antiproton (X3.nucleon p vs X3.antiNucleon), neutron + antineutron (neutron grey vs a darker grey-violet twin);
twins are the same size; slow lateral dolly. 789.7-794.3: lower-left dark.
mode "antiproton" (794.46-802.18): close on the proton and the antiproton side by side; slow orbit; lower-left dark 798.4-802.0.
mode "antih" (802.18-807.16): an anti-hydrogen atom builds: antiproton at centre, a positron settles into a soft orbital cloud around it (pale warm haze);
next to it, faint, an ordinary hydrogen atom (proton + steel-blue electron cloud) for comparison; lower-left dark 804.0-807.0.""",

    # ===== group B -> assets/js/k_math.js =====
    "triangle": """Einstein's energy triangle, built from REAL objects: three polished rods (brass for 'mc²' rest energy, steel for 'pc' momentum, a warm glowing glass
rod for 'E' total energy) forming a right triangle lying on a dark slate table under one warm desk lamp, with a small square brass corner marker at the right angle.
Pins name the sides (max 2 at once): "mass, sitting still · mc²", "motion · pc", "total energy · E". No 2D diagrams, no wireframes.
mode "einstein" (229.90-241.54): a single satin particle (X3.electron, larger) resting still on the slate, a calm warm halo hinting at energy locked inside;
centre block dark 233.4-241.3 (eq 'E = mc²'), so keep the particle low-left or low-right.
mode "moving" (241.54-248.26): the particle now rolls/slides fast across the slate (motion blur feel via a trailing soft streak), extra energy from motion.
mode "tri" (248.26-268.90): the triangle assembles: 250.9 the right angle; 253.7 brass side (rest energy) lights; 259.7 steel side (momentum); 263.5 the long glass
side (total energy) glows; slow orbit; 268.9 'Pythagoras' — faint engraved squares appear on each side.
mode "squares" (268.90-278.54): physical squares grow on each side from small tiles (like stone/ceramic tiles): the two small squares' tiles slide over and exactly
fill the big square (Pythagoras by tiles). Centre block dark 273.5-278.4 (frame the triangle low/right, or dim it).
mode "problem" (278.54-290.16): the big square of tiles (= E²) shown alone; 286.2 a large carved square-root sign (brass) slides over it; centre dark 286.3-290.0.
mode "first" (290.16-305.62): concrete beats: 290.2 the big 5x5 tile square (E²) sits on the slate, camera low and slow; 295.3 'no squares' — the square's tiles
lift a few mm and hover (a square is not what Dirac wants); 296.6 'just the first power' — beside it a single brass rod 'E' (5 tiles long) slides into the lamp light;
299.0-305.6 the tiles try to collapse into the rod: they stack/funnel toward the rod's end but jam half-way (it doesn't simply work) and settle back, camera
orbiting slowly from the square to the rod. Lower-left dark 295.3-299.0.
mode "root" (305.62-317.14): the tiles: a 3x3 block (9) and a 4x4 block (16) of real ceramic tiles; they merge into a 5x5 square (25) whose side is a 5-tile rod;
beside it a 3-tile rod + 4-tile rod laid end to end = 7, clearly longer than 5 (the mismatch). Centre dark 312.3-316.9 (keep the tiles low).
mode "recap" (986.36-992.46): the brass square-root sign over the tile square, slow push; the sign splits into two (a + and a − version) gently.""",
    "matrix": """Dirac's matrices as REAL objects: grids of numbers engraved/inlaid on dark slate tablets or brass plates (numbers 0, 1, −1, i in a serif face,
canvasTex), on a scholar's dark wood desk under one lamp. Dirac's 4x4 gamma matrices (use the real Dirac representation: blocks of 1, 0, −1, and Pauli
matrices with 0, 1, −i, i) — correct numbers matter.
mode "bold" (317.14-324.66): ordinary numbers (single carved number tiles 3, 4, 9, 16) on the slate turn and dissolve into grids of numbers.
mode "grid" (324.66-331.24): one 4x4 brass/slate grid in focus, rack focus across its entries; lower-left dark 325.0-330.8.
mode "order" (331.24-334.38): two grids A and B side by side, swapping places slowly ('the order matters').
mode "book" (342.88-351.50): THE physical demo of non-commuting rotations: two identical hardbound books on the desk (real cloth covers, gold-stamped spine).
Book 1: rotate 90° about the vertical axis, then 90° about the left-right axis. Book 2: same two turns in the opposite order. They end in visibly different
orientations. Lower-left dark 343.0-346.5; centre dark 347.0-351.3 (keep books in the upper/right part or dim them then).
mode "ab" (351.50-356.70): grid A × grid B gives one result plate; B × A gives a different plate. COMPUTE the products in JS from real matrices (use γ⁰ and γ¹
in the Dirac representation: γ¹γ⁰ = −γ⁰γ¹, so the two result plates differ by sign in every non-zero entry) and engrave the computed entries; centre dark 351.8-356.5
(plates in the upper third or dimmed while the eq shows).
mode "fit" (356.70-363.92): the four gamma grids slot together and the square-root sign from the triangle scene settles cleanly over them — it 'comes out perfectly'.
mode "four" (363.92-369.06): a single 4x4 grid, its 4 rows glowing faintly one by one; centre dark 364.2-367.0.
mode "parts" (369.06-382.02): the electron's wave: one soft translucent wave ribbon (pale blue, thin, elegant) splits into FOUR stacked parallel ribbons (like four
strings of one instrument), a column of 4 small brass cells beside it; centre dark 376.9-380.0.
mode "parts2" (436.00-442.56): the four stacked ribbons: top two light up (pins "spin up", "spin down"), bottom two stay dim; lower-left dark 437.0-441.6.
mode "parts3" (468.52-477.94): the bottom two ribbons now glow a cool, deep blue and sink below a faint 'zero' line (negative energy), lower-left dark 472.2-477.8.""",
    "roots": """The two answers of a square root, with real objects on the slate desk.
mode "pm" (442.56-456.54): 3x3 tile square (9 tiles); 449.5 a mirrored copy appears reflected in a dark glass sheet ('minus 3 times minus 3'); both make 9;
452.3 one brass '√9' plaque points to both '3' and '−3' carved tiles. Centre block dark at 447.2-456.4 (eq overlays) — keep objects in the lower third.
mode "ball" (456.54-468.52): a steel ball dropped from a wooden ledge falls to the floor (real physics, ~2 s, slow-motion feel ok) beside a vertical brass time
rail with marks; the 'other answer' is shown as a faint ghost ball going back UP the rail and fading (time doesn't run backward); centre dark 463.0-468.3.
mode "recap" (992.46-1001.44): the √9 plaque with both 3 and −3 tiles; the −3 tile is kept (pushed forward into the light) instead of thrown away; lower-left dark 992.6-995.2.""",

    # ===== group C -> assets/js/k_sea.js =====
    "sea": """THE DIRAC SEA as a vast, dark CINEMA: rows and rows of real velvet cinema seats (deep wine-red velvet, brass seat numbers, wooden armrests) stepping DOWN
endlessly into darkness below a 'zero' level (a faint warm line of light like a stage edge), every seat below it holding one electron (X3.electron, the size of a
seat cushion's ball). Above the line: open air, an ordinary atom/electron floats. Instance the seats/electrons (thousands, fading into fog/darkness = bottomless).
Calm, cinematic, low warm light from above, rim light on velvet. Seats are a metaphor (Pauli: one electron per seat).
mode "twins" (65.18-69.50): early tease: one steel-blue electron above a dark still mirror-like floor, its reflection beneath becomes the warm ivory positron twin.
mode "full" (522.80-527.18): first view of the seats below the zero line, all occupied; lower-left dark 522.9-527.0.
mode "pauli" (531.96-535.62): close: an electron hovers over a seat already taken, cannot sit; lower-left dark 532.1-535.4.
mode "fill" (541.82-551.34): crane down past rows going deeper and deeper, every seat full, into darkness; lower-left dark 548.6-551.2.
mode "cant" (551.34-557.24): an ordinary electron above the line tries to drop in — no empty seat, it stays up.
mode "smooth" (557.24-562.70): wide: the full sea looks perfectly smooth and uniform (seen from above like a calm surface, soft fog).
mode "knock" (564.68-574.10): a soft warm flash (energy, X3.halo) knocks one electron up out of its seat: it rises above the line as a normal electron (568) and
leaves an EMPTY seat (570.3) — the hole, marked by a gentle warm light on the empty velvet.
mode "hole" (583.92-593.42): the hole moves: neighbouring electrons hop seat to seat one after another, so the empty seat travels across the rows like a
bubble; the hole is drawn as a faint warm-ivory glow (positron colour) — acting like a particle with positive charge; lower-left dark 590.2-593.2.
mode "proton" (593.42-604.94): a hydrogen-like atom: the proton (X3.nucleon p) at centre glowing slightly; the hole's warm glow beside it — is it a proton?
lower-left dark 596.4-604.6.
mode "mass" (615.80-623.88): an honest mass comparison on X3.balance (on a dark plinth beside the cinema, warm key light): the left pan holds ONE proton
(X3.nucleon p, large); the right pan holds a heap of 1,836 electron beads (instanced X3.mats.electron spheres, small) poured in from 615.8 to 619, and the beam
settles LEVEL — a proton weighs as much as ~1,836 electrons. The camera then moves low/right so the centre block is dark plain background 619.2-623.6.
mode "fall" (623.88-633.06): an electron above the line falls into the empty seat; both vanish in a soft, intense warm-white flash with two gamma 'rays' (thin
light beams) leaving in opposite directions; no fireworks.
mode "hydrogen" (633.06-639.76): a few hydrogen atoms (proton + electron cloud): if holes were protons each would flash out of existence one after another.
mode "leap" (639.76-647.70): the hole lifts out of the sea as a real, separate warm-ivory particle (X3.positron), same size as an electron; lower-left dark 640.2-645.0.
mode "anti" (647.70-655.34): electron and positron side by side, identical size, slow orbit, a faint '−' and '+' engraved feel only via pins; lower-left dark 651.4-655.2.
mode "antiproton" (655.34-659.64): beside the proton, its dark slate-violet twin (X3.antiNucleon) fades in.
mode "sea" (867.92-880.40): the endless cinema slowly dims and dissolves into darkness (physics moved past it), only the warm positron remains lit; lower-left dark 872.6-875.0.""",

    # ===== group D -> assets/js/k_desk.js (eqpaper, stone) =====
    "eqpaper": """Dirac's desk, Cambridge, late 1920s: a quiet study at night. Dark oak desk, green-shaded brass banker's lamp (the only key light), ink pot and dip pen,
pages of X3.paperTex handwritten maths (his real 1928 form X3.EQ1928, and matrices, and E² = m²c⁴ + p²c²), a pencil, a chalkboard out of focus behind with faint
equations, a window with dim night. No people, no hands. Slow camera always moving.
mode "reveal" (52.10-58.92): the key page with the equation written in ink under the lamp, slow push; lower-left dark 53.2-58.6.
mode "strange" (58.92-65.18): rack focus across the page; the lamp flickers once softly.
mode "symbols" (76.10-80.96): macro across the handwritten symbols (γ, ψ, ∂).
mode "clock" (111.46-121.88... shot 111.46-120.40): a brass carriage clock on the desk, its hands sweeping one hour slowly (time passing in silence);
centre block dark 115.8-120.2.
mode "mind" (120.40-129.48): wide of the desk at night, papers spread; lower-left dark 123.0-128.6.
mode "need" (206.42-216.68): two books/papers side by side on the desk: one titled 'Relativität' with a light-beam sketch, one 'Quantenmechanik' with a wave
sketch; the camera moves between them; a blank page in the middle.
mode "tries" (216.68-221.58): crumpled failed attempts; one page shows 'P = −0.3' circled and crossed.
mode "properly" (227.62-229.90): a fresh blank page, pen dipped.
mode "published" (419.00-424.54): the printed journal: 'The Quantum Theory of the Electron. By P. A. M. Dirac' (Proc. Roy. Soc. A, 1928) — a bound journal open on
the desk; lower-left dark 419.4-424.2.
mode "sea" (515.86-522.80): a page with a sketched staircase of levels going down, all filled with small circles; lower-left dark 516.4-521.0.
mode "guess" (604.94-609.08): a page with 'hole = proton?' written and then lightly struck through.
mode "logic" (659.64-665.34): the lamp pulls back to show the whole desk: nothing but paper and ink.
mode "refuse" (760.72-766.10): a telegram on the desk ('NOBEL PRIZE PHYSICS 1933') beside an unwritten reply.
mode "recap" (976.24-986.36): the equation page once more, lamp light warmer, slow pull-back.""",
    # ===== group F -> assets/js/k_theory.js (theories, gold) =====
    "theories": """Two great theories, as calm real-object vignettes on the 'void' or 'studio' stage.
mode "fast" (140.14-144.40): a light pulse (soft warm streak) racing along a long dark polished rail; a small satin object chasing it fast.
mode "clock" (144.40-150.00): a brass pocket watch moving fast (camera tracking) ticks visibly slower than an identical one at rest; a steel ruler beside it
contracts along its motion; lower-left dark 145.0-149.8.
mode "mass" (150.00-153.18): 'E = mc²' engraved on a brass plaque catching the light; centre block dark 150.3-153.0 (plaque low or blurred).
mode "quantum" (153.18-164.18): the tiny world: an atom with the electron as a soft, shimmering probability cloud (pale blue haze, never a planet orbit),
a wave rippling through it; lower-left dark 154.0-158.6.
mode "wave" (168.80-171.28): hydrogen orbitals (1s, 2p lobes) as soft clouds, slow orbit.
mode "spectrum" (171.28-174.60): a real glass prism on a dark bench: light from a narrow slit passes through and splits into hydrogen's bright lines
(red 656 nm, cyan 486, violet 434) on a dark card — NOT a rainbow wash; lower-left dark 171.6-174.4.
mode "slow" (177.98-184.10): the electron cloud drifting lazily (slow motion), labelled pin "Schrödinger: slow electrons"; lower-left dark 178.2-183.8.""",
    "gold": """Gold and relativity, with real materials.
mode "atom" (184.10-192.80): a heavy gold atom: the dense nucleus (X3.nucleus 79, 118) with the innermost electrons racing in tight fast blurred paths
close to it (streaks), outer cloud calm; camera dives in; centre block dark 188.9-192.6 (atom off-centre, right).
mode "bars" (192.80-206.42): a polished gold bar (warm yellow metal, accurate colour) beside a silver bar (cool white metal) on dark velvet, a slow
dolly across; 198.8 light rakes over the gold; lower-left dark 198.9-203.2.""",
    "stone": """Dirac's memorial stone in the floor of Westminster Abbey (1995): a pale grey stone slab set among the abbey's worn floor stones (old patterned
marble/limestone, brass inlays), carved: 'PAUL ADRIEN MAURICE DIRAC' / 'OM FRS 1902–1984' / 'THEORETICAL PHYSICIST' / and the equation X3.EQ, lit by soft
cathedral window light (cool shafts, dust), a hint of Newton's monument (dark marble and gilt) in the background.
mode "slab" (956.22-965.28): slow descent from the light shafts down to the stone; centre block dark 959.0-965.0 (frame the slab in the lower third).
mode "close" (965.28-976.24): raking light across the carved equation, very slow push; lower-left dark 967.4-976.0.""",

    # ===== group E -> assets/js/k_cosmos.js =====
    "spin": """Electron spin: the electron (X3.electron, large) as a tiny bar magnet — inside its satin shell (cut-away or semi-translucent) a small polished bar magnet
(red/grey painted steel, N/S) shows its direction; iron-filing-like faint field lines are NOT allowed (no line diagrams) — instead a compass needle nearby swings.
mode "magnet" (382.02-393.74): the electron turns, its internal magnet pointing up, then another electron pointing down; a compass needle follows; lower-left dark 384.8-389.0.
mode "experiment" (393.74-400.84): Stern–Gerlach style: a beam of tiny particles passes between shaped magnet poles and splits into exactly TWO spots on a
glass plate (up and down), real metal magnet.
mode "bolted" (400.84-407.54): the 'old equations': a brass mechanism (a clockwork-like device = the equation) with a spin part bolted on clumsily from outside
with a mismatched bracket and visible bolts.
mode "appears" (407.54-419.00): the same mechanism now seamless: the spin part grows naturally out of the inside (gears mesh), the electron's internal magnet
appears by itself; lower-left dark 407.7-412.4.""",
    "ladder": """Negative energy as an endless staircase: a stone staircase descending from a lit landing (the 'zero' level, an atom's normal home) down into darkness
forever (fog swallows it), steps lit by soft light from above.
mode "down" (477.94-483.98): a satin electron on the landing; water-like logic: things fall to the lowest energy (it rests on the lowest lit step).
mode "fall" (488.02-500.06): the electron drops down step after step, each step giving off a small warm flash of light (photon), faster and deeper, forever, no bottom;
lower-left dark 498.2-500.0.
mode "collapse" (500.06-507.08): many atoms (soft electron clouds around tiny nuclei) in space, all collapsing inward in a blaze of light in a fraction of a second
(shown slowly), then darkness.
mode "either" (510.24-515.86): back on the lit landing, the electron rests safely ('atoms are fine'); 512.5 'or something was stopping electrons from falling':
the camera slowly tilts down over the edge of the landing into the dark stairwell below — the steps below are dimly visible and NOT empty: a faint
row of steel-blue electron beads sits on every step going down (a foreshadow of the full Dirac sea), barely lit.""",
    "cosmos": """Annihilation and antimatter facts.
mode "flash" (69.50-76.10): electron and positron drift together and annihilate: a soft intense warm-white flash and two thin gamma beams leaving in opposite
directions, then empty darkness; centre block dark 73.6-76.0 (flash earlier, by 72.5).
mode "meet" (812.08-824.68): the same annihilation, slower and closer: 812.1-815.5 an electron and a positron drift toward each other in a dim void, slow orbit;
816.0 they touch and BOTH vanish completely in one soft intense warm-white flash; 816.3-820 two thin gamma beams race out in opposite directions and the glow
fades to an empty dark void (nothing left: entire mass became energy); centre block dark 820.9-824.5 (just drifting dust, camera slowly pulling back).
mode "drop" (831.56-839.44): CERN's ALPHA-g experiment: a tall vertical cylindrical magnetic trap (layers of copper coils, cryostat steel), anti-hydrogen atoms
(antiproton + positron cloud, small) released inside; they drift and FALL downward, counters at bottom flash; centre block dark 838.2-839.4.
mode "potassium" (848.46-851.70): a single potassium-40 nucleus (X3.nucleus 19, 21) spits out one positron (warm ivory bead) and a faint neutrino streak;
lower-left dark 848.8-851.6.
mode "tiny" (858.02-867.92): a jeweller's precision balance under a glass dome on a dark velvet cloth, its tiny pan empty, display reading '0.000 g' — all the
antimatter ever made is too little to weigh; centre block dark 861.0-867.7 (balance low-right).""",
    "bang": """The matter–antimatter mystery, cosmic and calm (space stage, warm-white light only, no rainbow).
mode "bang" (886.42-898.98): the hot early universe: a dense glowing fog of countless particle/antiparticle pairs (tiny steel-blue and ivory beads), pairs
meeting and flashing softly everywhere; lower-left dark 888.4-893.9.
mode "light" (898.98-907.46): if perfectly equal: every pair annihilates, leaving only an expanding fading glow of light and then emptiness; lower-left dark 903.5-907.3.
mode "tip" (907.46-919.60): a balance of two great heaps of beads (or two columns), one heap one bead heavier; centre block dark 912.6-919.4.
mode "left" (919.60-928.36): after the flashes, a sparse scatter of survivors (steel-blue electrons + copper protons) slowly gathers into gas clouds and first
stars/galaxies (soft).
mode "why" (933.06-945.78): slow drift through a galaxy field with a single leftover particle in the foreground; lower-left dark 936.6-938.0.
mode "end" (1012.78-1020.60): looking up into a deep starfield; slow push; last 1.5 s fade to black; lower-left dark 1015.6-1020.6.""",
}
