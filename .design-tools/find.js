// Locate clusters of a colour: node find.js <img> <hex> [tol] [x y w h]
const fs = require('node:fs')
const { PNG } = require('pngjs')
const [, , imgPath, target, tolArg, ...box] = process.argv
const png = PNG.sync.read(fs.readFileSync(imgPath))
const tol = Number(tolArg ?? 8)
const t = target
  .slice(1)
  .match(/../g)
  .map((h) => parseInt(h, 16))
const [bx, by, bw, bh] =
  box.length === 4 ? box.map(Number) : [0, 0, png.width, png.height]
const hit = (x, y) => {
  const i = (png.width * y + x) << 2
  return (
    Math.abs(png.data[i] - t[0]) <= tol &&
    Math.abs(png.data[i + 1] - t[1]) <= tol &&
    Math.abs(png.data[i + 2] - t[2]) <= tol
  )
}
// Group hits into row-bands, then into boxes per band
const seen = new Set()
const boxes = []
for (let y = by; y < by + bh; y++) {
  for (let x = bx; x < bx + bw; x++) {
    if (!hit(x, y) || seen.has(y * png.width + x)) continue
    // flood fill (4-way, iterative)
    const stack = [[x, y]]
    let minX = x,
      maxX = x,
      minY = y,
      maxY = y,
      n = 0
    while (stack.length) {
      const [cx, cy] = stack.pop()
      const k = cy * png.width + cx
      if (
        cx < bx ||
        cy < by ||
        cx >= bx + bw ||
        cy >= by + bh ||
        seen.has(k) ||
        !hit(cx, cy)
      )
        continue
      seen.add(k)
      n++
      if (cx < minX) minX = cx
      if (cx > maxX) maxX = cx
      if (cy < minY) minY = cy
      if (cy > maxY) maxY = cy
      stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1])
    }
    if (n > 60)
      boxes.push({ minX, minY, w: maxX - minX + 1, h: maxY - minY + 1, n })
  }
}
boxes.sort((a, b) => b.n - a.n)
boxes
  .slice(0, 14)
  .forEach((b) =>
    console.log(`x=${b.minX} y=${b.minY} w=${b.w} h=${b.h}  (${b.n}px)`),
  )
