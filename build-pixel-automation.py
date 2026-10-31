"""Build original, two-color pixel animation from an integer pixel grid."""
from pathlib import Path
import json
import math
import sys
from PIL import Image, ImageDraw

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "assets"
W, H, COUNT = 256, 160, 24
NAMES = ["automation-pixel-sprite.png", "automation-pixel.gif", "automation-pixel-still.png", "automation-pixel-manifest.json"]
print(f"[0/5] Input drawing program: {Path(__file__).resolve()}")
for name in NAMES:
    print(f"[0/5] Output: {(OUT / name).resolve()}")

# Hand-defined 5x7 bitmap lettering. No font rasterization or anti-aliasing.
FONT = {
    "A": ["01110","10001","10001","11111","10001","10001","10001"],
    "C": ["01111","10000","10000","10000","10000","10000","01111"],
    "D": ["11110","10001","10001","10001","10001","10001","11110"],
    "E": ["11111","10000","10000","11110","10000","10000","11111"],
    "G": ["01110","10001","10000","10111","10001","10001","01110"],
    "I": ["11111","00100","00100","00100","00100","00100","11111"],
    "K": ["10001","10010","10100","11000","10100","10010","10001"],
    "L": ["10000","10000","10000","10000","10000","10000","11111"],
    "M": ["10001","11011","10101","10101","10001","10001","10001"],
    "N": ["10001","11001","11001","10101","10011","10011","10001"],
    "O": ["01110","10001","10001","10001","10001","10001","01110"],
    "P": ["11110","10001","10001","11110","10000","10000","10000"],
    "R": ["11110","10001","10001","11110","10100","10010","10001"],
    "S": ["01111","10000","10000","01110","00001","00001","11110"],
    "T": ["11111","00100","00100","00100","00100","00100","00100"],
    "U": ["10001","10001","10001","10001","10001","10001","01110"],
    "V": ["10001","10001","10001","10001","10001","01010","00100"],
    "W": ["10001","10001","10001","10101","10101","10101","01010"],
    "Y": ["10001","10001","01010","00100","00100","00100","00100"],
    "0": ["01110","10001","10011","10101","11001","10001","01110"],
    "1": ["00100","01100","00100","00100","00100","00100","01110"],
    "2": ["01110","10001","00001","00110","01000","10000","11111"],
    "3": ["11110","00001","00001","01110","00001","00001","11110"],
    "/": ["00001","00001","00010","00100","01000","10000","10000"],
    ".": ["00000","00000","00000","00000","00000","00110","00110"],
}

def text(draw, x, y, value, color=0):
    for letter in value:
        for row, pixels in enumerate(FONT.get(letter, [])):
            for col, pixel in enumerate(pixels):
                if pixel == "1":
                    draw.point((x + col, y + row), fill=color)
        x += 6

def gear(image, cx, cy, radius, teeth, angle):
    pixels = image.load()
    # Sample the silhouette directly at grid-cell centers. Every cell is 0 or 1.
    for y in range(cy-radius-1, cy+radius+2):
        for x in range(cx-radius-1, cx+radius+2):
            dx, dy = x-cx, y-cy
            distance = math.hypot(dx, dy)
            tooth = ((math.atan2(dy, dx)-angle) * teeth / math.tau) % 1
            tooth_tip = 0.20 < tooth < 0.78
            edge = radius if tooth_tip else radius-5
            inner_edge = radius-10
            if distance <= edge:
                pixels[x, y] = 0 if distance > inner_edge else 1
            # Stationary patterned axle contrasts with the rotating silhouette.
            if distance < radius*0.34:
                pixels[x,y] = 0 if distance < radius*0.23 or (x+y)%2 == 0 else 1

print("[1/5] Integer grid / bitmap lettering / gear silhouettes ready.")
frames = []
for frame in range(COUNT):
    image = Image.new("1", (W, H), 1)
    draw = ImageDraw.Draw(image)
    draw.line([(2,7),(2,152),(7,157),(248,157),(253,152),(253,7),(248,2),(7,2),(2,7)], fill=0, width=2)
    draw.line([(6,10),(6,149),(10,153),(245,153),(249,149),(249,10),(245,6),(10,6),(6,10)], fill=0)
    draw.rectangle((7,7,248,24), fill=0)
    text(draw, 16,12,"NICOA / AUTO TOOLS", 1)
    for x in [224,232,240]:
        draw.rectangle((x,13,x+3,16), fill=1)
    # Quiet dither accents, with an explicit white moat around each moving gear.
    for x in range(15,162,4):
        for y in range(37,136,4):
            if (x//4 + y//4)%3 == 0:
                draw.point((x,y), fill=0)
    pipe = [(92,72),(132,72),(132,48),(157,48),(157,102),(176,102)]
    draw.line(pipe,fill=0,width=7)
    draw.line(pipe,fill=1,width=3)
    draw.line([(45,117),(45,139),(139,139),(139,117)],fill=0,width=5)
    draw.line([(45,117),(45,139),(139,139),(139,117)],fill=1,width=1)
    phase = frame/COUNT
    for cx,cy,radius in [(73,72,29),(36,111,22),(115,114,21)]:
        draw.rectangle((cx-radius-2,cy-radius-2,cx+radius+2,cy+radius+2),fill=1)
    gear(image,73,72,29,12,phase*math.tau/12)
    gear(image,36,111,22,10,-phase*math.tau/10+0.15)
    gear(image,115,114,21,10,-phase*math.tau/10+0.10)
    # A square packet follows the orthogonal pipe in integer steps.
    route = []
    for (x1,y1),(x2,y2) in zip(pipe,pipe[1:]):
        length = abs(x2-x1)+abs(y2-y1)
        for n in range(length):
            route.append((x1 + (0 if x1==x2 else (1 if x2>x1 else -1)*n), y1 + (0 if y1==y2 else (1 if y2>y1 else -1)*n)))
    px,py = route[int(phase*len(route))]
    draw.rectangle((px-2,py-2,px+2,py+2),fill=0)
    # Checklist window and three discrete completion states.
    draw.rectangle((176,40,242,134),fill=0)
    draw.rectangle((179,43,239,131),fill=1)
    draw.rectangle((180,44,238,55),fill=0)
    text(draw,185,46,"TASKS",1)
    for index,y in enumerate([64,85,106]):
        draw.rectangle((184,y,195,y+11),outline=0,width=2)
        if frame >= [5,10,15][index]:
            draw.line([(186,y+5),(189,y+8),(194,y+2)],fill=0,width=2)
        draw.rectangle((202,y+1,231,y+3),fill=0)
        draw.rectangle((202,y+7,220,y+8),fill=0)
    text(draw,15,143,"AUTO")
    draw.rectangle((46,144,105,149),outline=0)
    completion = min(frame+1,19)/19
    draw.rectangle((48,146,48+int(55*completion),147),fill=0)
    text(draw,155,143,"DONE 3/3" if frame >= 18 else "WORKING")
    assert set(image.convert("RGB").get_flattened_data()) <= {(0,0,0),(255,255,255)}, "Frame contains a non-binary pixel"
    frames.append(image)
    if (frame+1)%6 == 0:
        print(f"[2/5] Drawn {frame+1}/{COUNT} frames ({(frame+1)*100//COUNT}%).")

OUT.mkdir(exist_ok=True)
sprite = Image.new("1", (W*COUNT,H),1)
for index,frame in enumerate(frames):
    sprite.paste(frame,(W*index,0))
sprite.save(OUT/NAMES[0])
frames[18].resize((W*3,H*3),Image.Resampling.NEAREST).save(OUT/NAMES[2])
# GIF timing has a 10ms resolution: alternate 120/130ms for exactly 8 fps on average.
gif_frames = [frame.resize((W*3,H*3),Image.Resampling.NEAREST) for frame in frames]
gif_frames[0].save(OUT/NAMES[1],save_all=True,append_images=gif_frames[1:],duration=[120,130]*12,loop=0,optimize=False,disposal=2)
print("[3/5] Written 1-bit PNG sprite, 3x still and looping GIF.")
with Image.open(OUT/NAMES[1]) as exported:
    assert exported.n_frames == COUNT
    duration = 0
    for index in range(exported.n_frames):
        exported.seek(index)
        assert set(exported.convert("RGB").get_flattened_data()) <= {(0,0,0),(255,255,255)}
        duration += exported.info["duration"]
    assert duration == 3000
assert frames[0].tobytes() != frames[12].tobytes(), "Animation does not change"
print("[4/5] Verified all 24 GIF frames: exactly black/white; loop duration 3000ms.")
manifest = {"width":W,"height":H,"frames":COUNT,"fps":8,"durationMs":3000,"colors":["#000000","#ffffff"],"pngBitDepth":1,"sprite":NAMES[0],"gif":NAMES[1],"still":NAMES[2],"authorship":"Original code-drawn pixel artwork; existing service image used only as visual reference."}
(OUT/NAMES[3]).write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("[5/5] Pixel animation complete. Original service artwork is unchanged.")
