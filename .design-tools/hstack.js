// Two images side by side with a divider, for comparison sheets.
//   node hstack.js <left> <right> <out> [gap]
const fs = require('node:fs')
const { PNG } = require('pngjs')
const [, , a, b, out, gapArg = '12'] = process.argv
const A = PNG.sync.read(fs.readFileSync(a)),
  B = PNG.sync.read(fs.readFileSync(b))
const gap = Number(gapArg)
const w = A.width + gap + B.width,
  h = Math.max(A.height, B.height)
const d = new PNG({ width: w, height: h })
d.data.fill(255)
const blit = (S, ox) => {
  for (let y = 0; y < S.height; y++)
    for (let x = 0; x < S.width; x++) {
      const si = (S.width * y + x) << 2,
        di = (w * y + x + ox) << 2
      d.data[di] = S.data[si]
      d.data[di + 1] = S.data[si + 1]
      d.data[di + 2] = S.data[si + 2]
      d.data[di + 3] = 255
    }
}
blit(A, 0)
blit(B, A.width + gap)
fs.writeFileSync(out, PNG.sync.write(d))
console.log(`${out} ${w}x${h}  (left=design, right=mine)`)
