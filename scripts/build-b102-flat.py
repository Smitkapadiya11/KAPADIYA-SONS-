"""Build and render the furnished B-102 cutaway. Run with Blender in background."""
import bpy,math,random
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[1];out=root/'public/apartments/flat';out.mkdir(exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
def color(h):
    return tuple(((int(h[i:i+2],16)/255+.055)/1.055)**2.4 for i in (0,2,4))+(1,)
def mat(name,tint,tex=None,rough=.58,metal=0):
    m=bpy.data.materials.new(name);m.diffuse_color=color(tint);m.use_nodes=True
    p=m.node_tree.nodes['Principled BSDF'];p.inputs['Base Color'].default_value=m.diffuse_color
    p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal
    if tex:
        img=m.node_tree.nodes.new('ShaderNodeTexImage');img.image=bpy.data.images.load(str(root/tex),check_existing=True);img.image.pack()
        m.node_tree.links.new(img.outputs['Color'],p.inputs['Base Color'])
    return m
fin='pinyoursite/public/finishes/'
wood=mat('Smoked teak','916945','design/materials/smoked-teak.webp')
stone=mat('Ivory marble','efe5d3','design/materials/ivory-marble.webp',.32)
fabric=mat('Natural khadi','fff3de','design/materials/khadi.webp')
ajrakh=mat('Ajrakh cotton','a9674b',fin+'ajrakh.webp')
kota=mat('Balcony Kota','70806d',fin+'kota-court.webp')
jade=mat('Glazed ceramic','69837a','design/materials/jade-tile.webp',.26)
wall=mat('Warm plaster','e9ddc9');edge=mat('Section cap','625746');olive=mat('Sage velvet','657758')
blue=mat('Indigo velvet','526575');brass=mat('Brass','b68f51',rough=.27,metal=.72)
cer=mat('Porcelain','fff7e8',rough=.23);dark=mat('Charcoal','393933');leaf=mat('Foliage','50733e')
clay=mat('Terracotta','ae7155');rug=mat('Wool rug','c6ab87');rng=random.Random(35)
def shape(name,x,y,z,w,d,h,m,r=0,kind='box'):
    if kind=='box':bpy.ops.mesh.primitive_cube_add(size=1,location=(x,y,z))
    elif kind=='cyl':bpy.ops.mesh.primitive_cylinder_add(vertices=24,radius=.5,depth=1,location=(x,y,z))
    else:bpy.ops.mesh.primitive_uv_sphere_add(segments=14,ring_count=8,location=(x,y,z))
    o=bpy.context.object;o.name=name;o.dimensions=(w,d,h);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.data.materials.append(m)
    if r:
        mod=o.modifiers.new('Rounded edges','BEVEL');mod.width=r;mod.segments=3
        o.modifiers.new('Normals','WEIGHTED_NORMAL')
    if kind=='ball':
        for p in o.data.polygons:p.use_smooth=True
    # Metric planar UVs preserve the grain scale across floors, furniture and counters.
    uv=o.data.uv_layers.active
    for p in o.data.polygons:
        n=p.normal
        for i in p.loop_indices:
            v=o.data.vertices[o.data.loops[i].vertex_index].co
            a,b=(v.x,v.y) if abs(n.z)>.65 else ((v.y,v.z) if abs(n.x)>.65 else (v.x,v.z))
            uv.data[i].uv=(a/(.48 if m==fabric else 1.25),b/(.48 if m==fabric else 1.25))
    return o
def cylinder(n,x,y,z,w,h,m):return shape(n,x,y,z,w,w,h,m,kind='cyl')
def partition(x,y,w,d,h=.86):
    shape('Cut wall',x,y,h/2,w,d,h,wall,.012);shape('Section line',x,y,h+.018,w+.012,d+.012,.035,edge,.006)
def plant(x,y,size):
    cylinder('Planter',x,y,.19*size,.45*size,.38*size,clay)
    for i in range(13):
        a=i*2.4;o=shape('Leaf',x+.14*size*math.cos(a),y+.14*size*math.sin(a),(.52+i*.025)*size,.46*size,.125*size,.09*size,leaf,kind='ball')
        o.rotation_euler=(0,-.52,a)
def bed(x,y,tone):
    shape('Teak bed',x,y,.25,1.66,2.05,.38,wood,.06)
    shape('Mattress',x,y,.47,1.64,2.02,.25,fabric,.075)
    shape('Headboard',x,y+1.01,.70,1.84,.13,1.16,tone,.06)
    shape('Duvet',x,y-.18,.64,1.69,1.57,.19,fabric,.09)
    shape('Block-printed throw',x,y-.64,.745,1.71,.44,.07,ajrakh,.025)
    for v in (-.40,.40):shape('Pillow',x+v,y+.69,.65,.73,.42,.17,fabric,.07)
    for v in (-1.08,1.08):
        cylinder('Nightstand',x+v,y+.68,.26,.44,.49,wood)
        cylinder('Reading lamp',x+v,y+.68,.60,.16,.21,brass)
# Living and kitchen west; two bedrooms east with baths between, per Wing B.
shape('Slab',0,0,-.15,9.9,7.45,.3,edge,.04)
shape('Marble floor',0,0,.014,9.80,7.36,.045,stone)
shape('Balcony slab',-3.30,4.19,-.13,3.30,1.04,.27,edge)
shape('Balcony paving',-3.30,4.19,.025,3.26,1.0,.06,kota)
for x in (-4.84,-1.76):partition(x,4.18,.14,1.07,.56)
for i in range(14):cylinder('Balcony baluster',-4.8+i*.232,4.66,.42,.04,.83,brass)
shape('Balcony handrail',-3.30,4.66,.86,3.15,.06,.07,wood,.02)
partition(-4.89,0,.14,7.47);partition(4.89,0,.14,7.47)
partition(1.66,3.66,6.57,.14);partition(-4.60,3.66,.55,.14)
partition(-3.03,-3.66,3.73,.14);partition(2.38,-3.66,5.1,.14)
for y,d in [(-3.12,1.04),(-.05,3.05),(3.12,1.09)]:partition(1.09,y,.14,d)
for y in (-.96,.90):partition(3.02,y,3.83,.13)
partition(3.12,-.03,.12,1.74)
# Doors into bathrooms from the bedrooms.
for y in (-.96,.90):
    # Split the existing divider into two runs around a genuine passage.
    for o in list(scene.objects):
        if o.name.startswith(('Cut wall','Section line')) and abs(o.location.x-3.02)<.01 and abs(o.location.y-y)<.01:
            bpy.data.objects.remove(o,do_unlink=True)
    for x,w in [(1.38,.55),(3.60,2.56)]:partition(x,y,w,.13)
# Second bathroom entrance from the bedroom side.
for o in list(scene.objects):
    if o.name.startswith(('Cut wall','Section line')) and abs(o.location.x-3.60)<.01 and abs(o.location.y+.96)<.01:
        bpy.data.objects.remove(o,do_unlink=True)
partition(2.92,-.96,1.20,.13);partition(4.64,-.96,.48,.13)
for y in (2.25,-2.29):
    shape('Bedroom floor',3.0,y,.048,3.7,2.64,.035,wood)
    shape('Bedroom rug',3.29,y,.073,2.41,2.32,.026,rug,.02)
    bed(3.30,y,olive if y>0 else blue)
    shape('Wardrobe',1.50,y+.42,.64,.50,1.13,1.16,wood,.025)
for x in (2.06,4.00):
    shape('Bath tiles',x,-.03,.055,1.78,1.70,.04,jade)
    shape('Vanity',x-.39,.56,.40,.78,.42,.70,wood,.025)
    shape('Basin rim',x-.39,.55,.78,.66,.40,.09,cer,.04)
    shape('Bowl inset',x-.39,.54,.831,.46,.25,.013,stone,.025)
    shape('WC',x+.44,.26,.26,.43,.67,.43,cer,.11)
    cylinder('Shower drain',x+.42,-.49,.085,.11,.018,dark)
# Sofa, reading chair, coffee table, dining setting.
shape('Dhurrie',-3.17,-.31,.063,2.97,3.60,.036,rug,.03)
shape('Sofa base',-4.20,-.36,.27,.88,2.76,.36,wood,.055)
for i in range(3):
    shape('Seat',-4.13,-1.22+i*.86,.46,.81,.83,.24,fabric,.085)
    shape('Back',-4.53,-1.22+i*.86,.68,.20,.84,.58,fabric,.07)
for y in (-1.76,1.03):shape('Arm',-4.20,y,.54,.91,.15,.41,fabric,.05)
for y in (-1.1,.55):shape('Ajrakh cushion',-4.37,y,.70,.24,.44,.36,ajrakh,.07)
for x,y,r in [(-2.96,-.48,.88),(-2.66,.15,.61)]:
    cylinder('Fluted base',x,y,.21,r*.63,.36,wood);cylinder('Marble table',x,y,.41,r,.08,stone)
shape('Reading chair',-2.54,1.18,.36,.77,.75,.55,olive,.11)
shape('Chair back',-2.54,1.51,.68,.77,.18,.45,olive,.06)
shape('Media ledge',.74,-1.46,.37,.42,1.60,.62,wood,.03)
shape('Display',.90,-1.46,.96,.07,1.38,.80,dark,.025)
shape('Dining table',-2.28,-2.70,.80,1.86,.82,.10,wood,.08)
for x in (-2.86,-1.7):
    cylinder('Table foot',x,-2.70,.41,.17,.78,brass)
    for y in (-3.32,-2.08):
        shape('Dining chair',x,y,.37,.48,.49,.40,olive,.06)
        cylinder('Porcelain plate',x,-2.7+(.19 if y>-2.7 else -.19),.86,.26,.019,cer)
# L-shaped kitchen plus utility; a low divider keeps the overhead sightline open.
shape('Kitchen cabinets',-.27,3.12,.48,2.44,.82,.91,olive,.025)
shape('Kitchen return',.56,2.1,.48,.77,1.97,.91,olive,.025)
shape('Kitchen worktop',-.27,3.10,.97,2.51,.89,.10,stone,.022)
shape('Marble return',.55,2.06,.97,.83,1.99,.10,stone,.022)
shape('Hob',.55,1.61,1.037,.63,.63,.032,dark,.025)
for x in (.39,.70):
    for y in (1.46,1.76):cylinder('Burner',x,y,1.064,.16,.022,edge)
shape('Sink',-.75,3.07,1.034,.66,.46,.035,dark,.035)
cylinder('Tap',-.75,3.34,1.17,.055,.30,brass)
for x,y in [(-4.46,3.98),(-2.03,4.07),(-4.47,-3.18)]:plant(x,y,.87)
cylinder('Balcony bistro table',-3.35,4.15,.56,.54,.07,wood);cylinder('Bistro pedestal',-3.35,4.15,.29,.12,.53,brass)
# Merge authored furniture by material so the web renderer has a bounded draw count.
for m in list(bpy.data.materials):
    group=[o for o in scene.objects if o.type=='MESH' and o.data.materials[0]==m]
    if not group:continue
    bpy.ops.object.select_all(action='DESELECT')
    for o in group:o.select_set(True)
    bpy.context.view_layer.objects.active=group[0]
    bpy.ops.object.convert(target='MESH');bpy.ops.object.join();bpy.context.object.name=m.name
bpy.ops.export_scene.gltf(filepath=str(out/'b102.gltf'),export_format='GLTF_SEPARATE',export_image_format='JPEG',export_image_quality=82)
world=bpy.data.worlds.new('Daylight');scene.world=world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs[1].default_value=.55
sun=bpy.data.lights.new('Window light','SUN');sun.energy=3;sun.angle=.12;sun.color=(1,.90,.78)
o=bpy.data.objects.new('Window light',sun);scene.collection.objects.link(o);o.rotation_euler=Vector((.6,.45,-1)).to_track_quat('-Z','Y').to_euler()
cam=bpy.data.cameras.new('Axonometric');cam.type='ORTHO';cam.ortho_scale=13.95
c=bpy.data.objects.new('Axonometric',cam);scene.collection.objects.link(c);c.location=(4,-11,19);c.rotation_euler=(Vector((0,.4,0))-c.location).to_track_quat('-Z','Y').to_euler();scene.camera=c
scene.render.engine='CYCLES';scene.cycles.samples=16;scene.cycles.use_denoising=True
prefs=bpy.context.preferences.addons['cycles'].preferences
try:
    prefs.compute_device_type='OPTIX';prefs.get_devices()
    if any(d.type=='OPTIX' for d in prefs.devices):
        for d in prefs.devices:d.use=d.type=='OPTIX'
        scene.cycles.device='GPU'
except (TypeError,RuntimeError):pass
scene.render.film_transparent=True;scene.render.resolution_x=4096;scene.render.resolution_y=3414;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA'
bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(root/'design/b102-flat.blend'),compress=True)
scene.render.image_settings.file_format='WEBP';scene.render.image_settings.quality=88
scene.render.filepath=str(out/'preview.webp');bpy.ops.render.render(write_still=True)
