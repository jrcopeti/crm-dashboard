// Exact 3x -> 1x downscale by 3x3 box average. The export is a clean @3x of a
// 1440x750 frame, so every output pixel is the mean of exactly nine inputs —
// no resampling kernel, no ringing, no guesswork.
//   node box3.js <in> <out>
const fs = require('node:fs')
const { PNG } = require('pngjs')
const [, , inPath, outPath] = process.argv
const src = PNG.sync.read(fs.readFileSync(inPath))
if (src.width % 3 || src.height % 3) throw new Error('not an exact 3x image')
const out = new PNG({ width: src.width / 3, height: src.height / 3 })
for (let y = 0; y < out.height; y++)
  for (let x = 0; x < out.width; x++) {
    const acc = [0, 0, 0, 0]
    for (let j = 0; j < 3; j++)
      for (let i = 0; i < 3; i++) {
        const k = (src.width * (y * 3 + j) + (x * 3 + i)) << 2
        for (let c = 0; c < 4; c++) acc[c] += src.data[k + c]
      }
    const o = (out.width * y + x) << 2
    for (let c = 0; c < 4; c++) out.data[o + c] = Math.round(acc[c] / 9)
  }
fs.writeFileSync(outPath, PNG.sync.write(out))
console.log(outPath, out.width + 'x' + out.height)
