// Ink bounding box of a region in the export vs a render, for many regions.
const fs = require('node:fs')
const { PNG } = require('pngjs')
const E = PNG.sync.read(fs.readFileSync(process.argv[2]))
const R = PNG.sync.read(fs.readFileSync(process.argv[3]))
const [OX, OY] = [37, 92]
const px = (p, x, y) => {
  const i = (p.width * y + x) << 2
  return [p.data[i], p.data[i + 1], p.data[i + 2]]
}
const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
function box(p, ox, oy, x, y, w, h, bgL, t) {
  let x0 = 1e9,
    y0 = 1e9,
    x1 = -1,
    y1 = -1,
    n = 0
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) {
      const c = px(p, ox + x + i, oy + y + j)
      if (Math.abs(bgL - lum(c)) > t) {
        n++
        if (x + i < x0) x0 = x + i
        if (x + i > x1) x1 = x + i
        if (y + j < y0) y0 = y + j
        if (y + j > y1) y1 = y + j
      }
    }
  return n ? { x0, y0, w: x1 - x0 + 1, h: y1 - y0 + 1, n } : null
}
const W = lum([255, 255, 255])
const probes = [
  ['sidebar nav "Dashboard"', 50, 70, 120, 18, W, 30],
  ['sidebar nav "Find New"', 50, 118, 120, 18, W, 30],
  ['sidebar user name', 48, 692, 140, 18, W, 30],
  ['sidebar user "Sales"', 48, 710, 100, 16, W, 30],
  ['trial "Trial ends in..."', 16, 530, 150, 18, null, 30],
  ['Welcome heading', 232, 48, 200, 26, W, 30],
  ['Welcome para line 1', 232, 86, 350, 16, W, 25],
  ['Replies title', 628, 36, 100, 18, W, 30],
  ['"Open inbox"', 876, 36, 110, 18, W, 30],
  ['Tasks title', 224, 186, 140, 18, W, 30],
  ['Overdue count "3"', 240, 218, 40, 30, null, 30],
  ['Overdue label', 240, 260, 90, 16, null, 30],
  ['Signals title', 224, 340, 70, 18, W, 30],
  ['Signals subtitle', 224, 364, 700, 18, W, 25],
  ['KPI title', 1032, 38, 160, 18, W, 30],
  ['"Edit KPIs"', 1330, 38, 80, 18, W, 30],
  ['KPI label 1', 1040, 74, 120, 14, W, 25],
  ['KPI figure 1', 1040, 98, 100, 20, W, 30],
  ['Onboarding title', 1032, 340, 120, 18, W, 30],
  ['Onboarding row 1 title', 1104, 384, 200, 18, W, 30],
  ['Onboarding row 1 mins', 1352, 384, 60, 18, W, 25],
]
console.log('region'.padEnd(26), 'dx    dy    dw    dh    ink e/r')
for (const [name, x, y, w, h, bg, t] of probes) {
  const bgL = bg === null ? lum(px(E, OX + x, OY + y)) : bg
  const bgR = bg === null ? lum(px(R, x, y)) : bg
  const e = box(E, OX, OY, x, y, w, h, bgL, t),
    r = box(R, 0, 0, x, y, w, h, bgR, t)
  if (!e || !r) {
    console.log(name.padEnd(26), 'no ink')
    continue
  }
  const f = (v) => (v > 0 ? '+' : '') + v
  const flag =
    Math.abs(r.x0 - e.x0) > 1 ||
    Math.abs(r.y0 - e.y0) > 1 ||
    Math.abs(r.w - e.w) > 2 ||
    Math.abs(r.h - e.h) > 1
      ? '  <<<'
      : ''
  console.log(
    name.padEnd(26),
    `${f(r.x0 - e.x0).padStart(4)}  ${f(r.y0 - e.y0).padStart(4)}  ${f(r.w - e.w).padStart(4)}  ${f(r.h - e.h).padStart(4)}   ${(e.n / r.n).toFixed(2)}${flag}`,
  )
}
