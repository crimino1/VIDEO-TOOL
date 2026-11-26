---
name: health-voice-api
description: "User's ai33.pro ElevenLabs key: ONLY for the health channel, max 5,000 characters per day, always via tools/health_tts.py"
metadata:
  node_type: memory
  type: feedback
  originSessionId: b354c296-90c4-4934-b758-f14141f567d7
  modified: 2026-11-09T20:07:52.430Z
---

The user gave an ai33.pro API key (stored as AI33_API_KEY in VIDEO-TOOL\.env, never print it) for voiceover. Rules they set on 2026-11-10, to follow strictly:
- Use it only for the health/workout channel, never for other channels.
- At most 5,000 characters per day, emotion tags included. Use "a little bit" of voice: short cues, not long narration.
- Voice elevenlabs_1qz7q3ZW54FIyiWDvo33, model eleven_v3 with [emotion] tags, speed 0.94.

**Why:** it is the user's paid key; they asked for a hard daily limit.
**How to apply:** always call `.venv\Scripts\python.exe tools\health_tts.py --channel health <text.txt> <out.mp3>`. It enforces the cap with a ledger in health-voice\usage.json, waits 10 s between requests, and slows to 0.94 locally (the API ignores speed fields). Check `--usage` before planning a voiceover; if a script needs more than what's left today, split it across days or ask. API facts: POST https://api.ai33.pro/v3/text-to-speech {text, model_id, voice_id} returns a task id; poll GET /v1/task/{id} for metadata.audio_url; GET /v1/credits shows balance (about 1.1 credits per character). Related: [[health-workout-style]].

Exception (2026-11-23): the user themself gave the same key for an AI Equator video with its own budget, at most 17,000 characters for that video, Lucius voice. That runs through tools/aieq_tts.py (key AIEQ_TTS_KEY in .env, per-project ledger), see [[ai-equator-channel]]. It does not lift the health-only rule for other channels: use the key outside health only when the user hands it over again for that video. On 2026-11-23 the user again handed it over for a second AI Equator video (GLM-5.4) with ~5k characters left; balance after: about 1,000 credits.
Exception (2026-11-26): the user gave the Akira voice ID (elevenlabs_aHYS10erl9IGphnXtDeD) for the new Cutaway Survival Shorts channel and asked for the voiceover. Ran through tools/aieq_tts.py with a 3,000-char per-short ledger (waterfall: 977 chars, 1,094 credits). See [[cutaway-survival-channel]].
