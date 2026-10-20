// Radius from where a rounded rect's straight edges begin.
// node radius2.js <img> left top   (of the card's border box)
const fs = require('node:fs')
const { PNG } = require('pngjs')
const [, , p, L, T] = process.argv
const png = PNG.sync.read(fs.readFileSync(p))
const [l, t] = [L, T].map(Number)
const at = (x, y) => {
  const i = (png.width * y + x) << 2
  return [png.data[i], png.data[i + 1], png.data[i + 2]]
}
// "Solid border" = close to #e6e9f2 rather than a faint antialiased blend.
const solid = (c) =>
  Math.abs(c[0] - 230) <= 6 &&
  Math.abs(c[1] - 233) <= 6 &&
  Math.abs(c[2] - 242) <= 6
let firstX = null
for (let x = l; x < l + 40; x++)
  if (solid(at(x, t))) {
    firstX = x
    break
  }
let firstY = null
for (let y = t; y < t + 40; y++)
  if (solid(at(l, y))) {
    firstY = y
    break
  }
console.log(
  `  top edge solid from x=${firstX} -> radius ≈ ${firstX === null ? '?' : firstX - l}`,
)
console.log(
  `  left edge solid from y=${firstY} -> radius ≈ ${firstY === null ? '?' : firstY - t}`,
)
