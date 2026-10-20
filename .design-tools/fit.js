// Area-average downscale into a square canvas, padding with the source's
// corner colour when the source is not square.
// node fit.js <in> <out> <size>
const fs = require('node:fs')
const { PNG } = require('pngjs')
const [, , inp, out, sizeArg, insetArg = '1'] = process.argv
const src = PNG.sync.read(fs.readFileSync(inp))
const size = Number(sizeArg)
const inset = Number(insetArg) // fraction of the canvas the art should occupy
const scale = Math.min(size / src.width, size / src.height) * inset
const dw = Math.round(src.width * scale),
  dh = Math.round(src.height * scale)
const ox = ((size - dw) / 2) | 0,
  oy = ((size - dh) / 2) | 0
const dst = new PNG({ width: size, height: size })
// Pad colour: top-left pixel of the source.
const pad = [src.data[0], src.data[1], src.data[2], src.data[3]]
for (let i = 0; i < size * size; i++) {
  dst.data[i * 4] = pad[0]
  dst.data[i * 4 + 1] = pad[1]
  dst.data[i * 4 + 2] = pad[2]
  dst.data[i * 4 + 3] = pad[3]
}
for (let y = 0; y < dh; y++) {
  for (let x = 0; x < dw; x++) {
    const sx0 = Math.floor(x / scale),
      sx1 = Math.min(src.width, Math.ceil((x + 1) / scale))
    const sy0 = Math.floor(y / scale),
      sy1 = Math.min(src.height, Math.ceil((y + 1) / scale))
    let r = 0,
      g = 0,
      b = 0,
      a = 0,
      n = 0
    for (let sy = sy0; sy < sy1; sy++)
      for (let sx = sx0; sx < sx1; sx++) {
        const si = (src.width * sy + sx) << 2
        r += src.data[si]
        g += src.data[si + 1]
        b += src.data[si + 2]
        a += src.data[si + 3]
        n++
      }
    const di = (size * (y + oy) + (x + ox)) << 2
    dst.data[di] = r / n
    dst.data[di + 1] = g / n
    dst.data[di + 2] = b / n
    dst.data[di + 3] = a / n
  }
}
fs.writeFileSync(out, PNG.sync.write(dst, { deflateLevel: 9 }))
console.log(
  `${out.split('/').pop()}  ${src.width}x${src.height} -> ${size}x${size}  ${fs.statSync(out).size}B`,
)
