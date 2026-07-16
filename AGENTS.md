# AGENTS.md

## Quick start

```sh
pnpm i
pnpm dev       # Vite dev server on 127.0.0.1:8080
pnpm build     # tsc + vite build → dist/
pnpm preview   # serve dist/
```

## Key rules

- **`pnpm build` runs `tsc && vite build`** — TypeScript errors block the build. No separate typecheck script; `pnpm build` is the only type-check path.
- **Build output uses fixed filenames** (no hash): `dist/index.js`, `dist/style.css`. Configured in `vite.config.ts` rollupOptions.
- **No test suite, no linter, no formatter.** Only `tsc --strict` provides static analysis.
- **Path alias**: `@` maps to `src/` (both vite.config.ts and tsconfig.json).

## Project structure

```
src/
  main.ts                    # App entry — wires all managers and UI
  style.css                  # Global styles (includes custom dialog styles)
  core/
    DragManager.ts           # Native drag from library to canvas
    MoveManager.ts           # In-editor element movement (mousedown/mousemove)
    SelectionManager.ts      # Click-to-select, visual feedback, delete button
    GridSnapper.ts           # 20px grid snapping with bounds
  components/
    Editor.ts                # Canvas render, preview mode, source download
    PropertyPanel.ts         # Right panel — edit selected element props
    ComponentLibrary.ts      # Left panel — draggable component cards
    ComponentRegistry.ts     # Component type registry (configs, schemas, createElement)
  state/
    store.ts                 # Central state (pub/sub)
    history.ts               # Snapshot-based undo/redo (max 50)
    persistence.ts           # localStorage save/load + JSON export
  types/
    index.ts                 # AppState, HistoryState, event types, Position
    component.ts             # ComponentType enum, ComponentProps, ComponentConfig
  utils/
    dialog.ts                # Custom alert/confirm dialogs (replaces native browser dialogs)
```

## Gotchas

- **Editor full re-render**: `Editor.render()` clears and re-renders all components on every state mutation — element refs are invalidated after each update.
- **MoveManager global listeners**: Uses `document.addEventListener` for mousemove/mouseup — can interfere with native drag events if not careful.
- **select drag interference**: `e.preventDefault()` on select elements inside draggable wrappers breaks `dragstart`. Use `e.stopPropagation()` instead (handled in DragManager).
- **Custom dialogs are async**: `showAlert()` and `showConfirm()` return Promises. Must use `await` or `.then()` to sequence actions after dialog closes.

## Architecture notes

- **No framework** — pure TypeScript + DOM manipulation
- **State**: Central `Store` with pub/sub. All mutations go through `Store.setState()`.
- **Component types**: Registered in `ComponentRegistry` with `defaultProps` and `propertySchema`. Adding new component types = add a registry entry.
- **Target**: ES2020, strict TypeScript, bundler module resolution
