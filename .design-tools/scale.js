// Nearest-neighbour zoom, so individual pixels stay visible.
//   node scale.js <in> <out> <factor>
const fs = require('node:fs')
const { PNG } = require('pngjs')
const [, , inp, out, f] = process.argv
const k = Number(f)
const s = PNG.sync.read(fs.readFileSync(inp))
const d = new PNG({ width: s.width * k, height: s.height * k })
for (let y = 0; y < d.height; y++)
  for (let x = 0; x < d.width; x++) {
    const si = (s.width * ((y / k) | 0) + ((x / k) | 0)) << 2,
      di = (d.width * y + x) << 2
    d.data[di] = s.data[si]
    d.data[di + 1] = s.data[si + 1]
    d.data[di + 2] = s.data[si + 2]
    d.data[di + 3] = 255
  }
fs.writeFileSync(out, PNG.sync.write(d))
console.log(out, d.width + 'x' + d.height)
