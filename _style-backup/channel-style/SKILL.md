---
name: channel-style
description: The editing style of each of the user's YouTube channels (sea mammal and ocean documentaries, AI news and documentaries, senior exercise, space, true crime and others), and how to create a new style from reference videos. Use this whenever the user makes, edits, plans, scripts visuals for, or reviews a video for one of their channels, names a channel such as Unseen Kingdom, Unexplored Space, Crime Equator or Dr David Carter, says "my style", "channel style" or "edit like this", or shares a reference video to copy the editing from. Use it even if they only mention the topic, such as "make a whale video" or "chair exercises for seniors".
---

# Channel Style

Each channel has its own look, and viewers come back for it. An edit that drifts into a generic style hurts the channel even when it looks good by itself. Every style lives in its own file, built from videos the user chose.

```
channels/<channel-name>.md     one style guide per channel
references/style-template.md   the sections every guide has
references/pinterest-footage.md   how to find, download and place Pinterest footage
scripts/analyze_reference.py   measures a reference video
```

## Pick the job

- **Making or editing a video:** go to "Apply a style".
- **User shares references, or a channel has no guide yet:** go to "Build a style".
- **User corrects an edit** ("too fast", "wrong font"): make the fix, then go to "Keep guides current".

## Apply a style

1. Find the channel from the user's words or the topic, then read only that file in `channels/`. If the topic could fit two channels, ask which. Styles should not mix, so don't blend them.
2. If the channel has no guide, say so and offer to build one from references. Without a guide, any style you used would be a guess presented as the channel's look.
3. Before building, state the numbers you will edit to, such as shot length, hook pacing, caption style and loudness target, in a few short lines. This catches a wrong channel or stale guide before any render time is spent.
4. Build with the tool the project uses. For HyperFrames, load the `hyperframes` skill and `media-use`, whose rules still apply. The guide decides how the video should look, and those skills decide how to build it. For Pinterest footage, follow `references/pinterest-footage.md`, along with any other sources the guide names.
5. Check the result against the guide. Run `analyze_reference.py` on your render and compare its cuts per minute, average shot length and loudness to the guide's numbers. A film that moves one camera between scenes shows almost no cuts, so count its camera beats from the code instead. Look at the contact sheets too. Report any real difference instead of calling it on style.

## Build a style

Work on one channel at a time. Ask for 2 or 3 reference videos and what the user likes in each. "The captions from this one, the pacing from that one" is worth more than any measurement, because it separates what they want from what happens to be in the video.

**1. Measure each reference.** Keep results outside the skill folder, because the videos are large:

```bash
python -I "<skill-dir>/scripts/analyze_reference.py" "<url-or-file>" --out "<working-folder>/style-refs/<channel>/<ref-name>"
```

**2. Look at the frames.** Read `report.md`, then open `hook.jpg` and each `overview-N.jpg`. Note framing, shot types, colour, text, footage sources and how scenes are structured.

**3. Look closer at anything the sheets can't show.** Sheets show a moment, not motion. For a transition, caption animation or lower third, pull frames around it from `reference.mp4`, every 0.1 to 0.2 seconds, and read them in order:

```bash
ffmpeg -y -ss <start> -t <seconds> -i reference.mp4 -vf "fps=8,scale=480:-2,tile=4x4" -frames:v 1 -q:v 3 closeup-<name>.jpg
```

**4. Get the words.** Fetch subtitles with yt-dlp (`--write-auto-subs --skip-download`) to see how narration pacing and structure relate to the visuals.

**5. Be honest about what you can't perceive.** You can measure loudness but you can't hear the audio, so music mood, sound effects and voice character need another source. Ask the user to describe them. If they want it analysed, `vidiq_video_watch` can do it, but it costs 25 vidIQ credits per video, so ask first. A guessed music style sends the channel in the wrong direction and nobody will notice why.

**6. Write the guide.** Copy `references/style-template.md` to `channels/<channel-name>.md` and fill every section. Mark each fact as one of these, because they deserve different trust when editing later:

- `[measured]` from the script, with the number
- `[seen]` observed in frames, with the timestamp
- `[user]` said by the user
- `[unknown]` not established, with what would settle it

Where references disagree, give the range and follow the one the user preferred. Be specific enough that two editors would produce the same result: "white Montserrat Bold, 64px, lower third, pops in over 0.2s" rather than "clean captions".

**7. Show the user before calling it done.** Summarise the style in a few lines, list the `[unknown]` items, and ask what's wrong. Then offer a short test edit, because that's the real test of a guide.

## Keep guides current

When the user corrects an edit, the correction usually applies to every future video too. Add it to the guide's "Rules from feedback" with the date, and mark it `[user]`. If it contradicts an earlier line, change that line, because a guide that argues with itself gets ignored. If it might be a one-off, ask.

## Copying style, not content

Pacing, structure, text treatment and grade can all be copied from a reference. The footage, music and narration are the reference creator's own work, so don't reuse them in the user's videos. Also point out anything so close to one channel's branding that viewers could mistake the two.
