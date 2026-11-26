"""AI Equator: "AI lost almost $3 trillion". Real footage, Mac-style page windows and posts on a near-black stage, timed to the voice. Writes index.html."""
import hashlib, os, subprocess
from pathlib import Path
from PIL import Image

H = Path(__file__).parent
Image.MAX_IMAGE_PIXELS = None
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin/ffmpeg.exe"
RAW = H / "assets" / "raw"
CLIPS = H / "assets" / "clips"
IMG = H / "assets" / "img"
CLIPS.mkdir(exist_ok=True)
END = 283.34


def s(t):
    if isinstance(t, (int, float)):
        return float(t)
    m, x = t.split(":")
    return int(m) * 60 + float(x)


html, tl, PENDING = [], [], []
Z = {"n": 10, "i": 0}


def nid(p="e"):
    Z["i"] += 1
    return f"{p}{Z['i']}"


def trim(raw, ss, d):
    """Cut one silent section at 1080p so the render only touches what it uses."""
    key = hashlib.md5(f"{raw}{ss:.2f}{d:.2f}".encode()).hexdigest()[:8]
    out = CLIPS / f"{raw}_{key}.mp4"
    if not out.exists():
        subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{ss:.2f}", "-t", f"{d + .25:.2f}", "-i", str(RAW / (raw + ".mp4")), "-an",
                        "-vf", "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30", "-c:v", "libx264", "-preset", "fast", "-crf", "17", "-pix_fmt", "yuv420p", str(out)], check=True)
    return f"assets/clips/{out.name}"


def page(name, crop=None):
    """A captured page, cropped and saved as a sharp JPEG."""
    tag = "" if not crop else "_" + hashlib.md5(str(crop).encode()).hexdigest()[:5]
    out = IMG / f"{name}{tag}.jpg"
    if not out.exists():
        im = Image.open(RAW / "web" / f"{name}.png").convert("RGB")
        if crop:
            w, h = im.size
            im = im.crop((int(crop[0] * w), int(crop[1] * h), int(crop[2] * w), int(crop[3] * h)))
        im.save(out, quality=93)
    return f"assets/img/{out.name}", Image.open(out).size


def video(a, b, raw, ss, x=0, y=0, w=1920, h=1080, zoom=True):
    Z["n"] += 1
    v, wr = nid("v"), nid("w")
    src = trim(raw, ss, b - a)
    html.append(f'<div id="{wr}" class="vw" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;z-index:{Z["n"]}"><video id="{v}" class="clip fit" src="{src}" muted playsinline data-start="{a:.3f}" data-duration="{b - a:.3f}" data-track-index="1"></video></div>')
    if zoom:
        tl.append(f'tl.fromTo("#{v}",{{scale:1}},{{scale:1.05,duration:{b - a:.3f},ease:"none"}},{a:.3f});')


def layer(a, b, inner, bg=False):
    Z["n"] += 1
    html.append(f'<div id="{nid("s")}" class="clip scene{" stage" if bg else ""}" data-start="{a:.3f}" data-duration="{b - a:.3f}" data-track-index="2" style="z-index:{Z["n"]}" data-layout-allow-overflow data-layout-allow-overlap>{inner}</div>')
    for p in PENDING:
        Z["n"] += 1
        html.append(p.replace("@Z@", str(Z["n"])))
    PENDING.clear()


def enter(sel, t, y=36):
    tl.append(f'tl.fromTo("{sel}",{{opacity:0,y:{y}}},{{opacity:1,y:0,duration:.26,ease:"power3.out"}},{t:.3f});')


def pop(sel, t):
    tl.append(f'tl.fromTo("{sel}",{{opacity:0,scale:.9}},{{opacity:1,scale:1,duration:.13,ease:"power2.out"}},{t:.3f});')


def mac(name, url, a, b, x=210, y=64, w=1500, crop=None, zoom=1.03, origin="50% 50%"):
    src, (iw, ih) = page(name, crop)
    eid, kb = nid("m"), nid("k")
    hh = int(w * ih / iw)
    tl.append(f'tl.fromTo("#{kb}",{{scale:1}},{{scale:{zoom},duration:{b - a:.3f},ease:"none"}},{a:.3f});')
    enter(f"#{eid}", a)
    return (f'<div id="{eid}" class="mac" style="left:{x}px;top:{y}px;width:{w}px"><div class="mbar"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i>'
            f'<div class="murl"><svg width="13" height="15" viewBox="0 0 13 15"><path d="M3 6V4.2a3.5 3.5 0 0 1 7 0V6h1.2c.5 0 .8.3.8.8v6.4c0 .5-.3.8-.8.8H1.8c-.5 0-.8-.3-.8-.8V6.800c0-.5.3-.8.8-.8H3zm1.500 0h4V4.200a2 2 0 0 0-4 0V6z" fill="#9b9ba0"/></svg>{url}</div></div>'
            f'<div class="mbody" style="height:{hh}px"><img id="{kb}" src="{src}" alt="{name}" style="width:{w}px;height:{hh}px;transform-origin:{origin}"></div></div>')


def macv(name, url, a, b, x=210, y=64, w=1500):
    """A Mac window playing a real scrolling recording of the page."""
    eid, v, wr = nid("m"), nid("v"), nid("w")
    hh = int(w * 860 / 1440)
    enter(f"#{eid}", a)
    enter(f"#{wr}", a)
    PENDING.append(f'<div id="{wr}" class="vw" style="left:{x}px;top:{y + 46}px;width:{w}px;height:{hh}px;z-index:@Z@;opacity:0"><video id="{v}" class="clip fit" src="assets/raw/rec/{name}.mp4" muted playsinline data-start="{a:.3f}" data-duration="{b - a:.3f}" data-track-index="1"></video></div>')
    return (f'<div id="{eid}" class="mac" style="left:{x}px;top:{y}px;width:{w}px"><div class="mbar"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i>'
            f'<div class="murl">{url}</div></div><div class="mbody" style="height:{hh}px"></div></div>')


def post(name, a, b, w=None, x=None, y=None, crop=None):
    """A post card: real embed from X, centred on the stage."""
    p = RAW / "web" / f"{name}.png"
    im = Image.open(p)
    if crop:
        W0, H0 = im.size
        im = im.crop((int(crop[0] * W0), int(crop[1] * H0), int(crop[2] * W0), int(crop[3] * H0)))
    iw, ih = im.size
    tag = "" if not crop else "_" + hashlib.md5(str(crop).encode()).hexdigest()[:5]
    out = IMG / f"{name}{tag}.png"
    if not out.exists():
        im.save(out)
    if w is None:
        w = min(1040, int(iw * 880 / ih))
    hh = int(w * ih / iw)
    x = (1920 - w) // 2 if x is None else x
    y = (1080 - hh) // 2 if y is None else y
    eid = nid("p")
    enter(f"#{eid}", a, 40)
    tl.append(f'tl.fromTo("#{eid}",{{scale:1}},{{scale:1.025,duration:{b - a:.3f},ease:"none"}},{a + .02:.3f});')
    return f'<img id="{eid}" class="post" src="assets/img/{out.name}" alt="{name}" style="left:{x}px;top:{y}px;width:{w}px;height:{hh}px">'


def cap(text, t, style="left:0;right:0;bottom:90px;text-align:center;font-size:96px", cls="cap"):
    eid = nid("c")
    pop(f"#{eid}", s(t))
    return f'<div id="{eid}" class="{cls}" style="{style}">{text}</div>'


LOW = "left:0;right:0;bottom:80px;text-align:center;font-size:92px"
MID = "left:0;right:0;top:440px;text-align:center;font-size:118px"


def stamp(text, t, x=None, y=880, size=84):
    pos = f"left:0;right:0;top:{y}px;text-align:center" if x is None else f"left:{x}px;top:{y}px"
    eid = nid("c")
    pop(f"#{eid}", s(t))
    return f'<div class="row" style="{pos}"><span id="{eid}" class="stamp" style="font-size:{size}px">{text}</span></div>'


def plate(text, t, x=70, y=940, size=44):
    eid = nid("c")
    pop(f"#{eid}", s(t))
    return f'<div id="{eid}" class="plate" style="left:{x}px;top:{y}px;font-size:{size}px">{text}</div>'


def credit(text, t):
    return f'<div class="credit" style="left:40px;bottom:26px">{text}</div>'


def logo(name, t, x, y, w=300):
    p = RAW / "logos" / f"{name}.png"
    im = Image.open(p)
    h = int((w - 56) * im.size[1] / im.size[0])
    eid = nid("c")
    pop(f"#{eid}", s(t))
    return f'<div id="{eid}" class="chip" style="left:{x}px;top:{y}px;width:{w}px"><img src="assets/raw/logos/{name}.png" alt="{name}" style="width:{w - 56}px;height:{h}px"></div>'


# ---------------------------------------- HOOK
a, b = s("0:00.00"), s("0:04.40")
video(a, b, "yt_nbc", 10.4)
layer(a, b, credit("NBC News", a) + stamp("WORST DAY IN YEARS", "0:02.14"))

a, b = s("0:04.40"), s("0:09.32")
layer(a, b, macv("cnn", "cnn.com", a, b), True)
layer(a, b, stamp("$2.5 TRILLION GONE", "0:05.72", size=100, y=860))

a, b = s("0:09.32"), s("0:11.96")
layer(a, b, mac("cry", "en.cryptonomist.ch", a, b, crop=(.20,.28,.80,.74), w=1560, x=180) + stamp("CLOSE TO $3 TRILLION", "0:10.20", y=860), True)

a, b = s("0:11.96"), s("0:19.28")
layer(a, b, post("tw_pcmr", a, b, w=760, x=580, y=40) + cap("ONE DAY EARLIER", a, "left:60px;top:80px;font-size:64px;width:500px") + stamp("RAM ALTMAN", "0:17.52", y=870, size=120), True)

a, b = s("0:19.28"), s("0:22.24")
video(a, b, "px_wallst_2", 3, 0, 0, 955, 1080)
video(a, b, "x_morqon", 6, 965, 0, 955, 1080)
layer(a, b, cap("MORE CONNECTED THAN YOU THINK", "0:20.16", "left:0;right:0;bottom:90px;text-align:center;font-size:82px"))

# ---------------------------------------- THE CRASH
a, b = s("0:22.24"), s("0:24.08")
video(a, b, "yt_abc", 11.0)
layer(a, b, credit("ABC News (Australia)", a) + cap("THE CRASH", "0:23.04", MID))

a, b = s("0:24.08"), s("0:30.28")
layer(a, b, mac("gf_qqq", "google.com/finance", a, b, crop=(0, 0, .82, .60), x=170, w=1580) + stamp("NASDAQ -5.5%", "0:25.94", y=800, size=110) + plate("WORST DAY SINCE APRIL 2025", "0:27.66", x=550, y=960), True)

a, b = s("0:30.28"), s("0:34.62")
layer(a, b, mac("cnn_ndx", "cnn.com", a, b, crop=(.20,.28,.80,.74), w=1560, x=180) + stamp("NASDAQ 100: WORST SINCE MARCH 2020", "0:31.72", size=62, y=890), True)

a, b = s("0:34.62"), s("0:36.62")
video(a, b, "px_chip_2", 4)
layer(a, b, cap("CHIP STOCKS TOOK THE BIGGEST HIT", "0:35.00", "left:0;right:0;bottom:90px;text-align:center;font-size:82px"))

a, b = s("0:36.62"), s("0:43.00")
video(a, b, "yt_bloom", 124.0, zoom=False)
layer(a, b, credit("Bloomberg Television", a) + stamp("CHIP INDEX -12%", "0:38.80", y=610, size=100) + plate("WORST DAY IN ABOUT 6.5 YEARS", "0:40.00", x=510, y=750))

a, b = s("0:43.00"), s("0:47.76")
layer(a, b, mac("gf_nvda", "google.com/finance", a, b, crop=(0, 0, .82, .60), x=170, w=1580) + logo("nvidia", a, 90, 40, 340) + stamp("NVIDIA -9%", "0:43.84", y=800, size=110) + plate("ALL ITS GAINS FOR THE YEAR: GONE", "0:44.88", x=490, y=960), True)

a, b = s("0:47.76"), s("0:51.88")
video(a, b, "yt_nbc", 66.0, zoom=False)
layer(a, b, credit("NBC News", a))

a, b = s("0:51.88"), s("0:57.64")
layer(a, b, mac("gf_crwv", "google.com/finance", a, b, crop=(0, 0, .82, .60), x=170, w=1580) + logo("coreweave", a, 90, 40, 380) + plate("RENTS OUT AI COMPUTING POWER", "0:52.86", x=530, y=790) + stamp("ANOTHER -10%", "0:55.84", y=860, size=100), True)

a, b = s("0:57.64"), s("1:01.36")
layer(a, b, mac("cnn_core", "cnn.com", a, b, crop=(.20,.28,.80,.74), w=1560, x=180) + stamp("-76% FROM ITS PEAK", "0:58.32", y=860, size=100), True)

a, b = s("1:01.36"), s("1:04.44")
layer(a, b, mac("gf_vix", "google.com/finance", a, b, crop=(0, 0, .82, .60), x=170, w=1580) + stamp("FEAR GAUGE +70%", "1:03.12", y=820, size=110), True)

a, b = s("1:04.44"), s("1:06.99")
video(a, b, "px_seoul_1", 3)
layer(a, b, cap("THE PANIC WENT GLOBAL", "1:05.22", LOW))

a, b = s("1:06.99"), s("1:11.37")
video(a, b, "yt_arirang", 16.0)
layer(a, b, credit("Arirang News", a) + stamp("SOUTH KOREA -9% AT THE OPEN", "1:09.45", y=70, size=72))

a, b = s("1:11.37"), s("1:13.85")
video(a, b, "yt_arirang", 28.0)
layer(a, b, credit("Arirang News", a) + stamp("TRADING HALTED: 20 MINUTES", "1:11.99", y=70, size=72))

a, b = s("1:13.85"), s("1:18.06")
layer(a, b, mac("cnn2_kospi", "cnn.com", a, b, crop=(.20,.28,.80,.74), w=1560, x=180) + stamp("KOREA AND JAPAN: BOTH -6%", "1:15.33", y=880, size=76), True)

# ---------------------------------------- WHY
a, b = s("1:18.06"), s("1:19.28")
layer(a, b, cap("SO WHAT HAPPENED?", a, MID), True)

a, b = s("1:19.28"), s("1:21.68")
video(a, b, "px_datacenter_2", 2)
layer(a, b, cap("DID AI STOP WORKING?", "1:19.40", LOW))

a, b = s("1:21.68"), s("1:22.82")
layer(a, b, cap("NOT EXACTLY.", a, MID), True)

a, b = s("1:22.82"), s("1:24.58")
video(a, b, "yt_nbc", 94.0)
layer(a, b, credit("NBC News", a) + stamp("THE TRIGGER: POLITICS", "1:23.44", y=60))

a, b = s("1:24.58"), s("1:29.20")
layer(a, b, mac("cnn_dem", "cnn.com", a, b, crop=(.20,.28,.80,.74), w=1560, x=180), True)

a, b = s("1:29.20"), s("1:30.92")
video(a, b, "yt_nbc", 40.0)
layer(a, b, credit("NBC News", a) + cap("THE DATA CENTER BOOM", "1:29.30", "left:0;right:0;top:90px;text-align:center;font-size:92px"))

# one bet: three boxes, added as the voice names each one
a, b = s("1:30.92"), s("1:42.81")
video(a, b, "px_datacenter_0", 1, zoom=False)
d1, d2, d3, a1, a2 = nid("c"), nid("c"), nid("c"), nid("c"), nid("c")
inner = '<div class="dim"></div>' + cap("ONE BET", "1:34.30", "left:0;right:0;top:130px;text-align:center;font-size:110px")
inner += f'<div id="{d1}" class="box" style="left:130px;background:#14352f;border-color:#2de1c2">HUNDREDS OF BILLIONS</div>'
inner += f'<div id="{a1}" class="arw" style="left:640px">&rarr;</div>'
inner += f'<div id="{d2}" class="box" style="left:720px;background:#3a2410;border-color:#fa9432">CHIPS AND DATA CENTERS</div>'
inner += f'<div id="{a2}" class="arw" style="left:1230px">&rarr;</div>'
inner += f'<div id="{d3}" class="box" style="left:1310px;background:#3c1320;border-color:#d52243">IT ALL PAYS OFF?</div>'
layer(a, b, inner)
pop(f"#{d1}", s("1:36.56"))
pop(f"#{a1}", s("1:38.20"))
pop(f"#{d2}", s("1:38.36"))
pop(f"#{a2}", s("1:40.10"))
pop(f"#{d3}", s("1:41.14"))

a, b = s("1:42.81"), s("1:45.37")
video(a, b, "px_worried_0", 3)
layer(a, b, cap("NOBODY CAN TELL YOU WHEN", "1:43.20", LOW))

a, b = s("1:45.37"), s("1:50.63")
layer(a, b, macv("cnbc_qc", "cnbc.com", a, b), True)
layer(a, b, logo("qualcomm", "1:48.51", 1320, 780, 440))

a, b = s("1:50.63"), s("1:53.65")
layer(a, b, mac("cnn_memcost", "cnn.com", a, b, crop=(.20,.28,.80,.74), w=1560, x=180), True)

a, b = s("1:53.65"), s("1:56.19")
layer(a, b, mac("gf_qcom", "google.com/finance", a, b, crop=(0, 0, .82, .60), x=170, w=1580) + stamp("QUALCOMM -9%", "1:54.61", y=820, size=110), True)

a, b = s("1:56.19"), s("1:58.65")
layer(a, b, '<img id="ram1" class="fit2" src="assets/img/ram.jpg" alt="RAM">' + cap("MEMORY", "1:57.11", MID))
tl.append(f'tl.fromTo("#ram1",{{scale:1}},{{scale:1.06,duration:{b - a:.3f},ease:"none"}},{a:.3f});')

a, b = s("1:58.65"), s("2:03.21")
video(a, b, "yt_cheeky", 43.0)
layer(a, b, credit("Cheeky Pint", a) + plate("SAM ALTMAN", "1:59.65", x=70, y=900, size=60))

a, b = s("2:03.21"), s("2:05.55")
video(a, b, "yt_cheeky", 12.0)
layer(a, b, credit("Cheeky Pint", a) + plate("JOHN COLLISON, STRIPE CO-FOUNDER", a, x=70, y=900, size=52))

a, b = s("2:05.55"), s("2:17.47")
video(a, b, "x_morqon", 8.0)
layer(a, b, credit("Cheeky Pint, clip via @morqon on X", a) + stamp("“QUITE TERRIBLE”", "2:08.91", y=870, size=96))
layer(s("2:14.95"), b, stamp("“5% OF THE TIME”", "2:14.95", y=870, size=96))

a, b = s("2:17.47"), s("2:19.13")
video(a, b, "x_morqon", 20.0)
layer(a, b, cap("NOW THINK ABOUT WHO SAID THAT", a, "left:0;right:0;bottom:90px;text-align:center;font-size:82px"))

a, b = s("2:19.13"), s("2:21.35")
video(a, b, "px_datacenter_1", 2)
layer(a, b, cap("AI DATA CENTERS", "2:19.30", LOW))

a, b = s("2:21.35"), s("2:28.59")
layer(a, b, mac("wc70", "windowscentral.com", a, b, crop=(.08,.16,.92,.72), w=1560, x=180) + stamp("MORE THAN 70%", "2:25.29", y=860, size=110), True)

a, b = s("2:28.59"), s("2:35.04")
layer(a, b, mac("ev90", "evertiq.com", a, b, crop=(.11,.28,.71,.74), w=1560, x=180) + stamp("+90% IN ONE QUARTER", "2:32.45", y=860, size=100), True)

for ta, tb, r, ss in (("2:35.04", "2:35.90", "px_phone_1", 3), ("2:35.90", "2:36.90", "px_laptop_2", 3), ("2:36.90", "2:40.26", "px_smarthome_0", 4)):
    video(s(ta), s(tb), r, ss)
layer(s("2:35.04"), s("2:40.26"), stamp("MORE EXPENSIVE", "2:38.58", y=870, size=100))

a, b = s("2:40.26"), s("2:44.62")
video(a, b, "px_datacenter_2", 5)
layer(a, b, cap("SOME OF THE BIGGEST AI DATA CENTERS ON EARTH", "2:41.90", "left:100px;right:100px;bottom:80px;text-align:center;font-size:72px"))

a, b = s("2:44.62"), s("2:47.03")
video(a, b, "x_morqon", 28.0)
layer(a, b, stamp("YOUR RAM = “THE WASTE”", "2:44.80", y=870, size=88))

# ---------------------------------------- THE INTERNET RESPONDS
a, b = s("2:47.03"), s("2:49.79")
layer(a, b, post("tw_morqon", a, b, w=980), True)

a, b = s("2:49.79"), s("2:52.31")
layer(a, b, macv("ah_ram", "androidheadlines.com", a, b), True)

a, b = s("2:52.31"), s("2:56.01")
video(a, b, "px_car_0", 3)
layer(a, b, cap("YOUR CAR SITS PARKED TOO", "2:53.25", LOW))

a, b = s("2:56.01"), s("2:58.31")
layer(a, b, '<img id="ram2" class="fit2" src="assets/img/ram.jpg" alt="RAM">' + cap("RAM STICK EARRINGS", "2:56.20", LOW))
tl.append(f'tl.fromTo("#ram2",{{scale:1.08}},{{scale:1,duration:{b - a:.3f},ease:"none"}},{a:.3f});')

a, b = s("2:58.31"), s("3:02.77")
layer(a, b, post("tw_elon", a, b), True)

a, b = s("3:02.77"), s("3:04.77")
video(a, b, "x_morqon", 41.0)
layer(a, b, cap("THE ONLY THING LEFT", "3:03.00", LOW))

a, b = s("3:04.77"), s("3:09.91")
layer(a, b, post("tw_okyeah", a, b, w=1040) + stamp("“OK YEAH”", "3:08.61", y=880, size=100), True)

a, b = s("3:09.91"), s("3:15.85")
layer(a, b, post("tw_pcmr", a, b, w=720, y=30) + stamp("RAM ALTMAN", "3:13.93", y=880, size=120), True)

a, b = s("3:15.85"), s("3:20.54")
layer(a, b, post("tw_sama_ram", a, b, w=1040), True)

a, b = s("3:20.54"), s("3:25.77")
layer(a, b, post("tw_annoy", a, b, w=1040, y=120) + stamp("TAKEN OUT OF CONTEXT", "3:22.34", y=880), True)

a, b = s("3:25.77"), s("3:28.87")
video(a, b, "yt_cheeky", 130.0)
layer(a, b, credit("Cheeky Pint", a) + cap("TO BE FAIR", a, LOW))

a, b = s("3:28.87"), s("3:34.11")
video(a, b, "px_datacenter_0", 6)
layer(a, b, cap("SUPPLY IS SHORT", "3:29.00", "left:0;right:0;top:120px;text-align:center;font-size:92px") + stamp("SHARED CLOUD: MORE USE PER CHIP", "3:31.45", y=850, size=72))

a, b = s("3:34.11"), s("3:38.74")
layer(a, b, post("tw_annoy", a, b, w=1040, y=120) + stamp("“RAMP UP MEMORY PRODUCTION”", "3:35.83", y=880, size=76), True)

a, b = s("3:38.74"), s("3:41.54")
video(a, b, "px_chipfab_1", 4)
layer(a, b, cap("YOU CAN'T BUILD A MEMORY FACTORY WITH A TWEET", "3:38.90", "left:100px;right:100px;bottom:80px;text-align:center;font-size:76px"))

a, b = s("3:41.54"), s("3:48.27")
layer(a, b, mac("heise2030", "heise.de", a, b, crop=(.09,.27,.585,.72), w=1400, x=260) + logo("skhynix", "3:41.54", 70, 40, 300) + stamp("UNTIL 2030", "3:46.80", y=850, size=130), True)

# ---------------------------------------- THE BOUNCE
a, b = s("3:48.27"), s("3:50.39")
layer(a, b, cap("THE PART THAT MATTERS FOR YOU", a, "left:0;right:0;top:450px;text-align:center;font-size:92px"), True)

a, b = s("3:50.39"), s("3:53.07")
video(a, b, "px_wallst_0", 2)
layer(a, b, cap("FRIDAY: THE MARKET BOUNCED", "3:51.45", LOW))

a, b = s("3:53.07"), s("3:58.93")
layer(a, b, mac("cnn2_nv", "cnn.com", a, b, crop=(.20,.28,.80,.74), w=1560, x=180)
      + plate("NASDAQ +1%", "3:53.97", x=120, y=860, size=64) + plate("NVIDIA +2.8%", "3:55.91", x=690, y=860, size=64) + plate("SPACEX +8.6%", "3:57.09", x=1290, y=860, size=64), True)

a, b = s("3:58.93"), s("4:04.81")
layer(a, b, mac("cnn_yard", "cnn.com", a, b, crop=(.20,.28,.80,.74), w=1560, x=180) + plate("ED YARDENI", "3:59.89", x=730, y=880, size=64), True)

a, b = s("4:04.81"), s("4:11.35")
layer(a, b, mac("cnn2_week", "cnn.com", a, b, crop=(.20,.28,.80,.74), w=1560, x=180) + stamp("WORST WEEK SINCE APRIL 2025", "4:08.27", y=870, size=80), True)

# ---------------------------------------- THE ANSWER
a, b = s("4:11.35"), s("4:13.23")
layer(a, b, cap("SO DID THE AI BUBBLE POP?", a, MID.replace("118px", "100px")), True)

a, b = s("4:13.23"), s("4:16.83")
video(a, b, "px_trading_1", 5)
layer(a, b, cap("ONE BAD WEEK CAN'T TELL YOU", "4:14.07", "left:0;right:0;bottom:90px;text-align:center;font-size:88px"))

a, b = s("4:16.83"), s("4:21.27")
video(a, b, "px_datacenter_1", 8)
layer(a, b, cap("STILL SPENDING", "4:16.90", "left:0;right:0;top:120px;text-align:center;font-size:92px") + cap("STILL REAL DEMAND", "4:18.75", LOW))

a, b = s("4:21.27"), s("4:24.17")
video(a, b, "px_worried_2", 3)
layer(a, b, cap("HOW NERVOUS THAT MONEY IS", "4:22.19", LOW))

a, b = s("4:24.17"), s("4:30.32")
layer(a, b, cap("ONE ELECTION.", "4:24.17", "left:0;right:0;top:230px;text-align:center;font-size:104px")
      + cap("ONE BAD DAY.", "4:25.37", "left:0;right:0;top:390px;text-align:center;font-size:104px")
      + stamp("$2.5 TRILLION DISAPPEARS", "4:26.77", y=590, size=104), True)

a, b = s("4:30.32"), s("4:34.38")
video(a, b, "yt_nbc", 17.4)
layer(a, b, credit("NBC News", a) + cap("AI STOCKS CAN CRASH BY TRILLIONS", "4:31.70", "left:0;right:0;top:40px;text-align:center;font-size:80px"))

a, b = s("4:34.38"), s("4:37.43")
layer(a, b, '<img id="ram3" class="fit2" src="assets/img/ram.jpg" alt="RAM">' + stamp("YOUR RAM IS STILL NOT CHEAPER", "4:34.60", y=860, size=84))
tl.append(f'tl.fromTo("#ram3",{{scale:1}},{{scale:1.06,duration:{b - a:.3f},ease:"none"}},{a:.3f});')

# ---------------------------------------- CLOSE, with the channel's real logo
a, b = s("4:37.43"), END
lid = nid("c")
layer(a, b, f'<img id="{lid}" src="assets/img/logo.png" alt="AI Equater logo" style="position:absolute;left:660px;top:150px;width:600px;height:600px">' + stamp("SUBSCRIBE", "4:38.43", y=800, size=88))
tl.append(f'tl.fromTo("#{lid}",{{opacity:0,scale:.96}},{{opacity:1,scale:1,duration:.4,ease:"power2.out"}},{a:.3f});')

doc = f'''<!doctype html>
<html lang="en" data-resolution="landscape">
<head>
<meta charset="UTF-8" /><meta name="viewport" content="width=1920, height=1080" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1920px;height:1080px;overflow:hidden;background:#0e0c0d}}
#root{{position:relative;width:1920px;height:1080px;overflow:hidden;background:#0e0c0d;font-family:"Archivo Black",sans-serif;color:#f8f3d9}}
.scene{{position:absolute;left:0;top:0;width:1920px;height:1080px;overflow:hidden}}
.stage{{background:#0e0c0d}}
.vw{{position:absolute;overflow:hidden}}
.fit{{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover}}
.fit2{{position:absolute;left:0;top:0;width:1920px;height:1080px;object-fit:cover}}
.dim{{position:absolute;inset:0;background:rgba(14,12,13,.72)}}
.mac{{position:absolute;border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 34px 90px rgba(0,0,0,.75),0 0 0 1px rgba(255,255,255,.14);opacity:0}}
.mbar{{height:46px;background:#2b2b2e;position:relative;display:block}}
.mbar i{{position:absolute;top:16px;width:14px;height:14px;border-radius:50%;display:block}}
.mbar i:nth-child(1){{left:18px}}.mbar i:nth-child(2){{left:42px}}.mbar i:nth-child(3){{left:66px}}
.murl{{position:absolute;left:50%;top:9px;transform:translateX(-50%);height:28px;padding:0 90px;background:#1c1c1e;border-radius:7px;font-family:Inter,sans-serif;font-size:17px;line-height:28px;color:#c9c9cf;white-space:nowrap}}
.murl svg{{margin-right:8px;vertical-align:-2px}}
.mbody{{overflow:hidden;position:relative}}
.mbody img{{display:block}}
.post{{position:absolute;opacity:0;filter:drop-shadow(0 26px 60px rgba(0,0,0,.7))}}
.cap{{position:absolute;line-height:1.06;color:#f8f3d9;-webkit-text-stroke:14px #0f0c0d;paint-order:stroke fill;opacity:0}}
.row{{position:absolute}}
.stamp{{display:inline-block;background:#d52243;color:#f8f3d9;padding:10px 30px;opacity:0;white-space:nowrap}}
.plate{{position:absolute;background:#ecede5;color:#0f0c0d;padding:8px 22px;border:5px solid #0f0c0d;opacity:0;white-space:nowrap}}
.credit{{position:absolute;font-family:Inter,sans-serif;font-size:22px;color:#fff;background:rgba(0,0,0,.55);padding:4px 12px;border-radius:5px}}
.chip{{position:absolute;background:#fff;border-radius:16px;padding:18px 28px;box-shadow:0 14px 40px rgba(0,0,0,.6);opacity:0}}
.chip img{{display:block}}
.box{{position:absolute;top:430px;width:480px;height:230px;border:5px solid;border-radius:22px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:48px;line-height:1.15;padding:18px;opacity:0}}
.arw{{position:absolute;top:490px;font-size:80px;opacity:0;font-family:Inter,sans-serif}}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{END}" data-width="1920" data-height="1080">
{chr(10).join(html)}
<audio id="vo" class="clip" src="assets/vo.mp3" data-start="0" data-duration="{END}" data-volume="1" data-track-index="10"></audio>
</div>
<script>
const tl = gsap.timeline({{ paused: true }});
{chr(10).join(tl)}
tl.set({{}}, {{}}, {END});
window.__timelines = window.__timelines || {{}};
window.__timelines["main"] = tl;
</script>
</body>
</html>
'''
(H / "index.html").write_text(doc, encoding="utf-8")
print("built", len(html), "layers")
