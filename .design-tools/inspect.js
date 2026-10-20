// Geometry + colour probes for the Figma export.
//   runs   <img> row|col <n> [bgHex]   -> contiguous non-background spans
//   ink    <img> x y w h               -> darkest + most saturated pixel in a region
//   region <img> x y w h [topN]        -> most frequent colours
const fs = require('node:fs')
const { PNG } = require('pngjs')

const [, , mode, imgPath, ...rest] = process.argv
const png = PNG.sync.read(fs.readFileSync(imgPath))
const at = (x, y) => {
  const i = (png.width * y + x) << 2
  return [png.data[i], png.data[i + 1], png.data[i + 2]]
}
const hex = ([r, g, b]) =>
  '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
const lum = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b
const sat = ([r, g, b]) => Math.max(r, g, b) - Math.min(r, g, b)

if (mode === 'runs') {
  const axis = rest[0]
  const n = Number(rest[1])
  const bg = (rest[2] ?? '#d4d2d2')
    .slice(1)
    .match(/../g)
    .map((h) => parseInt(h, 16))
  const isBg = (p) => p.every((v, i) => Math.abs(v - bg[i]) < 6)
  const len = axis === 'row' ? png.width : png.height
  const get = (i) => (axis === 'row' ? at(i, n) : at(n, i))
  const runs = []
  let start = null
  for (let i = 0; i < len; i++) {
    const b = isBg(get(i))
    if (!b && start === null) start = i
    if (b && start !== null) {
      runs.push([start, i - 1])
      start = null
    }
  }
  if (start !== null) runs.push([start, len - 1])
  console.log(
    `${axis} ${n}: ` +
      runs
        .filter(([a, b]) => b - a >= 2)
        .map(([a, b]) => `${a}..${b} (${b - a + 1})`)
        .join('  '),
  )
} else if (mode === 'ink') {
  const [x, y, w, h] = rest.map(Number)
  let darkest = null,
    boldest = null
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) {
      const p = at(xx, yy)
      if (!darkest || lum(p) < lum(darkest)) darkest = p
      if (!boldest || sat(p) > sat(boldest)) boldest = p
    }
  }
  console.log(`darkest ${hex(darkest)}   most-saturated ${hex(boldest)}`)
} else if (mode === 'region') {
  const [x, y, w, h, topN = 6] = rest.map(Number)
  const counts = new Map()
  for (let yy = y; yy < y + h; yy++)
    for (let xx = x; xx < x + w; xx++) {
      const k = hex(at(xx, yy))
      counts.set(k, (counts.get(k) ?? 0) + 1)
    }
  ;[...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .forEach(([k, n]) =>
      console.log(`${k}  ${((n / (w * h)) * 100).toFixed(1).padStart(5)}%`),
    )
}
