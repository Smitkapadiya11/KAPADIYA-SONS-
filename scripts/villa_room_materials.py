"""Apply the authored material scans to the Blender room geometry before baking."""
import bpy
from pathlib import Path

def style_rooms(root):
    def surface(src,name,scale,rough,relief):
        m=bpy.data.materials.get(name) or bpy.data.materials[src].copy()
        m.name=name
        tree=m.node_tree;nodes=tree.nodes;link=tree.links.new
        bs=nodes['Principled BSDF']
        tex=nodes.new('ShaderNodeTexImage')
        tex.image=bpy.data.images.load(str(root/'design/materials'/(name+'.webp')),check_existing=True)
        tex.image.pack();tex.projection='BOX';tex.extension='MIRROR'
        coord=nodes.new('ShaderNodeTexCoord')
        mul=nodes.new('ShaderNodeVectorMath');mul.operation='MULTIPLY';mul.inputs[1].default_value=(scale,)*3
        link(coord.outputs['Object'],mul.inputs[0]);link(mul.outputs[0],tex.inputs['Vector'])
        link(tex.outputs['Color'],bs.inputs['Base Color']);bs.inputs['Roughness'].default_value=rough
        bump=nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.28;bump.inputs['Distance'].default_value=relief
        link(tex.outputs['Color'],bump.inputs['Height']);link(bump.outputs[0],bs.inputs['Normal'])
        return m
    cloth=surface('Flax linen','khadi',3.8,.87,.002)
    cloth.node_tree.nodes['Principled BSDF'].inputs['Sheen Weight'].default_value=.33
    wood=surface('Quarter sawn teak','smoked-teak',.55,.42,.004)
    marble=surface('Honed travertine','ivory-marble',.65,.29,.003)
    glaze=surface('Honed travertine','jade-tile',1.25,.22,.009)
    for o in bpy.context.scene.objects:
        if o.type!='MESH' or not len(o.data.materials):continue
        for prefixes,m in [
            (('Seat cushion','Back cushion','Upholstered arm','Duvet','Feather pillow','Folded guest towel','Gathered linen'),cloth),
            (('Wall cabinet','Wardrobe front','Floating vanity','Headwall fluting','Door leaf','Media console','Oak floorboard'),wood),
            (('Island slab','Worktop','Stone splashback','Vanity slab','Travertine table'),marble),
            (('Travertine wall tile',),glaze)]:
            if o.name.startswith(prefixes):o.data.materials[0]=m;break
    garden=bpy.data.materials['Garden light'].node_tree
    nodes=garden.nodes;link=garden.links.new
    tex=nodes.new('ShaderNodeTexImage')
    tex.image=bpy.data.images.load(str(root/'pinyoursite/public/finishes/surat-garden.webp'),check_existing=True)
    tex.image.pack()
    coord=nodes.new('ShaderNodeTexCoord');split=nodes.new('ShaderNodeSeparateXYZ');join=nodes.new('ShaderNodeCombineXYZ')
    link(coord.outputs['Generated'],split.inputs[0]);link(split.outputs['Y'],join.inputs['X']);link(split.outputs['Z'],join.inputs['Y'])
    v=nodes.new('ShaderNodeVectorMath');v.operation='MULTIPLY_ADD';v.inputs[1].default_value=(.45,.53,1);v.inputs[2].default_value=(.25,.24,0)
    link(join.outputs[0],v.inputs[0]);link(v.outputs[0],tex.inputs['Vector'])
    emit=nodes.new('ShaderNodeEmission');emit.inputs[1].default_value=1.2;link(tex.outputs[0],emit.inputs[0])
    link(emit.outputs[0],nodes['Material Output'].inputs['Surface'])
