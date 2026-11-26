# Unseen Kingdom 2 kit

Tools, sounds and music gathered from the earlier Unseen Kingdom films, for the "Unseen Kingdom 2" style
(`~/.claude/skills/channel-style/channels/unseen-kingdom-2.md`).

Start a film: copy `tools/` into the new project folder and run everything from there. Read sounds and music
straight from this folder; don't copy them again.

| Need | Tool | From |
|---|---|---|
| Pinterest video search / download | `lor_search.mjs`, `lor_download.mjs`, `thumbs.py` | orcakill |
| Pexels 16:9 stock video | `get_stock.py` (keys in `VIDEO-TOOL\.env`) | predators |
| YouTube / web clips | `get_clips.sh`, `sheets.py` | orcakill |
| Free images (Wikimedia Commons) | `commons.py`, `find_photos.py`, `get_photos.py`, `fetch_commons.py` | orcakill, predators |
| Cut an animal out of a photo (background remover) | `cut.py` | predators |
| Cut an illustration off a white page | `cutout.py` | predators |
| Check clips for logos and text | `clipsheet.py`, `scan_clips.py` | orcakill |
| Sound effects made from scratch | `make_sfx.py`, `make_sfx_variants.py` | predators |
| Pick music without listening | `music_test.py` | predators |
| Final mix (voice / music / effects) | `mix.py` | orcakill |
| Credits file | `credits.py` | orcakill |
| Render in parts and join | `render_parts.sh`, `finish.sh` | orcakill |

- `sfx/`: 40 effects (booms, swells, whooshes, thuds, splashes, drones, bubbles, sonar). All synthesized, no licence issue.
- `music/`: 29 Kevin MacLeod tracks, CC BY. Credit each track used in the description.

Several tools have the old film's title, paths or pick lists at the top (`credits.py`, `get_photos.py`, `mix.py`,
`scan_clips.py`). Change those lines for the new film.
