"""Run with Blender in the repository root after build-villa-interiors.py."""
import bpy
from pathlib import Path
root=Path(__file__).resolve().parents[1]
scene=bpy.context.scene
def finish(name,texture,scale):
    mat=bpy.data.materials[name];tree=mat.node_tree
    node=tree.nodes.new('ShaderNodeTexImage')
    node.image=bpy.data.images.load(str(root/'pinyoursite/public/finishes'/(texture+'.webp')),check_existing=True)
    node.image.pack();node.projection='BOX';node.projection_blend=.12;node.extension='MIRROR'
    coord=tree.nodes.new('ShaderNodeTexCoord')
    mul=tree.nodes.new('ShaderNodeVectorMath');mul.operation='MULTIPLY';mul.inputs[1].default_value=scale
    tree.links.new(coord.outputs['Object'],mul.inputs[0]);tree.links.new(mul.outputs[0],node.inputs['Vector'])
    tree.links.new(node.outputs['Color'],tree.nodes['Principled BSDF'].inputs['Base Color'])
finish('Quarter sawn teak','surat-teak',(.75,.75,.75))
finish('Honed travertine','kota',(.8,.8,.8))
m=bpy.data.materials['Flax linen'].copy();m.name='Ajrakh block print';finish(m.name,'ajrakh',(1.3,1.3,1.3))
for o in scene.objects:
    if o.name.startswith(('Scatter cushion','Folded throw','Bath mat')):o.data.materials[0]=m
# Suspended teak jhula along the east wall.
def block(name,loc,size,material):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    b=o.modifiers.new('Soft corners','BEVEL');b.width=.035;b.segments=3
    o.modifiers.new('Normals','WEIGHTED_NORMAL');o.data.materials.append(bpy.data.materials[material])
block('Jhula seat',(2.79,-.61,.61),(.70,1.82,.14),'Quarter sawn teak')
block('Swing cushion',(2.79,-.61,.73),(.62,1.7,.14),m.name)
for y in (-1.42,.2):
    for x in (2.53,3.05):
        bpy.ops.mesh.primitive_cylinder_add(vertices=12,radius=.015,depth=2.52,location=(x,y,1.90));bpy.context.object.data.materials.append(bpy.data.materials['Antique brass'])
scene.render.use_file_extension=True
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(root/'design/villa-interiors.blend'),compress=True)
for name in ['living','kitchen','bedroom','bath']:
    scene.camera=bpy.data.objects[name+' tour point'];scene.render.filepath=str(root/'pinyoursite/public/rooms'/(name+'.webp'));bpy.ops.render.render(write_still=True)
