"""Briefs for the 3D scene authors — "Nobody Explained E = mc² Like THIS!". Times are FILM seconds (ft = o.T0 + t). Read transcript.txt for the words.
THESIS: mass and energy are the same thing in two currencies; c² is the exchange rate. Adding energy adds mass, removing it removes mass — always,
but in daily life the change is ~a billionth, invisible. Most of your mass is energy (quark motion + binding inside protons). Honest scale at all times:
when a balance shows a tiny mass change it is a clearly magnified model. Overlay windows (see shots.py ov) must stay clear (see BUILDERS.md).
SHARED PROPS: every balance, nucleon/nucleus and paperclip MUST come from window.X3 in assets/js/k_0shared.js (read its header) so the film has one look.
Do not edit k_0shared.js; if you need a change there, say so in your report. Groups: A k_chai.js = chai, props, balance. B k_atom.js = atom, lithium,
fission, sun. C k_history.js = patent, paper, snow, letters. D k_rate.js = exchange, paperclip, hiroshima, pet."""

KINDS = {
    # ===== group A -> assets/js/k_chai.js =====
    "chai": """THE recurring hero object, matching the real street-chai footage that opens the film (a vendor pouring into small glasses): ONE small clear
ribbed 'cutting chai' glass (~8 cm tall, thick glass, slight green tint) of hot milky masala chai (opaque caramel-brown, a faint skin and a few bubbles on top) — the same
glass in every mode, steam (soft, translucent, slowly curling — a few layered noise-textured sprite ribbons, never white blobs),
on a warm wooden table by a window, morning light, shallow depth-of-field feel (soft background), cosy kitchen background shapes (steel tiffin, a kettle) out of focus.
mode "hot" (4.44-8.40): close on the steaming chai, slow push-in; steam strong.
mode "seal" (8.40-19.00): 8.4 steam curls; 10.66 a clear glass bell jar (cloche) lowers over the cup and seals on the table (the steam stays inside, condensing faintly
on the glass); 15.42 cut-wide to a fine brass two-pan balance: a sealed HOT cup (steam inside) and a sealed COLD cup (no steam) side by side, perfectly level — the
balance does not visibly move (the difference is far too small); lower-left clear 10.9-15.2.
mode "scale" (19.00-25.18): the sealed hot cup on a kitchen digital scale reading a steady '250 g' (canvasTex digits, LCD green-grey) — the reading never changes; slow
orbit; centre block dark/plain 19.3-24.9 for the big '< 0.000 000 000 5 g' overlay (frame the scale low or to one side).
mode "title" (25.18-32.32): dark, intimate: camera rises slowly through the steam above the cup into darkness; centre calm 28.9-32.1 for the title 'E = mc²'.
mode "heavier" (52.12-54.78) and "heavier2" (251.56-254.50): the chai glass on the brass balance's left pan heats (a soft warm glow under it / steam rises) and that pan dips a
hair (magnified, slow, subtle) — 'heat your chai and the cup weighs more'.
mode "divide" (195.78-214.68): the chai being heated in a small steel pan on a gas flame (blue flame, realistic), milk-tea simmering; 204.5 cut closer: the glass on the
balance pan, a magnified needle barely twitches; centre block clear 204.5-209.8 (eq overlay 'Δm = E ÷ c²'); lower-left clear 210.2-214.5.
mode "cool" (623.46-636.52): late-morning light, the chai has cooled, the last wisps of steam fade away by ~631; warmth drifts out (a faint warm shimmer leaving into
the room); very slow push.
mode "end" (640.76-645.40): the cooled chai on the table, still, light shifting; final 1.2 s fade to black. lower-left clear for the last line.""",
    "props": """Real-material still-life props.
mode "mug" (32.32-43.16): the equation as a cultural icon: a slow dolly across a desk/shelf: a ceramic coffee mug printed with 'E = mc²' (32.3-35.2), then a folded grey
t-shirt with the equation printed in white (35.2-37.5), then a framed poster on the wall (Einstein-style chalkboard look — the equation only, no face) (37.5-43.2);
warm interior light. (Text on the props is allowed here — it is printed on the objects.)
mode "tile" (506.60-511.56): a periodic-table style element tile, made as a real object (a thick enamel/acrylic tile on dark slate), reading '109', 'Mt', 'Meitnerium';
slow push; soft light.""",
    "balance": """A beautiful antique brass two-pan precision balance (laboratory, glass case optional), on a dark wooden bench, soft key light + rim. A pointer and a
magnified dial show tilt (honest: 'magnified' feel, slow gentle movement).
mode "add" (227.02-243.00): 227 a plain closed steel box on the left pan, a matching weight on the right, level; 233 'anything that has energy also has mass': soft warm
energy (light) flows into the box (it glows faintly from within) and the left pan dips slightly; 239.1 energy leaves (glow fades out into the air) and the pan rises
past level; 241.8 'Always.' settles; lower-left clear 233.0-236.0 and 241.8-242.9.
mode "spring" (248.04-251.56): a steel coil spring on the left pan is wound tight (a ratchet clamp tightens it) and that pan dips a hair.
mode "log" (262.42-270.78): a sealed glass vessel on the left pan with a small log burning inside (flames, smoke curling inside the glass, ash forming); as it burns the
pan rises a hair (mass left as heat and light: warm light radiates out through the glass); lower-left clear 267.1-270.6.
mode "recap" (605.90-611.96): quick: energy out → pan rises (605.9-608.8), energy in → pan dips (608.9-611.9).""",
    # ===== group B -> assets/js/k_atom.js (also 'sun' below) =====
    "atom": """The atom and the proton. Nucleons = satin spheres (protons warm copper-red, neutrons pale warm grey), electrons = a soft pale-blue probability haze (not
planets). Quarks = three small bright-satin spheres (warm white with a hint of colour: one faint red, one faint green, one faint blue tint — subtle) joined by the strong
force drawn as soft, flickering warm-white flux tubes (gluon field), the space between filled with a faint seething energy glow.
mode "metal" (54.78-59.98): a small dull grey metal cylinder (a uranium slug, ~3 cm, oxidised dark grey-black surface) alone on a dark steel table under a hard top
light, ominous; slow push-in. No glow.
mode "zoom" (287.98-299.28): start on skin-like surface texture (abstract, warm, macro — not a person), dive into a cloud of atoms (289.6) → one atom: electron haze
around a tiny nucleus → into the nucleus of protons and neutrons (292) → into one proton (294.5): three quarks inside.
mode "sum" (299.28-311.46): the proton (a soft translucent sphere) on the left pan of a brass balance, the three quarks on the right: the quarks' pan barely registers;
a needle/scale shows ≈1 %; centre block clear 305.7-309.6 (big '≈ 1%'), lower-left clear 309.7-311.3.
mode "binding" (311.46-323.74): inside the proton: quarks racing on tight chaotic paths, flux tubes stretching and snapping back, the energy field glowing — fast but
calm-looking (motion blur trails, soft). 319.4 'all that motion and binding energy shows up as mass': the glow gathers into the proton's 'weight' (a gentle pulse).
mode "pullback" (323.74-330.90): pull back out from proton → nucleus → atom → many atoms → warm macro skin-like texture; centre block clear 324.0-330.6 for big '≈ 99%'.
mode "you" (616.16-623.46): reverse of pullback, slower: from the warm surface into one atom; the nucleus glowing with locked energy; lower-left clear 617.4-623.2.""",
    "lithium": """350.52-362.88. Cockcroft–Walton 1932: a proton (copper-red sphere) flies in from the left and hits a lithium-7 nucleus (3 protons + 4 neutrons cluster);
the nucleus splits into two helium-4 nuclei (2p+2n each) flying apart fast (354.4) with soft warm energy streaks; 357.9 a small brass balance inset or side-by-side:
'before' (proton + lithium) slightly heavier than 'after' (two helium); the missing mass reappears as the helium's motion energy (pins 'lithium-7', 'helium-4').
Lower-left clear 358.0-362.6.""",
    "fission": """Uranium fission, Meitner & Frisch 1938. Nuclei as satin sphere clusters (protons copper-red, neutrons grey); uranium big (show ~235 spheres as a dense cluster,
can be instanced), barium ~half.
mode "barium" (397.10-407.68): a neutron drifts into a uranium nucleus (pin 'uranium'); 400.8 'ended up with barium': beside it a barium nucleus about half the size
appears (pin 'barium'), the camera compares them — puzzling.
mode "split" (419.60-432.88): the uranium nucleus wobbles, stretches into a peanut/dumbbell shape (liquid-drop), pinches and splits in two (422.5); the two fragments fly
apart with energy (soft warm shock of light, two or three neutrons spark out); centre block clear 428.7-432.7 (big '≈ 200 million eV').
mode "mass" (432.88-446.82): the original nucleus on the left pan of a brass balance, the two fragments on the right: the right pan is lighter (rises a hair, magnified);
442.7 'about a fifth of a proton's mass missing': a small ghost sphere (a fifth of a proton, translucent) floats above the right pan showing what's missing (pin
'≈ 1/5 of a proton').
mode "match" (456.12-460.68): the two fragments flying apart; their energy glow equals the ghost sphere dissolving (the missing mass becoming the energy).""",
    # hiroshima -> group D (k_rate.js)
    "hiroshima": """471.40-484.96. Sombre, respectful, no explosion imagery. TRUE SIZES (uranium is ~19 g/cm³): on a dark steel table under one cool light: a dull
dark-grey metal cube 15 cm on a side = 64 kg of uranium (471.4, pin '64 kg uranium'), beside it a 3.6 cm cube = the < 1 kg that actually split (474.9, pin 'less than 1 kg split'), and finally a single steel paperclip on a
precision weighing pan (477.5, pin '≈ 0.7 g'); slow push toward the paperclip; centre block clear 478.3-484.7.""",
    # ===== group C -> assets/js/k_history.js =====
    "patent": """77.12-84.08. The Swiss Patent Office, Bern, 1905: a wooden clerk's desk by a tall window (morning light through old glass), stacks of patent applications
tied with string, a technical drawing of an invention (a simple electrical machine / clock mechanism, sepia ink), inkwell, dip pen, a pocket watch; 81.4 'in his spare
time he did physics': camera finds a notebook slid under the files, pages of handwritten maths (pencil). No people. Lower-left clear 77.5-82.0.""",
    "paper": """Einstein's 1905 papers. Old journal pages (Annalen der Physik look: cream paper, German Fraktur-free serif, 2 columns) — a recreation, the title of the
September paper can be shown as 'Ist die Trägheit eines Körpers von seinem Energieinhalt abhängig?' and author 'A. Einstein'.
mode "papers" (84.08-99.84): 84 a stack of journal issues of 1905 on a desk (warm lamp light), camera glides; 88.5 one issue opens to a short paper (3 pages fanned);
94.0 the camera reads down the last page to its key SENTENCE, which is printed text in the paper (no formula, no margin notes — accuracy matters):
'Gibt ein Körper die Energie L in Form von Strahlung ab, so verkleinert sich seine Masse um L/V².' — picked out by a soft pool of light (no box); lower-left clear
88.8-94.0; centre block clear 95.0-99.6 (eq overlay 'E = mc²'), so frame the page low/aside then.
mode "letter" (99.84-111.62): a handwritten letter in German (ink on paper, recreated, illegible-but-convincing cursive) on a desk with an envelope 'Bern 1905'; candle or
lamp light; slow push; lower-left clear 103.2-111.4.
mode "laugh" (636.52-640.76): the same letter, late light, very slow drift.""",
    "snow": """Sweden, Christmas 1938. TIGHT MACRO ONLY (no wide forest — wide landscapes look toy-like in this engine; real snow-forest footage is used
around it): a fallen tree trunk — rough bark with moss and snow on top, soft snowflakes falling in shallow depth of field, blue-hour light with a warm rim — scraps of
squared notebook paper on the trunk weighed down by a pencil. NO people.
mode "trunk" (414.92-419.60): low macro dolly along the snowy bark (a few footprints in the snow beside it, out of focus) arriving at the paper scraps.
mode "calc" (446.82-456.12): close on a paper scrap on the trunk: handwritten calculation in pencil (fraction of proton mass × c², arriving at '≈ 200 MeV' — scribbled,
looks like real working); centre block clear 450.4-454.6 (eq overlay) so frame the paper low/aside then; lower-left clear 454.7-456.0.
mode "end" (494.96-506.60; voice 498.4 "Meitner, who first explained ... was left out"): the trunk alone at night, the paper scraps lifting in a little wind, snow covering the tracks; lower-left clear 504.0-506.4.""",
    "letters": """The three letters as real things on a dark studio table (no floating text).
mode "e" (111.62-120.80): ENERGY: 115.3 three quick vignettes merged in one continuous camera move: a small flame (heat, 118.7), a light bulb lighting (light, 119.3),
a steel ball rolling down a ramp (motion, 119.9). Lower-left clear 115.4-120.6 (cap).
mode "m" (120.80-127.72): MASS: a heavy cast-iron block and a small wooden block on the table; 125.4 'how hard it is to push': a pusher arm (mechanical, no hands)
pushes both with the same force — the wooden block slides far, the iron block barely moves. Lower-left clear.
mode "c" (127.72-140.90): LIGHT: a pulse of light (a soft bright point with a short trail) races along a very long polished rail into the distance — real speed feel;
centre block clear 129.2-133.8 (big '300,000 km/s'); 136.7 the iron block and the light pulse side by side, camera between them (puzzle); lower-left clear 136.7-140.7.""",
    # ===== group D -> assets/js/k_rate.js (also 'hiroshima' above) =====
    "exchange": """An exchange-rate idea, as a real object: a brass and wood currency-exchange counter / balance.
mode "money" (145.72-153.84): Indian rupee coins slide in on one side, US dollar coins come out on the other at a fixed rate (a counter dial turns) — 'same value,
different currency'; lower-left clear 151.1-153.7.
mode "rate" (153.84-165.96): the same machine, but now the left side takes a small block of matter (a dark satin cube, 'mass') and the right side gives out soft warm light
(energy) — a brass plaque on the machine engraved 'c²' (the exchange rate); 162 camera on the plaque; centre block clear 162.0-165.8 (eq overlay).
mode "huge" (165.96-179.14): the rate dial spins up and up: a mechanical odometer counter rolls to a huge number (90 000 000 000 000 000) — the number is ON the counter,
real object; centre block clear 173.2-178.9 (frame the counter low or aside then).
mode "recap" (586.52-597.82): the machine at rest at night, a tiny cube of mass slides in and a big warm flood of light comes out; lower-left clear 593.7-597.6.""",
    "paperclip": """mode "gram" (179.14-189.04): a single steel paperclip on a precision lab scale reading '1.000 g' (canvasTex LCD); 184.1 'convert all of it into energy':
the paperclip dissolves into warm light that floods outward (calm, not an explosion); centre block clear 186.8-188.9 (big '90 trillion joules').
mode "recap" (597.82-605.90): the paperclip on the scale; the huge flood of light it would release; slow orbit.""",
    # sun -> group B (k_atom.js)
    "sun": """The Sun as a real star: use tex('2k_sun.jpg') on a sphere with limb darkening, granulation shimmer, soft corona; space background (stars faint).
mode "core" (518.28-533.38): from the Sun's surface dive into the core (deep orange-white glowing plasma); hydrogen nuclei (single copper-red protons) collide and fuse
step by step into a helium nucleus (2p+2n); 523.6-529.7 a balance or side-by-side: four hydrogen vs one helium — the helium slightly lighter; 529.7 the missing 0.7 %
leaves as light; centre block clear 529.8-533.2.
mode "lose" (533.38-549.18): the whole Sun from space, shining, slowly rotating; light streaming away; centre block clear 535.0-540.4; lower-left clear 540.6-544.6;
544.7 pull back far: the Sun still almost the same — 'only a tiny fraction'.
mode "star" (614.38-616.16): a short, beautiful close shot of the Sun's limb with a prominence.""",
    "pet": """566.96-586.52. Positron emission tomography as physics: 567 a positron (pale anti-electron, a soft cool-white haze sphere) approaches an electron (pale blue haze);
572.6 they meet and both vanish completely in a flash; two gamma rays (thin bright lines with soft glow) shoot out in exactly opposite directions; 577.3 pull back: we are
inside a ring of detector crystals (a PET scanner ring, real-looking white plastic housing, crystal blocks) — the two rays hit opposite detectors which light up; many such
pairs build a soft glowing image of an organ (a stylised but tasteful heart/brain shape made of points) in the middle. Lower-left clear 582.3-586.4.""",
}
