// Tiled difference between the export frame and a render, ranked worst-first.
//   node diff.js <exportPng> <ox> <oy> <renderPng> [tile]
const fs = require('node:fs')
const { PNG } = require('pngjs')
const [, , eP, OX, OY, rP, T = '20'] = process.argv
const E = PNG.sync.read(fs.readFileSync(eP))
const R = PNG.sync.read(fs.readFileSync(rP))
const [ox, oy, t] = [OX, OY, T].map(Number)
const px = (p, x, y) => {
  const i = (p.width * y + x) << 2
  return [p.data[i], p.data[i + 1], p.data[i + 2]]
}
const tiles = []
for (let ty = 0; ty < Math.floor(R.height / t); ty++) {
  for (let tx = 0; tx < Math.floor(R.width / t); tx++) {
    let sum = 0,
      worst = 0,
      n = 0
    for (let y = 0; y < t; y++)
      for (let x = 0; x < t; x++) {
        const X = tx * t + x,
          Y = ty * t + y
        const a = px(E, ox + X, oy + Y),
          b = px(R, X, Y)
        const d =
          Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2])
        sum += d
        if (d > worst) worst = d
        n++
      }
    tiles.push({ x: tx * t, y: ty * t, mean: sum / n, worst })
  }
}
tiles.sort((a, b) => b.mean - a.mean)
const total = tiles.reduce((s, x) => s + x.mean, 0) / tiles.length
console.log(`overall mean channel-delta per pixel: ${total.toFixed(2)}`)
console.log(
  `tiles over 20: ${tiles.filter((x) => x.mean > 20).length} of ${tiles.length}\n`,
)
console.log('worst 28 tiles (design coords):')
for (const q of tiles.slice(0, 28))
  console.log(
    `  x=${String(q.x).padStart(4)} y=${String(q.y).padStart(3)}  mean ${q.mean.toFixed(1).padStart(6)}  worst ${q.worst}`,
  )
