// Difference heatmap: red where export and render disagree.
const fs = require('node:fs')
const { PNG } = require('pngjs')
const [, , eP, OX, OY, rP, outP] = process.argv
const E = PNG.sync.read(fs.readFileSync(eP))
const R = PNG.sync.read(fs.readFileSync(rP))
const ox = +OX,
  oy = +OY
const out = new PNG({ width: R.width, height: R.height })
const px = (p, x, y) => {
  const i = (p.width * y + x) << 2
  return [p.data[i], p.data[i + 1], p.data[i + 2]]
}
for (let y = 0; y < R.height; y++)
  for (let x = 0; x < R.width; x++) {
    const a = px(E, ox + x, oy + y),
      b = px(R, x, y)
    const d =
      (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2])) /
      3
    const i = (out.width * y + x) << 2
    const v = Math.min(255, d * 3)
    // faint greyscale of the render underneath, red where it differs
    const g = 235
    out.data[i] = Math.min(255, g + v)
    out.data[i + 1] = Math.max(0, g - v)
    out.data[i + 2] = Math.max(0, g - v)
    out.data[i + 3] = 255
  }
fs.writeFileSync(outP, PNG.sync.write(out))
console.log(outP)
