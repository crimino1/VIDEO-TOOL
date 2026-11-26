# AI Equator editing style

Version 2, 2026-11-09. The main look now comes from the DeepSeek Harness reference the user chose as "main editing style" `[user]`. The three earlier references (Fireship Code Report x2, AI news round-up) now only supply the spice layer: memes, stickers, CEO cutouts. Version 1 is kept at VIDEO-TOOL\style-refs\ai-equator\guide-v1-2026-11-07.md. No test edit of version 2 yet.

Marks: `[measured]` from the analysis scripts, `[seen 3:20]` from frames, `[user]` said by the user, `[proposal]` my choice that the user has not approved, `[unknown: what would settle it]`.

## Summary
AI news and explainers: model and agent launches, benchmarks, the AI bubble, company money stories `[user]`. The look is a calm, premium tech explainer: near-black stage with a faint navy glow, thin-outlined UI cards and diagrams that build piece by piece, blue for the key word, orange handwritten notes with little arrows, and soft blur dissolves between scenes instead of hard cuts. On top of that clean base AI Equator adds what the user asked for: the real thing being talked about (downloaded demo and review clips, tweets, screenshots), logos, founder and CEO photos, and a meme now and then to keep it fun `[user]`.

## References
| Video | File | Role | Length |
|---|---|---|---|
| NEW DeepSeek Harness - Super Agent! (Sam Witteveen) | VIDEO-TOOL\references\deepseek-harness.mp4 | **Main style** `[user]` | 17:52, 60 fps |
| Did the AI bubble just pop? (Code Report) | Downloads\vidssave.com Did the AI bubble just pop_ 720P.mp4 | Spice: memes, stickers, joke captions | 5:24 |
| The one thing holding theoretical CS together just broke (Code Report) | Downloads\vidssave.com The one thing holding theoretical CS... 720P.mp4 | Spice | 6:00 |
| AI finally sleeps... AI NEWS round-up | Downloads\vidssave.com AI finally sleeps... 360P.mp4 | Website recordings, demos | 53:53 |

Measurements, frames and transcripts: VIDEO-TOOL\style-refs\ai-equator\ (main reference in deepseek-harness\).

## Pacing
- No hard cuts at all: the cut detector found 1 shot in 17:52 `[measured]`. Every scene change is a blur dissolve on one continuous dark stage.
- Visual beats (something new builds or the scene changes): about 9 a minute, median 4.8 s apart; big scene changes about 3.4 a minute, median 9.8 s `[measured from frame differences]`. Same rate in the hook and later, so it is steady rather than front-loaded.
- Inside a scene, one new element lands on each phrase that names it: card, then arrow, then step, then note `[seen 0:02-0:08]`. So the screen changes every 1 to 3 s even though scenes last about 10 s.
- Narration about 187 words a minute, conversational, with no pause over 1 s `[measured]`.
- AI Equator videos run 8 to 15 minutes for one topic `[proposal: the reference is 18 min; settle with the user]`.
- Spice beats (meme, CEO photo, demo clip) every 30 to 60 s so it never feels like a slideshow `[proposal, from the user's ask]`.

## Hook (first 30 seconds)
- Opens straight on the claim as a quote: "The answer to Claude Code" in big white type, quote marks and underline in orange, company logo small above `[seen 0:00]`.
- Within 2 s the real product appears as a simple built diagram of what it does (issue, session, pull request) with one orange note: "you never open a chat" `[seen 0:02-0:08]`.
- Then the turn: "How they built it" with the key words in blue `[seen 0:10]`.
- AI Equator hook `[proposal]`: quote or headline card, the real demo clip or tweet within 5 s, one meme or CEO reaction by 15 s, then the "here's what really matters" turn line.

## Video structure
Seen in the main reference:
1. Hook with the quote and a 10-second picture of what the thing does.
2. Context: launch card (logo, name, "Released Aug 13, 2026"), the GitHub page, a star counter ticking up `[seen 0:22-0:44]`.
3. The source: the tweet or article as a card with its real numbers (replies, reposts, likes, views) `[seen 1:30]`.
4. Explain how it works: diagrams that grow one box at a time, quoted lines from the docs with the source under them `[seen 6:00-11:00]`.
5. Benchmarks: bar rows and before-to-after numbers (6.4 -> 1.6) with the source line under them `[seen 4:40, 12:00]`.
6. Limits and risks: three red-cross cards ("Security: prompt injection, credential leaks, device permissions") `[seen 16:40]`.
7. Wrap-up: the architecture in one picture, then a list of links (repos, paper, site) `[seen 17:10-17:50]`.
AI Equator adds: a meme or reaction at each section change, and a short subscribe card at the end `[proposal]`.

## Visual sources
In the main reference, about 70% is built graphics, 30% real material shown as cards `[seen]`. AI Equator raises the real share to about 50% because the user wants downloaded clips, tweets and photos `[user]`:
- **Built graphics:** UI cards, flow diagrams, bar charts, number counters, quotes. HyperFrames.
- **Demo and review clips:** the company launch video, or what people built and posted on X or YouTube, downloaded with yt-dlp, 3 to 10 s per use, inside a rounded card with a source line `[user]`.
- **Tweets:** the real post as a dark card with avatar, handle, verified tick and real counts `[seen 1:30][user]`.
- **Screenshots and scrolls:** GitHub, docs, papers, product pages, dimmed slightly, with an orange hand-drawn circle on the part that matters `[seen 8:00, 17:00]`.
- **Logos:** small, white or full colour, next to the product name and in comparison lists `[seen 3:40]`.
- **People:** founder and CEO photos (press kit, Wikimedia Commons, their own posts), as a round or rounded-square card with a name and title line `[user]`. A creator's channel page appears when their video is cited `[seen 4:00]`.
- **Memes:** a well-known reaction image or short reaction gif on a card, 1 to 2 s, never more than one a minute `[user][proposal for the rate]`.

## Shots and camera
- One 16:9 stage. The camera never moves; elements fade or slide a few pixels into place `[seen]`.
- Layouts: one big quote centred; a row of 2 to 4 cards joined by thin arrows; a grid of small labelled boxes; a big number centred `[seen]`.
- Cards are small and leave lots of empty dark space around them, about 40 to 60% of the frame used `[seen]`.
- Screenshots and clips sit at 50 to 65% of frame width in a card, never full screen `[seen 0:25, 8:00]`. A vertical clip stays vertical, centred.
- Older elements dim to about 30% when the next one lands, so the eye goes to the new thing `[seen 0:04-0:06]`.

## Transitions
- **Default:** blur dissolve. The old scene blurs out and fades as the new one fades in, about 0.5 to 0.7 s `[seen 0:09-0:11]`.
- **Inside a scene:** each new element fades in with a small upward slide, about 0.3 s, ease-out `[seen 0:10-0:13]`.
- **Counters:** numbers count up to their value, about 1 s `[seen 2:10-2:12, star count 145,065 -> 267,805]`.
- **Strike:** an orange X draws over something that is wrong or replaced `[seen 1:50]`, and a strike-through with a handwritten replacement ("the usual") `[seen 15:50]`.
- No glitch, whoosh-pan or flashy transitions in the main look. Keep the Code Report scan-line glitch only for a meme punchline `[proposal]`.

## Colour and texture
- Stage: black `#000000` to `#000003` `[measured]`, with a few large soft navy blobs and a faint blurred grid of squares behind, about `#0B1530` at low opacity `[seen]`.
- Text: white `#FFFFFF`, secondary grey about `#8A8F98` `[seen]`.
- Key-word blue: about `#5090F0` (for example "Harness", "Agent", "1.6") `[measured]`. Selected box: blue outline with a dark navy fill `[seen]`.
- Handwritten notes and underlines: orange about `#F0A818` `[measured]`.
- Good: green `#3FB950` ticks and "Ready for review"; bad: red `#F85149` crosses and "-3" `[seen]`.
- Card: fill slightly lighter than the stage, about `#0D0F14`, 1 px border about `#2A2E37`, radius about 8 px `[seen]`.
- No grain, no vignette. Clips keep their own colour.

## Text on screen
Font choices `[proposal: the reference fonts look like a geometric sans, a mono and a marker hand; these are free matches]`:
- **Headline / quote:** Inter Bold, 96 to 120 px, white, key words blue, tight letter spacing, centred `[seen 0:00]`.
- **Card titles:** Inter SemiBold 36 to 44 px white; labels Inter Regular 28 px grey.
- **Code and IDs:** JetBrains Mono 26 to 30 px (`work/482`, `tool-bash`), blue for IDs `[seen]`.
- **Handwritten note:** Caveat 40 to 48 px orange, 3 to 5 words, with a small hand-drawn arrow to its target `[seen 0:06, 4:40, 9:30]`.
- **Source line:** Inter 22 px grey under every quote, number or screenshot, for example "DeepSeek · Super Agent design article (as reported)" `[seen 12:00]`.
- **Big numbers:** Inter Bold 160 to 200 px, an arrow between old and new, new value blue, small green or red arrow `[seen 12:20]`.
- No word-by-word captions. Words on screen are labels and quotes only `[seen]`.

## Graphics
- **Flow diagram:** cards joined by thin grey arrows, each step appearing as it is said, steps tick from grey ">" to green "✓" `[seen 0:04-0:08]`.
- **Grid of options:** rounded pill tabs and box grids, the chosen one blue-outlined, the rest dimmed, turned-off ones dashed with an orange "off" `[seen 6:00, 9:30]`.
- **Bars:** thin grey bars, the hero bar blue, value at the end, logo at the start of each row `[seen 4:40]`.
- **Gauges:** small half-circle meters with a range under them `[seen 5:40]`.
- **Balance and comparison:** simple line drawings, like a seesaw "Model vs Harness" `[seen 3:20]`.
- **Links list at the end:** GitHub icon, repo path in mono, one grey line under it `[seen 17:40]`.

## Spice layer (from the earlier references, used sparingly)
For energy, about once a minute `[user asked for memes; rate is proposal]`:
- A meme or reaction card that lands with a small pop, 1 to 2 s.
- A CEO or founder cutout sliding in from the edge beside a quote card, with a name plate.
- A slightly rotated logo sticker on a big moment.
- A one-line sarcastic caption in the handwritten orange style instead of the old chunky cream type, so it fits the clean look.

## Sound
- **Loudness:** the reference reads -20 LUFS with a very narrow range of 2.3 LU `[measured]`. Deliver at -14 LUFS for YouTube `[proposal]`.
- **Voice:** one conversational narrator, about 187 words a minute, no long pauses `[measured]`. The user will supply the voiceover `[user]`. Voice stays at 100%, everything else low `[user, rule 2026-11-07]`.
- **Music:** `[unknown: the user should describe it or pick a track by ear; I can't hear the reference]`. Do not pick a bed without approval `[user, rule 2026-11-07]`.
- **Effects:** `[unknown]`. Default proposal: a soft click when a card lands, a tick on counters, a small pop on memes, nothing on blur dissolves.
- **Tools (2026-11-23):** no music, unchanged. Effects stay sparse (about 2 a minute) and only on a visible cause. Take them from `sfx-library/openverse` (soft whoosh, pop, click, impact, shutter), placed by real-sfx with `--voice-safe`, or from earshot when nothing fits. Keep the voice untouched.

## Do and don't
Do:
- Show the source for every claim, with outlet and date readable.
- Highlight the exact line being read.
- Keep the stage dark, and the documents real.
- Credit every clip from X or another person on screen with their @handle, and link it in the description.

Don't:
- Copy the Code Report logo, its date card, its custom font, "This has been the Code Report", or the "AI never sleeps" slogan. Viewers must not mistake AI Equator for those channels, so its colours and logo need their own touch.
- Copy the main reference creator's intro, channel name or exact layouts of a specific scene. Take the grammar (dark stage, built cards, orange notes, blur dissolves), not their scenes.
- Fake a real person's words, tweet, article or benchmark. A joke must read as a joke.
- Make realistic fake images or videos of real people. The references do use face-swaps and crude captions; leave those out unless the user decides otherwise, as they risk YouTube strikes and legal complaints.
- Stretch a clip or mix aspect ratios beyond the centred vertical clip.
- Show a stock price or claim without checking it against the primary source first.

## Build notes
- **Master:** HyperFrames at 1920x1080, 30 fps. Set up like VIDEO-TOOL\schrodinger, with a shots file and a build script.
- **Paper or article shot:** `node ai-equator\tools\capture.mjs shot <url> out.png --highlight="exact words"`. Rendered at double pixel density, so zooms stay sharp. Tested on arXiv.
- **Website recording:** `capture.mjs scroll <url> out.mp4 --seconds=8 --px=1400`. It renders frame by frame, so it is perfectly smooth. Tested on Hugging Face.
- **Tweet card:** `capture.mjs tweet <id> out.png`, dark theme, transparent corners, from X's official embed. Tested. Direct x.com pages can show a login wall.
- **Benchmarks:** the same shot or scroll tool on Artificial Analysis, LMArena and each lab's own page. Tested on Artificial Analysis. Use a real page with a highlight, and never retype numbers into a fake table.
- **Demos people built:** find posts on X, then `.venv\Scripts\yt-dlp.exe <post url>`. Tested by looking up two real Seedance posts without downloading. Also works for YouTube. Company demos come from the launch page.
- **Sign-ins:** a site that needs a login gets captured only after the user signs in, in their own browser.
- **Cutouts:** `npx hyperframes remove-background` on a photo. Not yet tested here.
- **Logos:** the company's own press or brand page first, then Simple Icons (SVG) or Wikimedia Commons. Keep them as SVG or large PNG with transparent background.
- **Founder and CEO photos:** Wikimedia Commons (check the licence, credit in the description), the company's press kit, or a frame from their own keynote or interview video. Never a generated face.
- **Memes:** well-known reaction templates (Pinterest per references/pinterest-footage.md, or imgflip templates). Search with the lor-tools pinterest_search and download_video tools. Keep each 1 to 2 s, never about a private person.
- **Review and demo clips:** YouTube reviews and X posts with `.venv\Scripts\yt-dlp.exe --download-sections "*start-end"`, short sections only, credit the @handle on screen. Pattern: ai-equator\crash\tools\get_clips.sh.
- **Asset folder per video:** assets/raw (downloads), assets/cards (screenshots, tweets), assets/people, assets/logos, assets/memes, plus credits.txt for the description.
- **Rights:** other people's clips and screenshots are used for commentary and news, with credit, kept short. This reduces but does not remove claim risk. Keep a source list per video for the description.

- **Test edit:** VIDEO-TOOL\ai-equator\test60 (build.py times every beat to a word from words.json) is the project to copy. Rendered 2026-11-07, 61 s, about 1.5 min to render.
- **Fact check found live:** the Artificial Analysis page showed 60 where Google's post said 59. Check live pages against the script before recording the voice.
- **Levels:** normalise the voice before the mix. In the test, voice about -16 LUFS, bed about 15 dB under it, impacts at 0.2 to 0.3 volume.

## Rules from feedback
- 2026-11-07: first real video: use lots of real video, images and X posts; no bad animation or slop; blackish background; Mac-style high-quality screenshots and screen recordings; the logo reads "AI EQUATER" (white on black circle); voice stays at 100%, everything else low `[user]`. Project to copy: VIDEO-TOOL\ai-equator\crash (build.py, tools/mix.py keeps the voice untouched, music 22 dB under it).
- 2026-11-07: the test edit's background music ("Investigations" by Kevin MacLeod) was "very bad, not even normal". Do not use it. Do not choose a bed without the user's approval; ask for a track or send options to pick by ear `[user]`.
- 2026-11-07: the user wants 2 to 3 real videos every week, with topics from recent AI news `[user]`.
- 2026-11-07: use website screen recording, screenshots of people's tweets, benchmarks, images from the internet, and where possible record or download what people already built with a model from X or elsewhere `[user]`.
- 2026-11-09: the DeepSeek Harness video (dark navy motion-graphics explainer) is now the main editing style. Also download the real videos of the thing being reviewed, show tweets, logo images, founder and CEO photos, and a meme sometimes, to keep it engaging. The user supplies voiceover and topics; transcribe the audio and cut to it `[user]`.
- 2026-11-09: no background music at all. Sound effects only, and only where something on screen needs one (about 14 in a 6-minute video: memes, the big reveal, section changes) `[user]`. Project to copy: VIDEO-TOOL\ai-equator\cyber (lib.py helpers for the v2 look, scenes1/2.py timed to the transcript, tools/mix.py).
- 2026-11-12: show every video clip at about 80% of the screen (1536x864, centred); everything else in the style stays the same `[user]`.

## Rule from feedback, 2026-11-18: white editorial look, no overlaps, cleaned voice
The user asked for a white background everywhere ("no dark neon slop, only white"), very high quality, and said earlier animations overlapped or looked bad. They also asked for the voice to be cleaned and long pauses removed.
- Look: pure white page, ink type (Inter), one blue accent #1D4ED8, red #B91C1C for negatives, amber "source check" cards. Real pages sit in light browser frames, tweets are light cards (capture.mjs tweet --light), and OpenAI's black charts sit in clean frames next to white bar charts rebuilt from the numbers. No glow, no grid, no blur dissolves, no Caveat hand notes.
- Layout: kicker + title header, then a flex body (rows and columns), with sources at the bottom. Nothing is hand-placed. Scenes don't cross-fade: each one is fully out by its end time.
- Clips are still at 80% (1536x864); captions stack bottom-left inside the frame as white pills.
- QA before render: tools/overlap.mjs (overlaps, off-frame, text spilling or wrapping) + hyperframes check + end-of-scene and post-cut snapshots.
- Voice: tools/clean_voice.py (0.25 / 0.4 / 0.55 s pauses, EQ, de-ess, -15 LUFS).
- Project to copy: ai-equator\oai (GPT-6.2 Astra review).

## Script style, from feedback 2026-11-24: hands-on tester, not narrator
The user called my GLM-5.4 script "very bad" and pasted a competitor's script (a Gemini 4 Neon review) as the pattern to copy `[user]`. The full pasted text is kept at VIDEO-TOOL\style-refs\ai-equator\script-ref-neon-review.txt. Copy its **structure and voice**, never its sentences.

**Voice: a real person who used the model, talking to a friend.**
- First person, present tense, casual: "So here's my prompt.", "All right, next.", "Let's see how good it is at...", "And that's pretty much it. Here's the final result."
- Honest gut reactions, both ways: amazed ("I cannot believe it pulled that off"), let down ("that looks pretty awful"), confused by jargon ("I have no idea what this means").
- Plain spoken words, short sentences, normal fillers (so, basically, pretty, really, kind of). No writerly lines like "the pace has been ridiculous", "changes the math for everyone" or "here's the catch". No narrator voice.
- Opinions with reasons. Say what I like and don't like: "too verbose", "no citations", "I prefer GPT's answer here".
- A running comparison anchor: the model reviewed last ("which I reviewed yesterday") and the current best model.

**Structure (about 70% tests, 30% specs):**
1. **Hook, 20–30 s.** The news in one breath (who released what, and what came just before it), one personal aside, then what the video covers ("I'm going to test this with really difficult prompts, plus specs, cost, performance and benchmarks"), then one striking claim ("even beats Opus and GPT-6.2 at agentic coding").
2. **"Benchmarks are boring, so demos first."** One line on where I'm running it (app, chat, or the best agent harness, and why).
3. **Hard demos, one after another.** Each one follows the same beat:
   - The prompt, read in plain words, and what makes it hard.
   - The settings I picked.
   - How long it worked ("it worked for 17 minutes").
   - The follow-up prompt when I wasn't happy ("it looked basic, so I wrote: add more detail...").
   - The final result shown or played.
   - A specific verdict: what's right, the exact flaw ("only the last transition is off"), and how it compares with the anchor model.
   - Mix the domains: computer use, video, education explainer, music, 3D game, Blender, and at least one where it fails.
4. **Quick chat-interface tests.** Short image or knowledge tests (find a hidden animal, medical scans scored out of N, deep research, new ideas), each with a score or a clear pass/fail.
5. **Sponsor slot** mid-video, only if the user has one; otherwise skip it.
6. **Usage and limits:** how much of my plan the tests used.
7. **Benchmarks, one at a time.** "If you look at X, which measures Y, it ranks number 2, even beating Z." Always explain the benchmark in one plain clause, give the margin, call out surprises, and include where it loses.
8. **Price and availability:** which plan, API, AI Studio.
9. **Wrap:** my honest overall take in two or three lines, then like / comment / subscribe and "let me know in the comments what you think".

**What this needs from production:** real test footage. The user's own screen recordings of each test (as in astrafable), or demos from the launch page and X labelled as such. Without the user's own tests, say so plainly in the voice ("I haven't got access yet, so here's what Z.ai and early testers showed") and keep the same tester tone, rather than switching to narrator mode.

**Length:** the reference runs about 4,300 words, roughly 23 minutes. Fit the number of tests to the voice budget: about 1,000 characters is one minute.
