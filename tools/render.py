"""Gera Reels animados (só texto + trilha) no padrão visual da RBS.
Uso: python3 render.py spec.json saida.mp4 trilha.mp4
"""
import json, sys, subprocess, math
from PIL import Image, ImageDraw, ImageFont

W, H, FPS = 1080, 1920, 30
F = "/usr/share/fonts/opentype/inter/Inter-%s.otf"
def font(w, s): return ImageFont.truetype(F % w, s)

BG1, BG2 = (8, 40, 86), (14, 52, 104)
ACC = (126, 182, 255)
MUTED = (150, 175, 210)
WHITE = (255, 255, 255)
X0, X1 = 90, 990

def background():
    # gradiente diagonal + brilho radial suave no canto superior direito
    import numpy as np
    yy, xx = np.mgrid[0:H, 0:W]
    t = (xx / W * 0.4 + yy / H * 0.6)
    base = np.array(BG1)[None, None, :] * (1 - t[..., None]) + np.array(BG2)[None, None, :] * t[..., None]
    d = np.sqrt((xx - 950) ** 2 + (yy - 250) ** 2)
    glow = np.clip(1 - d / 700, 0, 1)[..., None] * np.array([8, 12, 18])
    arr = np.clip(base + glow, 0, 255).astype("uint8")
    return Image.fromarray(arr)

def wrap(draw, text, fnt, maxw):
    lines = []
    for para in text.split("\n"):
        words, cur = para.split(), ""
        for w in words:
            t = (cur + " " + w).strip()
            if draw.textlength(t, font=fnt) <= maxw: cur = t
            else:
                lines.append(cur); cur = w
        lines.append(cur)
    return lines

def ease(t):
    t = max(0.0, min(1.0, t)); return 1 - (1 - t) ** 3

def text_block(img, x, y, lines, fnt, color, lh, alpha=1.0, dy=0):
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for i, ln in enumerate(lines):
        d.text((x, y + dy + i * lh), ln, font=fnt, fill=color + (int(255 * alpha),))
    img.alpha_composite(layer)
    return y + len(lines) * lh

def chrome(img, tag, progress):
    d = ImageDraw.Draw(img)
    fb, fr = font("Bold", 34), font("Regular", 34)
    d.text((X0, 170), "RBS", font=fb, fill=WHITE)
    d.text((X0 + d.textlength("RBS ", font=fb), 170), "Engenharia Térmica", font=fr, fill=WHITE)
    ft = font("SemiBold", 24)
    tw = d.textlength(tag.upper(), font=ft)
    d.rounded_rectangle((X1 - tw - 50, 162, X1, 218), radius=28, fill=(40, 70, 118))
    d.text((X1 - tw - 25, 176), tag.upper(), font=ft, fill=(190, 210, 240))
    d.text((X0, 1505), "@rbs.engenhariatermica", font=font("Regular", 30), fill=(200, 212, 230))
    d.rounded_rectangle((X0, 1552, X1, 1558), radius=3, fill=(52, 78, 115))
    d.rounded_rectangle((X0, 1552, X0 + max(8, int((X1 - X0) * progress)), 1558), radius=3, fill=ACC)

def scene_hook(img, s, t):
    d = ImageDraw.Draw(img)
    a1, a2, a3 = ease(t / 0.5), ease((t - 0.3) / 0.5), ease((t - 0.6) / 0.5)
    y = 640
    d.rounded_rectangle((X0, y, X0 + int(120 * a1), y + 10), radius=5, fill=ACC)
    y += 50
    y = text_block(img, X0, y, [s["eyebrow"]], font("SemiBold", 38), ACC, 52, a1, (1 - a1) * 30) + 14
    ft = font("ExtraBold", 92)
    lines = wrap(d, s["title"], ft, X1 - X0)
    y = text_block(img, X0, y, lines, ft, WHITE, 104, a2, (1 - a2) * 40) + 24
    if s.get("sub"):
        fs = font("Regular", 44)
        text_block(img, X0, y, wrap(d, s["sub"], fs, X1 - X0), fs, (215, 225, 240), 60, a3, (1 - a3) * 30)

def scene_item(img, s, t):
    d = ImageDraw.Draw(img)
    a1, a2, a3 = ease(t / 0.45), ease((t - 0.25) / 0.5), ease((t - 0.55) / 0.5)
    y = 560
    fn = font("ExtraBold", 230)
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0)); dl = ImageDraw.Draw(layer)
    dl.text((X0 - int((1 - a1) * 60), y - 40), str(s["n"]), font=fn, fill=ACC + (int(255 * a1),))
    nw = dl.textlength(str(s["n"]), font=fn)
    dl.text((X0 + nw + 24, y + 170), "de %d" % s["of"], font=font("SemiBold", 40), fill=MUTED + (int(255 * a1),))
    img.alpha_composite(layer)
    y += 300
    ft = font("Bold", 80)
    lines = wrap(d, s["title"], ft, X1 - X0)
    y = text_block(img, X0, y, lines, ft, WHITE, 92, a2, (1 - a2) * 40) + 30
    fs = font("Regular", 44)
    text_block(img, X0, y, wrap(d, s["body"], fs, X1 - X0), fs, (215, 225, 240), 60, a3, (1 - a3) * 30)

def scene_close(img, s, t):
    d = ImageDraw.Draw(img)
    a1, a2, a3 = ease(t / 0.5), ease((t - 0.35) / 0.5), ease((t - 0.8) / 0.5)
    y = 480
    ft = font("ExtraBold", 88)
    lines = wrap(d, s["title"], ft, X1 - X0)
    y = text_block(img, X0, y, lines, ft, WHITE, 98, a1, (1 - a1) * 40) + 50
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0)); dl = ImageDraw.Draw(layer)
    off = int((1 - a2) * 50); al = int(255 * a2)
    dl.rounded_rectangle((X0, y + off, X1, y + 470 + off), radius=36, fill=(255, 255, 255, al))
    dl.text((X0 + 55, y + 55 + off), "ORÇAMENTO PELO WHATSAPP", font=font("SemiBold", 32), fill=(37, 75, 170, al))
    dl.text((X0 + 50, y + 110 + off), "(21) 96458-1719", font=font("ExtraBold", 94), fill=(10, 40, 90, al))
    dl.text((X0 + 55, y + 255 + off), "Responsável técnico e ART em todo serviço", font=font("Regular", 34), fill=(70, 80, 95, al))
    dl.line((X0 + 55, y + 330 + off, X1 - 55, y + 330 + off), fill=(225, 228, 235, al), width=3)
    dl.text((X0 + 55, y + 365 + off), "rbsengenhariatermica.com.br", font=font("SemiBold", 40), fill=(37, 75, 170, al))
    img.alpha_composite(layer)
    y += 540
    fs = font("Medium", 40)
    text_block(img, X0, y, wrap(d, s.get("foot", "Atendemos residências, empresas e condomínios no Rio de Janeiro."), fs, X1 - X0),
               fs, ACC, 56, a3, 0)

DRAW = {"hook": scene_hook, "item": scene_item, "close": scene_close}

def main(spec_path, out, music):
    spec = json.load(open(spec_path))
    scenes = spec["scenes"]
    n_items = sum(1 for s in scenes if s["type"] == "item")
    k = 0
    for s in scenes:
        if s["type"] == "item":
            k += 1; s["n"], s["of"] = k, n_items
    total = sum(s["dur"] for s in scenes)
    bg = background().convert("RGBA")
    proc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                             "-r", str(FPS), "-i", "-", "-stream_loop", "-1", "-i", music, "-map", "0:v", "-map", "1:a",
                             "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p",
                             "-c:a", "aac", "-b:a", "160k", "-ar", "48000",
                             "-af", f"afade=t=in:d=0.5,afade=t=out:st={total-1.5}:d=1.5", "-t", str(total),
                             "-movflags", "+faststart", out], stdin=subprocess.PIPE)
    elapsed = 0.0
    for s in scenes:
        nf = int(round(s["dur"] * FPS))
        for f in range(nf):
            t = f / FPS
            img = bg.copy()
            chrome(img, spec["tag"], (elapsed + t) / total)
            DRAW[s["type"]](img, s, t)
            # fade de saída de cada cena
            if s["dur"] - t < 0.25 and s is not scenes[-1]:
                fade = (s["dur"] - t) / 0.25
                img = Image.blend(bg, img, fade)
                chrome(img, spec["tag"], (elapsed + t) / total)
            proc.stdin.write(img.convert("RGB").tobytes())
        elapsed += s["dur"]
    proc.stdin.close(); proc.wait()
    print(out, total, "s")

if __name__ == "__main__":
    main(*sys.argv[1:4])
