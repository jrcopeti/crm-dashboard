# .design-tools

A small harness for checking this build against the Figma export. Nineteen
single-purpose scripts, Node plus `pngjs`, about 700 lines in total.

```sh
cd .design-tools && npm install
node sample.js px ../design/Dashboard.png 245,108:card-border
```

## Why it exists

A language model cannot read pixel values out of an image. It can look at the
export and say "that is a teal pill button"; it cannot say
`#1ebab2 at (898,406), 90x32`. Vision is impressionistic, and fidelity work
needs exact numbers.

These scripts turn an image into text — which is the form a number has to be in
before anything, human or model, can reason about it precisely. Every value in
`docs/design-notes.md` came out of one of them.

The important framing: **this harness verifies, it does not specify.** It tells
you whether the render matches the export. It cannot tell you what the designer
intended — weight, line-height and the authored radius all have to come from the
spec. Reading radii off the export as absolute pixel counts gave 12 and 8, and
both were wrong; the real values, 16 and 12, came from the designer. What the
harness did afterwards was confirm them.

## Coordinates

`design/Dashboard.png` is 1794x1692 and holds two frames. The default state is
at origin **(37, 92)** and is exactly 1440x750, so a design coordinate maps to a
viewport coordinate by subtracting (37, 92). An @3x export is a clean 4320x2250
with no offset — multiply design coordinates by three.

## Probe — ask the export a question, get a number

| Script                             | Answers                                                        |
| ---------------------------------- | -------------------------------------------------------------- |
| `sample.js px \| region`           | colour at a coordinate; most frequent colours in a box         |
| `inspect.js ink \| region \| runs` | true text colour (darkest pixel); palette; non-bg spans        |
| `find.js`                          | clusters of a colour, as element boxes                         |
| `bbox2.js`                         | bounding box of pixels near a colour                           |
| `scanline.js`                      | where a colour appears along one row or column — exact edges   |
| `bands.js` / `hbands.js`           | rows / columns containing ink — vertical and horizontal rhythm |
| `radius.js` / `radius2.js`         | corner inset profile                                           |

`bands.js` is how the 73px signal-row pitch and the 48px nav pitch were found:
ink bands with the gaps between them, rather than guessing a spacing scale.

## View — make a region judgeable

| Script                    | Does                                                            |
| ------------------------- | --------------------------------------------------------------- |
| `crop.js`                 | crop, top-left origin (`sips` crops centred — do not use it)    |
| `scale.js`                | nearest-neighbour zoom, so pixels stay visible                  |
| `fit.js`                  | area-average downscale into a square                            |
| `box3.js`                 | exact 3x -> 1x box average; every output pixel the mean of nine |
| `hstack.js` / `vstack.js` | two images side by side or stacked, for comparison sheets       |

## Verify — compare a render against the export

| Script    | Does                                                       |
| --------- | ---------------------------------------------------------- |
| `diff.js` | tile the frame, rank every block worst-first               |
| `heat.js` | red heatmap of where the two disagree                      |
| `ink.js`  | ink bounding box per region, export vs render              |
| `runs.js` | width, height and ink count per text run, export vs render |

## The loop

1. **Probe** the export for a value
2. **Write** the component to it
3. **Render** in a real browser and read `getBoundingClientRect`
4. **Diff** render against export for a ranked list of what is still wrong
5. Repeat on the worst item

Screenshots come from Playwright at 1440x750. For text work capture at
`deviceScaleFactor: 3` — at three samples per CSS pixel you can separate weight
from size, which is impossible at 1:1. Pin any scroll container to `scrollTop=0`
first, and assert it, or you will compare the wrong rows.

## Known limitation

Everything here compares against a **static** frame. Hover, cursor and motion do
not exist in a PNG, so the loop is blind to them by construction. Interaction
states have to be checked against the design's own hover frame.
