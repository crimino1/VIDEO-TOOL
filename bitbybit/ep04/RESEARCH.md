# EP4 research: "Weird Computer Science Concepts: five living computers"

Compiled 2026-11-16. The source tier is marked on each fact:
- **[P]** primary (the paper itself, its PubMed/Europe PMC record, preprint, or the organisation's own page)
- **[R]** official press release from the institution
- **[S]** secondary (news coverage, review articles, search summaries)

Paths are relative to `ep04/`. Every video below was checked with ffprobe. **None are HDR.** All are bt709, smpte170m or untagged SDR. The `pxb_*` files in `stock/raw/` came from somewhere else (another process) and are not covered here.

---

## Narration flags (read first)

| Line in transcript.txt | Verdict |
|---|---|
| 2:33 "Leonard **Adelman**" | **Spelling: Adleman** (ASR error). Paper byline is "L M Adleman" [P]. Fix any on-screen text. |
| 5:47 "a tool called **Shello**" | **Spelling: Cello** [P] (ASR error). |
| 1:12 "cities around Tokyo, 36 of them, and put the slime mould where Tokyo would be" | OK. The paper says "a template of 36 FSs [food sources] that represented geographical locations of cities in the Tokyo area" and "The Physarum plasmodium was allowed to grow from Tokyo" [P]. Strictly, it is 36 food sources representing cities in the Tokyo area. (The "Tokyo = aggregate of seven FSs" line in the paper is from the Fig. 4 caption about the simulation model, not the dish.) |
| 1:22 bright light for mountains and lakes | OK [P]: "The ocean and inland lakes were also given strong illumination". An illumination mask restricted growth "to more shaded areas corresponding to low-altitude regions" (i.e. mountains were lit). |
| 1:28 "about a day" | OK. Fig. 1 panels run 0, 5, 8, 11, 16, **26 hr** [P]. |
| 1:30 comparable in cost, efficiency, fault tolerance | OK, abstract wording [P]. |
| 0:54 maze (one end / food at other) | Nuance. This is a separate experiment (Nakagaki, Yamada and Toth, Nature 2000). The mould first **filled the maze**, then food was put at the two exits (Commons PD diagram caption). Not a contradiction, just a different experiment from the Tokyo one. |
| 2:41 seven cities, one-way flights | OK. Directed Hamiltonian path, 7 vertices [P abstract says "small graph"; 7 cities per S]. |
| 3:14 "Within seconds, the tube holds pretty much every route" | Secondary only. "within a few seconds, all of the possible combinations" form (Bristol explainer) [S]. Fine as narration. |
| 3:33 "about a week of lab work" | OK [S]. JYI review: "seven days", "nearly a week to sort through all the combinations". Not in the abstract. |
| 3:44 "at 200 cities, the DNA would outweigh the earth" | OK in substance, secondary. Hartmanis, "On the weight of computations", Bulletin of the EATCS 55 (Feb 1995), 136-138 [S summaries]. Secondary sources quote different figures (>=3x10^25 kg; "24 Earth masses"; JYI says >10^27 kg). All exceed Earth's ~6x10^24 kg. **Don't put a number on screen**, the line as written is safe. |
| 4:37 "72,000 tiny strands" | OK [P preprint]: "We instructed DNA Fountain to generate 72,000 oligos" (200 nt each [R]). |
| 4:29 "an entire computer operating system and a short movie" | OK [P]: "a complete graphical operating system of 1.4Mbyte". Fig S8 names it "The Kolibri operating system" (KolibriOS). The film is "The Arrival of a Train" [P], 1895, French: "Arrival of a train at La Ciotat" [R]. No fetched page names the filmmakers, so don't add "Lumiere" from memory. Six files in total: OS, film, $50 Amazon gift card, computer virus, Pioneer plaque, 1948 Shannon study [R]. |
| 4:43 "sent the order to a company" | OK. Twist Bioscience, San Francisco [P preprint and R]. The vial came back "Two weeks later" [R]. |
| 4:50 "Zero errors" | OK [P]: "fully recovered the entire input file with zero errors". The abstract says "perfectly retrieved" [P]. |
| 4:51 booted the OS and played Minesweeper | OK, with nuance [R]: Erlich "opened the archived operating system on a **virtual machine** and played Minesweeper". |
| 4:59 215 petabytes per gram | OK [P abstract]: "perfect retrieval from a density of 215 petabytes per gram of DNA". |
| 4:05-4:10 four letters = two bits | Theory is fine. Nuance: the practical limit is about 1.8 bits/nt, and DNA Fountain achieved about **1.6 bits per nucleotide** [R]. Don't imply the demo used the full 2 bits. |
| 5:10 "DNA can last hundreds of thousands of years" | OK [R]: "hundreds of thousands of years if kept cool and dry". The release cites DNA from a 430,000-year-old human ancestor. |
| 5:15 "A hard drive might give you 10" | **Unsourced** here. Not in any source fetched. Soften it or keep it as rough narration. |
| 5:20 "That demo was 2 megabytes" | OK [P]: 2.14 x 10^6 bytes in total. |
| 5:22 "$7,000 to write and $2,000 to read" | OK [R]: about $7,000 to synthesize and $2,000 to read. This is the press release, not the paper. |
| 5:33 code "originally designed for streaming video to phones" | OK [R]: "an algorithm designed for streaming video on a cellphone". The preprint [P] frames fountain codes (Luby Transform) as unicasting over channels with dropouts, "such as mobile TV". |
| 5:54 "write code in Verilog" | OK [P abstract]. |
| 6:18 inputs "like oxygen or sugar" | Nuance. The MIT News release [R] says sensors can detect "oxygen or glucose", plus light, temperature and acidity. The paper's actual 60 circuits used lab chemical inducers (not checked in full text here). Fine as "things a cell can sense". |
| 6:28 "60 circuits, 45 worked correctly on the first try" | OK. [P]: 60 circuits, "each DNA sequence was built as predicted by the software with no additional tuning. Of these, 45 circuits performed correctly in every output state". [R]: "45 of them worked correctly the first time they were tested". Also [P]: 92% of all output states across all circuits worked. |
| 6:40-6:44 tumour drug / plant-root insecticide | OK [R] (MIT News lists exactly these examples). |
| 7:07 "In 2022 ... about 800,000 brain cells" | OK, with nuance [P methods]. "Approximately 800,000 cells were plated down onto each pre-prepared HD-MEA" applies to the **mouse** E15.5 primary cortical cultures. For the human iPSC-derived cultures it was "approximately 10^6 cells plated onto each MEA". So "about 800,000 to a million" is the fully accurate version. |
| 7:15 mouse and human neurons | OK [P]: "In vitro neural networks from human or rodent origins". |
| 7:33-7:40 hit = neat predictable signal, miss = random noise | OK [P]. Hit: "a predictable stimulus was delivered across all electrodes simultaneously at 100Hz for 100ms". Miss: "an unpredictable stimulus was delivered (150mV voltage at 5Hz for 4 seconds)". |
| 7:48 "Within about five minutes, hitting more often than chance" | **Nuance, not a contradiction.** The abstract [P] says "apparent learning within five minutes of real-time gameplay not observed in control conditions". So the comparison is against **controls**, not "chance". The paper's Video S2 caption: improvement in all metrics vs controls, 0-5 vs 5-15 min. Safer wording: "within about five minutes they were improving, and the control dishes weren't". |
| 8:03 "now sells a computer built around living neurons for about $35,000" | OK, **press-reported only** [S]. GIGAZINE (5 Mar 2025): "price starts at $35,000"; PC Gamer headline: "costs $35,000". Cortical Labs' own CL1 page shows **no price** [P]. Launch: Reuters video dated 6 Mar 2025 ("unveiled the world's first commercial biological computer (CL1)"); ABC News headline "Melbourne start-up launches 'biological computer'..." (cited by GIGAZINE). |
| 8:12 brain about 20 W | Not checked (common figure). |

---

## 1. Slime mould Tokyo rail network (2010)

**Paper [P]:** Tero A, Takagi S, Saigusa T, Ito K, Bebber DP, Fricker MD, Yumiki K, Kobayashi R, Nakagaki T. "Rules for Biologically Inspired Adaptive Network Design." *Science* 327(5964):439-442, 22 Jan 2010.
- DOI: https://doi.org/10.1126/science.1177894
- PubMed: https://pubmed.ncbi.nlm.nih.gov/20093467/
- Full text (read via Fermat's Library): https://fermatslibrary.com/s/rules-for-biologically-inspired-adaptive-network-design

**Affiliations [P]** (from the paper's footnotes, via Fermat's Library; the PDF grep picked up neighbouring articles, so it was ignored):
- Tero, Takagi, Ito, Nakagaki: Research Institute for Electronic Science, **Hokkaido University, Sapporo**, Japan. Tero is also at PRESTO, JST.
- Saigusa: Graduate School of Engineering, Hokkaido University, Sapporo.
- Bebber, Fricker: Department of Plant Sciences, **University of Oxford**, UK.
- Yumiki, Kobayashi: Department of Mathematical and Life Sciences, **Hiroshima University**, Higashi-Hiroshima.
- Kobayashi and Nakagaki: also JST CREST, Tokyo.
- Lead: **Atsushi Tero** (first author). Senior: **Toshiyuki Nakagaki**. The experiment was performed by **Seiji Takagi** (per the uploader of the Fig. 1 movie, see below).

**Other facts [P]:**
- Each Fig. 1 panel is 17 cm wide.
- Model: "high rates of streaming stimulate an increase in tube diameter, whereas tubes tend to decline at low flow rates". This is exactly the narration's "thicker with flow, thinner without" rule.
- Abstract: networks with "comparable efficiency, fault tolerance, and cost" to the Tokyo rail system.

**Photos:** **No free photo of Tero or Nakagaki** on Commons or Wikipedia (en or ja). Nothing downloaded.

**Images:**
- `assets/img/physarum_tokyo_fig1_redrawn_fr.jpg`
  - Six-panel **redrawing** of the paper's Fig. 1 with French labels "0 heure ... 26 heures". Replace or cover the labels if used.
  - Commons "File:Physarum polycephalum network.jpg", by Tim Tim (VD fr), **CC BY-SA 4.0**. It is an adaptation, not the original figure.
- `assets/img/physarum_plasmodium.jpg`
  - Commons "File:Physarum polycephalum plasmodium.jpg", by frankenstoen (Flickr), **CC BY 2.5**. 1024x768.

**Footage** (`stock/raw/`). Columns: file, size/length, codec, transfer, source and licence, good moments.

| File | Size / len | Codec | Transfer | Source / licence | Good moments |
|---|---|---|---|---|---|
| `yt_BZUQQmcR5-g_Tokyo_rail_network_designed_by_Physarum_plasmodium.mp4` | 640x480, 38.5 s | h264 | bt709 | YouTube "sjtkg001", 2010-09-28: "This is the movie of Fig 1 of the paper ... The experiment was performed by Seiji Takagi." **The real experiment.** Standard YouTube licence; credit Tero et al., *Science* 2010. | **0-8 s** blob at Tokyo starts spreading. **9-17 s** fills the land. **19-28 s** thins into a network. **28-38 s** final rail-like network (best hero: 33-37 s). Oat flakes are visible as white dots. A thin bright edge strip on the left can be cropped. |
| `physarum_aus_timelapse_10h_2160sq.webm` | 2160x2160, 12.9 s | vp9 | smpte170m | Commons, Tim Tim (VD fr), **CC BY-SA 4.0** (10 h timelapse) | **Best "pull back from dead ends" shot.** 0-2.5 s blob spreads from a central disc. 3-6 s reaches oat flakes. **6-12 s** excess thins, thick tubes stay between the food. |
| `physarum_oatflake_to_roots.webm` | 916x1080, 28.8 s | vp9 | untagged | Commons, Ricigliano et al. 2015 (*Front. Microbiol.*, doi:10.3389/fmicb.2015.00720), **CC BY 4.0** | Full petri dish, top view. Mould on an oat flake in the centre, grows outward. **21-28 s** branches reach toward the left food well. Good for the "spreads into every corridor" line. |
| `physarum_timelapse_growth_720sq.webm` | 720x720, 19.6 s | vp9 | smpte170m | Commons, Tim Tim, **CC BY-SA 4.0** | Bright yellow blob engulfing oat flakes. Pulls out wide from 9 s. Good for the 0:44 "bright yellow blob" line. |
| `physarum_aus_timelapse_1080.webm` | 1920x1080, 16 s | vp9 | smpte170m | Commons, Tim Tim, **CC BY-SA 4.0** | Close-up of a veined plasmodium edge creeping across a dark surface toward a disc. Usable at all times. Nice 16:9 texture. |
| `physarum_timelapse_to_food_720.webm` | 1280x720, 64 s | av1 | bt709 | Commons, "Phy sarum" (from YouTube), **CC BY 3.0** | Advancing front with branching tubes. 0-20 s strongest. Soft focus. |
| `physarum_cytoplasm_flow_micro.webm` | 1080x1080, 39 s | vp9 | smpte170m | Commons, Tim Tim, **CC BY-SA 4.0** (microscope view of intracellular streaming, 3x speed) | Stills look static. The motion is the streaming flow. Use as a "one giant cell" texture. Weak. |
| `physarum_terrarium_1080.webm` | 1920x1080, 7.5 s | vp9 | smpte170m | Commons, Tim Tim, **CC BY-SA 4.0** | Small yellow blob on leaf litter, near-static. Weak. Possible "lives on rotting logs" cutaway. |

**Other YouTube options (not downloaded):**
- BBC Earth Science "Can Slime Mould Solve Mazes?" (`HyzT5b0tNtk`, 2:33)
- Heather Barnett TED (`2UxGrde1NDA`)

---

## 2. Leonard Adleman's DNA computer (1994)

**Paper [P]:** Adleman LM. "Molecular computation of solutions to combinatorial problems." *Science* 266(5187):1021-1024, 11 Nov 1994.
- DOI: https://doi.org/10.1126/science.7973651
- PubMed: https://pubmed.ncbi.nlm.nih.gov/7973651/
- Affiliation [P]: Department of Computer Science, **University of Southern California, Los Angeles** 90089. Sole author.
- Spelling: **Leonard Adleman** (byline "L M Adleman").

**Abstract [P]:** "an instance of the directed Hamiltonian path problem. A small graph was encoded in molecules of DNA".
- Graph size: 7 cities [S]. Secondary sources say 14 edges.
- About seven days of lab work [S, JYI 2005]: https://www.jyi.org/2005-september/2005/9/7/fear-not-traveling-salesmen-dna-computing-is-here-to-save-the-day

**200-city weight:** Hartmanis J., "On the weight of computations", Bull. EATCS 55:136-138 (1995) [S]. The PDF mirror at typeset.io returned HTTP 403, so the primary text is not verified.

**Credit page:** https://en.wikipedia.org/wiki/Leonard_Adleman (or USC Viterbi faculty page).

**Photo:**
- `assets/img/adleman.jpg`: Commons "File:Len-mankin-pic.jpg", 1045x1640.
  - Licence **CC BY-SA 3.0**. Author field "len adlmen". Credit "by mail from len adlman" (2010). This is the Wikipedia infobox photo.
  - Credit as "Leonard Adleman, CC BY-SA 3.0, via Wikimedia Commons".
- Rejected: "File:2017-08-Ron Rivest Adi Shamir and Len Adleman on CRYPTO 2017 in UCSB.jpg". The file page strikes out "and Len Adleman", so **he is not in it**. It was downloaded, then deleted.

**Footage:**
- Nothing specific to Adleman exists on Commons.
- Use `dna_sequencing_3d_yourgenome.webm` (see story 3) for generic DNA strands and polymerase.
- The free-floating strands at 3:06-3:16 suit "molecules bump into each other".

---

## 3. DNA Fountain storage (2017)

**Paper [P]:** Erlich Y, Zielinski D. "DNA Fountain enables a robust and efficient storage architecture." *Science* 355(6328):950-954, 3 Mar 2017.
- DOI: https://doi.org/10.1126/science.aaj2038
- PubMed: https://pubmed.ncbi.nlm.nih.gov/28254941/
- Free preprint (read): https://www.biorxiv.org/content/10.1101/074237v4.full
- Code: https://github.com/TeamErlich/dna-fountain

**Affiliations [P]:**
- **Yaniv Erlich:** New York Genome Center (NYC 10013); Department of Computer Science, Columbia University; Center for Computational Biology and Bioinformatics, Columbia.
- **Dina Zielinski:** New York Genome Center.
- Roles [R]: Erlich, Columbia Engineering CS professor and NYGC core member. Zielinski, associate scientist at NYGC.

**Press release [R]:** Columbia Engineering via EurekAlert, 2 Mar 2017: https://www.eurekalert.org/news-releases/822697. It is the source for:
- the six files
- 72,000 strands x 200 bases
- Twist Bioscience; vial back in two weeks
- zero errors
- $7,000 / $2,000
- 215 PB/g
- "algorithm designed for streaming video on a cellphone"
- Minesweeper on a VM
- "hundreds of thousands of years"
- 1.6 bits/nt

**Preprint [P]** confirms: 72,000 oligos; Twist Bioscience synthesis; "Kolibri operating system" (Fig S8); "The Arrival of a Train" (Fig S8); zero errors; Luby Transform basis.

**Photo:**
- `assets/img/erlich_zielinski_press.jpg` (1440x960). **Press photo**, EurekAlert multimedia 725970.
  - Credit "New York Genome Center". Page says "Usage Restrictions: None", licence "Licensed content".
  - Shows **Yaniv Erlich** (centre-left, glasses, lab coat name tag reads "Erlich") and **Dina Zielinski** (right, pipetting), in the lab.
- No free Commons/Wikipedia photo exists for either person.

**Other images:**
- `assets/img/illumina_miseq.jpg`: Commons "File:Illumina MiSeq sequencer.jpg", Konrad Förstner, **CC0**.
  - Generic Illumina benchtop sequencer. The paper says retrieval came from "a single tile of Illumina sequencing"; the exact model was not verified.

**Footage:**

| File | Size / len | Codec | Transfer | Source / licence | Good moments |
|---|---|---|---|---|---|
| `dna_sequencing_3d_yourgenome.webm` | 1920x1080, 4:55 | **av1** | bt709 | Commons, yourgenome (Wellcome Genome Campus), **CC BY 3.0**. **Shows the Sanger method used in the Human Genome Project, not Erlich's method.** Illustrative only. | **0:00-0:15** rotating double helix (clean). 0:39 96-well plate. 0:59-1:10 labelled A C G T free bases. 1:28-2:40 polymerase copying a strand. **3:06-3:16** many strands floating. **4:05-4:35** colour-coded A/C/G/T readout blocks. **4:45** wall of ACGT letters (good for "files become letters"). |

**Other YouTube option (not downloaded):** EurekAlert video "Yaniv Erlich Discusses the Study" (Columbia University), multimedia 725969.

---

## 4. Cello, MIT (2016)

**Paper [P]:** Nielsen AAK, Der BS, Shin J, Vaidyanathan P, Paralanov V, Strychalski EA, Ross D, Densmore D, Voigt CA. "Genetic circuit design automation." *Science* 352(6281):aac7341, 1 Apr 2016.
- DOI: https://doi.org/10.1126/science.aac7341
- PubMed: https://pubmed.ncbi.nlm.nih.gov/27034378/

**People and institutions [P]:**
- Lead author **Alec A. K. Nielsen** (MIT grad student [R]).
- Senior/corresponding author **Christopher A. Voigt**: Synthetic Biology Center, Department of Biological Engineering, **MIT, Cambridge, MA**.
- Co-authors from **Boston University** (Densmore lab) and **NIST** (Gaithersburg, MD).

**Facts [P abstract]:**
- "a design environment, **Cello**, in which a user writes **Verilog** code that is automatically transformed into a DNA sequence".
- "60 circuits for *Escherichia coli* (880,000 base pairs of DNA) ... built as predicted by the software with no additional tuning. Of these, 45 circuits performed correctly in every output state (up to 10 regulators and 55 parts) ... 92% of the output states functioned as predicted".

**Press release [R]:** MIT News, 31 Mar 2016: https://news.mit.edu/2016/programming-language-living-cells-bacteria-0331
- Verilog
- "45 of them worked correctly the first time they were tested"
- sensors for oxygen/glucose/light/temperature/acidity
- tumour-drug and plant-root insecticide examples
- Image credit on that page: Janet Iwasa

**Tool URLs:**
- https://www.cellocad.org/ (live, page title "CELLO")
- Source: https://github.com/CIDARLAB/cello
- v2: https://github.com/CIDARLAB/Cello-v2

**Photos:**
- `assets/img/voigt.jpg` (810x1094) and `assets/img/voigt_2.png` (1200x1551).
- Commons "File:Christopher Voigt.jpg" / "File:Christopher Voigt 2.png". Office of Naval Research, 2016. **Public domain** (US Navy, Flickr usnavyresearch).
- No free photo of Nielsen was searched beyond Commons; none was found.

**Footage:**

| File | Size / len | Codec | Transfer | Source / licence | Good moments |
|---|---|---|---|---|---|
| `ecoli_swarming_gfp_confocal.ogv` | 640x480, 20.9 s | **theora** (transcode for browser renders) | untagged | Commons, Girgis H, Liu Y, Ryu W, Tavazoie S (2007) *PLOS Genetics* doi:10.1371/journal.pgen.0030154, **CC BY 2.5**. **Wild-type GFP E. coli, not Cello circuits.** Illustrative only. | Dense field of glowing green rod bacteria swarming. Uniform, usable at all times. Good for "put it inside E. coli". |

Dropped: `ecoli_swimming_phase_contrast.ogv` (240x240 with a burned-in scale bar, too weak; deleted).

---

## 5. DishBrain and CL1, Cortical Labs (Melbourne)

**Paper [P]:** Kagan BJ, Kitchen AC, Tran NT, Habibollahi F, Khajehnejad M, Parker BJ, Bhat A, Rollo B, Razi A, Friston KJ. "In vitro neurons learn and exhibit sentience when embodied in a simulated game-world." *Neuron* 110(23):3952-3969.e8, 7 Dec 2022 (online 12 Oct 2022).
- DOI: https://doi.org/10.1016/j.neuron.2022.09.001
- PubMed: https://pubmed.ncbi.nlm.nih.gov/36228614/
- Open access: https://pmc.ncbi.nlm.nih.gov/articles/PMC9747182/ (article licence **CC BY 4.0** [P])
- Publisher page: https://www.cell.com/neuron/fulltext/S0896-6273(22)00806-6

**People and institutions [P]:**
- Lead/first author **Brett J. Kagan**, Cortical Labs, **Melbourne, Australia** (Chief Scientific Officer [S: GIGAZINE, New Scientist description]; the lower-third in Cortical Labs' DOOM video, uploaded 2026-02-25, says "CSO/COO").
- Andy C. Kitchen, Cortical Labs.
- Co-authors from Hudson Institute, University of Melbourne, Monash University, and UCL (Karl J. Friston, Wellcome Centre for Neuroimaging).
- Cortical Labs CEO: **Hon Weng Chong** [S] (named in a Dassault Systèmes YouTube talk title; GIGAZINE transliterates it "Chung Hongwen"). Not identified on screen in any downloaded clip.

**Facts [P]:**
- "Approximately 800,000 cells" per HD-MEA for **mouse** E15.5 cortical cultures; "approximately 10^6" for **human** iPSC cultures.
- System named **DishBrain**. High-density multielectrode array (MaxWell MaxOne chip visible in the footage).
- Hit/miss feedback values are in the flags table above.
- "apparent learning within five minutes".

**Press release [R]:** Cell Press via EurekAlert, 12 Oct 2022: https://www.eurekalert.org/news-releases/967077 ("Human and mouse neurons in a dish learned to play the video game Pong").

**CL1:**
- Official page [P]: https://corticallabs.com/cl1. It says: "The world's first code deployable biological computer"; neurons kept alive "up to 6 months"; "Biological Intelligence Operating System (biOS)". It shows **no price**.
- Price and launch [S]:
  - GIGAZINE, 5 Mar 2025: "The price starts at $35,000"; neurons from iPS cells from blood samples.
  - Reuters, 6 Mar 2025: "unveiled the world's first commercial biological computer (CL1)". Footage is at a trade show (MWC Barcelona is likely but **unverified**).
- Shipping dates, rack price and neuron count were seen only in search summaries and are **not verified**. Leave them out.

**Credit URL:** https://corticallabs.com. YouTube channel: https://www.youtube.com/channel/UCq4mqLeGRdq47sHumYMIDJw

**Photos / images:**
- `assets/img/kagan_cortical_video_still.jpg`: frame at 2:00.5 of Cortical Labs' own video yRV8fSw6HaE. Burned-in lower-third "Dr. Brett Kagan – CSO/COO".
  - **Standard YouTube licence, not free.** Press-style use only; crop the lower-third if you add your own name card.
  - No free photo of Kagan exists on Commons. The 2022 media kit link (scienceinpublic.com.au/corticallabs) is dead (404).
- Figures from the paper, via Commons, all **CC BY 4.0**, credit "Kagan et al., Neuron 2022":
  - `dishbrain_schematic.jpg` (system/protocol schematic)
  - `dishbrain_neurons_stain.jpg` (fluorescent-stained mouse and human cortical neurons; great colour)
  - `dishbrain_activity.jpg` (firing-rate panels)
  - `dishbrain_pong_results.jpg` (performance graphs)
  - `dishbrain_graphical_abstract.jpg` (paper's graphical abstract, from the Europe PMC supplementary zip)

**Footage:**

| File | Size / len | Codec | Transfer | Source / licence | Good moments |
|---|---|---|---|---|---|
| `dishbrain_neuron_videoS1_pong.mp4` | 600x600, 57 s | h264 | untagged | **Paper Video S1** (Europe PMC supplement). **CC BY 4.0**, credit Kagan et al., *Neuron* 2022. "paddle being controlled by the activity of living neurons". | **The real Pong game, clean**: white paddle and ball on black. Use all of it. Upscale or frame it (600 px). |
| `dishbrain_neuron_videoS2_spikestream.mp4` | 1920x1080, 65 s | h264 | bt709 | **Paper Video S2**, **CC BY 4.0**. SpikeStream visualiser. | 0-4 s title "Dishbrain Visualisation". 4-12 s electrode grid with captions ("sensory input" / "output (paddle up/down)"). 12 s "Each tile represents an electrode". **20 s** red spike burst. 24-62 s 3D electrode activity next to the game window. 44 s caption "significant improvement ... 0-5 vs 5-15 mins". Burned-in captions only, no logos. |
| `yt_yRV8fSw6HaE_Living_Human_Brain_Cells_Play_DOOM_on_a_CL1.mp4` | 1920x1080, 6:29 | **av1** | bt709 | **Cortical Labs' own channel**, standard YouTube licence. "cortical labs" bug top-right throughout. | **0:38-0:45 and 4:32** gloved hands sliding a CL1 unit out of a rack. 1:43 "From Pong to Doom" card. **~1:50-1:57 and 2:03-2:09 Pong game plus live electrode-activity grid** ("Real Neurons Gameplay"). **1:58-2:02 Kagan** on camera (lower-third). 1:17 and 3:01 green 3D electrode activity on a monitor. **5:10** microscope monitor showing neurons over electrode traces. 2:09/4:19 lab with **racks of CL1 units**. DOOM gameplay 0:25, 1:04, 3:53 (off-topic). Speakers: Alon Loeffler, Sean Cole, David Hogan (CTO), Azin Azadi. |
| `yt_EURpmKn49ps_Growing_Neurons_from_Stem_Cells.mp4` | 1920x1080, 8:13 | **av1** | bt709 | Cortical Labs' own channel, standard licence | Lab B-roll at 2:11-4:06 (centrifuge, microscope, pipetting). **6:01 MEA chip close-up with caption "MEA Chip: Multi Electrode Array Chip"**. **6:18-6:40** pipetting cells onto the chip. **6:50** neurons growing across electrode traces (monitor). **7:07** grey micrograph of neurons over the electrode grid (200 µm scale bar). 5:28 colourful immunostain. |
| `yt_3KeC8gxopio_This_computer_runs_on_living_human_brain_cells_R.mp4` | 1920x1080, 2:33 | vp9 | bt709 | **Reuters**, standard licence. Burned-in "Future of Health" title. | 0:00-0:10 CL1 unit (green and white) at a trade-show booth. 0:57 incubator. **2:04** neurons over electrodes, Cortical Labs software. **2:13** stack of CL1 screens (37.0 / 5.0 / 20.0). An unnamed Cortical Labs presenter talks at 0:47, 1:35, 1:54 (no lower-third). |
| `yt_9ksLuRoEq6A_Human_brain_cells_in_a_dish_learn_to_play_Pong.mp4` | 1920x1080, 59 s | **av1** | bt709 | **New Scientist**, standard licence. Burned-in yellow captions and NS logo; images credited to Cortical Labs. | 0:07 MaxOne chip in its holder. 0:22-0:33 Pong (captions). |
| `yt_BtEGAHxTj6k_Lab-grown_brain_cells_play_Pong_video_game_after_l.mp4` | 1920x1080, 74 s | h264 | bt709 | **South China Morning Post**, standard licence. Burned-in captions and logo; end card from 0:58. | 0:09-0:23 gloved hands loading the chip rig. 0:27-0:35 petri dishes with chips. 0:36 "800,000 ... Source: Cortical Labs" card. 0:55 microscope monitor showing neurons on electrodes. |
| `human_ipsc_neurons_4096_mea.ogv` | 1440x1080, 28 s | **theora** | untagged | Commons, Amin H et al. 2016, *Front. Neurosci.* doi:10.3389/fnins.2016.00121, **CC BY 4.0**. **Not DishBrain**: another lab's human iPSC neurons on a 4096-electrode array. | 0-4 s evoked response map with labels. **10-27 s** blue heat-map of spikes flickering (clean). Avoid 7-9 s (full-red frames). |

**For clean, free Pong footage use the paper's Video S1/S2 (CC BY).** The three news clips carry burned-in captions and logos and are standard-licence. Treat them as reference or fair-use only.

---

## Licence summary for credits

| Licence | Assets |
|---|---|
| CC BY-SA 4.0 (Tim Tim (VD fr)) | 5 clips: `physarum_aus_timelapse_1080`, `physarum_aus_timelapse_10h_2160sq`, `physarum_timelapse_growth_720sq`, `physarum_cytoplasm_flow_micro`, `physarum_terrarium_1080`; plus `physarum_tokyo_fig1_redrawn_fr.jpg` |
| CC BY 3.0 | `physarum_timelapse_to_food_720.webm` ("Phy sarum"); `dna_sequencing_3d_yourgenome.webm` (yourgenome) |
| CC BY 4.0 | `physarum_oatflake_to_roots.webm` (Ricigliano et al. 2015); `human_ipsc_neurons_4096_mea.ogv` (Amin et al. 2016); all `dishbrain_*` images and Video S1/S2 (Kagan et al. 2022) |
| CC BY 2.5 | `physarum_plasmodium.jpg` (frankenstoen); `ecoli_swarming_gfp_confocal.ogv` (Girgis et al. 2007) |
| CC BY-SA 3.0 | `adleman.jpg` |
| Public domain | `voigt.jpg`, `voigt_2.png` (ONR) |
| CC0 | `illumina_miseq.jpg` (Konrad Förstner) |
| Press photo | `erlich_zielinski_press.jpg` (New York Genome Center via EurekAlert, "Usage Restrictions: None") |
| Standard YouTube licence | the six `yt_*` files and `kagan_cortical_video_still.jpg` |

## Video technical notes
- **Timestamp accuracy:** clips under 75 s were sampled every 1-4 s, so their times are tight. For the long clips (DOOM, Growing Neurons, Reuters, yourgenome), times come from frames every 10-16 s, so treat them as **±10 s**. The exception is the Kagan/Pong span in DOOM (1:58-2:09), which was checked at 1 fps.
- **No HDR.** Transfers are bt709, smpte170m (Commons VP9) or untagged.
- **Codecs that may need transcoding** before a Chromium/HyperFrames render:
  - Theora: `ecoli_swarming_gfp_confocal.ogv`, `human_ipsc_neurons_4096_mea.ogv`
  - AV1: `dna_sequencing_3d_yourgenome.webm`, `physarum_timelapse_to_food_720.webm`, three of the `yt_*` files
  - VP9 inside `.mp4`: the Reuters clip
- Odd frame rates: `physarum_oatflake_to_roots.webm` (46.15 fps), `dishbrain_neuron_videoS1_pong.mp4` (50 fps), `dishbrain_neuron_videoS2_spikestream.mp4` (48 fps).
