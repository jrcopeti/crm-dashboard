// Row bands containing non-background pixels within a box.
//   node bands.js <img> x y w h [bgHex] [minGap]
const fs = require('node:fs')
const { PNG } = require('pngjs')
const [, , imgPath, X, Y, W, H, bgHex = '#ffffff', minGap = '3'] = process.argv
const png = PNG.sync.read(fs.readFileSync(imgPath))
const bg = bgHex
  .slice(1)
  .match(/../g)
  .map((h) => parseInt(h, 16))
const [x0, y0, w, h] = [X, Y, W, H].map(Number)
const rowHas = (y) => {
  for (let x = x0; x < x0 + w; x++) {
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
const bands = []
let start = null,
  gap = 0
for (let y = y0; y < y0 + h; y++) {
  if (rowHas(y)) {
    if (start === null) start = y
    gap = 0
  } else if (start !== null) {
    if (++gap >= Number(minGap)) {
      bands.push([start, y - gap])
      start = null
    }
  }
}
if (start !== null) bands.push([start, y0 + h - 1])
bands.forEach(([a, b], i) => {
  const prev = bands[i - 1]
  const delta = prev ? ` (+${a - prev[0]} from prev)` : ''
  console.log(`y ${a}..${b}  h=${b - a + 1}${delta}`)
})
