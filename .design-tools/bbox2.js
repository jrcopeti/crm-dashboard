// Bounding box of pixels near a colour (no flood fill).
// node bbox2.js <img> <hex> <tol> x y w h
const fs = require('node:fs')
const { PNG } = require('pngjs')
const [, , p, hex, tolA, X, Y, W, H] = process.argv
const png = PNG.sync.read(fs.readFileSync(p))
const t = hex
  .slice(1)
  .match(/../g)
  .map((h) => parseInt(h, 16))
const tol = Number(tolA)
const [x0, y0, w, h] = [X, Y, W, H].map(Number)
let minX = 1e9,
  minY = 1e9,
  maxX = -1,
  maxY = -1,
  n = 0
for (let y = y0; y < y0 + h; y++)
  for (let x = x0; x < x0 + w; x++) {
    const i = (png.width * y + x) << 2
    if (
      Math.abs(png.data[i] - t[0]) <= tol &&
      Math.abs(png.data[i + 1] - t[1]) <= tol &&
      Math.abs(png.data[i + 2] - t[2]) <= tol
    ) {
      n++
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
console.log(
  n
    ? `  ${n}px  bbox ${maxX - minX + 1}x${maxY - minY + 1} at (${minX},${minY})  rel (${minX - x0},${minY - y0})`
    : '  none',
)
