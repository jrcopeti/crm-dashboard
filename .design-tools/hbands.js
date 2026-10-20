// Horizontal ink spans within a box (columns that contain non-bg pixels).
// node hbands.js <img> x y w h [bgHex] [minGap]
const fs = require('node:fs')
const { PNG } = require('pngjs')
const [, , p, X, Y, W, H, bgHex = '#ffffff', minGap = '4'] = process.argv
const png = PNG.sync.read(fs.readFileSync(p))
const bg = bgHex
  .slice(1)
  .match(/../g)
  .map((h) => parseInt(h, 16))
const [x0, y0, w, h] = [X, Y, W, H].map(Number)
const colHas = (x) => {
  for (let y = y0; y < y0 + h; y++) {
    const i = (png.width * y + x) << 2
    if (
      Math.abs(png.data[i] - bg[0]) > 10 ||
      Math.abs(png.data[i + 1] - bg[1]) > 10 ||
      Math.abs(png.data[i + 2] - bg[2]) > 10
    )
      return true
  }
  return false
}
const out = []
let s = null,
  gap = 0
for (let x = x0; x < x0 + w; x++) {
  if (colHas(x)) {
    if (s === null) s = x
    gap = 0
  } else if (s !== null && ++gap >= Number(minGap)) {
    out.push([s, x - gap])
    s = null
  }
}
if (s !== null) out.push([s, x0 + w - 1])
out.forEach(([a, b]) =>
  console.log(`  x ${a}..${b}  w=${b - a + 1}  (rel ${a - 37})`),
)
