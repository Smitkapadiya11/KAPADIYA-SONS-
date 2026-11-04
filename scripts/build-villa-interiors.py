"""Build the villa's furnished interior design and bake four 360-degree tours.
Run with blender -b -P scripts/build-villa-interiors.py.
"""
import bpy
import math
import random
from pathlib import Path
from mathutils import Vector
from math import pi

root=Path(__file__).resolve().parents[1]
out=root/"pinyoursite/public/rooms"
out.mkdir(exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
rng=random.Random(37)
def rgb(h):
    return tuple(((int(h[i:i+2],16)/255+.055)/1.055)**2.4 for i in (0,2,4))+(1,)
def material(name,a,b=None,scale=(1,1,1),rough=.62,metal=0):
    m=bpy.data.materials.new(name);m.diffuse_color=rgb(a);m.use_nodes=True
    nodes=m.node_tree.nodes;link=m.node_tree.links.new;bs=nodes.get("Principled BSDF")
    bs.inputs["Base Color"].default_value=rgb(a);bs.inputs["Roughness"].default_value=rough;bs.inputs["Metallic"].default_value=metal
    if b:
        uv=nodes.new("ShaderNodeTexCoord")
        mul=nodes.new("ShaderNodeVectorMath");mul.operation='MULTIPLY';mul.inputs[1].default_value=scale
        link(uv.outputs["Object"],mul.inputs[0])
        noise=nodes.new("ShaderNodeTexNoise");noise.inputs['Scale'].default_value=4
        link(mul.outputs[0],noise.inputs['Vector'])
        ramp=nodes.new("ShaderNodeValToRGB");ramp.color_ramp.elements[0].color=rgb(a);ramp.color_ramp.elements[1].color=rgb(b)
        link(noise.outputs['Fac'],ramp.inputs[0]);link(ramp.outputs[0],bs.inputs["Base Color"])
        bump=nodes.new("ShaderNodeBump");bump.inputs['Strength'].default_value=.16;bump.inputs['Distance'].default_value=.014
        link(noise.outputs['Fac'],bump.inputs['Height']);link(bump.outputs[0],bs.inputs['Normal'])
    return m

plaster=material('Mineral plaster','e5d9c3','f7ebd3',(3,3,3))
oak=material('Quarter sawn teak','63402d','c69b6b',(.32,7,9))
walnut=material('Smoked walnut','412d21','967254',(.45,8,10))
stone=material('Honed travertine','aaa38e','e3d7bb',(1,2,7),.38)
linen=material('Flax linen','c8bca6','fff2db',(55,55,55))
sage=material('Olive velvet','526447','869171',(37,37,37))
clay=material('Burnt ochre','9d5539','dc9062')
metal=material('Antique brass','ab8857',rough=.28,metal=.8)
black=material('Blackened bronze','32312b',rough=.34,metal=.68)
china=material('Ivory porcelain','fff3d8',rough=.21)
green=material('Olive leaves','45573b','829451')
rug=material('Woven wool','9b8873','dbcbb4',(65,65,65))
mirror=material('Polished mirror','e7eeee',rough=.045,metal=1)
sky=material('Garden light','c1d5cc');sky.node_tree.nodes.get('Principled BSDF').inputs['Emission Color'].default_value=rgb('b8d6d2')
sky.node_tree.nodes.get('Principled BSDF').inputs['Emission Strength'].default_value=1
glow=material('Opal glass','fff2d6');glow.node_tree.nodes.get('Principled BSDF').inputs['Emission Color'].default_value=rgb('ffdb99')
glow.node_tree.nodes.get('Principled BSDF').inputs['Emission Strength'].default_value=4
offset=0
def finish(name,mat):
    o=bpy.context.object;o.name=name;o.data.materials.append(mat);return o
def cube(name,x,y,z,w,d,h,mat,r=.018):
    bpy.ops.mesh.primitive_cube_add(size=1,location=(offset+x,y,z))
    o=finish(name,mat);o.dimensions=(w,d,h);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if r:
        mod=o.modifiers.new('Soft joinery','BEVEL');mod.width=min(r,min(w,d,h)*.42);mod.segments=3
        mod=o.modifiers.new('Face normals','WEIGHTED_NORMAL')
    return o
def ball(name,x,y,z,w,d,h,mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,location=(offset+x,y,z))
    o=finish(name,mat);o.scale=(w/2,d/2,h/2)
    for p in o.data.polygons:p.use_smooth=True
    return o
def cyl(name,x,y,z,r,h,mat):
    bpy.ops.mesh.primitive_cylinder_add(vertices=48,radius=r,depth=h,location=(offset+x,y,z))
    o=finish(name,mat);m=o.modifiers.new('Soft rim','BEVEL');m.width=min(.018,h*.14);m.segments=3
    o.modifiers.new('Normals','WEIGHTED_NORMAL');return o
def lamp(x,y,z,energy,size,color,aim):
    dat=bpy.data.lights.new('Architectural light','AREA');dat.energy=energy;dat.shape='DISK';dat.size=size;dat.color=color
    o=bpy.data.objects.new('Architectural light',dat);scene.collection.objects.link(o);o.location=(offset+x,y,z)
    o.rotation_euler=(Vector((offset+aim[0],aim[1],aim[2]))-o.location).to_track_quat('-Z','Y').to_euler()
def plant(x,y,z,h):
    cyl('Ceramic planter',x,y,z+h*.16,h*.16,h*.32,clay)
    cyl('Branch',x,y,z+h*.58,.024,h*.67,walnut)
    for i in range(24):
        angle=i*2.4;length=h*(.14+.12*math.sin(pi*i/24))
        leaf=ball('Olive foliage',x+math.cos(angle)*length*.58,y+math.sin(angle)*length*.58,z+h*(.36+i*.026),length*1.65,.13*h,.065*h,green)
        leaf.rotation_euler=(0,-.32,angle)
def pendant(x,y,z):
    cyl('Pendant drop',x,y,(3.2+z)/2,.015,3.2-z,metal)
    ball('Opal globe',x,y,z,.36,.36,.36,glow);cyl('Socket',x,y,z+.16,.07,.12,metal)
def art(x,y,z,w,h):
    cube('Fine art frame',x,y,z,w,.06,h,walnut);cube('Canvas',x,y-.04,z,w-.065,.02,h-.065,linen)
    for i,(dx,dz,frac,m) in enumerate([(-.14,.13,.42,clay),(.12,-.13,.48,sage),(.12,.22,.17,oak)]):
        ball('Relief composition',x+dx*w,y-.065-i*.012,z+dz*h,w*frac,.033,h*frac,m)
def shell():
    cube('Floor substrate',0,0,-.10,7,7,.18,stone)
    for row in range(26):
        x=-3.50
        for n in range(5):
            length=min(1.2+((row+n*3)%6)*.20,3.50-x)
            if length<=0:break
            cube('Oak floorboard',x+length/2,-3.365+row*.269,-.009,length-.008,.265,.035,oak,.006);x+=length
    for y in (-3.5,3.5):
        cube('Plaster wall',0,y,1.6,7.2,.15,3.2,plaster)
        cube('Skirting',0,y-math.copysign(.085,y),.07,7,.06,.14,stone)
    cube('East wall',3.5,0,1.6,.15,7,3.2,plaster)
    for y in (-2.68,2.68):cube('Window reveal',-3.5,y,1.6,.18,1.65,3.2,plaster)
    cube('Sill',-3.5,0,.33,.22,3.8,.66,stone);cube('Window head',-3.5,0,3.02,.22,3.8,.36,plaster)
    for y in (-1.83,-.61,.61,1.83):cube('Window mullion',-3.5,y,1.75,.09,.046,2.23,black)
    cube('Roof',0,0,3.28,7.2,7.2,.15,plaster)
    cube('Door leaf',2.32,-3.405,1.10,1.04,.07,2.2,walnut)
    cube('Lever',2.67,-3.34,1,.15,.05,.035,metal)
    cube('Garden beyond glass',-7,0,2,.12,15,6,sky)
    for i in range(5):plant(-5.5,-3+i*1.3,.42,1.5+rng.random())
    for y in (-1.72,1.72):
        for i in range(6):cyl('Gathered linen',-3.33+(i%2)*.045,y+i*.052,1.60,.052,2.73,linen)
    lamp(-3.95,-.8,2.5,710,3.4,(1,.92,.78),(1,1,.55))
    lamp(1,-1,3.06,170,2.8,(1,.85,.66),(0,1,.7))
def living():
    cube('Wool rug',-.12,.74,.04,4.3,3.35,.048,rug)
    cube('Sofa plinth',-.42,2.33,.19,3.2,.94,.27,walnut,.08)
    for x in (-1.42,-.42,.58):
        cube('Seat cushion',x,2.24,.48,.98,.92,.31,linen,.12)
        cube('Back cushion',x,2.69,.80,1,.28,.71,linen,.12)
    for x in (-2.01,1.18):cube('Upholstered arm',x,2.30,.59,.23,1.06,.64,linen,.10)
    for x,m in [(-1.51,sage),(.70,clay)]:
        o=cube('Scatter cushion',x,2.46,.84,.52,.20,.47,m,.09);o.rotation_euler.y=.15
    for x,y,r,h in [(-.62,.47,.66,.37),(.37,.20,.47,.48)]:
        cyl('Pedestal',x,y,h/2,r*.52,h,walnut);cyl('Travertine table',x,y,h,r,.075,stone)
    cyl('Stoneware bowl',-.53,.42,.44,.19,.08,china)
    art(-.4,3.385,1.96,2.05,1.22);plant(2.2,2.50,.03,1.60)
    for x in (-2.45,1.62):pendant(x,2.16,1.94)
    cube('Media console',0,-3.10,.46,3.54,.48,.74,walnut);cube('Media screen',0,-3.394,1.55,2.12,.09,1.19,black)
def kitchen():
    for x in (-2.45,-1.48,-.51,.46,1.43,2.40):
        cube('Cabinet',x,2.95,.50,.95,.90,.96,sage)
        cube('Brass pull',x,2.48,.79,.32,.035,.035,metal)
        cube('Wall cabinet',x,3.18,2.40,.95,.5,.89,oak)
    cube('Worktop',0,2.90,1.01,5.91,1.04,.104,stone)
    cube('Stone splashback',0,3.38,1.53,5.93,.045,.92,stone)
    cube('Sink',-1.45,2.80,1.073,.75,.54,.035,black)
    cyl('Mixer tap',-1.45,3.04,1.22,.037,.34,metal)
    cube('Spout',-1.45,2.94,1.38,.068,.24,.06,metal)
    cube('Hob',1.20,2.78,1.072,.87,.62,.035,black)
    for x in (.99,1.42):
        for y in (2.64,2.92):cyl('Burner',x,y,1.10,.10,.02,basalt)
    cube('Island base',0,.61,.53,2.75,1.10,1.02,walnut);cube('Island slab',0,.46,1.07,3.15,1.47,.10,stone)
    for x in (-.96,0,.96):
        cyl('Stool plinth',x,-.60,.32,.10,.63,black);cyl('Dining stool',x,-.60,.67,.275,.14,sage);pendant(x,.50,2.32)
    cyl('Fruit bowl',.72,.47,1.15,.25,.085,china)
    for i in range(5):ball('Citrus',.70+math.sin(i)*.135,.47+math.cos(i)*.13,1.24,.14,.14,.14,clay)
    cube('Pantry',3.12,-.75,1.34,.65,2.5,2.6,oak)
    for y in (-1.56,-.72,.12):cube('Pantry handle',2.77,y,1.31,.045,.04,.49,metal)
def bedroom():
    cube('Bedroom rug',0,.82,.04,3.8,4.15,.05,rug)
    cube('Headboard',0,2.78,.91,3.54,.20,1.76,sage,.12)
    cube('Upholstered base',0,1.18,.31,2.37,3.02,.48,oak,.12)
    cube('Mattress',0,1.16,.59,2.32,2.95,.40,linen,.14)
    cube('Duvet',0,.78,.79,2.40,2.14,.22,linen,.12)
    cube('Folded throw',0,.13,.92,2.44,.67,.105,clay,.04)
    for x in (-.56,.56):cube('Feather pillow',x,2.14,.87,1.00,.61,.23,linen,.095)
    for x in (-1.93,1.93):
        cyl('Bedside table',x,2.10,.33,.38,.63,walnut);pendant(x,2.10,1.48)
    for k in range(34):cube('Headwall fluting',-2.7+k*.165,3.37,1.47,.074,.11,2.85,oak,.025)
    cube('Wardrobe',3.12,-.48,1.40,.66,3.65,2.78,walnut)
    for i in range(4):cube('Wardrobe front',2.76,-1.84+i*.87,1.4,.07,.85,2.7,oak)
    art(-1.18,-3.40,1.73,1.15,1.0);plant(-2.72,2.2,0,1.22)
def bath():
    cube('Stone floor',0,0,.044,6.95,6.95,.068,stone)
    for k in range(10):
        for j in range(5):cube('Travertine wall tile',-3.12+k*.69,3.399,.32+j*.64,.686,.075,.635,stone,.006)
    cube('Floating vanity',-.42,2.81,.72,2.77,.95,.56,walnut)
    cube('Vanity slab',-.42,2.79,1.04,2.92,1.0,.09,stone)
    for x in (-1.08,.27):
        cyl('Porcelain basin',x,2.70,1.15,.31,.19,china);cyl('Basin inset',x,2.7,1.252,.23,.013,stone)
        cyl('Tap',x,3.03,1.22,.038,.34,metal)
        o=cyl('Mirror frame',x,3.30,1.95,.54,.07,metal);o.rotation_euler.x=pi/2
        o=cyl('Mirror',x,3.25,1.95,.51,.04,mirror);o.rotation_euler.x=pi/2
    for x in (-1.88,1.09):pendant(x,2.93,1.96)
    ball('Freestanding bath',2.45,.50,.48,1.17,2.4,.92,china)
    ball('Bath inset',2.45,.50,.81,1.01,2.12,.35,stone)
    cyl('Bath filler',1.80,1,.56,.046,1.0,metal)
    cube('Rain shower column',-2.78,-3.36,1.48,.075,.08,1.67,metal)
    cube('Rain shower arm',-2.78,-3.08,2.31,.065,.56,.055,metal)
    cyl('Rain head',-2.78,-2.84,2.27,.23,.042,metal)
    cube('Shower plinth',-2.42,-2.57,.11,1.65,1.74,.11,stone)
    cube('WC cistern',.35,-3.25,.58,.58,.26,.85,china,.07)
    ball('WC pan',.35,-2.93,.39,.53,.78,.46,china)
    cube('Bath mat',-.52,1.57,.10,1.55,.77,.035,rug)
    plant(-2.52,2.65,.11,1.22)
basalt=black
rooms=[('living',living),('kitchen',kitchen),('bedroom',bedroom),('bath',bath)]
cameras=[]
for i,(name,furnish) in enumerate(rooms):
    offset=i*19
    before=set(scene.objects)
    shell();furnish()
    cam=bpy.data.cameras.new(name);cam.type='PANO';cam.panorama_type='EQUIRECTANGULAR'
    obj=bpy.data.objects.new(name+' tour point',cam);scene.collection.objects.link(obj)
    obj.location=(offset-.18,-1.47,1.46);obj.rotation_euler=(pi/2,0,0)
    cameras.append(obj)
    coll=bpy.data.collections.new(name.title());scene.collection.children.link(coll)
    for ob in set(scene.objects)-before:
        for old in list(ob.users_collection):old.objects.unlink(ob)
        coll.objects.link(ob)
# Finish each room with practical details and directional light through the glazing.
def bowl(name,x,y,z,rx,ry,h,mat):
    profile=[(.02,.02),(.68,.025),(.90,.21),(.99,.84),(1,.96),(.985,1),(.94,.98),(.91,.84),(.78,.40),(.61,.25),(.025,.20)]
    verts=[(rx*r*math.cos(i*2*pi/64),ry*r*math.sin(i*2*pi/64),v*h) for r,v in profile for i in range(64)]
    faces=[(k*64+i,k*64+(i+1)%64,(k+1)*64+(i+1)%64,(k+1)*64+i) for k in range(len(profile)-1) for i in range(64)]
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.materials.append(mat)
    ob=bpy.data.objects.new(name,mesh);scene.collection.objects.link(ob);ob.location=(offset+x,y,z)
    for f in mesh.polygons:f.use_smooth=True
    cyl('Drain',x,y,z+h*.21,.034,.008,metal)
for j,(name,_) in enumerate(rooms):
    offset=j*19
    collection=bpy.data.collections[name.title()]
    for ob in list(collection.objects):
        if ob.type=='LIGHT':
            ob.visible_glossy=False
            ob.data.energy*=.72
        if name=='bath' and ob.name.startswith(('Freestanding bath','Bath inset','Porcelain basin','Basin inset')):
            bpy.data.objects.remove(ob,do_unlink=True)
    before=set(scene.objects)
    # A small directional source gives window mullions and furniture legible shadows.
    lamp(-5.2,-1.7,3.28,1320,.32,(1,.88,.72),(1.4,1.75,.15))
    if name=='living':
        cube('Reading chair base',2.07,.34,.31,.91,.90,.45,walnut,.09)
        cube('Olive seat',2.05,.33,.53,.89,.85,.25,sage,.11)
        cube('Olive backrest',2.06,.69,.85,.91,.24,.63,sage,.11)
        for x in (1.59,2.54):cube('Chair arm',x,.30,.69,.10,.85,.14,oak,.04)
        for k,m in enumerate([walnut,linen,sage]):
            o=cube('Design monograph',.36,.21,.54+k*.043,.34,.25,.038,m,.008);o.rotation_euler.z=k*.12
        for k in range(12):cube('Rug border',-2.23+k*.37,-.85,.071,.16,.023,.008,walnut,.002)
    if name=='kitchen':
        cube('Integrated oven',1.42,2.47,.50,.82,.065,.66,black)
        cube('Oven door glass',1.42,2.42,.46,.66,.04,.38,mirror)
        cube('Oven handle',1.42,2.37,.73,.63,.04,.035,metal)
        for x in (1.14,1.70):ball('Oven control',x,2.40,.77,.055,.035,.055,metal)
        for x in (-1.46,1.48):cube('Task strip',x,3.12,1.948,2.73,.055,.025,glow)
        for i,m in enumerate([oak,walnut]):cube('Chopping board',-2.2+i*.27,3.23,1.28,.32,.055,.42,m,.04)
        cyl('Ceramic storage jar',2.45,2.94,1.23,.13,.31,china)
    if name=='bedroom':
        for k,m in enumerate([oak,clay,linen]):
            cube('Bedside library',-1.92,2.11,.68+k*.040,.32,.23,.035,m,.005)
        for k in range(12):cube('Stitched blanket stripe',0,-.13+k*.031,.975,2.31,.010,.008,rug,.002)
        cube('Upholstered bench',0,-.87,.48,1.71,.50,.19,sage,.075)
        for x in (-.65,.65):cube('Bench runner',x,-.87,.26,.16,.41,.33,walnut,.022)
    if name=='bath':
        bowl('Cast stone bath',2.45,.50,.09,.66,1.31,.70,china)
        for x in (-1.08,.27):bowl('Ceramic washbasin',x,2.70,1.095,.32,.26,.16,china)
        for k in range(3):cube('Folded guest towel',.91,2.79,1.14+k*.047,.42,.31,.043,linen,.016)
        for k in range(2):
            cyl('Amber soap bottle',-1.62+k*.14,2.97,1.20,.047,.20,clay)
            cyl('Soap pump',-1.62+k*.14,2.97,1.32,.023,.055,black)
    for ob in set(scene.objects)-before:
        if ob.type=='LIGHT':ob.visible_glossy=False
        for old in list(ob.users_collection):old.objects.unlink(ob)
        collection.objects.link(ob)
scene.world=bpy.data.worlds.new('Overcast daylight');scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.67,.77,.83,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.8
scene.view_settings.look='AgX - Medium High Contrast'
scene.render.engine='CYCLES';scene.cycles.samples=12;scene.cycles.use_denoising=True;scene.cycles.max_bounces=5
prefs=bpy.context.preferences.addons['cycles'].preferences
for backend in ['OPTIX','CUDA','HIP','METAL']:
    try:
        prefs.compute_device_type=backend;prefs.get_devices()
        devices=[d for d in prefs.devices if d.type==backend]
        if devices:
            for d in prefs.devices:d.use=d in devices
            scene.cycles.device='GPU';break
    except (TypeError,RuntimeError):pass
scene.render.resolution_x=3072;scene.render.resolution_y=1536;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='WEBP';scene.render.image_settings.quality=90
scene.camera=cameras[0];bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(root/'design/villa-interiors.blend'),compress=True)
for (name,_),camera in zip(rooms,cameras):
    scene.camera=camera;scene.render.filepath=str(out/(name+'.webp'));bpy.ops.render.render(write_still=True)
