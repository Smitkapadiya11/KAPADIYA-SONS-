"""Build the PinYourSite Apartments world: stackable tower floors and the site.

Run: blender --background --python scripts/build-apartments-world.py
Writes public/apartments/world/{towers.glb,site.glb,layout.json}.
Each floor module carries its glazing split into four flats (glass-q1..q4,
clockwise from the north-west), matching unit suffixes 01..04 in the plans.
"""
import sys
import json
import math
import random
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from bkit import Group, material, reset, export, props  # noqa: E402

root = Path(__file__).resolve().parents[1]
out = root / 'public/apartments/world'
rng = random.Random(102)
K = 0.031          # metres per floor-plan pixel
FLOOR = 3.0
PODIUM = 4.5
FLOORS = 22

PLATES = {
    'wide': {'w': 1296 * K, 'd': 616 * K, 'crop': [312, 232, 1608, 848],
             'balconies': [(690 - 960) * K, (1231 - 960) * K]},
    'square': {'w': 808 * K, 'd': 758 * K, 'crop': [556, 160, 1364, 918],
               'balconies': [(882 - 960) * K, (1009 - 960) * K]},
}
TOWERS = {
    'A': {'plate': 'wide', 'x': -27, 'z': -31},
    'B': {'plate': 'square', 'x': 33, 'z': -27},
    'C': {'plate': 'wide', 'x': -27, 'z': 33},
}


def palette():
    material('slab', 'eeeae3', .8)
    material('render', 'e4ddd2', .85)
    material('fin', '3a3c3f', .5, .3)
    material('rail', 'bcd6de', .05, .1, alpha=.32)
    material('leaf', '4f7140', .95)
    material('teak', '8b5e3c', .6)
    material('lobby', '2a363c', .08, .4)
    material('stone', 'b2a48e', .75)
    material('water', '3aa2c2', .04, .1)
    material('steel', 'b9bdc2', .35, .8)
    material('lamp', 'fff1d0', .3, emit='ffd9a0')
    for q in range(1, 5):
        material('glass-q%d' % q, '27343a', .06, .4)


def quadrant(x, y):
    """Blender y is north. q1 NW, q2 NE, q3 SE, q4 SW."""
    if y >= 0:
        return 1 if x < 0 else 2
    return 4 if x < 0 else 3


def floor_module(kind):
    p = PLATES[kind]
    w, d = p['w'], p['d']
    g = Group('floor-' + kind)
    g.box('slab', 0, 0, FLOOR - .32, w + .5, d + .5, .32)
    g.box('render', 0, 0, 0, w - 1.2, d - 1.2, FLOOR - .32)

    # Glazed bays separated by piers on every face, each pane owned by its flat.
    def face(axis, sign, length):
        bays = max(3, round(length / 3.3))
        step = length / bays
        for i in range(bays):
            c = -length / 2 + step * (i + .5)
            pier = -length / 2 + step * i
            if axis == 'x':
                x, y = c, sign * (d / 2 - .05)
                g.box('glass-q%d' % quadrant(x, y), x, y, .1, step - .55, .08, FLOOR - .5)
                g.box('slab', pier, y, 0, .5, .4, FLOOR - .32)
            else:
                x, y = sign * (w / 2 - .05), c
                g.box('glass-q%d' % quadrant(x, y), x, y, .1, .08, step - .55, FLOOR - .5)
                g.box('slab', x, pier, 0, .4, .5, FLOOR - .32)
                if i % 2 == 0:
                    g.box('fin', x + sign * .35, pier + step / 2, 0, .12, .08, FLOOR - .32)
        if axis == 'x':
            g.box('slab', length / 2, sign * (d / 2 - .05), 0, .5, .4, FLOOR - .32)
        else:
            g.box('slab', sign * (w / 2 - .05), length / 2, 0, .4, .5, FLOOR - .32)
    face('x', 1, w)
    face('x', -1, w)
    face('y', 1, d)
    face('y', -1, d)

    # Living-room balconies with glass guards on both long faces.
    for bx in p['balconies']:
        for sign in (1, -1):
            y = sign * (d / 2 + .7)
            g.box('slab', bx, y, -.05, 3.6, 1.4, .18)
            g.box('rail', bx, sign * (d / 2 + 1.38), .13, 3.6, .04, 1.05)
            g.box('fin', bx - 1.82, y, .13, .06, 1.4, FLOOR - .45)
            g.box('fin', bx + 1.82, y, .13, .06, 1.4, FLOOR - .45)
    # Corner flower beds (the plans' 2'0" F.B.).
    for sx in (-1, 1):
        for sy in (-1, 1):
            g.box('leaf', sx * (w / 2 + .05), sy * (d / 2 - 2.2), .0, .7, 3.2, .55)
            g.box('slab', sx * (w / 2 + .05), sy * (d / 2 - 2.2), .0, .8, 3.3, .1)
    return g.build()


def podium(kind):
    p = PLATES[kind]
    w, d = p['w'], p['d']
    g = Group('podium-' + kind)
    g.box('stone', 0, 0, 0, w + .6, d + .6, .3)
    g.box('lobby', 0, 0, .3, w - .8, d - .8, PODIUM - .6)
    g.box('slab', 0, 0, PODIUM - .32, w + .5, d + .5, .32)
    cols = max(4, round(w / 5))
    for i in range(cols + 1):
        x = -w / 2 + .3 + (w - .6) * i / cols
        for sy in (-1, 1):
            g.box('slab', x, sy * (d / 2 - .1), .3, .55, .55, PODIUM - .6)
    g.box('teak', 0, -d / 2 - 2.0, PODIUM - 1.0, 9, 4.2, .28)
    g.box('lamp', 0, -d / 2 - 2.0, PODIUM - 1.04, 7, 3.4, .04)
    for sx in (-1, 1):
        g.box('fin', sx * 4.3, -d / 2 - 3.9, .3, .2, .2, PODIUM - 1.3)
    return g.build()


def crown(kind, pool=False):
    p = PLATES[kind]
    w, d = p['w'], p['d']
    g = Group('crown-' + kind)
    g.box('render', 0, 0, 0, w + .5, .3, 1.2)
    for sy in (-1, 1):
        g.box('slab', 0, sy * (d / 2), 0, w + .5, .3, 1.25)
    for sx in (-1, 1):
        g.box('slab', sx * (w / 2), 0, 0, .3, d + .5, 1.25)
    g.box('render', 0, 1, 0, 7.5, 6, 4.2)
    g.box('slab', 0, 1, 4.2, 8.2, 6.7, .3)
    g.box('render', -w / 4, -d / 4, 0, 4, 3, 2.6)
    g.box('steel', w / 4, d / 5, 0, 3.4, 2.6, 2.2)
    g.box('leaf', -w / 2 + 3, d / 2 - 2.2, 0, 4, 2.6, .5)
    g.box('leaf', w / 2 - 3, -d / 2 + 2.2, 0, 4, 2.6, .5)
    for i in range(8):
        g.box('teak', w / 2 - 6.5 + i * .5, -d / 2 + 4.5, 2.5, .1, 3.4, .12)
    for sx in (-1, 1):
        g.box('lamp', sx * (w / 2 + .26), 0, .4, .04, d * .6, .14)
    if pool:
        g.box('stone', -w / 4 + 1, d / 4, 0, 6.4, 4.6, .45)
        g.box('water', -w / 4 + 1, d / 4, .2, 5.6, 3.8, .3)
    return g.build()


def site():
    g = Group('site')
    # Main roads (south and east) with markings and footpaths.
    def road(a, b, width, lanes=True):
        g.strip('asphalt', a, b, width, -.02, .05)
        dx, dy = b[0] - a[0], b[1] - a[1]
        ln = math.hypot(dx, dy)
        ux, uy = dx / ln, dy / ln
        if lanes:
            t = 0
            while t < ln:
                g.strip('paint', (a[0] + ux * t, a[1] + uy * t), (a[0] + ux * (t + 3), a[1] + uy * (t + 3)), .16, .03, .01)
                t += 8
            for s in (1, -1):
                off = width / 2 + 1.4
                g.strip('paving', (a[0] - uy * off * s, a[1] + ux * off * s), (b[0] - uy * off * s, b[1] + ux * off * s), 2.8, -.02, .16)
    material('asphalt', '383a3d', .92)
    material('paint', 'f1ede4', .6)
    material('paving', 'd6cdbf', .8)
    material('lawn', '6b8b44', 1.)
    material('court', '3f7a55', .9)
    material('rubber', 'c58a5a', .95)
    material('wall', 'ece6da', .85)
    material('deck', 'cdbfa8', .8)

    # Blender y = -three z.
    def T(x, z):
        return (x, -z)
    road(T(-260, 70), T(260, 70), 16)
    road(T(74, -260), T(74, 260), 16)
    # Estate ground and compound wall.
    g.prism('paving', [T(-62, -62), T(64, -62), T(64, 60), T(-62, 60)], 0, .04)
    for a, b in ((T(-62, -62), T(64, -62)), (T(64, -62), T(64, 2)), (T(64, 16), T(64, 60)),
                 (T(-62, 60), T(64, 60)), (T(-62, -62), T(-62, 60))):
        g.strip('wall', a, b, .3, .04, 1.9)
        g.strip('fin', a, b, .38, 1.94, .08)
    # Internal roads.
    for a, b in ((T(-54, -12), T(64, -12)), (T(-54, -12), T(-54, 54)), (T(-54, 54), T(6, 54)),
                 (T(6, -12), T(6, 54)), (T(6, 9), T(74, 9))):
        g.strip('asphalt', a, b, 7.5, .04, .04)
        g.strip('paint', a, b, .12, .08, .01)
    # Landscaped beds around towers.
    for t in TOWERS.values():
        p = PLATES[t['plate']]
        g.box('lawn', t['x'], -t['z'], .04, p['w'] + 9, p['d'] + 9, .1)
        g.box('paving', t['x'], -t['z'] + p['d'] / 2 + 3.5, .05, 10, 7, .12)
    # Pool court.
    g.box('lawn', -24, 0, .04, 50, 16, .1)
    g.box('deck', -20, 0, .05, 30, 13, .16)
    g.box('stone', -18, 0, .05, 17.2, 9.2, .3)
    g.box('water', -18, 0, .1, 16, 8, .26)
    g.cylinder('stone', -6.5, 0, .05, .32, 3.2, 20)
    g.cylinder('water', -6.5, 0, .1, .3, 2.7, 20)
    for i in range(6):
        g.box('teak', -30 + i * 2.2, 5.0, .2, .8, 2.0, .35)
    g.box('teak', -40, 0, .2, 6, 6, .12)
    for sx in (-1, 1):
        for sy in (-1, 1):
            g.box('teak', -40 + sx * 2.7, sy * 2.7, .2, .2, .2, 2.8)
    g.box('slab', -40, 0, 3.0, 6.6, 6.6, .2)
    # Clubhouse with rooftop pool.
    g.box('lawn', 30, -30, .04, 54, 40, .1)
    g.box('stone', 20, -26, .05, 19, 17, .35)
    g.box('lobby', 20, -26, .4, 17, 15, 4.6)
    g.box('slab', 20, -26, 5.0, 19, 17, .35)
    g.box('stone', 20, -26, 5.35, 11, 8, .5)
    g.box('water', 20, -26, 5.5, 10, 7, .4)
    g.box('rail', 20, -17.5, 5.35, 19, .05, 1.1)
    g.box('rail', 20, -34.5, 5.35, 19, .05, 1.1)
    g.box('lamp', 20, -17.45, 4.6, 16, .04, .2)
    # Tennis court.
    g.box('court', 44, -26, .05, 13, 26, .1)
    for x in (-5.5, -4.1, 4.1, 5.5):
        g.box('paint', 44 + x, -26, .15, .08, 23.8, .01)
    for y in (-11.9, -6.4, 0, 6.4, 11.9):
        g.box('paint', 44, -26 + y, .15, 11 if abs(y) > 11 else 8.2, .08, .01)
    g.box('paint', 44, -26, .15, .08, 12.8, .01)
    g.box('steel', 44, -26, .15, 12, .04, 1.0)
    # Children's play lawn.
    g.box('rubber', 38, -48, .05, 16, 11, .1)
    g.cylinder('rubber', 33, -48, .1, .35, 1.6, 16)
    g.box('steel', 40, -47, .1, 2, 2, 2.4)
    g.box('teak', 40, -47, 2.4, 2.4, 2.4, .14)
    # Gate and security cabin on the east road.
    for y in (-2.5, 16.5):
        g.box('stone', 64, -y, 0, 1.4, 1.4, 6.5)
    g.box('teak', 64, -7, 5.4, 1.6, 21, 1.0)
    g.box('lamp', 64, -7, 5.34, .6, 18, .06)
    g.box('wall', 56, -21, .04, 4, 3, 2.8)
    g.box('fin', 56, -21, 2.84, 4.8, 3.8, .2)
    return g.build()


def scatter():
    trees, lamps = [], []

    def T(kind, x, z, s=1.):
        trees.append([kind, round(x, 2), round(z, 2), round(s * rng.uniform(.85, 1.2), 2), round(rng.uniform(0, 6.28), 2)])
    for x in range(-58, 62, 7):
        T('palm' if x % 2 else 'round', x, -58)
        T('palm', x, 56.5, .95)
    for z in range(-50, 56, 7):
        T('round', -58.5, z)
        T('palm', 60, z) if not -6 < z < 20 else None
    for x in range(-40, 4, 6):
        T('palm', x, -6.5, .9)
        T('palm', x, 6.5, .9)
    for i in range(10):
        T('round', 4 + i * 5, -47 - (i % 2) * 3, .8)
    for x in range(-250, 260, 13):
        if abs(x - 74) > 12:
            T('round', x, 81, 1.1)
            T('palm', x + 6, 59.8, 1.0) if x < 60 else None
    for z in range(-250, 260, 13):
        if abs(z - 70) > 12:
            T('round', 85, z, 1.1)
    for _ in range(130):
        while True:
            x, z = rng.uniform(-240, 240), rng.uniform(-240, 240)
            if not (-70 < x < 96 and -70 < z < 90):
                break
        T(rng.choice(('round', 'round', 'cone', 'palm')), x, z, rng.uniform(1, 1.6))
    for x in range(-50, 62, 14):
        lamps.append([x, -7.6, round(math.pi, 4)])
    for z in range(-6, 54, 14):
        lamps.append([-57.8, z, round(math.pi / 2, 4)])
        lamps.append([9.8, z, round(-math.pi / 2, 4)])
    for x in range(-240, 250, 22):
        lamps.append([x, 63.5, 0])
    return trees, lamps


reset()
palette()
for kind in PLATES:
    floor_module(kind)
    podium(kind)
    crown(kind, pool=kind == 'square')
export(out / 'towers.glb')

reset()
props()
export(out / 'props.glb')

reset()
palette()
site()
export(out / 'site.glb')

trees, lamps = scatter()
layout = {
    'floor': FLOOR, 'podium': PODIUM, 'floors': FLOORS, 'planScale': K,
    'plates': {k: {'w': round(v['w'], 3), 'd': round(v['d'], 3), 'crop': v['crop']} for k, v in PLATES.items()},
    'towers': TOWERS, 'trees': trees, 'lamps': lamps,
}
(out / 'layout.json').write_text(json.dumps(layout, separators=(',', ':')))
print('apartments world written to', out)
