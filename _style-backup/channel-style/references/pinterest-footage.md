# Getting footage from Pinterest

The working pipeline from the shark film, `C:\Users\daggu222105\video\sharks`. It used 39 clips from 31 Pinterest videos, on screen for 43% of an 8-minute film. Reuse these tools rather than rewriting them: copy `tools/` into the new project and run everything from the project folder.

## Steps

1. **Write short searches.** One line per search in `stock/queries.txt`, as `key|query`. Keep them to one to three words, such as `orca|orca` or `killer|killer whale`. On the shark film, 32 long searches found 0.4 videos each and 27 found nothing, while 16 short ones found 21 each and none came back empty. Say what the shot should show afterwards, when picking from the thumbnails.

2. **Search.**
   ```bash
   node tools/lor_search.mjs stock/queries.txt stock/results.json
   ```
   Each search tries 16:9, 9:16, 4:5 and 1:1, with a 480p minimum. Accepting every shape matters, because only about 1 in 9 Pinterest videos is landscape.

3. **Make thumbnail sheets.**
   ```bash
   python -I tools/thumbs.py
   ```
   This keeps up to 14 videos per search, 16:9 first and then by reactions, and skips anything under 3 seconds. It writes `stock/cands.json` and `stock/sheetN.jpg`, with each thumbnail labelled like `orca#3`. `thumbs.py` lists its input files on line 4, so change that list to match your results files.

4. **Pick by eye.** Read the sheets and choose clips that show what the script says. Reject anything with a logo, a watermark, burned-in text or a handle.

5. **Download.**
   ```bash
   node tools/lor_download.mjs orca#3 killer#1 shark#2
   ```
   Saves to `stock/raw/<key>_<i>.mp4` and records each source pin in `stock/sources.json`.

6. **Check what arrived.**
   ```bash
   python -I tools/clipsheet.py
   ```
   Writes `stock/clips.jpg` with three frames per clip and `stock/info.json` with real sizes. Trust these sizes, not the search results.

7. **Trim and place.** Edit the table at the top of `tools/build_clips.py`: id, source, in-point, film time, seconds on screen, display width, optional crop. It adds a light grade (saturation 0.92, contrast 1.03), slows a clip rather than running out of footage, and writes the `<video>` tags into `index.html`. Delete the part below the clip loop that handles the shark film's research paper, and keep only the clip info and tag writing.

8. **Check the trims.**
   ```bash
   python -I tools/scan_clips.py
   ```
   Writes `stock/scan.jpg` with six frames from each trimmed clip, to catch a logo or a bad moment.

9. **Record sources.** From `stock/sources.json`, write `stock/pinterest-sources-NOT-licensed.txt`, listing only the clips actually used, with pin links.

## Showing non-16:9 clips

Of the 39 clips, 22 were wide, 8 close to square and 9 vertical. Vertical and square clips are not cropped to fill the screen. They sit as framed cards (12px border `#efeadc`) beside a word or number, so the rest of the frame stays useful. Crop only when the subject still reads well.

## Rights

Pinterest does not tell you who owns a video or what you may do with it. Treat every clip as unlicensed until checked. Before a video is monetised, tell the user how many Pinterest clips it uses and point them to the sources file. Prefer free-to-use footage where it exists, such as US government agencies, and credit it on screen.

Quality tops out around 720p, with some clips smaller. Display small clips as smaller cards instead of stretching them.
