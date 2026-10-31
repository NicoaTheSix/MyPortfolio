"""Draw twelve original monochrome service animations on integer pixel grids."""
from pathlib import Path
import json
import math
import sys
from PIL import Image, ImageDraw

sys.stdout.reconfigure(encoding="utf-8",line_buffering=True)
ROOT=Path(__file__).resolve().parent
OUT=ROOT/"assets"
W,H,N=240,122,24
FONT={
 "A":"0e 11 11 1f 11 11 11","B":"1e 11 11 1e 11 11 1e","C":"0f 10 10 10 10 10 0f",
 "D":"1e 11 11 11 11 11 1e","E":"1f 10 10 1e 10 10 1f","F":"1f 10 10 1e 10 10 10",
 "G":"0e 11 10 17 11 11 0e","H":"11 11 11 1f 11 11 11","I":"1f 04 04 04 04 04 1f",
 "J":"07 02 02 02 12 12 0c","K":"11 12 14 18 14 12 11","L":"10 10 10 10 10 10 1f",
 "M":"11 1b 15 15 11 11 11","N":"11 19 19 15 13 13 11","O":"0e 11 11 11 11 11 0e",
 "P":"1e 11 11 1e 10 10 10","Q":"0e 11 11 11 15 12 0d","R":"1e 11 11 1e 14 12 11",
 "S":"0f 10 10 0e 01 01 1e","T":"1f 04 04 04 04 04 04","U":"11 11 11 11 11 11 0e",
 "V":"11 11 11 11 11 0a 04","W":"11 11 11 15 15 15 0a","X":"11 11 0a 04 0a 11 11",
 "Y":"11 11 0a 04 04 04 04","Z":"1f 01 02 04 08 10 1f",
 "0":"0e 11 13 15 19 11 0e","1":"04 0c 04 04 04 04 0e","2":"0e 11 01 06 08 10 1f",
 "3":"1e 01 01 0e 01 01 1e","4":"02 06 0a 12 1f 02 02","5":"1f 10 10 1e 01 01 1e",
 "6":"0e 10 10 1e 11 11 0e","7":"1f 01 02 04 08 08 08","8":"0e 11 11 0e 11 11 0e",
 "9":"0e 11 11 0f 01 01 0e","/":"01 01 02 04 08 10 10","+":"00 04 04 1f 04 04 00",
 "=":"00 00 1f 00 1f 00 00","!":"04 04 04 04 04 00 04",".":"00 00 00 00 00 0c 0c",
 "<":"02 04 08 10 08 04 02",">":"08 04 02 01 02 04 08","-":"00 00 00 1f 00 00 00",
}

def text(d,x,y,s,color=0,scale=1):
 for char in s:
  if char!=" ":
   for row,hexa in enumerate(FONT[char].split()):
    for col in range(5):
     if int(hexa,16)&(1<<(4-col)):
      d.rectangle((x+col*scale,y+row*scale,x+(col+1)*scale-1,y+(row+1)*scale-1),fill=color)
  x+=6*scale

def window(d,x,y,w,h):
 d.rectangle((x,y,x+w,y+h),fill=1,outline=0,width=2)
 d.rectangle((x+2,y+2,x+w-2,y+10),fill=0)
 for xx in [x+6,x+12,x+18]: d.rectangle((xx,y+4,xx+2,y+6),fill=1)

def sheet(d,x,y,w=52,h=79):
 d.polygon([(x,y),(x+w-12,y),(x+w,y+12),(x+w,y+h),(x,y+h)],fill=1,outline=0,width=2)
 d.line([(x+w-12,y),(x+w-12,y+12),(x+w,y+12)],fill=0,width=2)

def check(d,x,y,color=0): d.line([(x,y+6),(x+6,y+12),(x+20,y-3)],fill=color,width=3)

def arrow(d,x,y,side=1,offset=0):
 x+=offset*side
 d.line((x,y,x+25*side,y),fill=0,width=3)
 d.polygon([(x+22*side,y-6),(x+30*side,y),(x+22*side,y+6)],fill=0)

def middle_zh(d,x,y):
 d.rectangle((x,y+4,x+14,y+15),outline=0,width=2)
 d.line((x+7,y,x+7,y+21),fill=0,width=2)

def bubble(d,x,y,label,active=False):
 d.polygon([(x,y),(x+37,y),(x+40,y+3),(x+40,y+27),(x+24,y+27),(x+17,y+34),(x+17,y+27),(x,y+27)],fill=1,outline=0,width=2)
 if label=="ZH": middle_zh(d,x+12,y+3)
 else: text(d,x+8,y+10,label)
 if active: d.line((x+6,y+23,x+33,y+23),fill=0,width=2)

def cat(d,x,y,pose=0):
 d.line([(x-9,y+24),(x-16,y+18-(pose%2)*3),(x-19,y+24)],fill=0,width=3)
 d.ellipse((x-9,y+18,x+10,y+35),fill=0)
 d.polygon([(x-12,y+2),(x-10,y-8),(x-3,y-2),(x+5,y-3),(x+12,y-9),(x+14,y+8),(x+10,y+19),(x-8,y+18)],fill=0)
 d.ellipse((x-9,y+2,x+11,y+17),fill=1)
 for xx in [x-5,x+5]: d.rectangle((xx,y+5,xx+1,y+8),fill=0)
 d.line([(x,y+10),(x+2,y+11),(x+5,y+10)],fill=0)
 d.line((x-12,y+10,x-18,y+8),fill=0)
 d.line((x+12,y+10,x+18,y+8),fill=0)
 d.line([(x-5,y+29),(x-10-(pose%3)*2,y+38),(x-17,y+38)],fill=0,width=3)
 d.line([(x+5,y+29),(x+11+(pose%2)*3,y+34),(x+19,y+34)],fill=0,width=3)

def avatar(d,x,y,phase=0):
 d.ellipse((x-10,y-12,x+10,y+9),fill=0)
 d.rectangle((x-7,y-4,x+7,y+6),fill=1)
 d.point((x-4,y),fill=0);d.point((x+4,y),fill=0)
 d.line((x-3,y+4,x+3,y+4),fill=0)
 d.polygon([(x-8,y+10),(x+8,y+10),(x+15,y+33),(x-15,y+33)],fill=0)
 d.line([(x+10,y+18),(x+21,y+20),(x+26,y+12-phase)],fill=0,width=3)

def teaching(d,f):
 window(d,63,20,113,75)
 for i in range(4):
  y=37+i*12;active=i==(f//5)%4
  d.rectangle((70,y,111+(i%2)*8,y+9),fill=0 if active else 1,outline=0)
  if active: d.rectangle((76,y+3,94,y+4),fill=1)
 cat(d,145,55,(f//3)%3)
 d.line((53,97,185,97),fill=0,width=4)
 avatar(d,28,66,f%3);avatar(d,211,64,(f+1)%3)
 bubble(d,6,9,"HI",f%12<6);bubble(d,190,7,"OK",f%12>=6)
 text(d,92,108,"LEARN + PLAY")

def game(d,f):
 window(d,8,8,174,99)
 d.line((15,94,177,94),fill=0,width=3)
 for x,y in [(17,25),(49,25),(122,40),(151,40),(160,82)]: d.rectangle((x,y,x+13,y+7),fill=0)
 x=39+min(f,19)*5
 cat(d,x,55-(4 if f%6<3 else 0),(f//2)%3)
 d.line((160,42,160,91),fill=0,width=2)
 d.polygon([(162,43),(176,49),(162,56)],fill=0)
 for key_index,(dx,dy) in enumerate([(0,-15),(-13,0),(13,0),(0,15)]):
  x,y=211+dx,48+dy
  active=(f//3)%4==key_index
  d.rectangle((x-5,y-5,x+5,y+5),fill=0 if active else 1,outline=0)
  points=[[(x-2,y+2),(x+2,y+2),(x,y-2)],[(x+2,y-2),(x+2,y+2),(x-2,y)],[(x-2,y-2),(x-2,y+2),(x+2,y)],[(x-2,y-2),(x+2,y-2),(x,y+2)]][key_index]
  d.polygon(points,fill=1 if active else 0)
 d.rounded_rectangle((190,86,232,110),radius=5,fill=1,outline=0,width=2)
 d.line((197,98,209,98),fill=0,width=3);d.line((203,92,203,104),fill=0,width=3)
 d.rectangle((219,93,222,96),fill=0);d.rectangle((224,101,227,104),fill=0)

def animation(d,f):
 for i,x in enumerate([11,66,121]):
  active=i==(f//4)%3
  d.rectangle((x,16,x+45,89),fill=0 if active else 1,outline=0,width=2)
  # Draw a running figure in a temporary binary layer so selected frames invert cleanly.
  layer=Image.new("1",(40,65),1);q=ImageDraw.Draw(layer)
  q.ellipse((14,5,26,17),fill=0)
  q.line((20,17,20,39),fill=0,width=4)
  q.line([(20,23),(9+i*2,30),(5,23+i*3)],fill=0,width=3)
  q.line([(20,24),(31,28-i*3),(34,20)],fill=0,width=3)
  q.line([(20,38),(11,49),(7+i*3,57)],fill=0,width=3)
  q.line([(20,38),(29,43),(34,54-i*3)],fill=0,width=3)
  ink=layer.convert("L").point(lambda p:255-p)
  d.rectangle((x+3,20,x+42,84),fill=0 if active else 1)
  d.bitmap((x+3,20),ink,fill=1 if active else 0)
 d.rectangle((185,35,228,72),outline=0,width=2)
 d.polygon([(199,43),(199,64),(217,54)],fill=0)
 d.line((12,107,228,107),fill=0,width=2)
 for x in [12,66,121,228]: d.rectangle((x-3,103,x+3,111),fill=1,outline=0)
 x=12+(f*9)%216;d.rectangle((x,101,x+8,113),fill=0)

def block(d,x,y,label,active=False):
 d.polygon([(x,y),(x+12,y),(x+15,y-3),(x+27,y-3),(x+30,y),(x+69,y),(x+69,y+18),(x+30,y+18),(x+27,y+21),(x+15,y+21),(x+12,y+18),(x,y+18)],fill=0 if active else 1,outline=0,width=2)
 text(d,x+8,y+6,label,1 if active else 0)

def debug(d,f):
 block(d,13,23,"IF",f<8);block(d,13,47,"THEN",8<=f<16);block(d,13,71,"MOVE",f>=16)
 x=90+(f%12)*3
 d.ellipse((x,27,x+42,69),fill=1,outline=0,width=4)
 d.line((x+35,63,x+58,86),fill=0,width=7)
 if f>=14: check(d,x+10,40)
 else:
  d.line((x+12,39,x+30,57),fill=0,width=3);d.line((x+30,39,x+12,57),fill=0,width=3)
 cat(d,200,72,f//4)
 if f>=17:
  bubble(d,183,8,"OK",True)

def software(d,f):
 for x in [8,151]:
  window(d,x,20,79,83)
  for i in range(4): d.rectangle((x+8,38+i*12,x+43,42+i*12),fill=0)
 bubble(d,45,58,"EN",f<12);bubble(d,187,58,"ZH",f>=12)
 arrow(d,98,48,1,f%5);arrow(d,142,79,-1,f%5)
 text(d,15,110,"INTERFACE")

def technical(d,f):
 for x in [17,169]:
  sheet(d,x,14,54,91)
  text(d,x+9,34,"</>")
  for i in range(4):
   if x==17 or f>=i*4: d.rectangle((x+9,55+i*10,x+42-(i%2)*8,57+i*10),fill=0)
 arrow(d,97,42,1,f%5);arrow(d,141,77,-1,f%5)
 text(d,15,111,"CODE");text(d,166,111,"TEXT")

def book(d,x,y,lines=5):
 d.rectangle((x,y,x+73,y+78),fill=1,outline=0,width=2)
 d.line((x+36,y,x+36,y+78),fill=0,width=2)
 d.rectangle((x+6,y+9,x+29,y+31),outline=0)
 d.line([(x+8,y+27),(x+17,y+17),(x+24,y+25),(x+28,y+20)],fill=0,width=2)
 for i in range(lines):
  d.rectangle((x+43,y+11+i*11,x+65,y+13+i*11),fill=0)
 for i in range(3):d.rectangle((x+6,y+42+i*10,x+28,y+44+i*10),fill=0)

def articles(d,f):
 book(d,9,24);book(d,157,24,min(5,f//4+1))
 arrow(d,95,47,1,f%6);arrow(d,139,79,-1,f%6)
 x=43+(f%8)*2
 d.polygon([(x,77),(x+28,37),(x+36,43),(x+9,83),(x-2,88)],fill=1,outline=0,width=2)
 d.line((x+25,41,x+32,47),fill=0,width=2)

def terminology(d,f):
 d.rectangle((19,14,99,110),fill=1,outline=0,width=2)
 for y in range(25,107,14):d.rectangle((12,y,27,y+5),fill=1,outline=0)
 for i,label in enumerate(["WORD","TONE","CLEAR","CHECK"]):
  y=28+i*19;active=i==(f//5)%4
  if active:d.rectangle((35,y-3,94,y+11),fill=0)
  text(d,40,y,label,1 if active else 0)
 bubble(d,120,15,"EN",f<12);bubble(d,181,15,"ZH",f>=12)
 d.ellipse((160,70,212,117),fill=0)
 if f>=10:check(d,175,85,1)
 else:text(d,178,89,"...",1)

def grid(d,x,y,cols,rows,cw=12,ch=12):
 d.rectangle((x,y,x+cols*cw,y+rows*ch),fill=1,outline=0,width=2)
 for i in range(1,cols):d.line((x+i*cw,y,x+i*cw,y+rows*ch),fill=0)
 for i in range(1,rows):d.line((x,y+i*ch,x+cols*cw,y+i*ch),fill=0)

def convert(d,f):
 sheet(d,13,13,61,94)
 for y in [32,39]:d.rectangle((22,y,58,y+2),fill=0)
 grid(d,22,51,3,4,13,10)
 window(d,150,20,80,84);grid(d,157,38,5,5,13,12)
 count=min(24,f+1)
 for i in range(count):
  row,col=divmod(i,5)
  if row<5:d.rectangle((159+col*13,40+row*12,166+col*13,44+row*12),fill=0)
 arrow(d,95,48,1,f%6);arrow(d,139,82,-1,f%6)

def formula(d,f):
 window(d,9,11,146,99);grid(d,18,32,4,5,30,12)
 row=min(4,f//4)
 for i in range(5):
  if i==row:d.rectangle((20,34+i*12,46,42+i*12),fill=0)
  text(d,27,35+i*12,str(i+1),1 if i==row else 0)
 d.rectangle((61,88,151,106),fill=1,outline=0,width=2)
 text(d,69,94,"SUM=15" if f>=20 else "SUM...")
 d.rectangle((176,17,228,110),fill=1,outline=0,width=3)
 d.rectangle((183,24,221,43),outline=0,width=2)
 total=[1,3,6,10,15][row]
 text(d,187,30,str(total))
 for i in range(12):
  x=183+(i%3)*13;y=51+(i//3)*13
  d.rectangle((x,y,x+9,y+9),fill=0 if i==(f//2)%12 else 1,outline=0)

def ocr(d,f):
 sheet(d,13,10,68,101)
 d.rectangle((24,28,69,67),outline=0,width=2)
 d.line([(27,61),(41,43),(52,56),(64,37)],fill=0,width=2)
 for y in [78,85,92]:d.rectangle((24,y,67,y+2),fill=0)
 y=29+(f%16)*4;d.line((20,y,75,y),fill=0,width=2)
 d.ellipse((56,58,98,100),fill=1,outline=0,width=4)
 d.line((91,94,112,114),fill=0,width=6)
 arrow(d,108,55,1,f%5)
 sheet(d,165,10,61,101)
 for i in range(min(7,max(0,(f-3)//3))):d.rectangle((175,32+i*10,213-(i%2)*9,34+i*10),fill=0)

def gear(d,cx,cy,r,f):
 a=f/24*math.tau/8
 points=[]
 for i in range(64):
  angle=i*math.tau/64+a;rr=r if i%8 in [1,2,3,4] else r-4
  points.append((round(cx+math.cos(angle)*rr),round(cy+math.sin(angle)*rr)))
 d.polygon(points,fill=0)
 d.ellipse((cx-5,cy-5,cx+5,cy+5),fill=1)

def batch(d,f):
 for offset in [8,4,0]:
  sheet(d,14+offset,19-offset,45,83)
  for i in range(4):d.rectangle((23+offset,40-offset+i*12,49+offset,42-offset+i*12),fill=0)
 gear(d,117,60,24,f);gear(d,144,29,15,-f);gear(d,146,89,14,-f)
 arrow(d,73,62,1,f%4);arrow(d,158,62,1,f%4)
 for index,(x,y) in enumerate([(188,16),(201,37),(214,58)]):
  sheet(d,x,y,23,48)
  if f>=[7,13,19][index]:check(d,x+4,y+18)
  else:d.line((x+5,y+19,x+16,y+19),fill=0,width=2)

SERVICES=[
 {"id":"scratch","title":"Scratch 教學","source":"service-scratch-zh.png","gradient":["#ff7a18","#ff4b83"],"titleRect":[228,88,1086,172],"scenes":[
  {"id":"teaching","title":"一對一教學","draw":teaching,"rect":[54,503,690,201]},
  {"id":"game","title":"遊戲製作","draw":game,"rect":[793,502,685,202]},
  {"id":"animation","title":"動畫實作","draw":animation,"rect":[47,783,700,200]},
  {"id":"debug","title":"邏輯與除錯","draw":debug,"rect":[800,782,680,198]}]},
 {"id":"translation","title":"中英文翻譯","source":"service-translation-zh.png","gradient":["#45a8ff","#a66bff"],"titleRect":[280,108,960,166],"scenes":[
  {"id":"software","title":"軟體介面","draw":software,"rect":[78,454,646,186]},
  {"id":"technical","title":"技術文件","draw":technical,"rect":[823,454,617,186]},
  {"id":"articles","title":"文章翻譯","draw":articles,"rect":[76,751,650,204]},
  {"id":"terminology","title":"用詞與語氣","draw":terminology,"rect":[807,751,653,206]}]},
 {"id":"office","title":"文書自動化","source":"service-office-zh.png","gradient":["#19b986","#53d8ed"],"titleRect":[369,78,792,233],"scenes":[
  {"id":"convert","title":"表格轉換","draw":convert,"rect":[71,410,656,201]},
  {"id":"formula","title":"公式計算","draw":formula,"rect":[810,414,658,195]},
  {"id":"ocr","title":"圖片轉文字","draw":ocr,"rect":[61,720,674,188]},
  {"id":"batch","title":"批次處理","draw":batch,"rect":[794,720,682,188]}]},
]

print(f"[0/5] Input drawing program: {Path(__file__).resolve()}")
for service in SERVICES:
 for scene in service["scenes"]:
  scene["sprite"]=f'{service["id"]}-{scene["id"]}-pixel.png'
  print(f'[0/5] Output: {(OUT/scene["sprite"]).resolve()}')
 for suffix in ["gif","png"]:print(f'[0/5] Output: {(OUT/(service["id"]+"-animation-preview."+suffix)).resolve()}')
print(f'[0/5] Output: {(OUT/"service-animation-manifest.json").resolve()}')
print("[1/5] Drawing primitives and twelve distinct scenes ready.")
OUT.mkdir(exist_ok=True)
all_services=[]
scene_count=0
for service in SERVICES:
 all_frames=[]
 for scene in service["scenes"]:
  frames=[]
  for f in range(N):
   image=Image.new("1",(W,H),1);draw=ImageDraw.Draw(image)
   scene["draw"](draw,f)
   assert set(image.convert("RGB").get_flattened_data())<={(0,0,0),(255,255,255)}
   frames.append(image)
  assert len({im.tobytes() for im in frames})>=4,f'Static scene: {scene["id"]}'
  strip=Image.new("1",(W*N,H),1)
  for i,image in enumerate(frames):strip.paste(image,(i*W,0))
  strip.save(OUT/scene["sprite"])
  assert (OUT/scene["sprite"]).read_bytes()[24]==1
  all_frames.append(frames);scene_count+=1
  print(f'[2/5] {scene_count}/12 ({scene_count*100//12}%) {service["id"]}/{scene["id"]}: 24 two-color frames.')
 previews=[]
 for f in range(N):
  image=Image.new("1",(496,292),1);draw=ImageDraw.Draw(image)
  text(draw,10,10,service["id"].upper()+" / PIXEL STUDY")
  for i,frames in enumerate(all_frames):
   x=6+(i%2)*244;y=35+(i//2)*126
   image.paste(frames[f],(x,y));draw.rectangle((x-1,y-1,x+W,y+H),outline=0)
  previews.append(image.resize((992,584),Image.Resampling.NEAREST))
 gif_name=service["id"]+"-animation-preview.gif"
 previews[0].save(OUT/gif_name,save_all=True,append_images=previews[1:],loop=0,duration=[120,130]*12,optimize=False,disposal=2)
 previews[20].save(OUT/(service["id"]+"-animation-preview.png"))
 with Image.open(OUT/gif_name) as gif:
  assert gif.n_frames==24
  duration=0
  for i in range(24):
   gif.seek(i);duration+=gif.info["duration"]
   assert set(gif.convert("RGB").get_flattened_data())<={(0,0,0),(255,255,255)}
  assert duration==3000
 all_services.append({**{k:v for k,v in service.items() if k!="scenes"},"width":W,"height":H,"frames":N,"fps":8,"gif":gif_name,"scenes":[{k:v for k,v in scene.items() if k!="draw"} for scene in service["scenes"]]})
 print(f'[3/5] {service["id"]}: GIF and preview exported; 3000ms loop verified.')
print("[4/5] All twelve PNG strips verified as 1-bit; all 288 frames contain black/white only and every scene changes.")
(OUT/"service-animation-manifest.json").write_text(json.dumps({"services":all_services},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("[5/5] Manifest written. Original service posters have not been read or modified.")
