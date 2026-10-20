// Print x (or y) positions on a line whose colour matches a target.
// node scanline.js <img> row|col <n> <hex> [tol] [from] [to]
const fs = require('node:fs')
const { PNG } = require('pngjs')
const [, , p, axis, N, target, tolA = '6', fromA, toA] = process.argv
const png = PNG.sync.read(fs.readFileSync(p))
const t = target
  .slice(1)
  .match(/../g)
  .map((h) => parseInt(h, 16))
const tol = Number(tolA)
const n = Number(N)
const from = fromA ? Number(fromA) : 0
const to = toA ? Number(toA) : axis === 'row' ? png.width : png.height
const at = (x, y) => {
  const i = (png.width * y + x) << 2
  return [png.data[i], png.data[i + 1], png.data[i + 2]]
}
const hits = []
for (let i = from; i < to; i++) {
  const c = axis === 'row' ? at(i, n) : at(n, i)
  if (c.every((v, j) => Math.abs(v - t[j]) <= tol)) hits.push(i)
}
// collapse consecutive
const runs = []
let s = null,
  prev = null
for (const h of hits) {
  if (s === null) {
    s = h
  } else if (h !== prev + 1) {
    runs.push([s, prev])
    s = h
  }
  prev = h
}
if (s !== null) runs.push([s, prev])
console.log(
  runs.map(([a, b]) => (a === b ? `${a}` : `${a}..${b}`)).join('  ') ||
    '(none)',
)
