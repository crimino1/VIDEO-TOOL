"""Extra 2D pieces for the Qwen video: pelican on a bicycle, kebab machine, race bars, judge scoreboard."""
from lib import tl, T, el, nid
from toon import INK


def pelican_bike(eid, x, y, s=1.0):
    """An original cartoon pelican riding a bicycle; its feet sit a little off the pedals (the point of the test)."""
    w, h = int(520 * s), int(400 * s)
    return (f'<div id="{eid}" class="toon" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px"><svg width="{w}" height="{h}" viewBox="0 0 520 400">'
            f'<g fill="none" stroke="{INK}" stroke-width="8" stroke-linecap="round"><circle cx="120" cy="300" r="78"/><circle cx="400" cy="300" r="78"/>'
            f'<path d="M120 300 L230 300 L330 190 L180 190 Z M230 300 L330 190 L400 300 M330 190 L318 150 M300 150 L340 150 M180 190 L170 160 M150 160 L196 160"/></g>'
            f'<g id="{eid}_ped"><line x1="230" y1="300" x2="262" y2="330" stroke="{INK}" stroke-width="8"/><rect x="252" y="324" width="30" height="10" rx="3" fill="{INK}"/></g>'
            f'<ellipse cx="200" cy="120" rx="80" ry="58" fill="#F4F5F7" stroke="{INK}" stroke-width="7"/>'
            f'<circle cx="262" cy="64" r="34" fill="#F4F5F7" stroke="{INK}" stroke-width="7"/><circle cx="272" cy="58" r="6" fill="{INK}"/>'
            f'<path d="M290 64 L392 84 L294 92 Z" fill="#F2B33D" stroke="{INK}" stroke-width="6" stroke-linejoin="round"/>'
            f'<path d="M150 108 Q120 130 150 156" fill="none" stroke="#C9D1DC" stroke-width="10" stroke-linecap="round"/>'
            f'<path id="{eid}_leg" d="M210 172 L232 236 L300 250" fill="none" stroke="#F2B33D" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<circle id="{eid}_miss" cx="281" cy="300" r="34" fill="none" stroke="#F85149" stroke-width="6" stroke-dasharray="10 8" style="opacity:0"/></svg></div>')


def kebab(eid, x, y, s=1.0):
    """A vertical rotisserie: spit, meat cone (browns over time), heat panel."""
    w, h = int(360 * s), int(520 * s)
    bands = "".join(f'<rect class="{eid}_band" x="{110 - i * 4}" y="{90 + i * 34}" width="{140 + i * 8}" height="30" rx="12" fill="#D9A77A" stroke="{INK}" stroke-width="4"/>' for i in range(9))
    return (f'<div id="{eid}" class="toon" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px"><svg width="{w}" height="{h}" viewBox="0 0 360 520">'
            f'<rect x="20" y="40" width="40" height="440" rx="10" fill="#3A3F4A" stroke="{INK}" stroke-width="5"/>'
            f'<rect id="{eid}_heat" x="24" y="60" width="32" height="400" rx="8" fill="#F85149" style="opacity:.25"/>'
            f'<line x1="180" y1="40" x2="180" y2="480" stroke="{INK}" stroke-width="10"/>'
            f'<g id="{eid}_meat">{bands}</g><rect x="120" y="470" width="120" height="20" rx="6" fill="#9AA3B2" stroke="{INK}" stroke-width="4"/></svg></div>')


def kebab_run(eid, a, b):
    d = T(b) - T(a)
    tl.append(f'tl.to("#{eid}_meat",{{scaleX:.86,transformOrigin:"180px 0px",duration:.35,yoyo:true,repeat:{max(1, int(d / .35)) - 1},ease:"sine.inOut"}},{T(a):.3f});')
    tl.append(f'tl.to(".{eid}_band",{{fill:"#9B5A2E",duration:{d:.3f},stagger:.05,ease:"none"}},{T(a):.3f});')
    tl.append(f'tl.to("#{eid}_heat",{{opacity:.9,duration:.6}},{T(a):.3f});')


def race_bar(t, label, x, y, total_w, finish_s, run_s, color, eid, time_label):
    """A progress bar that fills in run_s seconds of video time, standing for finish_s minutes of real time."""
    out = el(t, label, f"left:{x}px;top:{y - 44}px;font-size:32px", "bl")
    out += f'<div class="track" style="left:{x}px;top:{y}px;width:{total_w}px;height:34px"></div>'
    out += f'<div id="{eid}" class="fill" style="left:{x}px;top:{y}px;width:0;height:34px;background:{color}"></div>'
    out += el(t + run_s, f'<span style="color:{color}">{time_label}</span>', f"left:{x + total_w + 20}px;top:{y - 6}px;font-size:40px", "bvl")
    tl.append(f'tl.fromTo("#{eid}",{{width:0}},{{width:{total_w},duration:{run_s:.2f},ease:"none"}},{T(t):.3f});')
    return out
