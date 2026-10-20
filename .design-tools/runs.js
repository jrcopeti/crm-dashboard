// Compare many text runs at once: ink width, height and pixel count, export vs
// render. Coordinates are 1x design pixels; both images must be @3x.
//   node runs.js <exportPng@3x> <renderPng@3x>
const fs = require('node:fs'),
  { PNG } = require('pngjs')
const [, , ePath, rPath] = process.argv
if (!ePath || !rPath) {
  console.error('usage: node runs.js <export@3x> <render@3x>')
  process.exit(1)
}
const E = PNG.sync.read(fs.readFileSync(ePath))
const R = PNG.sync.read(fs.readFileSync(rPath))
const px = (p, x, y) => {
  const i = (p.width * y + x) << 2
  return [p.data[i], p.data[i + 1], p.data[i + 2]]
}
const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
function run(p, x, y, w, h, t) {
  // biggest ink band in the window, measured on its own terms
  let x0 = 1e9,
    y0 = 1e9,
    x1 = -1,
    y1 = -1,
    n = 0
  for (let j = 0; j < h * 3; j++)
    for (let i = 0; i < w * 3; i++) {
      const c = px(p, x * 3 + i, y * 3 + j)
      if (255 - lum(c) > t) {
        n++
        if (i < x0) x0 = i
        if (i > x1) x1 = i
        if (j < y0) y0 = j
        if (j > y1) y1 = j
      }
    }
  return n ? { w: (x1 - x0 + 1) / 3, h: (y1 - y0 + 1) / 3, n } : null
}
const probes = [
  ['Replies title', 628, 36, 90, 16, 40],
  ['Today’s tasks', 224, 186, 130, 16, 40],
  ['Signals title', 224, 341, 60, 16, 40],
  ['May’s perf.', 1032, 40, 130, 16, 40],
  ['Onboarding title', 1032, 342, 95, 16, 40],
  ['Welcome heading', 232, 48, 190, 24, 40],
  ['Welcome para L1', 232, 86, 340, 15, 25],
  ['nav "Dashboard"', 50, 82, 90, 14, 30],
  ['nav "Sequences"', 50, 274, 90, 14, 30],
  ['KPI label Activities', 1040, 160, 80, 13, 25],
  ['KPI figure 1000', 1056, 182, 90, 18, 40],
  ['Onb. row1 title', 1104, 384, 180, 16, 40],
  ['Onb. row1 "5 min"', 1360, 386, 45, 14, 25],
  ['Task label Overdue', 240, 262, 80, 14, 30],
  ['Task count 3', 240, 222, 30, 26, 40],
  ['signal date', 1136, 412, 70, 12, 25],
]
console.log(
  'run'.padEnd(22),
  'export w/ink'.padEnd(20),
  'app w/ink'.padEnd(20),
  'wΔ     ink ratio',
)
for (const [n, x, y, w, h, t] of probes) {
  const e = run(E, x, y, w, h, t),
    r = run(R, x, y, w, h, t)
  if (!e || !r) {
    console.log(n.padEnd(22), '—')
    continue
  }
  const dw = r.w - e.w,
    ratio = r.n / e.n
  const flag = Math.abs(dw) > 1.5 || ratio < 0.9 || ratio > 1.1 ? '  <<<' : ''
  console.log(
    n.padEnd(22),
    `${e.w.toFixed(1)}/${e.n}`.padEnd(20),
    `${r.w.toFixed(1)}/${r.n}`.padEnd(20),
    `${dw > 0 ? '+' : ''}${dw.toFixed(1)}`.padStart(5),
    ratio.toFixed(3).padStart(8) + flag,
  )
}
