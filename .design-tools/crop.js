// node crop.js <in> <out> x y w h  (top-left origin)
const fs = require('node:fs')
const { PNG } = require('pngjs')
const [, , inp, out, X, Y, W, H] = process.argv
const src = PNG.sync.read(fs.readFileSync(inp))
const [x0, y0, w, h] = [X, Y, W, H].map(Number)
const dst = new PNG({ width: w, height: h })
for (let y = 0; y < h; y++)
  for (let x = 0; x < w; x++) {
    const si = (src.width * (y + y0) + (x + x0)) << 2
    const di = (w * y + x) << 2
    dst.data[di] = src.data[si]
    dst.data[di + 1] = src.data[si + 1]
    dst.data[di + 2] = src.data[si + 2]
    dst.data[di + 3] = src.data[si + 3]
  }
fs.writeFileSync(out, PNG.sync.write(dst))
console.log(`${out} ${w}x${h}`)
