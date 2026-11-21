"""Build the PinYourSite plots world: estate site, four home designs and props.

Run: blender --background --python scripts/build-plots-world.py
Writes pinyoursite/public/world/{site.glb,kit.glb,scatter.json}.
Plan pixels from plots.json map to metres with S (0.46 ft per plan pixel).
"""
import sys
import json
import math
import random
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from bkit import Group, material, reset, export, props  # noqa: E402

root = Path(__file__).resolve().parents[1]
out = root / 'pinyoursite/public/world'
S = 0.1402
rng = random.Random(25)


def P(sx, sy):
    """Plan pixel to Blender metres (Y north = up the plan)."""
    return ((sx - 960) * S, -(sy - 540) * S)


def poly(*pts):
    return [P(*p) for p in pts]


def palette():
    material('earth', 'cbbd9f', .95)
    material('asphalt', '3a3c3f', .92)
    material('paint', 'f2efe6', .6)
    material('curb', 'c9c3b6', .85)
    material('paving', 'd8cfc0', .8)
    material('lawn', '6f8f45', 1.)
    material('track', 'b4664a', .95)
    material('rubber', 'c98b5a', .95)
    material('stone', 'b6a68d', .75)
    material('teak', '8d5f3b', .6)
    material('charcoal', '2c2f33', .45, .35)
    material('wall', 'ece6da', .85)
    material('steel', 'b9bdc2', .35, .8)
    material('lamp', 'fff1d0', .3, emit='ffd9a0')
    material('net', 'e8efe8', .8, alpha=.35)
    material('water', '3f9bb6', .05, .1)


def build_site():
    g = Group('site')
    # Estate pad, slightly above the meadow.
    g.prism('earth', poly((476, 258.5), (1140, 258.5), (1423, 817), (416, 797)), 0, .05)

    # Public arterial roads, extended past the plan for the horizon.
    def arterial(a, b, width_px):
        ax, ay = P(*a)
        bx, by = P(*b)
        dx, dy = bx - ax, by - ay
        ln = math.hypot(dx, dy)
        ux, uy = dx / ln, dy / ln
        nx, ny = -uy, ux
        w = width_px * S / 2
        a2 = (ax - ux * 90, ay - uy * 90)
        b2 = (bx + ux * 90, by + uy * 90)
        g.prism('asphalt', [(a2[0] + nx * w, a2[1] + ny * w), (b2[0] + nx * w, b2[1] + ny * w),
                            (b2[0] - nx * w, b2[1] - ny * w), (a2[0] - nx * w, a2[1] - ny * w)], -.02, .035)
        total = math.hypot(b2[0] - a2[0], b2[1] - a2[1])
        t = 0
        while t < total:
            p0 = (a2[0] + ux * t, a2[1] + uy * t)
            p1 = (a2[0] + ux * (t + 3), a2[1] + uy * (t + 3))
            g.strip('paint', p0, p1, .16, .035, .01)
            t += 7.5
        for side in (1, -1):
            off = w - .25
            g.strip('paint', (a2[0] + nx * off * side, a2[1] + ny * off * side),
                    (b2[0] + nx * off * side, b2[1] + ny * off * side), .12, .035, .01)
            s0 = (a2[0] + nx * (w + 1.3) * side, a2[1] + ny * (w + 1.3) * side)
            s1 = (b2[0] + nx * (w + 1.3) * side, b2[1] + ny * (w + 1.3) * side)
            g.strip('paving', s0, s1, 2.6, -.02, .15)
    arterial((430.5, 193), (349, 887), 108)
    arterial((1191.5, 193), (1543, 887), 160)

    # Internal 23 ft roads with curbs and dashed centre lines.
    for y0, y1, x0, x1 in ((368, 420, 455, 1205), (643, 695, 425, 1345)):
        g.prism('asphalt', poly((x0, y0), (x1, y0), (x1, y1), (x0, y1)), 0, .055)
        cy = (y0 + y1) / 2
        x = x0 + 40
        while x < x1 - 40:
            g.strip('paint', P(x, cy), P(x + 14, cy), .14, .055, .01)
            x += 34
        for yy in (y0, y1):
            g.strip('curb', P(x0 + 10, yy), P(x1 - 10, yy), .28, 0, .16)

    # Central amenity spine.
    g.prism('rubber', poly((820, 258.5), (905, 258.5), (905, 345), (820, 345)), .05, .1)
    g.prism('paving', poly((820, 345), (905, 345), (905, 368), (820, 368)), .05, .12)
    g.prism('track', poly((820, 420), (905, 420), (905, 643), (820, 643)), .05, .1)
    g.prism('lawn', poly((832, 434), (893, 434), (893, 629), (832, 629)), .05, .13)
    g.prism('lawn', poly((820, 695), (905, 695), (905, 808), (820, 808)), .05, .12)

    def gazebo(sx, sy, size=3.4):
        x, y = P(sx, sy)
        g.box('paving', x, y, .1, size + .6, size + .6, .25)
        for i in (-1, 1):
            for j in (-1, 1):
                g.box('teak', x + i * size / 2.3, y + j * size / 2.3, .35, .18, .18, 2.5)
        g.box('teak', x, y, 2.85, size + .4, size + .4, .16)
        g.prism('charcoal', [(x - size / 2 - .4, y - size / 2 - .4), (x + size / 2 + .4, y - size / 2 - .4),
                             (x + size / 2 + .4, y + size / 2 + .4), (x - size / 2 - .4, y + size / 2 + .4)], 3.0, 3.1)
        g.add('charcoal', [(x - size / 2 - .4, y - size / 2 - .4, 3.1), (x + size / 2 + .4, y - size / 2 - .4, 3.1),
                           (x + size / 2 + .4, y + size / 2 + .4, 3.1), (x - size / 2 - .4, y + size / 2 + .4, 3.1),
                           (x, y, 4.2)], [(0, 1, 4), (1, 2, 4), (2, 3, 4), (3, 0, 4)])
        for k in range(2):
            g.box('teak', x + (k * 2 - 1) * size / 3.4, y, .35, .45, size * .8, .45)
    gazebo(862, 356, 2.6)
    gazebo(887, 446, 2.8)
    gazebo(839, 615, 2.8)

    # Play equipment.
    x, y = P(842, 285)
    g.box('steel', x, y, .1, 1.6, 1.6, .12)
    for i in (-1, 1):
        for j in (-1, 1):
            g.cylinder('steel', x + i * .7, y + j * .7, .1, 2.4, .06, 6)
    g.box('teak', x, y, 1.5, 1.6, 1.6, .12)
    g.prism('track', [(x - .9, y - .9), (x + .9, y - .9), (x, y - 1.5)], 2.4, 2.5)
    g.add('steel', [(x + .8, y - .4, 1.5), (x + .8, y + .4, 1.5), (x + 3.6, y + .4, .15), (x + 3.6, y - .4, .15)], [(0, 1, 2, 3)])
    x, y = P(884, 280)
    for i in (-1, 1):
        g.add('charcoal', [(x + i * 1.6, y - .9, .1), (x + i * 1.6, y - .8, .1), (x + i * 1.6, y + .05, 2.6), (x + i * 1.6, y - .05, 2.6)], [(0, 1, 2, 3)])
        g.add('charcoal', [(x + i * 1.6, y + .9, .1), (x + i * 1.6, y + .8, .1), (x + i * 1.6, y + .05, 2.6), (x + i * 1.6, y - .05, 2.6)], [(0, 1, 2, 3)])
    g.strip('charcoal', (x - 1.6, y), (x + 1.6, y), .1, 2.55, .1)
    for i in (-.7, .7):
        g.box('teak', x + i, y, .55, .55, .22, .06)
    x, y = P(856, 324)
    g.cylinder('track', x, y, .1, .3, 1.3, 16)

    # Net cricket.
    x, y = P(862, 782)
    g.box('paving', x, y, .1, 3.4, 16, .08)
    for i in (-1, 1):
        for j in range(-2, 3):
            g.cylinder('steel', x + i * 1.9, y + j * 4, .1, 3.4, .05, 6)
        g.box('net', x + i * 1.9, y, .1, .02, 16, 3.3)
    g.box('net', x, y, 3.35, 3.8, 16, .02)

    # Entrance gates with lit lintels, plus a security cabin.
    def gate(sx, sy, horizontal_px=52):
        x, y = P(sx, sy)
        half = horizontal_px * S / 2 + .9
        for j in (-1, 1):
            g.box('stone', x, y + j * half, 0, 1.3, 1.3, 5.2)
            g.box('charcoal', x, y + j * half, 5.2, 1.5, 1.5, .18)
        g.box('teak', x, y, 4.3, 1.1, half * 2 + 1.3, .65)
        g.box('lamp', x, y, 4.24, .5, half * 2 - .2, .06)
        g.box('charcoal', x - .58, y, 4.4, .06, 4.5, .45)
    gate(470, 394)
    gate(1196, 394)
    gate(441, 669)
    gate(1335, 669)
    x, y = P(1186, 430)
    g.box('wall', x, y, .05, 2.8, 2.4, 2.6)
    g.box('charcoal', x, y, 2.65, 3.4, 3.0, .18)
    g.box('lamp', x - 1.41, y, .9, .04, 1.6, 1.1)

    # Compound wall on the two long boundaries.
    for a, b in (((476, 256), (1140, 256)), ((416, 800), (1423, 820))):
        g.strip('wall', P(*a), P(*b), .25, .05, 1.7)
        g.strip('charcoal', P(*a), P(*b), .32, 1.75, .08)
    return g.build()


def build_scatter():
    trees, lamps = [], []

    def T(kind, sx, sy, s=1.):
        x, y = P(sx, sy)
        trees.append([kind, round(x, 2), round(-y, 2), round(s * rng.uniform(.82, 1.18), 2), round(rng.uniform(0, 6.28), 2)])

    # Garden canopy and edge palms.
    for sy in range(446, 625, 30):
        T('round', 826, sy, .9)
        T('round', 899, sy + 14, .9)
    for sy in (705, 740, 775, 800):
        T('palm', 826, sy)
        T('palm', 899, sy)
    for sx in (826, 899):
        T('cone', sx, 263, .8)
    # Avenue trees along the arterial sidewalks.
    for t in range(0, 30):
        f = t / 29
        T('palm' if t % 2 else 'round', 372 + (283 - 372) * f - 18, 120 + 860 * f, 1.1)
        T('palm' if t % 2 else 'round', 1205 + (1580 - 1205) * f + 32, 150 + 790 * f, 1.1)
    # Meadow groves beyond the estate.
    for _ in range(90):
        while True:
            sx, sy = rng.uniform(-300, 2200), rng.uniform(-200, 1300)
            if not (250 < sx < 1700 and 170 < sy < 900):
                break
        T(rng.choice(('round', 'round', 'cone', 'palm')), sx, sy, rng.uniform(1, 1.5))
    for _ in range(30):
        sx = rng.uniform(470, 1400)
        sy = rng.choice((rng.uniform(150, 240), rng.uniform(830, 900)))
        T(rng.choice(('round', 'cone')), sx, sy, rng.uniform(.9, 1.3))

    # Street lights along both internal roads, alternating sides.
    for y0, y1, x0, x1 in ((368, 420, 455, 1205), (643, 695, 425, 1345)):
        x, side = x0 + 45, 0
        while x < x1 - 30:
            if not 812 < x < 912:
                yy = y0 + 2 if side % 2 else y1 - 2
                px, py = P(x, yy)
                lamps.append([round(px, 2), round(-py, 2), 1 if side % 2 else -1])
            x += 62
            side += 1
    return {'trees': trees, 'lamps': lamps, 'scale': S}


def home_palette():
    material('render', 'f1ede6', .88)
    material('render-warm', 'e3d5c1', .9)
    material('charcoal', '2d3034', .45, .3)
    material('teak', '93603a', .55)
    material('stone', 'a89a85', .8)
    material('glass', '26343b', .06, .4)
    material('rail', 'b8d4dc', .05, .1, alpha=.35)
    material('paving', 'd3cabb', .85)
    material('lawn', '6d8c45', 1.)
    material('leaf', '527240', .9)
    material('concrete', 'd5d1c9', .9)
    material('solar', '1d2a3e', .2, .6)


W, D = 5.4, 10.5
X0, X1, Y0, Y1 = -W / 2, W / 2, -D / 2, D / 2


def frontage(g, car=True):
    """Front garden, driveway and boundary wall ahead of the facade (y < -D/2)."""
    g.box('paving', 1.05, -6.6, 0, 3.1, 2.9, .06)
    g.box('lawn', -1.6, -6.6, 0, 2.1, 2.9, .07)
    g.box('render-warm', -1.6, -8.0, 0, 2.2, .18, .9)
    g.box('charcoal', -1.6, -8.0, .9, 2.25, .22, .05)
    g.blob('leaf', -2.1, -6.3, .55, .55, .55, .5, 4, 7)
    g.blob('leaf', -1.2, -6.9, .45, .42, .42, .38, 4, 7)
    for i in range(13):
        g.box('teak', -.35 + i * .23, -8.0, 0, .09, .07, 1.15)
    g.box('paving', 0, 0, 0, W, D, .3)


def glass_slab(g, x, y, z, w, h, face='front'):
    if face == 'front':
        g.box('glass', x, y, z, w, .08, h)
        g.box('charcoal', x, y - .02, z - .06, w + .12, .1, .06)
        g.box('charcoal', x, y - .02, z + h, w + .12, .1, .06)
    else:
        g.box('glass', x, y, z, .08, w, h)


def home_a():
    g = Group('home-a')
    frontage(g)
    g.box('render-warm', 0, .4, .3, W - .3, D - 1.6, 3.1)
    glass_slab(g, -.55, -4.36, .45, 3.2, 2.6)
    g.box('teak', 1.75, -4.38, .3, 1.1, .1, 2.8)
    g.box('render', 0, -.15, 3.4, W, D - .3, 3.1)
    glass_slab(g, 0, -5.32, 3.75, W - 1.0, 2.4)
    for i in range(15):
        g.box('teak', -2.2 + i * .314, -5.52, 3.55, .07, .14, 2.8)
    g.box('concrete', 0, -.15, 6.5, W + .1, D - .2, .22)
    g.box('render', 0, 2.6, 6.72, W - .6, 3.4, .9)
    for x in (-1.4, 1.4):
        g.box('glass', X1 + .01, x + 1.2, 4.0, .04, 1.4, 1.6)
    for i in range(3):
        g.box('solar', -1.6 + i * 1.2, -2.0, 6.85, 1.0, 1.7, .05)
    g.blob('leaf', 1.7, -3.9, 7.1, .5, .5, .4, 4, 7)
    g.blob('leaf', -1.9, -3.6, 7.0, .45, .45, .35, 4, 7)
    return g.build()


def home_b():
    g = Group('home-b')
    frontage(g)
    g.box('stone', 0, 1.1, .3, W - .2, D - 2.6, 3.1)
    glass_slab(g, -.2, -4.2, .45, 2.4, 2.65)
    g.box('charcoal', 1.85, -4.2, .3, 1.0, .12, 2.9)
    g.box('charcoal', -.65, -.6, 3.4, 4.1, D - 1.5, 3.0)
    g.box('glass', -.65, -5.36, 3.65, 3.7, .08, 2.45)
    g.box('glass', -2.72, -3.1, 3.65, .08, 3.5, 2.45)
    g.box('rail', 2.0, -4.0, 3.4, 1.35, .04, 1.05)
    g.box('paving', 2.05, -2.0, 3.32, 1.35, 6.8, .1)
    g.box('teak', 1.1, 2.6, 6.4, 3.0, 4.6, 2.6)
    g.box('glass', 1.1, .28, 6.75, 2.1, .06, 1.6)
    g.box('concrete', -.65, -.6, 6.4, 4.2, D - 1.4, .14)
    g.blob('leaf', 2.1, -3.5, 3.8, .45, .45, .4, 4, 7)
    g.box('leaf', -1.6, -3.0, 6.55, 1.6, 2.4, .25)
    return g.build()


def extrude_x(g, mat, profile, x0, x1):
    n = len(profile)
    verts = [(x0, y, z) for y, z in profile] + [(x1, y, z) for y, z in profile]
    faces = [(i, (i + 1) % n, n + (i + 1) % n, n + i) for i in range(n)]
    faces.append(tuple(range(n - 1, -1, -1)))
    faces.append(tuple(range(n, 2 * n)))
    g.add(mat, verts, faces)


def home_c():
    g = Group('home-c')
    frontage(g)
    extrude_x(g, 'render', [(Y0 + .2, .3), (Y1, .3), (Y1, 8.2), (Y0 + .2, 6.2)], X0 + .1, X1 - .1)
    extrude_x(g, 'charcoal', [(Y0 - .35, 6.15), (Y1 + .3, 8.25), (Y1 + .3, 8.45), (Y0 - .35, 6.35)], X0 - .25, X1 + .25)
    glass_slab(g, 0, Y0 + .16, 3.5, 4.4, 2.5)
    g.box('charcoal', 0, Y0 + .12, 3.45, .08, .12, 2.6)
    glass_slab(g, -.9, Y0 + .16, .45, 2.6, 2.4)
    g.box('teak', 1.6, Y0 + .14, .3, 1.2, .1, 2.6)
    g.box('teak', 0, Y0 - .3, 3.05, W - .2, .8, .16)
    for z in (4.2, 6.6):
        g.box('glass', X1 - .05, 1.5, z - 1.0, .06, 3.4, .9)
    g.blob('leaf', -2.0, -4.2, 3.6, .5, .4, .4, 4, 7)
    return g.build()


def home_d():
    g = Group('home-d')
    frontage(g)
    g.box('render-warm', 0, 0, .3, W - .2, D - .5, 3.0)
    glass_slab(g, -.4, Y0 + .18, .45, 3.4, 2.5)
    g.box('teak', 1.85, Y0 + .16, .3, .9, .1, 2.7)
    g.box('render', 0, 1.0, 3.3, W - .2, D - 2.5, 3.0)
    glass_slab(g, 0, -4.0, 3.45, 3.8, 2.4)
    g.box('rail', 0, Y0 + .1, 3.3, W - .4, .04, 1.05)
    g.box('leaf', 0, Y0 + .45, 3.3, W - .6, .5, .5)
    g.box('render', 0, 2.2, 6.3, W - .4, D - 5.0, 2.9)
    glass_slab(g, 0, -.95, 6.45, 3.2, 2.2)
    g.box('rail', 0, -2.4, 6.3, W - .6, .04, 1.05)
    for i in range(9):
        g.box('teak', -2.2 + i * .55, -1.9, 9.05, .1, 2.2, .12)
    g.box('concrete', 0, 2.2, 9.2, W - .3, D - 4.9, .16)
    g.box('leaf', 0, -2.0, 6.3, W - .8, .4, .45)
    return g.build()


reset()
palette()
build_site()
export(out / 'site.glb')

reset()
home_palette()
for fn in (home_a, home_b, home_c, home_d):
    fn()
props()
export(out / 'kit.glb')

(out / 'scatter.json').write_text(json.dumps(build_scatter(), separators=(',', ':')))
print('plots world written to', out)
