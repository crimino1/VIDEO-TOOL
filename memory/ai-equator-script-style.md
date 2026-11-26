---
name: ai-equator-script-style
description: "2026-11-24 feedback - AI Equator scripts must sound like a hands-on tester (competitor's Gemini Neon review is the pattern), not a narrator"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 10b135ce-c154-4b5f-a545-46f4c14e33de
  modified: 2026-11-24T10:23:34.630Z
---

The user said my GLM-5.4 script was "very bad" and pasted a competitor's script (a Gemini 4 Neon review) as the pattern for AI Equator scripts. The full breakdown is in the channel-style skill (channels/ai-equator.md, "Script style"); the pasted text is at VIDEO-TOOL\style-refs\ai-equator\script-ref-neon-review.txt.

**Why:** my script was a writerly narrator explainer ("the pace has been ridiculous", "changes the math"). Theirs is a real person testing the model: casual first person, honest gut reactions, many hard demos, then benchmarks explained one by one.

**How to apply:**
- Structure: hook (news, aside, what's covered, one striking claim), then "benchmarks are boring, demos first". Hard tests follow, each told as prompt → why it's hard → minutes worked → follow-up prompt → result shown → specific verdict compared with the last model reviewed. Then quick chat tests, usage, benchmarks with a one-clause explanation each, price and plans, and an honest wrap with a CTA.
- Tests need footage: the user's screen recordings, or launch-page and X demos labelled as such. Say so in the voice when I haven't tested it myself.
- Never copy the competitor's sentences, only the shape and tone.
- Voice (2026-11-24, Inkling video): the user asked for a "normal good" voice, "no shouting". I switched back to eleven_multilingual_v2 with no tags, and assemble_vo.py now levels every paragraph to the same speech RMS before a gentle compressor. Ask before going back to eleven_v3 tags.

Related: [[ai-equator-channel]], [[ai-equator-white-style]].
