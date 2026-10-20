// Sample pixels / region palettes from the Figma export.
//   node sample.js px <img> x,y[:label] ...
//   node sample.js region <img> x y w h [topN]
const fs = require('node:fs')
const { PNG } = require('pngjs')

const [, , mode, imgPath, ...rest] = process.argv
const png = PNG.sync.read(fs.readFileSync(imgPath))
const at = (x, y) => {
  const i = (png.width * y + x) << 2
  return [png.data[i], png.data[i + 1], png.data[i + 2], png.data[i + 3]]
}
const hex = ([r, g, b]) =>
  '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')

if (mode === 'px') {
  for (const arg of rest) {
    const [coord, label] = arg.split(':')
    const [x, y] = coord.split(',').map(Number)
    const p = at(x, y)
    console.log(
      `${(label ?? '').padEnd(28)} (${x},${y}) ${hex(p)}  rgb(${p[0]},${p[1]},${p[2]}) a=${p[3]}`,
    )
  }
} else if (mode === 'region') {
  const [x, y, w, h, topN = 8] = rest.map(Number)
  const counts = new Map()
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) {
      const k = hex(at(xx, yy))
      counts.set(k, (counts.get(k) ?? 0) + 1)
    }
  }
  const total = w * h
  ;[...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .forEach(([k, n]) =>
      console.log(
        `${k}  ${((n / total) * 100).toFixed(1).padStart(5)}%  ${n}px`,
      ),
    )
} else {
  console.error('usage: sample.js px|region ...')
  process.exit(1)
}
