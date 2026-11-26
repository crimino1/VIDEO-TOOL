---
name: ai-equator-channel
description: "AI Equator is the user's AI news channel; style guide v2 (DeepSeek Harness dark-navy explainer look) set 2026-11-09, waiting on voiceover and topic"
metadata:
  node_type: memory
  type: project
  originSessionId: 10b135ce-c154-4b5f-a545-46f4c14e33de
  modified: 2026-11-13T18:32:26.866Z
---

The user named a channel "AI Equator" on 2026-11-07, for AI news, the AI bubble and similar stories. Style guide: channels/ai-equator.md in the channel-style skill. On 2026-11-09 the user made the DeepSeek Harness video (Sam Witteveen, copy at VIDEO-TOOL\references\deepseek-harness.mp4) the main editing style: black stage with navy glow, built UI cards, blue key words, orange handwritten notes, blur dissolves, no hard cuts. The old Fireship-style guide (v1) is at VIDEO-TOOL\style-refs\ai-equator\guide-v1-2026-11-07.md and now only supplies memes, stickers and CEO cutouts.

The user also wants in every video: downloaded clips of the thing being reviewed, tweets, logos, founder and CEO photos, and memes sometimes. The user will supply the voiceover and topic; transcribe it and cut to the words. Capture tools: ai-equator/tools/capture.mjs; clip downloads: ai-equator/crash/tools/get_clips.sh.

First v2 video rendered 2026-11-09: ai-equator\cyber (GPT-6 Cyber, 6:21), no music by the user's rule, 14 SFX. Not yet reviewed by the user. OpenAI pages need capture.mjs with --keep (the --mac cleanup blanks openai.com) and --rm=div.fixed.bottom-0 for the cookie bar. A build script full of exploit-like on-screen detail (IP addresses, exploit filenames) got blocked once, so keep hacking graphics abstract.

Second v2 video 2026-11-10: ai-equator\fable (Claude Fable 5.2 Review, 7:14), same lib/scenes/mix setup, tweet() helper added to fable/lib.py. anthropic.com pages need capture.mjs --until=load (looping videos never reach network idle) and --rm=#consent-banner. A general-purpose subagent finding X post ids (verified via fxtwitter) worked well; tweet cards via capture.mjs tweet <id>.

Third v2 video 2026-11-11: ai-equator\jensen (Nvidia CEO affair + spy probe, 7:08). For scandal stories about real people I left out: photos of the accused woman and of his family, AI-made "deepfake" meme clips of real people, and memes dragging in the family. Allegations labelled "reported"; the memo shown from Nvidia's own newsroom page. A full-frame vcard sits on a root layer above its scene, so text over it needs a second scene with the same times.

Fourth v2 video 2026-11-12: ai-equator\carbon (Gemini 4 Carbon, 14:08). New user rule: every video clip at ~80% of the screen (clip80() in carbon/lib.py, 1536x864 at 192,88; notes go in a second overlay scene on dark pills). The user now sends a source list with the transcript. Before rendering, check each clip's first frames: a cut a second off showed the wrong shot.

Fifth v2 video 2026-11-14: ai-equator\brain (AI Can Now Edit Another AI's Brain, 11:31). The user asked for 2D animation explainers "where needed" and sent a reference (chunky bean cartoon people). Built an original kit: brain\toon.py (bean people/robots, neuron brain, motion helpers) + brain\props.py (bubbles, weight grid, dials, game icons, Go board, car, pipe). Reuse both for AI Equator explainers. No transcript was sent: brain\tools\transcribe.py makes words.json; the voiceover began with a stray assistant line, which I trimmed (vo_full.mp3 kept).

Sixth v2 video 2026-11-17: ai-equator\qwen (Qwen 4 Max Is HERE, 8:50). Audio only, no transcript: transcribed it. The voiceover had facts the sources contradict (Qwen4-Max size, AA decimals, who is in Alibaba's chart, row count), so I kept the voice and added orange "source check" cards (fix() in qwen/scenes1.py) and told the user they can re-record those lines. alicdn images time out from this network: take charts from the X post photo (pbs.twimg.com). lib.scene() now adds a slow 1.03 push on long non-video scenes, which clears the dead_stretch lint; bars() takes dec/suf/vmax for non-percent scores. qwen/props2.py has a pelican-on-bike, kebab rotisserie and race_bar.

Seventh video 2026-11-18: ai-equator\oai (GPT-6.2 Astra review, 8:49). The user switched to a WHITE look and asked for no overlaps and a cleaned voice; see [[ai-equator-white-style]]. scenes.py times every beat with W("spoken phrase"), which looks the phrase up in words.json. openai.com blog pages return 500 to capture; system card pages capture with --until=domcontentloaded. Tweet cards use capture.mjs tweet --light.

Eighth video 2026-11-19: ai-equator\google ("Google Was Losing the AI Race. Then It Did This.", 9:06, white style). This is the newest kit to copy. Adds tile() (periodic-table tiles: Ar/C/H/Ne with real atomic numbers) and timeline() to lib.py; clean_voice.py and overlap.mjs live in tools/. scenes.py W() now matches whole words only: the old version matched "yes" inside "yesterday" and put a beat 3 s early. Google blog charts download fine from storage.googleapis.com, and model-card PDFs render with fitz.

Ninth video 2026-11-20: ai-equator\deepseek (DeepSeek V5 leaks fact-check, 10:26, white style). This is now the newest kit to copy. It adds code() (real source lines in a light panel; highlights light up on time), verdict() badges and check_row() scorecard rows. W() now searches from the latest scene's start (lib.CUR), and scene() raises an error if a scene is empty or backwards. Without that, repeated phrases ("biggest bet") had made scenes run backwards and stay on screen; the linter's content_overlap caught it, and overlap.mjs alone did not. 480p X GIF clips go into a 2×2 grid video instead of being blown up to 80%.

Tenth video 2026-11-21: ai-equator\riemann (AI claims a Riemann Hypothesis proof, 6:29, white style). The user asked for a "little" quality lift, so this one adds mathviz.py: real math drawn as animated SVG from mpmath values (zeta zeros on the critical line, |ζ(½+it)|, the prime staircase against Li(x)), with matplotlib and mpmath now in .venv. Quotes are shown on the source PDFs themselves, highlighted with fitz add_highlight_annot (search_for misses phrases that cross a footnote marker, so split them). WordPress blogs (Tao, Vakil) block the capture bot with a human check, so use quote cards instead. Wikimedia sends 429 when hit too fast; take a still from a clip instead. Crop out burned-in captions in X clips (crop=(1600,900,160,0)).

Still open: video length (proposed 8 to 15 min; the user's own voiceover set 6 min), fonts (proposed Inter, JetBrains Mono, Caveat).

**Why:** the guide marks these as unknown or proposal. **How to apply:** settle them on the first v2 video, and offer a short test edit. See [[video-toolchain]].
