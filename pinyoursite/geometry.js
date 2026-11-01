export function vertices(plot) {
  return plot.points
    .trim()
    .split(/\s+/)
    .map((p) => {
      const [x, y] = p.split(",").map(Number);
      return { x, y };
    });
}
export function dimensions(plot) {
  const pts = vertices(plot),
    area =
      Math.abs(
        pts.reduce((s, a, i) => {
          const b = pts[(i + 1) % pts.length];
          return s + a.x * b.y - b.x * a.y;
        }, 0),
      ) / 2,
    factor = Math.sqrt(plot.area / area);
  return pts.map((a, i) => {
    const b = pts[(i + 1) % pts.length],
      dx = b.x - a.x,
      dy = b.y - a.y,
      len = Math.hypot(dx, dy);
    let nx = -dy / len,
      ny = dx / len;
    if (nx * (plot.x - a.x) + ny * (plot.y - a.y) > 0) {
      nx = -nx;
      ny = -ny;
    }
    const u = { x: a.x + 5.5 * nx, y: a.y + 5.5 * ny },
      v = { x: b.x + 5.5 * nx, y: b.y + 5.5 * ny };
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (angle > 90 || angle < -90) angle += 180;
    return {
      a,
      b,
      u,
      v,
      mx: (u.x + v.x) / 2,
      my: (u.y + v.y) / 2,
      angle,
      length: len * factor,
    };
  });
}
export function fitView(w, h) {
  const k = Math.min(w / 1920, h / 1080) * (w < 1024 ? 1.3 : 1.1);
  return { k, x: (w - 1920 * k) / 2, y: (h - 1080 * k) / 2 };
}
export function plotView(plot, w, h) {
  const pts = vertices(plot),
    xs = pts.map((p) => p.x),
    ys = pts.map((p) => p.y),
    bw = Math.max(...xs) - Math.min(...xs),
    bh = Math.max(...ys) - Math.min(...ys),
    mobile = w < 1024,
    availableW = w - (mobile ? 0 : 360),
    availableH = h - (mobile ? 120 : 0),
    k = Math.min(
      8,
      Math.max(
        mobile ? 2 : 3,
        Math.min(
          (availableW * (mobile ? 0.6 : 0.5)) / bw,
          (availableH * (mobile ? 0.6 : 0.5)) / bh,
        ),
      ),
    );
  return { k, x: availableW / 2 - plot.x * k, y: availableH / 2 - plot.y * k };
}
