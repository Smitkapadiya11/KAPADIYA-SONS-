"""Small geometry kit shared by the Blender world builders.

Geometry is collected per group and per material, then written as one mesh per
material. That keeps exported scenes to a handful of draw calls on phones.
Blender axes: X east, Y north, Z up. glTF export turns this into Three.js
(x, z, -y), so Blender -Y is Three.js +Z.
"""
import bpy
import math
from collections import defaultdict


def srgb(h):
    return tuple(((int(h[i:i + 2], 16) / 255 + .055) / 1.055) ** 2.4 for i in (0, 2, 4)) + (1,)


MATERIALS = {}


def material(name, tint, rough=.7, metal=0., emit=None, alpha=None):
    if name in MATERIALS:
        return name
    m = bpy.data.materials.new(name)
    m.diffuse_color = srgb(tint)
    try:
        m.use_nodes = True
    except AttributeError:
        pass
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = srgb(tint)
    p.inputs['Roughness'].default_value = rough
    p.inputs['Metallic'].default_value = metal
    if emit:
        p.inputs['Emission Color'].default_value = srgb(emit)
        p.inputs['Emission Strength'].default_value = 1.0
    if alpha is not None:
        p.inputs['Alpha'].default_value = alpha
        try:
            m.surface_render_method = 'BLENDED'
        except AttributeError:
            m.blend_method = 'BLEND'
    MATERIALS[name] = m
    return name


class Group:
    def __init__(self, name):
        self.name = name
        self.parts = defaultdict(lambda: ([], []))

    def add(self, mat, verts, faces):
        v, f = self.parts[mat]
        o = len(v)
        v.extend(verts)
        f.extend(tuple(o + i for i in face) for face in faces)

    # Axis-aligned or Z-rotated box centred on (x, y) with base at z.
    def box(self, mat, x, y, z, w, d, h, rot=0.):
        c, s = math.cos(rot), math.sin(rot)
        pts = []
        for k in (0, 1):
            for j in (-1, 1):
                for i in (-1, 1):
                    px, py = i * w / 2, j * d / 2
                    pts.append((x + px * c - py * s, y + px * s + py * c, z + k * h))
        self.add(mat, pts, [(0, 2, 3, 1), (4, 5, 7, 6), (0, 1, 5, 4), (1, 3, 7, 5), (3, 2, 6, 7), (2, 0, 4, 6)])

    def prism(self, mat, poly, z0, z1, top=True, bottom=False):
        n = len(poly)
        if sum(poly[i][0] * poly[(i + 1) % n][1] - poly[(i + 1) % n][0] * poly[i][1] for i in range(n)) < 0:
            poly = poly[::-1]
        verts = [(x, y, z0) for x, y in poly] + [(x, y, z1) for x, y in poly]
        faces = [(i, (i + 1) % n, n + (i + 1) % n, n + i) for i in range(n)]
        if top:
            faces.append(tuple(range(n, 2 * n)))
        if bottom:
            faces.append(tuple(range(n - 1, -1, -1)))
        self.add(mat, verts, faces)

    def cylinder(self, mat, x, y, z0, z1, r, sides=10, r2=None):
        r2 = r if r2 is None else r2
        verts = []
        for z, rad in ((z0, r), (z1, r2)):
            for i in range(sides):
                a = 2 * math.pi * i / sides
                verts.append((x + rad * math.cos(a), y + rad * math.sin(a), z))
        faces = [(i, (i + 1) % sides, sides + (i + 1) % sides, sides + i) for i in range(sides)]
        faces.append(tuple(range(sides, 2 * sides)))
        self.add(mat, verts, faces)

    def blob(self, mat, x, y, z, rx, ry, rz, rings=5, segs=8):
        verts = [(x, y, z - rz)]
        for r in range(1, rings):
            phi = math.pi * r / rings
            for s in range(segs):
                a = 2 * math.pi * s / segs
                verts.append((x + rx * math.sin(phi) * math.cos(a), y + ry * math.sin(phi) * math.sin(a), z - rz * math.cos(phi)))
        verts.append((x, y, z + rz))
        faces = [(0, 1 + (s + 1) % segs, 1 + s) for s in range(segs)]
        for r in range(rings - 2):
            a0, a1 = 1 + r * segs, 1 + (r + 1) * segs
            faces += [(a0 + s, a0 + (s + 1) % segs, a1 + (s + 1) % segs, a1 + s) for s in range(segs)]
        top = len(verts) - 1
        last = 1 + (rings - 2) * segs
        faces += [(last + s, last + (s + 1) % segs, top) for s in range(segs)]
        self.add(mat, verts, faces)

    # A flat strip between two points, lying on z.
    def strip(self, mat, a, b, width, z, h=.02):
        dx, dy = b[0] - a[0], b[1] - a[1]
        length = math.hypot(dx, dy)
        self.box(mat, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z, length, width, h, math.atan2(dy, dx))

    def build(self, parent=None, smooth=()):
        root = bpy.data.objects.new(self.name, None)
        bpy.context.scene.collection.objects.link(root)
        if parent:
            root.parent = parent
        for mat, (verts, faces) in self.parts.items():
            if not faces:
                continue
            me = bpy.data.meshes.new(self.name + '-' + mat)
            me.from_pydata(verts, [], faces)
            me.validate()
            me.materials.append(MATERIALS[mat])
            uv = me.uv_layers.new(name='UVMap')
            for p in me.polygons:
                n = p.normal
                p.use_smooth = mat in smooth
                for li in p.loop_indices:
                    v = me.vertices[me.loops[li].vertex_index].co
                    if abs(n.z) > .7:
                        uv.data[li].uv = (v.x, v.y)
                    elif abs(n.x) > abs(n.y):
                        uv.data[li].uv = (v.y, v.z)
                    else:
                        uv.data[li].uv = (v.x, v.z)
            ob = bpy.data.objects.new(self.name + '-' + mat, me)
            bpy.context.scene.collection.objects.link(ob)
            ob.parent = root
        return root


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    MATERIALS.clear()


def export(path):
    path.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=str(path), export_format='GLB', export_yup=True,
                              export_apply=True, export_texcoords=True, export_normals=True,
                              export_materials='EXPORT', export_cameras=False, export_lights=False)


def props():
    """Trees and a street light, instanced by the web scenes."""
    material('leaf', '527240', .9)
    material('charcoal', '2d3034', .45, .3)
    material('bark', '6b5442', .9)
    material('leaf-dark', '3f5b31', .95)
    material('frond', '5f7d37', .9)
    material('lamp', 'fff1d0', .3, emit='ffd9a0')
    g = Group('tree-round')
    g.cylinder('bark', 0, 0, 0, 2.6, .16, 6, .1)
    for x, y, z, r in ((0, 0, 3.6, 1.7), (.8, .3, 3.0, 1.2), (-.7, -.4, 3.1, 1.25), (.1, .2, 4.5, 1.2)):
        g.blob('leaf', x, y, z, r, r, r * .85, 5, 8)
    g.build()
    g = Group('tree-cone')
    g.cylinder('bark', 0, 0, 0, 1.2, .12, 6, .08)
    g.cylinder('leaf-dark', 0, 0, 1.0, 6.2, 1.1, 8, .05)
    g.build()
    g = Group('tree-palm')
    x = y = 0.
    for i in range(6):
        nx = x + .12 * i
        g.cylinder('bark', x, y, i * 1.1, (i + 1) * 1.1, .17 - i * .012, 6, .16 - i * .012)
        x = nx
    top = 6.6
    for k in range(7):
        a = k * 2 * math.pi / 7
        cx, cy = x + math.cos(a) * 1.3, y + math.sin(a) * 1.3
        g.add('frond', [(x, y, top + .1), (cx + math.sin(a) * .45, cy - math.cos(a) * .45, top - .35),
                        (x + math.cos(a) * 2.6, y + math.sin(a) * 2.6, top - 1.1),
                        (cx - math.sin(a) * .45, cy + math.cos(a) * .45, top - .35)], [(0, 1, 2, 3), (3, 2, 1, 0)])
    g.blob('bark', x, y, top, .35, .35, .3, 4, 6)
    g.build()
    g = Group('lamp')
    g.cylinder('charcoal', 0, 0, 0, 6.4, .09, 8, .06)
    g.box('charcoal', 0, -.7, 6.3, .16, 1.5, .12)
    g.box('lamp', 0, -1.25, 6.24, .3, .55, .06)
    g.build()
