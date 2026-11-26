# Upgrade pass — group C file assets/js/k_cygnus.js (Black Holes film)
Reference frames from the current render are in review/*.jpg (open them with Read). Same rules as BUILDERS.md. Film times are FILM seconds (shots.py S list). Times and shot lengths do not change.

1. Gas stream burns white (review/gas_stream_white.jpg, gas_stream_end.jpg): in cygx1 disk/disk2/end the stream where it leaves the blue star is a saturated white blob. Make it a believable plasma stream: thinner at the star, warmer (pale orange -> orange-red as it spirals in), soft density falloff, no clipped white; the star's limb stays visible behind it. cygx1/end is the film's last image: it must be beautiful.
2. Galactic-centre orbits read as a line diagram (review/galcenter_orbits_linediagram.jpg; galcenter orbits 1116.80-1157.86, orbits2 1440.60-1442.30): make it look like the real infrared observations (ESO/Keck): a dense crowded field of stars with varied warm colours and soft point-spread glows (sprites), faint diffuse background glow and dust; the S-stars brighter; orbit tracks very thin and faint (dotted or fading trails behind each star, not full ellipses everywhere); S2's ellipse may stay as the one clear track. Keep the existing timing beats and pins.
3. Dust in galcenter approach reads as dark blobs (review/galcenter_dust_blobs.jpg): replace with filamentary dust lanes (noise-based texture on a few large planes or particle clouds with streaky shapes), lit warm by the bulge behind.
4. Soft Earth in xray atmosphere (review/xray_earth_soft.jpg): an 8K Earth map is now available: assets/tex/8k_earth_daymap.jpg (use it for xray atmosphere/cygnus only).
5. Not enough motion (frozen stretches found by freezedetect; refs review/frozen_*.jpg): add slow continuous camera motion (orbit/dolly 3-6 % over the hold, eased) so no stretch over ~2 s is static:
   - cygx1/star 838.0-844.0 and 846.0-849.5 (frozen_cygx1_star.jpg)
   - cygx1/disk 962.9-966.2 (frozen_disk_start.jpg)
   - bhslow/full 1162.5-1166.0 and 1172.0-1174.7 ; bhslow/end 1447.1-1450.0 (frozen_bhslow.jpg)
   - cygx1/end 1470.4-1473.0 (frozen_cygx1_end.jpg)
Test with tools/try.py in folder try_c2 (sample densely; also check motion by sampling 0.5 s apart). Run `node --check` on the file (try.py does not report JS/shader errors). Report briefly what changed. Delete try_c2 at the end.
