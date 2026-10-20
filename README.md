# Crono — Dashboard

A pixel-faithful rebuild of the Crono dashboard screen from the provided Figma design, in
React + TypeScript.

**Live:** <https://crm-dashboard-crono.vercel.app> — Vercel, built from `main`, with
a preview deployment on every PR.

> Frontend engineer assessment.

![The dashboard at 1440x750, the width the design is drawn at](docs/screenshots/dashboard.png)

## How it was built

Built with [Claude Code](https://claude.com/claude-code), from two sources that describe
the same screen in different ways: the Figma file, read through the **Figma MCP**, and
the PNG export the submission is judged against. Neither one was enough on its own.

**The Figma MCP gives intent.** Reading an editable copy of the file returns the layer
tree: names, structure and geometry, as the designer authored them. But a layer is what
was drawn in the file, not necessarily what the export shows. The sidebar header carries
an `Arrow, Forward` layer at (184, 48) that the export never renders, so the layer data
alone would have produced something the reference does not contain.

**The export gives the result, but only as an image.** A model looking at a PNG can tell
that a button is a teal pill; it cannot tell you it is `#1ebab2` at 90x32. So the build
leans on a measurement harness, [`.design-tools/`](.design-tools/README.md): nineteen
small Node scripts that turn the export into text. One reads the colour at a coordinate,
one finds the darkest pixel of a glyph for true text ink, one lists ink bands down a
column (which is how the 73px signal-row pitch and the 48px nav pitch were found), one
traces a corner's profile for its radius.

**Together they cover each other's blind spots.** The harness is better at checking a
value than at finding one. Measuring ink width gives a font's size but not its weight, so
weights and line heights were read from the Figma file through the MCP. Reading corner
radii as raw pixel counts gave 12 and 8, because antialiasing makes a curve look tighter
than it is; the real values were 16 and 12, confirmed by diffing a rendered corner's
profile against the export's row by row. Where the file and the export disagree, the
export wins, because it is what the screen is judged against.

The loop, run component by component:

1. **Probe** the export for a value.
2. **Write** the component to it.
3. **Render** it with Playwright at 1440x750 and read the real boxes.
4. **Diff** the render against the export, ranked worst-first.
5. Repeat on the worst item.

Claude Code ran that loop under the working agreement in [`CLAUDE.md`](CLAUDE.md): it
stages changes and stops, every diff was reviewed before it became a commit, and missing
design assets were asked for rather than substituted.

## Stack

| Choice                       | Why                                                            |
| ---------------------------- | -------------------------------------------------------------- |
| Vite + React 19 + TypeScript | Required by the brief; minimal scaffold, strict mode on        |
| Tailwind CSS v4              | Crono's internal choice; tokens declared CSS-first in `@theme` |
| Radix UI primitives          | Accessible, unstyled `DropdownMenu` / `Tooltip` / `ScrollArea` |
| TanStack Query v5            | Loading states and optimistic mutations over a simulated API   |
| Vitest + Testing Library     | Covers the one required interaction                            |
| ESLint (flat) + Prettier     | typescript-eslint type-aware rules, react-hooks, jsx-a11y      |

There is no backend. `src/mocks` holds the seed data as typed TypeScript modules, and
`src/lib/api.ts` is a handful of functions that return it after a short delay so the UI has
real loading states. The two signal mutations rebuild the list with `map`/`filter`, so the
seed is never modified and the change persists for the session.

## The interaction

The brief asks for one. **Action** on a signal row opens a menu with **Complete** and
**Delete**, and either one decreases the unread counter beside the Signals title.

![The Action menu open on the first signal row](docs/screenshots/action-menu.png)

- **Complete** marks the signal read in place: the unread dot clears, the row stays.
- **Delete** removes the row.
- The counter is **derived, never decremented** — `signals.filter((s) => !s.read).length`.
  That makes "complete an already-read signal" and "delete a read signal" correct without
  either case needing its own branch.
- The sidebar's Inbox badge is a separate, static replies count, deliberately not wired to
  this one.

Both run as optimistic mutations: the list is rewritten in the query cache before the
simulated request resolves, `onError` puts the previous list back, and `onSettled`
refetches so the cache agrees with the service either way.

The menu is Radix `DropdownMenu`, which supplies Escape and outside-click to close, arrow
key navigation, one menu open at a time, and focus returning to the button afterwards.

## Build order

Each phase is its own PR.

| PR  | Branch                        | Scope                                          |
| --- | ----------------------------- | ---------------------------------------------- |
| 1   | `chore/scaffold`              | Tooling, CI, `CLAUDE.md`                       |
| 2   | `feat/design-system`          | Tokens sampled from the export + UI primitives |
| 3   | `feat/app-shell`              | Layout grid and sidebar                        |
| 4   | `feat/welcome-replies-tasks`  | Welcome, Replies, Today's tasks                |
| 5   | `feat/performance-onboarding` | KPI card with tooltip, Onboarding              |
| 6   | `feat/mock-api`               | Types, seed JSON, fake service, query hooks    |
| 7   | `feat/signals-list`           | Signals card and rows                          |
| 8   | `feat/signal-actions`         | Action menu, mutations, unread counter, tests  |
| 9   | `fix/rail-alignment`          | Rail's 5px offset, `vite-env.d.ts`             |
| 10  | `docs/readme-and-deploy`      | Screenshots, decisions, deployment             |

## Known deviations

Judgement calls where the export is internally inconsistent, or where matching it
conflicts with another goal. All are deliberate, and each is explained in
[`docs/design-notes.md`](docs/design-notes.md).

| Item                                                                                | Decision                                                                                                                                               |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| KPI bars contradict their own numbers ("Companies engaged 0/500" is drawn 53% full) | Reproduced as drawn — fidelity is the brief. Five of six are 88px of 166 in the export, carried as data; `aria-valuenow` still reports the true figure |
| Only the two generic disclosure chevrons are not design exports                     | Lucide, since every distinctive glyph was exported from Figma                                                                                          |
| The gap between a KPI icon and its figure varies across the export's own tiles      | One uniform 16px icon box + 4px gap; matches five rows, 3px off on the sixth                                                                           |

## Design source

`design/Dashboard.png` — two frames: the default state, and the state with the Action
menu and the KPI tooltip open.

Nothing in this implementation is estimated by eye. Colours are sampled from the export,
font sizes solved from measured ink widths, and corner radii verified by diffing rendered
corner profiles against it. [`docs/design-notes.md`](docs/design-notes.md) records every
value and the method behind it.

### Side by side

The Figma export on top, the deployed app underneath, both 1440x750.

![The Figma export above, the deployed app below, both at 1440x750](docs/screenshots/fidelity.png)

## Running it locally

```sh
pnpm install
pnpm dev
```

| Command          | Purpose                        |
| ---------------- | ------------------------------ |
| `pnpm dev`       | Dev server                     |
| `pnpm build`     | Typecheck + production build   |
| `pnpm preview`   | Serve the production build     |
| `pnpm lint`      | ESLint                         |
| `pnpm typecheck` | TypeScript, no emit            |
| `pnpm test`      | Vitest + React Testing Library |
| `pnpm format`    | Prettier                       |

CI runs format, lint, typecheck, test and build on every push and PR.
