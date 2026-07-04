"""Generate 10 Instagram graphics for Pre-Season in brand style."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

W = H = 1080
M = 84  # margin
BG = (3, 7, 18)          # gray-950
WHITE = (243, 244, 246)
GRAY = (156, 163, 175)   # gray-400
DIM = (107, 114, 128)    # gray-500
EMERALD = (52, 211, 153) # emerald-400
CYAN = (34, 211, 238)    # cyan-400
CYAN5 = (6, 182, 212)    # cyan-500

FD = "fonts/Bricolage.ttf"
FS4 = "fonts/Geist-400.ttf"
FS5 = "fonts/Geist-500.ttf"
FS6 = "fonts/Geist-600.ttf"
FM = "fonts/JBMono.ttf"

def font(path, size, wght=None):
    f = ImageFont.truetype(path, size)
    if wght is not None:
        try:
            f.set_variation_by_axes([wght])
        except Exception:
            pass
    return f

def grad(w, h, c1=EMERALD, c2=CYAN5, horizontal=True):
    g = Image.new("RGB", (w, h))
    px = g.load()
    for x in range(w):
        for y in range(h):
            t = (x / max(w - 1, 1)) if horizontal else (y / max(h - 1, 1))
            px[x, y] = tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))
    return g

def new_canvas(glow_center=(540, -150), glow_r=700, glow_alpha=38):
    img = Image.new("RGB", (W, H), BG)
    # radial emerald glow
    glow = Image.new("L", (W, H), 0)
    gd = ImageDraw.Draw(glow)
    cx, cy = glow_center
    gd.ellipse([cx - glow_r, cy - glow_r, cx + glow_r, cy + glow_r], fill=glow_alpha)
    glow = glow.filter(ImageFilter.GaussianBlur(180))
    tint = Image.new("RGB", (W, H), (16, 185, 129))
    img = Image.composite(tint, img, glow.point(lambda a: a))
    img = Image.blend(Image.new("RGB", (W, H), BG), img, 1.0)
    # pitch center-circle accent bottom-right
    d = ImageDraw.Draw(img, "RGBA")
    d.ellipse([760, 760, 1360, 1360], outline=(52, 211, 153, 26), width=3)
    d.ellipse([860, 860, 1260, 1260], outline=(52, 211, 153, 18), width=2)
    d.line([(0, 1006), (W, 1006)], fill=(31, 41, 55, 120), width=1)
    return img

def kicker(d, img, text, y=108):
    f = font(FM, 26, 500)
    d.ellipse([M, y + 8, M + 14, y + 22], fill=EMERALD)
    d.text((M + 30, y), text.upper(), font=f, fill=EMERALD)
    # letterspacing fake: JBMono is mono already, fine
    return y + 60

def draw_grad_text(img, xy, text, f):
    """Draw text filled with brand gradient."""
    x, y = int(xy[0]), int(xy[1])
    bbox = f.getbbox(text)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    mask = Image.new("L", (tw + 20, th + bbox[1] + 20), 0)
    md = ImageDraw.Draw(mask)
    md.text((0, 0), text, font=f, fill=255)
    g = grad(mask.width, mask.height)
    img.paste(g, (x, y), mask)
    return tw

def headline(img, d, lines, y, size=88, lh=1.12):
    """lines: list of segments-lists; segment = (text, 'white'|'grad'|'gray')"""
    f = font(FD, size, 700)
    for segs in lines:
        x = M
        for text, style in segs:
            if style == "grad":
                w = draw_grad_text(img, (x, y), text, f)
            else:
                fill = WHITE if style == "white" else GRAY
                d.text((x, y), text, font=f, fill=fill)
                w = d.textlength(text, font=f)
            x += w
        y += int(size * lh)
    return y

def body(d, text, y, size=34, width_px=W - 2 * M, fill=GRAY, fpath=FS4, lh=1.5):
    f = font(fpath, size)
    words = text.split()
    line = ""
    for w_ in words:
        t = (line + " " + w_).strip()
        if d.textlength(t, font=f) > width_px:
            d.text((M, y), line, font=f, fill=fill)
            y += int(size * lh)
            line = w_
        else:
            line = t
    if line:
        d.text((M, y), line, font=f, fill=fill)
        y += int(size * lh)
    return y

def list_rows(img, d, rows, y, gap=86, label_w=0, size=36):
    """rows: list of (label, text). label drawn in mono emerald."""
    fl = font(FM, 30, 600)
    ft = font(FS5, size)
    for label, text in rows:
        if label:
            d.text((M, y + 4), label, font=fl, fill=EMERALD)
            d.text((M + label_w, y), text, font=ft, fill=WHITE)
        else:
            d.ellipse([M, y + 16, M + 12, y + 28], fill=EMERALD)
            d.text((M + 34, y), text, font=ft, fill=WHITE)
        y += gap
    return y

def punch(img, d, text, y):
    f = font(FS6, 34)
    tw = d.textlength(text, font=f)
    pad = 28
    box = [M, y, M + tw + 2 * pad, y + 66]
    g = grad(int(box[2] - box[0]), int(box[3] - box[1]))
    mask = Image.new("L", g.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, g.width - 1, g.height - 1], 16, fill=255)
    img.paste(g, (int(box[0]), int(box[1])), mask)
    d.text((M + pad, y + 14), text, font=f, fill=BG)
    return y + 66

def footer(img, d):
    y = 1030
    # logo chip
    chip = grad(46, 46)
    mask = Image.new("L", (46, 46), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, 45, 45], 10, fill=255)
    img.paste(chip, (M, y - 46), mask)
    fp = font(FD, 32, 700)
    pw = d.textlength("P", font=fp)
    d.text((M + 23 - pw / 2, y - 44), "P", font=fp, fill=BG)
    d.text((M + 62, y - 40), "Pre-Season", font=font(FS6, 30), fill=WHITE)
    url = "pre-season-app.vercel.app"
    fu = font(FM, 24, 400)
    d.text((W - M - d.textlength(url, font=fu), y - 36), url, font=fu, fill=DIM)

def start(name, glow_center=(540, -150)):
    img = new_canvas(glow_center)
    return img, ImageDraw.Draw(img, "RGBA"), name

def finish(img, d, name):
    footer(img, d)
    img.save(f"posts/{name}.png")
    print("saved", name)

os.makedirs("posts", exist_ok=True)

# ---------- 01 LAUNCH ----------
img, d, n = start("01_launch")
y = kicker(d, img, "Pre-Season '26")
y = headline(img, d, [
    [("A pre-season plan", "white")],
    [("built around ", "white"), ("you.", "grad")],
], y + 30, size=104)
y = body(d, "Position. Fitness. Kit. Injuries. Time. Answer seven questions and get a full periodized plan — Foundation to Taper.", y + 40, size=38)
punch(img, d, "Build yours free →", y + 50)
finish(img, d, n)

# ---------- 02 BANTER LIST ----------
img, d, n = start("02_counts_as_training")
y = kicker(d, img, "Field notes")
y = headline(img, d, [
    [("Things that count as", "white")],
    [("pre-season training,", "white")],
    [("apparently:", "grad")],
], y + 24, size=82)
y = list_rows(img, d, [
    (None, "New boots (still in the box)"),
    (None, "One game of 5-a-side"),
    (None, "Thinking about going for a run"),
    (None, "A gym edit watched at 1.5x speed"),
], y + 44, gap=82)
punch(img, d, "Get an actual plan. It's free →", y + 30)
finish(img, d, n)

# ---------- 03 POSITIONS ----------
img, d, n = start("03_positions_summer")
y = kicker(d, img, "Summer report")
y = headline(img, d, [
    [("How every position", "white")],
    [("spent the ", "white"), ("off-season", "grad")],
], y + 24, size=82)
y = list_rows(img, d, [
    ("GK", "hasn't moved since May"),
    ("CB", "36 holes of golf, zero sprints"),
    ("CM", "10,000 steps — fridge and back"),
    ("WG", "filmed 40 skills, posted none"),
    ("ST", "offside in the group chat"),
], y + 44, gap=80, label_w=110)
punch(img, d, "Wherever you're at, start there →", y + 26)
finish(img, d, n)

# ---------- 04 HOW IT WORKS ----------
img, d, n = start("04_how_it_works")
y = kicker(d, img, "How it works")
y = headline(img, d, [
    [("Match-ready", "white")],
    [("in four moves.", "grad")],
], y + 24, size=96)
y = list_rows(img, d, [
    ("01", "Answer seven quick questions"),
    ("02", "Get a plan periodized to your season"),
    ("03", "Train: Foundation, Build, Peak, Taper"),
    ("04", "Walk into week one already sharp"),
], y + 48, gap=88, label_w=90)
punch(img, d, "Takes 2 minutes →", y + 26)
finish(img, d, n)

# ---------- 05 HAMSTRING ----------
img, d, n = start("05_hamstring")
y = kicker(d, img, "Public service announcement")
y = headline(img, d, [
    [("Don't be the", "white")],
    [("week-one", "white")],
    [("hamstring", "grad"), (" guy.", "white")],
], y + 30, size=100)
y = body(d, "Every club has one. Tell Pre-Season about the dodgy hamstring and it builds the plan around it — not through it.", y + 44, size=38)
punch(img, d, "Train smart, free →", y + 46)
finish(img, d, n)

# ---------- 06 PRICING ----------
img, d, n = start("06_pricing")
y = kicker(d, img, "Free vs Season Pass")
y = headline(img, d, [
    [("A real plan, free.", "white")],
    [("AI on tap from ", "white"), ("£4.", "grad")],
], y + 24, size=84)
# two cards
fy = y + 50
card_h = 240
for i, (title, price, lines) in enumerate([
    ("FREE", "£0", ["Full periodized plan, instantly", "Position, kit & injury aware"]),
    ("SEASON PASS", "from £4 / $5", ["Unlimited AI plans by Claude", "One-time. Not a subscription."]),
]):
    cx0, cy0 = M, fy + i * (card_h + 28)
    d.rounded_rectangle([cx0, cy0, W - M, cy0 + card_h], 20,
                        fill=(17, 24, 39, 160) if i == 0 else (6, 78, 59, 70),
                        outline=(31, 41, 55, 255) if i == 0 else (52, 211, 153, 120), width=2)
    d.text((cx0 + 36, cy0 + 30), title, font=font(FM, 28, 600), fill=EMERALD if i else GRAY)
    pf = font(FD, 44, 700)
    d.text((W - M - 36 - d.textlength(price, font=pf), cy0 + 24), price, font=pf, fill=WHITE)
    ly = cy0 + 96
    for ln in lines:
        d.ellipse([cx0 + 36, ly + 14, cx0 + 46, ly + 24], fill=EMERALD)
        d.text((cx0 + 64, ly), ln, font=font(FS5, 32), fill=WHITE)
        ly += 58
finish(img, d, n)

# ---------- 07 PROCRASTINATION ----------
img, d, n = start("07_ill_start_later")
y = kicker(d, img, "Heard at training")
y = headline(img, d, [
    [("“I'll get fit when", "white")],
    [("pre-season starts.”", "white")],
], y + 30, size=92)
y = body(d, "— you, about to have the three worst weeks of your life.", y + 40, size=40, fill=EMERALD, fpath=FS5)
y = body(d, "Start two weeks early. Thank yourself in the first friendly.", y + 30, size=36)
punch(img, d, "Start today, free →", y + 46)
finish(img, d, n)

# ---------- 08 SIX WEEKS ----------
img, d, n = start("08_six_weeks")
y = kicker(d, img, "Do the maths")
bf = font(FD, 230, 800)
draw_grad_text(img, (M, y + 20), "6 weeks", bf)
y += 20 + 270
y = body(d, "is all it takes to go from sofa-fit to match-fit.", y, size=44, fill=WHITE, fpath=FS6, lh=1.4)
y = body(d, "Plans come in 4, 6, 8 and 10 weeks — pick the runway you've got left before the season kicks off.", y + 20, size=36)
punch(img, d, "Pick your runway →", y + 44)
finish(img, d, n)

# ---------- 09 PHASES ----------
img, d, n = start("09_phases")
y = kicker(d, img, "The method")
y = headline(img, d, [
    [("Periodization,", "white")],
    [("minus the sports-", "white")],
    [("science degree.", "grad")],
], y + 24, size=84)
y = list_rows(img, d, [
    ("PH 1", "Foundation — rebuild the engine"),
    ("PH 2", "Build — add load and speed"),
    ("PH 3", "Peak — hit match intensity"),
    ("PH 4", "Taper — arrive fresh, not fried"),
], y + 44, gap=82, label_w=120)
finish(img, d, n)

# ---------- 10 PROGRESS ----------
img, d, n = start("10_dashboard")
y = kicker(d, img, "Week 3 check-in")
y = headline(img, d, [
    [("The dashboard", "white")],
    [("doesn't ", "white"), ("lie.", "grad")],
], y + 24, size=96)
# stat card
cy0 = y + 50
d.rounded_rectangle([M, cy0, W - M, cy0 + 210], 20, fill=(6, 78, 59, 70), outline=(52, 211, 153, 120), width=2)
d.text((M + 36, cy0 + 28), "THIS WEEK", font=font(FM, 26, 600), fill=EMERALD)
sf = font(FD, 64, 700)
d.text((M + 36, cy0 + 72), "9 of 24 sessions", font=sf, fill=WHITE)
pf = font(FM, 34, 600)
d.text((W - M - 36 - d.textlength("+47% overall", font=pf), cy0 + 40), "+47% overall", font=pf, fill=EMERALD)
# progress bar
bx0, bx1, by0 = M + 36, W - M - 36, cy0 + 168
d.rounded_rectangle([bx0, by0, bx1, by0 + 14], 7, fill=(31, 41, 55))
fillw = int((bx1 - bx0) * 9 / 24)
g = grad(fillw, 14)
mask = Image.new("L", g.size, 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, fillw - 1, 13], 7, fill=255)
img.paste(g, (bx0, by0), mask)
y = cy0 + 210 + 44
y = body(d, "Tick off sessions. Watch the graph climb. Turn up in August as that player.", y, size=36)
punch(img, d, "Tag your slowest teammate →", y + 30)
finish(img, d, n)
