# AGENTS.md — drag-demo

## Quick start

```sh
pnpm i
pnpm dev       # Vite dev server on 127.0.0.1:8080
pnpm build     # tsc + vite build → dist/
pnpm preview   # serve dist/
```

## Key rules

- **Root `index.html` references `/src/main.ts`** — this is the Vite entry point. Do NOT change it to reference `/dist/index.js` (Vite build fails if dist doesn't exist yet).
- **`pnpm build` runs `tsc && vite build`** — TypeScript errors block the build. No separate `pnpm typecheck` script exists; `pnpm build` is the only type-check path.
- **Build output uses fixed filenames** (no hash): `dist/index.js`, `dist/style.css`, `dist/img/[name][extname]`. Configured in `vite.config.ts` rollupOptions.
- **User prefers Chinese communication.**
- **No test suite, no linter, no formatter.** Only `tsc --strict` provides static analysis.

## Project structure

```
src/
  main.ts                    # App entry — wires all managers and UI
  style.css                  # Global styles
  core/
    DragManager.ts           # Native drag from library to canvas
    MoveManager.ts           # In-editor element movement (mousedown/mousemove)
    SelectionManager.ts      # Click-to-select, multi-select
    GridSnapper.ts           # 20px grid snapping
  components/
    Editor.ts                # Canvas render, preview mode, source download
    PropertyPanel.ts         # Right panel — edit selected element props
    ComponentLibrary.ts      # Left panel — draggable component cards
    ComponentRegistry.ts     # Component type registry (configs, schemas, createElement)
  state/
    store.ts                 # Central state (pub/sub)
    history.ts               # Snapshot-based undo/redo (max 50)
    persistence.ts           # localStorage save/load + JSON export
  events/
    EventBus.ts              # Event bus
  types/
    index.ts                 # Re-exports
    component.ts             # Component type definitions
  utils/
    codegen.ts               # HTML code generation for preview/download
    geometry.ts              # Collision/overlap utilities
    dom.ts                   # DOM helpers
```

## Gotchas

- **dist cache**: After modifying `src/style.css` or `src/main.ts`, confirm `dist/` rebuilt. Stale dist files get cached by the browser and may load old CSS/JS.
- **CSS class `.body` collides with `<body>` tag** — use `.editor-body` or similar semantic names instead.
- **select drag interference**: `e.preventDefault()` on select elements inside draggable wrappers breaks `dragstart`. Use `e.stopPropagation()` instead (fixed in `DragManager.ts`).
- **MoveManager global listeners**: Uses `document.addEventListener` with `e.preventDefault()` for mousemove/mouseup — can interfere with native drag events.
- **ComponentLibrary inline styles**: `renderComponentItem` sets inline styles that override CSS rules. When updating the design system, sync these or switch to CSS variables.
- **Editor full re-render**: `Editor.render()` clears and re-renders all components on every state mutation — element refs are invalidated after each update.
- **Ghost image persistence**: Native `draggable="true"` ghost image only disappears after a valid `drop` event. Child elements can intercept `dragover` and prevent `drop` on the parent. The recommended fix is to replace native drag with pure mousedown/mousemove (MoveManager already does this for in-editor movement).
- **Root `index.html` direct open won't work**: The root HTML references `/src/main.ts` which requires Vite's module resolution. Either use `pnpm dev` or open `dist/index.html` after building.

## Architecture notes

- **No framework** — pure TypeScript + DOM manipulation
- **State**: Central `Store` with pub/sub. All mutations go through `Store.setState()`.
- **Component types**: Registered in `ComponentRegistry` with `defaultProps` and `propertySchema`. Adding new component types = add a registry entry.
- **Path alias**: `@` maps to `src/` (both vite.config.ts and tsconfig.json)
- **Target**: ES2020, strict TypeScript, bundler module resolution
