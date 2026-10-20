# Design notes

How the values in this codebase were derived from the Figma design, and why the
implementation differs from it in the few places it does.

The reference is `design/Dashboard.png` (1794×1692). It holds two frames: the
default state at origin **(37, 92)**, exactly **1440×750**, and the state with
the Action menu and KPI tooltip open at (37, 892). The first frame is 1:1, so a
design coordinate maps to a viewport coordinate by subtracting (37, 92) at a
1440-wide viewport.

Nothing here is estimated by eye. Each section says how the value was obtained,
and the scripts that obtained it live in [`.design-tools/`](../.design-tools/README.md).

---

## Colour

Sampled from the export by decoding the PNG and reading pixels at measured
coordinates. Every value lives in the `@theme` block in `src/styles/index.css`;
**a raw hex in a component file is a bug**.

| Role                 | Value                                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Page / card / border | `#f5f7f9` / `#ffffff` / `#e6e9f2`                                                                                                          |
| Ink                  | `#010e27`, soft `#3e485b`, muted `#7a8395`                                                                                                 |
| Brand                | `#1ebab2` (Action button), strong `#0a9b94` (links, active nav), soft `#e9f8f8` (Replies panel, pills), chip `#ceeded` (Replies icon disc) |
| Tooltip              | `#151618`                                                                                                                                  |

Accent hues are each reused on three surfaces — a task tile, a KPI progress bar
and a signal type label — so they are named by hue rather than by use site:

| Hue    | Solid / soft                                        |
| ------ | --------------------------------------------------- |
| Red    | `#ed4c5e` / `#ffe9e9`                               |
| Amber  | `#f9bb06`, ink `#c69812`, bar `#e2ad13` / `#fef3d2` |
| Blue   | `#3b85e8` / `#eaf1fb`                               |
| Indigo | `#3b58db` / `#eaf3fb`                               |
| Green  | `#1a9d6e` / `#e8f5d9`                               |
| Purple | `#8846dc` / `#f2eaff`                               |
| Pink   | `#e769cb` / `#fde5f8`                               |

Cards are white with a **1px `#e6e9f2` border and no shadow**. The Action menu
is the only surface that casts one, and its tint is neutral grey rather than
ink — every sampled pixel around it has r=g=b. Fitted to that falloff (about
7px to the sides, 11px below and barely 2px above) it is
`0 5px 12px rgb(0 0 0 / 0.1)`, carried by `--shadow-menu`. The offset is most
of what keeps the top edge clean: a wider blur with a smaller offset spreads
above the menu, where the export has almost nothing.

The wordmark carries its own teal, `#07c8c0` — a third teal, distinct from both
brand tokens. The asset is used unaltered rather than tinted to a token, because
that is what the export renders.

---

## Typography

**Poppins**, weights 400/500/600/700.

Sizes were first derived by measuring each string's ink width in the export and
solving for the font size whose canvas `actualBoundingBox` metrics match that
width — a method validated against a string of known size, accurate to 0.3px.
That is reliable for size but **cannot recover weight**; the weights and line
heights below are the designer's own Figma values.

**Weight can be recovered from a @3x export**, and two of them were wrong. At 3x
a glyph has nine samples per CSS pixel, so counting ink pixels inside a string's
own bounding box separates weight from size: a heavier weight thickens the
strokes and widens the advance slightly, a larger size grows the box. Rendering
the candidate weights and comparing against the export settles it outright —

| Run                  | Export             | Was                  | Now                      |
| -------------------- | ------------------ | -------------------- | ------------------------ |
| Signal sentence body | 336.3px, 11984 ink | 400 — 334.0, 10081   | **500 — 336.7, 11985**   |
| Replies count "24"   | 41.33x27, 4104 ink | 600 — 41.67x27, 4790 | **500 — 41.33x27, 4098** |

Both land within 0.2% of the export's ink. The bold subject inside a signal
sentence stays 600 — it already matched to 0.4%. Every other text run was checked
the same way and matches: the Welcome paragraph and heading, the Signals
subtitle, the Onboarding titles and the card titles are all within 5%.

| Use                                       | Size / weight / line-height | Token                            |
| ----------------------------------------- | --------------------------- | -------------------------------- |
| "Welcome Alex,"                           | 24 / 700 / 30               | `--text-display`                 |
| Task tile counts                          | 24 / 500 / 30               | `--text-display`                 |
| Replies count                             | 36 / 500                    | `--text-stat`                    |
| KPI figures                               | 16 / 500 / 24               | `--text-figure`                  |
| Card titles                               | 14 / 600 / 22               | `--text-title`                   |
| Body, Welcome paragraph                   | 14 / 400 / 20               | `--text-body`                    |
| Signal sentence                           | 14 / 500 / 22               | `--text-body` + `font-medium`    |
| "Open inbox" link                         | 14 / 500 / 18               | `--text-body` + `leading-[18px]` |
| Task tile labels                          | 14 / 500 / 16               | `--text-body` + `leading-4`      |
| Meta — durations, KPI labels, type labels | 12                          | `--text-meta`                    |
| Signal row date                           | 11 / 500 / 14               | `--text-micro`                   |
| "In sequence" chip                        | 10, measured not given      | a local override on `Pill`       |

Weight is never a token — Tailwind's `font-*` utilities carry it, so the same
`--text-body` serves 400, 500 and 600 uses.

The scale is narrow on purpose: almost everything is 14px, and weight rather
than size carries the hierarchy.

---

## Layout

Measured from the export, then verified by reading `getBoundingClientRect` in a
browser at 1440×750 and comparing against those measurements.

**Figma measures a frame's padding from its outer edge; CSS measures it from
inside the border.** On a bordered card the two differ by 1px per side, which is
why the KPI card is `px-[15px]` and the Onboarding card `pl-[15px] pr-[18px]`:
16 and 19 would leave the grid 2px narrow and shift every tile right.

**The two columns do not start level.** Scanning the border colour down a column
inside each card puts the main column's first card at y=16 and the rail's at
y=21. Not a rounding artefact: the same scan puts both columns' second row at
y=322 and both bottom edges at y=733, and the rail is 5px shorter to match
(293 + 8 + 412 = 713 against 142 + 8 + 148 + 8 + 412 = 718). The designer is
squaring two different card stacks against the same bottom edge, so the rail
column carries `lg:mt-[5px]` — from `lg` only, since stacked it would just be a
wrong gap.

|                   | Value                                           |
| ----------------- | ----------------------------------------------- |
| Sidebar           | 192px (191 + 1px right border)                  |
| Page padding      | 16px                                            |
| Main column       | x=208, width 800                                |
| Right rail        | x=1016, width 408                               |
| Column gap        | 8px                                             |
| Main card rows    | y=16 h=142 · y=166 h=148 · y=322 h=412          |
| Rail card rows    | y=21 h=293 · y=322 h=412                        |
| Nav rows          | 40px tall, 48px pitch, 8px gap                  |
| KPI card          | 408×293, 2×3 grid, 8px gutters                  |
| KPI tiles         | 184×71, 8px tile padding, first row at y=49     |
| KPI progress bars | 3px tall, 166px wide, at tile y+60              |
| Onboarding card   | 408×412, list 373×332 at y=50                   |
| Onboarding rows   | 40px tall, icons 40×40, 73px pitch              |
| Signals card      | 800×412, header at y=16, first row at y=80      |
| Signals list      | 332 tall, to the card's bottom, rule ends x=785 |
| Signal rows       | 40px tall, 73px pitch, 32px avatar              |
| Signals scrollbar | 8px wide at x=788–795, thumb `#e6e9f2`          |
| Action buttons    | 90×32, radius 34 (a pill), 16px side padding    |
| Dropdown menu     | 216×96, 200×40 items at radius 8, 8px padding   |
| "In sequence"     | 70×16, radius 12 (a pill), 2/4 padding          |
| Tooltip           | 246×64 body + a 8×3 caret, 16px line pitch      |

---

## Corner radii

|                           | Value | Token              |
| ------------------------- | ----- | ------------------ |
| Cards                     | 16px  | `--radius-card`    |
| Task tiles, Replies panel | 12px  | `--radius-tile`    |
| Trial card, KPI tiles     | 8px   | `--radius-callout` |
| Signals menu items        | 8px   | `--radius-callout` |
| "Upgrade plan", tooltip   | 6px   | `--radius-chip`    |

Several of the design's "radius 12" values are really pills: the Signals count
chip is 28×24 at radius 12 and the "In sequence" chip 70×16 at radius 12, and a
radius at or past half the height renders as a full round. Figma reports the
authored radius; the browser clamps it. Those take `rounded-full`, as does the
Action button at 90×32 with radius 34. There is no `--radius-control` token —
an earlier estimate put the button and the menu both at 12px and both were
wrong, so it was removed rather than left to mislead.

These were wrong at first, and the reason is worth recording. Reading absolute
pixel counts off the export **understates** a radius: an antialiased curve only
reaches full colour some way past its true tangent point, so the corner looks
tighter than it is. That produced 12px for cards and 8px for tiles.

The reliable method is to render a candidate and diff its corner _inset profile_
against the export's, row by row — the antialiasing bias is present in both and
cancels out:

```
row:         0  1  2  3  4  5  6  7  8  9 10 11
design:     11  9  7  6  5  4  3  2  2  1  1  0
mine @16px: 11  9  7  6  5  4  3  2  2  1  1  0   ← exact match
mine @12px:  8  6  4  3  2  2  1  1  0  0  0  0
```

A related artefact: a **half-pixel line** appears in the export as 2px of a 50%
blend. The 1px rules between task tiles read as `#f2f4f8`, which is `#e6e9f2` at
half strength. Rendering a crisp 1px line at the same position is correct.

---

## Details that are easy to get wrong

- **The task tiles are grouped, not evenly spaced.** A 1px rule, 86px tall, sits
  in the gaps either side of the two Pending tiles and nowhere else, so the row
  reads `Overdue │ Pending Manual  Pending Auto │ Completed`. The gaps measure
  16/8/16 _because the wider ones carry the rule_ — which looks like a slip until
  the rules are accounted for. `TodaysTasks` takes groups so the grouping lives
  in the data rather than in an index check in the view.
- **The Onboarding rules carry the list's height.** Five 40px rows would measure
  264px, but the list is 332: every gap is 16 + a 1px rule + 16. Same trap as the
  task tiles — the rule is structural, not decoration.
- **A KPI's icon is not always its number's colour.** Activities draws a
  `#995aff` glyph above a `#8846dc` number and bar; Deals `#f376d8` above
  `#e769cb`. The other four rows use one colour throughout. Sampled, not a slip.
- **The Pipeline bar's track is `#e9f8f8` (brand-soft), not
  `accent-green-soft`** — that lighter green belongs to the Completed task tile.
- **Every KPI bar in the export is drawn 88px of 166**, whatever its figures
  say; only Contacts engaged is drawn empty. One bar copied across the grid.
  These fills are carried as data so the screen matches the design, while
  `aria-valuenow` keeps the real figure.
- **The info icon darkens from `#7a8395` to `#010e27` on hover** — the second
  frame shows it under the cursor.
- **The Pipeline row has no icon** — its `€` is part of the text.
- **There are two ambers and the split is per-card, not per-role.** The Pending
  Manual count is `#c69812`; the Meetings KPI figure and icon are `#e2ad13`,
  though both are text. The task card contains no `#e2ad13` at all and the KPI
  figure is `#e2ad13` exactly, so neither can be inferred from the other.
- **The Signals rule stops before the scrollbar**, ending at x=785 with a 2px
  gap before the thumb at 788–795. It is easy to measure this wrong: the rule
  and the thumb are both `#e6e9f2`, so a scan for non-white pixels across a
  separator row reads as one unbroken run to the card's border. Check for the
  white gap, or read a row below the thumb's travel.
- **The Action menu's padding is 7px, not 8.** Its 216×96 counts the 1px
  border, so 1 + 7 + 40 + 40 + 7 + 1 is what leaves each item exactly 200×40.
  Its corner is 16px — the border arc matches the cards', not the 12px tiles'.
- **The menu's icons keep their own size inside a 24px box**: the check is
  20×20 and the trash 14×16. Forcing both to 24 stretches the trash, which is
  not square.
- **The menu is right-aligned to its button**, 9px below it — 772 + 216 lands
  on the button's right edge at 988.
- **"2 pages" is teal but not bold.** Only the subject — the person or the
  account — carries weight; the highlight is colour alone.
- **The "In sequence" chip is 10px type**, not the 12px the labels beside it
  use. The designer gave the chip's box but not its type; 12px draws its text
  72px wide where the export measures 60.
- **"2 pages" is `brand-strong`**, the same teal as the links, not the lighter
  `brand` of the Action button beside it.
- **The unread dot is baked into the avatar image**, not drawn over it. The
  export ships two files: `brand-amazon.png` on a 96px canvas for a read row,
  and `signal-brand-amazon.png` on a 102px canvas whose extra 3px a side hold
  the dot. Both carry the same 90px circle, so both are thirds: the read one
  renders at 32px and the unread at 34px offset by -2, which puts the dot at
  (16,84) and the circle at (17,85) exactly as the export draws them. Compose
  the dot in CSS instead and it doubles up on the baked one, and a round clip
  cuts its corner off.
- **Role change and Company change share a sentence.** Both read "Robert Smith
  changed role from SDR to Senior SDR at WeRoad"; only the coloured label
  differs. So the two kinds carry the same fields and `kind` selects the label,
  not the wording. The seed data reproduces the export's rows exactly and
  repeats them to the twelve the count chip reports.
- **Signal type labels are colour-coded by kind**: Role change purple, Company
  change blue, Website view pink — the same hues as the KPI bars.
- **Dashboard and Lists share one nav glyph**, differing only in colour.
- Replies avatar order is Reddit → Amazon → McDonald's → Medium, confirmed by
  sampling each avatar's dominant colour.

---

## Deliberate deviations from the design

| Item                                                                                                                                                                                      | Decision                                                                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Amber badges use white text (1.73:1, below WCAG AA)                                                                                                                                       | Kept — fidelity is the brief, and the colour was sampled rather than assumed. Flagged here rather than silently "fixed"                                                                             |
| The design's nav glyphs, the Onboarding icons and the brand avatars                                                                                                                       | All are the designer's own exports. Only the two generic disclosure chevrons come from Lucide                                                                                                       |
| The gap between a KPI icon and its figure is not consistent in the export — the figure starts +20px into the tile on five rows but +17px on Contacts engaged, whose glyph is 2px narrower | One uniform rule: a 16px icon box and a 4px gap. That matches five rows exactly and leaves Contacts engaged 3px right of the export. Consistency across the grid beats matching a nudge on one tile |

---

## Assets

Exports live flat in `src/assets/figma/` with semantic names. Two notes for
anyone adding more:

- **Avoid `#` in a path.** It begins a URL fragment and breaks shell commands; a
  `PR#4/` folder took the dev server down.
- **Export bitmap logos as PNG @2x/@3x, not SVG.** An SVG wrapping a base64
  raster is strictly larger than the raster and carries no vector benefit. Frame
  exports — circular, with transparent corners — are ideal, because the framing
  comes from the design rather than being reconstructed.

Two supplied assets needed repair, both recorded in `src/assets/figma/README.md`:
the wordmark carried ~20% padding inside its `viewBox` (tightened to the
artwork's own bounding box, no path data changed), and the trial-card swoosh
embedded a 1668×2224 raster of which its pattern transform used a 138×188
window — cropped, with the transform re-anchored, 304 KB → 19 KB.

Icon exports ship with their colour baked in. Every one is inlined by
`vite-plugin-svgr` with that colour swapped for `currentColor`, so a Tailwind
text-colour class drives it and the icon tracks its token. Without that the
class is silently dead — the artwork still renders in the right colour, but only
because the hardcoded hex happens to equal the token's current value, and it
would drift the moment that token changed.
