"""Original four-panel, two-color artwork and real hover-state assets."""
from pathlib import Path
import json
import subprocess
import sys
from PIL import Image, ImageDraw

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent
OUT = ROOT / "assets"
W, H, FRAMES = 256, 160, 24
FILES = ["gui-pixel-states.png", "api-pixel-sprite.png", "docs-pixel-sprite.png", "development-pixel.gif", "development-pixel-still.png", "development-pixel-manifest.json"]
print(f"[0/6] Input drawing program: {Path(__file__).resolve()}")
print(f"[0/6] Input automation generator: {(ROOT/'build-pixel-automation.py').resolve()}")
print(f"[0/6] Generated intermediate input: {(OUT/'automation-pixel-sprite.png').resolve()}")
for name in FILES:
    print(f"[0/6] Output: {(OUT/name).resolve()}")
print("[1/6] Rebuilding the existing automation frames with the original generator.", flush=True)
subprocess.run([sys.executable, str(ROOT/"build-pixel-automation.py")], check=True)

# Each hexadecimal row encodes exactly five bitmap cells; no installed fonts.
LETTERS = {
    "A":"0e 11 11 1f 11 11 11", "B":"1e 11 11 1e 11 11 1e", "C":"0f 10 10 10 10 10 0f",
    "D":"1e 11 11 11 11 11 1e", "E":"1f 10 10 1e 10 10 1f", "F":"1f 10 10 1e 10 10 10",
    "G":"0e 11 10 17 11 11 0e", "H":"11 11 11 1f 11 11 11", "I":"1f 04 04 04 04 04 1f",
    "J":"07 02 02 02 12 12 0c", "K":"11 12 14 18 14 12 11", "L":"10 10 10 10 10 10 1f",
    "M":"11 1b 15 15 11 11 11", "N":"11 19 19 15 13 13 11", "O":"0e 11 11 11 11 11 0e",
    "P":"1e 11 11 1e 10 10 10", "Q":"0e 11 11 11 15 12 0d", "R":"1e 11 11 1e 14 12 11",
    "S":"0f 10 10 0e 01 01 1e", "T":"1f 04 04 04 04 04 04", "U":"11 11 11 11 11 11 0e",
    "V":"11 11 11 11 11 0a 04", "W":"11 11 11 15 15 15 0a", "X":"11 11 0a 04 0a 11 11",
    "Y":"11 11 0a 04 04 04 04", "Z":"1f 01 02 04 08 10 1f",
    "0":"0e 11 13 15 19 11 0e", "1":"04 0c 04 04 04 04 0e", "2":"0e 11 01 06 08 10 1f",
    "3":"1e 01 01 0e 01 01 1e", "4":"02 06 0a 12 1f 02 02", "5":"1f 10 10 1e 01 01 1e",
    "6":"0e 10 10 1e 11 11 0e", "7":"1f 01 02 04 08 08 08", "8":"0e 11 11 0e 11 11 0e",
    "9":"0e 11 11 0f 01 01 0e", "/":"01 01 02 04 08 10 10", "+":"00 04 04 1f 04 04 00",
    "_":"00 00 00 00 00 00 1f", ".":"00 00 00 00 00 0c 0c", ":":"00 0c 0c 00 0c 0c 00",
    "<":"02 04 08 10 08 04 02", ">":"08 04 02 01 02 04 08", "=":"00 00 1f 00 1f 00 00",
    "{":"03 04 04 08 04 04 03", "}":"18 04 04 02 04 04 18", "-":"00 00 00 1f 00 00 00",
}

def text(draw, x, y, value, color=0, scale=1):
    for letter in value:
        if letter != " ":
            for row, value in enumerate(LETTERS[letter].split()):
                bits = int(value,16)
                for col in range(5):
                    if bits & (1 << (4-col)):
                        draw.rectangle((x+col*scale,y+row*scale,x+(col+1)*scale-1,y+(row+1)*scale-1),fill=color)
        x += 6*scale

def panel(title):
    image = Image.new("1", (W,H),1)
    draw = ImageDraw.Draw(image)
    draw.line([(2,7),(2,152),(7,157),(248,157),(253,152),(253,7),(248,2),(7,2),(2,7)],fill=0,width=2)
    draw.line([(6,10),(6,149),(10,153),(245,153),(249,149),(249,10),(245,6),(10,6),(6,10)],fill=0)
    draw.rectangle((7,7,248,24),fill=0)
    text(draw,16,12,"NICOA / "+title,1)
    for x in [224,232,240]:
        draw.rectangle((x,13,x+3,16),fill=1)
    return image,draw

# Real web hit targets use exactly these logical-coordinate rectangles.
FIELDS = [
    {"label":"名稱欄位", "rect":[77,52,230,70]},
    {"label":"工具選單", "rect":[77,79,230,97]},
    {"label":"執行按鈕", "rect":[83,111,149,132]},
    {"label":"重設按鈕", "rect":[161,111,230,132]},
    {"label":"左側第一個項目", "rect":[18,49,61,67]},
    {"label":"左側第二個項目", "rect":[18,76,61,94]},
    {"label":"左側第三個項目", "rect":[18,103,61,121]},
]

def gui(state=0, pointer=False):
    image,draw = panel("INTERFACE")
    draw.rectangle((13,35,242,141),outline=0,width=2)
    draw.rectangle((14,36,241,44),fill=0)
    for x in [224,230,236]:
        draw.rectangle((x,38,x+2,40),fill=1)
    draw.line((67,45,67,139),fill=0,width=2)
    for index,field in enumerate(FIELDS):
        x1,y1,x2,y2 = field["rect"]
        active = state == index+1
        draw.rectangle((x1,y1,x2,y2),fill=0 if active else 1,outline=0,width=2 if index<4 else 1)
        fg = 1 if active else 0
        if index == 0:
            text(draw,x1+8,y1+6,"MY NEXT IDEA",fg)
        elif index == 1:
            text(draw,x1+8,y1+6,"PYTHON",fg)
            draw.polygon([(x2-14,y1+6),(x2-6,y1+6),(x2-10,y1+10)],fill=fg)
        elif index < 4:
            text(draw,x1+19,y1+7,"RUN" if index==2 else "RESET",fg)
        else:
            draw.rectangle((x1+5,y1+5,x1+11,y1+11),outline=fg)
            draw.line((x1+17,y1+8,x2-5,y1+8),fill=fg,width=2)
    if pointer and state:
        x1,y1,x2,y2 = FIELDS[state-1]["rect"]
        x,y = x2-10,y2-3
        draw.polygon([(x,y),(x,y+15),(x+4,y+11),(x+8,y+18),(x+11,y+16),(x+7,y+10),(x+14,y+10)],fill=0)
        draw.polygon([(x+2,y+4),(x+2,y+11),(x+5,y+7),(x+9,y+8)],fill=1)
    return image

def terminal(draw,x,y,receive,frame):
    draw.rectangle((x,y,x+74,y+88),fill=0)
    draw.rectangle((x+3,y+3,x+71,y+10),outline=1)
    for xx in [x+59,x+64,x+69]:
        draw.point((xx,y+6),fill=1)
    text(draw,x+10,y+20,"</>",1,2)
    rows = min(4,frame//3+1) if receive else 4
    for i in range(rows):
        draw.rectangle((x+9,y+47+i*9,x+12,y+49+i*9),fill=1)
        draw.rectangle((x+19,y+47+i*9,x+[60,49,57,42][i],y+49+i*9),fill=1)

def api(frame):
    image,draw = panel("API LINK")
    terminal(draw,13,42,frame>=12,frame%12)
    terminal(draw,169,42,frame<12,frame%12)
    draw.line([(87,68),(98,68),(98,59),(157,59),(157,68),(169,68)],fill=0,width=3)
    draw.line([(87,106),(98,106),(98,115),(157,115),(157,106),(169,106)],fill=0,width=3)
    draw.rectangle((103,68,153,106),fill=0)
    draw.rectangle((106,71,150,103),outline=1)
    delta=frame%6
    # Arrow silhouettes move in opposite directions in integer grid steps.
    x=111+delta
    draw.line((x,80,x+23,80),fill=1,width=3)
    draw.polygon([(x+21,75),(x+28,80),(x+21,85)],fill=1)
    x=141-delta
    draw.line((x,94,x-23,94),fill=1,width=3)
    draw.polygon([(x-21,89),(x-28,94),(x-21,99)],fill=1)
    packet_x = 91+int((frame%12)/11*74)
    if frame<12:
        draw.rectangle((packet_x-2,57,packet_x+2,61),fill=0)
    else:
        packet_x=256-packet_x
        draw.rectangle((packet_x-2,113,packet_x+2,117),fill=0)
    text(draw,18,141,"CLIENT")
    text(draw,179,141,"SERVER")
    text(draw,106,35,"SEND" if frame<12 else "REPLY")
    return image

def docs(frame):
    image,draw = panel("README")
    for offset in [10,5,0]:
        x,y=56-offset,34+offset
        draw.polygon([(x,y),(181-offset,y),(199-offset,y+18),(199-offset,141+offset),(x,141+offset)],fill=1,outline=0,width=2)
    draw.line([(181,34),(181,52),(199,52)],fill=0,width=2)
    text(draw,69,43,"README",0,2)
    draw.line((69,63,175,63),fill=0,width=2)
    draw.rectangle((68,71,186,117),fill=0)
    lines=["<IDEA>","  CODE = WORK", "  CREATE", "</IDEA>"]
    for i,line in enumerate(lines):
        visible=max(0,min(len(line),(frame-i*4)*2))
        if visible:
            text(draw,75,77+i*9,line[:visible],1)
        if i == min(3,frame//4) and frame<18 and frame%4<2:
            draw.rectangle((75+visible*6,77+i*9,78+visible*6,83+i*9),fill=1)
    for i,length in enumerate([96,71,84]):
        draw.rectangle((69,124+i*5,69+length,125+i*5),fill=0)
    if frame>=18:
        draw.rectangle((194,115,226,145),fill=0)
        draw.rectangle((197,118,223,142),outline=1)
        draw.line([(201,130),(208,136),(220,123)],fill=1,width=3)
    return image

gui_states=[gui(state) for state in range(8)]
api_frames=[]
doc_frames=[]
for frame in range(FRAMES):
    api_frames.append(api(frame))
    doc_frames.append(docs(frame))
    if (frame+1)%6 == 0:
        print(f"[2/6] API + document drawing: {frame+1}/{FRAMES} ({(frame+1)*100//FRAMES}%).")

def save_strip(frames,name):
    strip=Image.new("1",(W*len(frames),H),1)
    for index,frame in enumerate(frames):
        assert set(frame.convert("RGB").get_flattened_data()) <= {(0,0,0),(255,255,255)}
        strip.paste(frame,(index*W,0))
    strip.save(OUT/name)
    assert (OUT/name).read_bytes()[24] == 1, "Expected a 1-bit PNG"

save_strip(gui_states,FILES[0])
save_strip(api_frames,FILES[1])
save_strip(doc_frames,FILES[2])
print("[3/6] Written 8 GUI states and two 24-frame strips; PNG bit depth verified as 1.")

with Image.open(OUT/"automation-pixel-sprite.png") as sprite:
    automation=[sprite.crop((i*W,0,(i+1)*W,H)) for i in range(FRAMES)]
combined=[]
for frame in range(FRAMES):
    image=Image.new("1",(536,384),1)
    draw=ImageDraw.Draw(image)
    draw.rectangle((0,0,535,383),outline=0,width=2)
    text(draw,14,9,"NICOA / DEVELOPMENT",0,2)
    text(draw,14,30,"C++ / JAVA / PYTHON")
    state=[0,1,2,3,4,5,6,7][frame//3]
    image.paste(gui(state,True),(8,48))
    image.paste(automation[frame],(272,48))
    image.paste(api_frames[frame],(8,216))
    image.paste(doc_frames[frame],(272,216))
    combined.append(image.resize((1072,768),Image.Resampling.NEAREST))
combined[20].save(OUT/FILES[4])
combined[0].save(OUT/FILES[3],save_all=True,append_images=combined[1:],duration=[120,130]*12,loop=0,optimize=False,disposal=2)
print("[4/6] Written the four-panel animated GIF and still. GIF hover is a demonstration, not interactive.")
with Image.open(OUT/FILES[3]) as exported:
    assert exported.n_frames==FRAMES
    duration=0
    for i in range(exported.n_frames):
        exported.seek(i)
        assert set(exported.convert("RGB").get_flattened_data()) <= {(0,0,0),(255,255,255)}
        duration+=exported.info["duration"]
    assert duration==3000
assert gui_states[0].tobytes()!=gui_states[1].tobytes()
assert api_frames[0].tobytes()!=api_frames[5].tobytes()
assert doc_frames[0].tobytes()!=doc_frames[20].tobytes()
print("[5/6] Verified two-color GIF, 3000ms loop, actual GUI state changes and both animation sequences.")
manifest={"width":W,"height":H,"frames":FRAMES,"fps":8,"colors":["#000000","#ffffff"],"fields":FIELDS,"scenes":[{"id":"gui","title":"圖形化介面","sprite":FILES[0],"frames":8,"interactive":True},{"id":"automation","title":"自動化工具","sprite":"automation-pixel-sprite.png","frames":24},{"id":"api","title":"API 串接","sprite":FILES[1],"frames":24},{"id":"docs","title":"技術文件","sprite":FILES[2],"frames":24}],"gif":FILES[3],"still":FILES[4]}
(OUT/FILES[5]).write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("[6/6] All four scenes complete. Real hover hitboxes recorded in the manifest.")
