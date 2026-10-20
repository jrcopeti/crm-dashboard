// Corner inset profile: how far the rounded edge is inset on each row.
//   node radius.js <img> <x> <y> [tl|tr|bl|br]   (of the border box)
const fs = require('node:fs')
const { PNG } = require('pngjs')
const [, , img, X, Y, dir = 'tl'] = process.argv
const png = PNG.sync.read(fs.readFileSync(img))
const at = (x, y) => {
  const i = (png.width * y + x) << 2
  return [png.data[i], png.data[i + 1], png.data[i + 2]]
}
const isPaint = (c) => {
  const [r, g, b] = c
  if (r > 250 && g > 250 && b > 250) return false
  if (Math.abs(r - 245) < 5 && Math.abs(g - 247) < 5 && Math.abs(b - 249) < 5)
    return false
  return true
}
const x0 = Number(X),
  y0 = Number(Y)
for (let dy = 0; dy <= 16; dy++) {
  let first = null
  for (let dx = 0; dx < 60; dx++)
    if (isPaint(at(x0 + dx, y0 + dy))) {
      first = dx
      break
    }
  console.log(
    `  +${String(dy).padStart(2)}  inset=${first === null ? '—' : first}`,
  )
}
