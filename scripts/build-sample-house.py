"""Rebuild the gallery-inspired exterior with Blender --background --python this_file."""
import bpy
import math
import random
from collections import defaultdict
from pathlib import Path
from mathutils import Vector

root = Path(__file__).resolve().parents[1] / "pinyoursite"
bpy.ops.wm.read_factory_settings(use_empty=True)
rng = random.Random(17)
geometry = defaultdict(lambda: ([], []))
palette = dict(stucco="e7cba8", limestone="eedfc6", trim="f8e9d0", clay="925448",
               tile="b86e55", bronze="504941", glass="52706c", oak="ad7950",
               basalt="737571", paving="beb2a0", lawn="8b9a60", leaf="577044",
               sage="778b46", palm="68793d", earth="78664d", brass="c09c60")

def mesh(material, vertices, faces):
    points, polys = geometry[material]
    offset = len(points)
    points.extend(vertices)
    polys.extend(tuple(offset + i for i in f) for f in faces)

def box(x,y,z,w,d,h,mat):
    points=[(x+i*w/2,y+j*d/2,z+k*h/2) for k in (-1,1) for j in (-1,1) for i in (-1,1)]
    mesh(mat,points,[(0,2,3,1),(4,5,7,6),(0,1,5,4),(1,3,7,5),(3,2,6,7),(2,0,4,6)])

def rod(a,b,r,mat,sides=7):
    a,b=Vector(a),Vector(b)
    n=(b-a).normalized()
    u=n.cross(Vector((1,0,0)) if abs(n.x)<.8 else Vector((0,1,0))).normalized()
    v=n.cross(u)
    points=[tuple(p+r*(u*math.cos(i*math.tau/sides)+v*math.sin(i*math.tau/sides))) for p in (a,b) for i in range(sides)]
    mesh(mat,points,[tuple(reversed(range(sides))),tuple(range(sides,2*sides))]+[(i,(i+1)%sides,(i+1)%sides+sides,i+sides) for i in range(sides)])

def window(x,y,z,w,h,side=False):
    def panel(u,depth,v,width,thick,height,mat):
        if side: box(x-depth,y+u,z+v,thick,width,height,mat)
        else: box(x+u,y+depth,z+v,width,thick,height,mat)
    panel(0,0,0,w+.18,.15,h+.18,"trim")
    panel(0,-.09,0,w,.08,h,"bronze")
    panel(0,-.14,0,w-.12,.04,h-.12,"glass")
    for u in (-w/4,0,w/4):panel(u,-.18,0,.045,.04,h,"bronze")
    panel(0,-.18,h*.27,w,.05,.045,"bronze")
    panel(0,-.1,-h/2,w+.25,.30,.10,"limestone")

def roof(x,y,z,w,d,rise):
    ridge=(w-d)/2 if w>d else .16
    base=[(x-w/2,y-d/2,z),(x+w/2,y-d/2,z),(x+w/2,y+d/2,z),(x-w/2,y+d/2,z)]
    left,right=(x-ridge,y,z+rise),(x+ridge,y,z+rise)
    mesh("clay",base+[left,right],[(0,1,5,4),(1,2,5),(2,3,4,5),(3,0,4),(3,2,1,0)])
    for a,b,c,e in [(base[0],base[1],left,right),(base[1],base[2],right,right),(base[2],base[3],right,left),(base[3],base[0],left,left)]:
        a,b,c,e=map(Vector,(a,b,c,e))
        count=math.ceil((a-b).length/.18)
        for j in range(count):
            t=(j+.5)/count
            rod(a.lerp(b,t),c.lerp(e,t),.033,"tile",5)
    box(x,y,z-.08,w,d,.15,"bronze")

def railing(x,y,z,length):
    for dz in (.14,.77):box(x,y,z+dz,length,.075,.07,"bronze")
    count=round(length/.24)
    for j in range(count+1):box(x-length/2+j*length/count,y,z+.43,.034,.04,.78,"bronze")

def shrub(x,y,z,size):
    for j in range(9):
        ax=x+rng.uniform(-.3,.3)*size;ay=y+rng.uniform(-.3,.3)*size
        radius=size*rng.uniform(.24,.46); peak=z+size*rng.uniform(.5,.95)
        ring=[(ax+radius*math.cos(i*math.tau/7),ay+radius*math.sin(i*math.tau/7),z+size*.35) for i in range(7)]
        mesh(rng.choice(["leaf","sage","palm"]),ring+[(ax,ay,peak),(ax,ay,z)],[(i,(i+1)%7,7) for i in range(7)]+[((i+1)%7,i,8) for i in range(7)])

box(0,0,-.24,13,15,.48,"paving")
box(0,0,.01,12.75,14.75,.08,"lawn")
box(0,-5.35,.08,10.65,4.05,.12,"paving")
for j in range(12):box(0,-7.25+j*.32,.148,10.65,.016,.012,"basalt")
# Ground-floor entrance and recessed carport, projecting balconies and setback pavilion.
box(0,1.25,1.5,9.3,7.3,2.92,"stucco")
box(-2.65,-2.8,1.56,3.75,1.5,3,"limestone")
window(-2.65,-3.58,1.66,2.55,1.72)
box(.22,-2.46,1.32,1.25,.15,2.57,"oak")
for k in range(8):box(-.31+k*.15,-2.55,1.33,.023,.04,2.48,"bronze")
box(.64,-2.59,1.35,.05,.06,.43,"brass")
window(2.95,-2.47,1.66,2.05,1.48)
for x in (-4.47,4.47):box(x,-4,1.52,.34,.37,2.96,"limestone")
for x in (-4.47,4.47):box(x,-4,1.75,.40,.42,.14,"brass")
box(0,.25,3.05,9.65,9.15,.28,"trim")
box(0,1.03,4.55,9.3,7.55,2.85,"stucco")
for x in (-2.62,1.19):window(x,-2.79,4.52,2.65,2.28)
railing(-.86,-4.13,3.20,7.05)
box(-.9,-4.03,3.35,6.9,.36,.32,"earth")
for k in range(22):shrub(-4.14+k*.30,-4.02,3.50,.40)
# Tall limestone bay with paired arched windows.
box(3.38,-3.61,4.62,2.50,1.54,3.15,"limestone")
for x in (2.87,3.88):
    r=.28; bottom=3.70; shoulder=5.08
    cap=[(x+r*math.cos(t*math.pi/16),-4.397,shoulder+r*math.sin(t*math.pi/16)) for t in range(17)]
    mesh("glass",[(x-r,-4.397,bottom),(x+r,-4.397,bottom)]+cap,[tuple(range(19))])
    for a,b in zip(cap,cap[1:]):rod(a,b,.033,"bronze")
    for dx in (-r,r):rod((x+dx,-4.41,bottom),(x+dx,-4.41,shoulder),.035,"bronze")
    box(x,-4.42,4.25,2*r,.04,.045,"bronze")
for z in (1.6,4.6):
    for y in (-.9,2.35):window(4.67,y,z,1.6,1.35,True)
box(0,.60,6.12,9.6,8.65,.26,"trim")
box(-.35,1.15,7.13,7.65,5.4,1.98,"stucco")
window(-.36,-1.59,7.13,3.5,1.55)
for x in (-3.43,2.72):
    for i in range(8):box(x,-1.62,6.63+i*.12,.71,.12,.075,"oak")
railing(-.25,-3.50,6.26,8.70)
roof(-.35,1.15,8.18,8.75,6.28,1.18)
roof(-2.65,-3.40,3.09,4.45,2.05,.52)
for x in (-5.65,5.65):
    box(x,.55,.49,.19,12.7,.90,"limestone")
    for y in (-5.8,-2,2,6.8):box(x,y,.66,.32,.33,1.24,"trim")
for x in (-5,-.52):box(x,-5.92,1.12,.36,.40,2.18,"limestone")
box(-2.75,-5.92,2.25,4.86,.45,.30,"limestone")
for k in range(26):box(-4.80+k*.16,-5.92,.94,.046,.064,1.68,"bronze")
for y in (-3.0,-1,1,3.2,5):shrub(-5.15,y,.08,.98)
for x,y,h in [(5.12,-3.30,5.35),(-5.16,3.7,5.95)]:
    start=Vector((x,y,.06));top=Vector((x+.29,y+.22,h))
    rod(start,top,.13,"earth",10)
    for j in range(12):
        a=j*math.tau/12;v=Vector((math.cos(a),math.sin(a),0));side=Vector((-v.y,v.x,0))
        def mid(t):return top+v*(2.0*t)+Vector((0,0,.76*math.sin(t*math.pi)-.60*t))
        for k in range(12):
            t=k/12;rod(mid(t),mid((k+1)/12),.018,"palm",4)
            for sign in (-1,1):
                tip=mid(t)+side*sign*(.12+.28*math.sin(math.pi*t))+v*.34-Vector((0,0,.19))
                mesh("leaf" if j%2 else "sage",[tuple(mid(t)),tuple(tip),tuple(mid((k+1)/12))],[(0,1,2)])
# Continue the fenestration around the elevations the gallery does not show.
for z,back in [(1.60,4.9),(4.6,4.805),(7.12,3.85)]:
    for x in (-2.30,1.75):
        box(x,back+.03,z,1.96,.16,1.65,"trim")
        box(x,back+.13,z,1.80,.065,1.49,"glass")
        box(x,back+.18,z,.055,.045,1.49,"bronze")
for z in (1.6,4.6):
    for y in (-.3,2.55):
        box(-4.68,y,z,.16,1.93,1.58,"trim")
        box(-4.79,y,z,.055,1.78,1.42,"glass")
        box(-4.83,y,z,.045,.06,1.42,"bronze")
for mat,(points,faces) in geometry.items():
    m=bpy.data.meshes.new(mat);m.from_pydata(points,[],faces);m.update()
    ob=bpy.data.objects.new(mat,m);bpy.context.collection.objects.link(ob)
    material=bpy.data.materials.new(mat);rgb=bytes.fromhex(palette[mat])
    material.diffuse_color=tuple(((c/255+.055)/1.055)**2.4 for c in rgb)+(1,)
    material.use_nodes=True
    shader=material.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value=material.diffuse_color
    shader.inputs["Roughness"].default_value=.27 if mat=="glass" else .79
    m.materials.append(material)
bpy.ops.export_scene.gltf(filepath=str(root/"public"/"sample-house.glb"),export_format="GLB",export_yup=True)

# Keep an editable native scene alongside the generator, outside the web payload.
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type == "VIEW_3D":
            space = area.spaces.active
            space.region_3d.view_location = (0,0,3.6)
            space.region_3d.view_rotation = Vector((-.5,1,-.3)).to_track_quat("-Z","Y")
            space.region_3d.view_distance = 25
            space.shading.color_type = "MATERIAL"
            space.overlay.show_overlays = False
source = root.parent / "design" / "courtyard-villa.blend"
source.parent.mkdir(exist_ok=True)
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(source),compress=True)
