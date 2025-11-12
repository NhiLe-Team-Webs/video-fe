# My Video Engine

**My Video Engine** is an opinionated Remotion template for building AI-assisted video generation pipelines. It packages a multi-template rendering system, hot-reloadable plan previews, GSAP/Lottie animation library, and manifest tooling so backend services can drive the editor through JSON alone.

## ✨ Features

- **Template System** – `template0`, `template1`, `template2` each define their own theme, rules, and animation defaults. Plans can set `templateId` plus per-segment `animationId`.
- **Animation Library** – Unified manifest for GSAP + Lottie effects, with browser panels to preview every animation (`animation-browser`) and inspect metadata (tags, emotions, type).
- **Preview Suite** – Remotion dev mode exposes:
  - `live-preview`: auto‑reloads `plan.json` & template configs.
  - `animation-browser`: adjustable duration/delay/repeat to visualize effects.
  - `template-preview`: swap templates, tweak FPS/resolution, edit plan JSON inline.
  - `plan-preview`: drag‑and‑drop plan files or load from URL and see a timeline of segments.
- **Quick Reload & Debug Overlay** – File watchers refresh previews, with on-screen toasts and per-frame debug info (active segment, animation, emotion, SFX). Toggle overlay via `D` or `Ctrl+D`.
- **Manifest Generator** – `npm run generate:manifest` scans `/src/library`, extracts metadata, and rewrites `manifest.json` for backend sync. Tag/type/emotion fields are ready for AI selection heuristics.

## 🚀 Getting Started

```bash
npm install
```

### Preview Modes

| Command | Description |
| --- | --- |
| `npm start` | Standard Remotion Studio with the production composition (`auto-video`). |
| `npm run dev:preview` | Dev suite exposing `live-preview`, `animation-browser`, `template-preview`, `plan-preview`. |

### Rendering & Tooling

```bash
# Generate manifest after changing library assets
npm run generate:manifest

# Render the main composition to MP4
npm run render
```

### Debug Overlay

- Toggle via **D** (no modifiers) or **Ctrl+D** / **Cmd+D**.
- Shows current frame, FPS, active segment index, animation ID, SFX, and emotion directly in the preview.

## 📁 Project Structure Highlights

```
src/
 ├─ core/
 │   ├─ CompositionBuilder.tsx       # Handles timeline + animations per segment
 │   ├─ context/DebugContext.tsx     # Debug overlay state & hotkeys
 │   └─ components/DebugPanel.tsx    # Overlay UI
 ├─ library/
 │   ├─ animations/                  # GSAP & Lottie implementations
 │   ├─ animations/manifest.json     # Unified metadata for effects
 │   └─ manifest.json                # Generated asset manifest
 ├─ preview/                         # Remotion preview panels
 │   ├─ TemplatePreviewPanel.tsx
 │   ├─ PlanPreviewPanel.tsx
 │   └─ hooks/useQuickReload.ts
 └─ templates/
     └─ template{0,1,2}/             # Template compositions, themes, rules
```

## 🧠 Effect Taxonomy Layer

- `src/constants/effectCategories.ts` + `effectTaxonomy.ts` define the canonical naming schema (`category.effectName`) and make keys type-safe.
- `src/components/effects/` holds reusable Remotion-ready building blocks organized by category with their own indexes for tree-shaking.
- `src/data/effects.json` is the metadata registry consumed by resolvers, galleries, and backend tooling.
- `src/hooks/useEffectByKey.ts` exposes a simple API: `const effect = useEffectByKey("text.popUp");` which returns `{Component, metadata}`.
- `npm run effects:classify` validates taxonomy ↔ component ↔ metadata coverage and can backfill stub entries via `--write`.

## 🧩 Manifest Generator Roadmap

The CLI (`scripts/generateManifest.ts`) already covers Feature 1 (basic scanning). Planned extensions (see `generateManifest.ts` comments) include metadata parsing, versioning, configurable filters, smart updates, and optional watcher mode.

## 🤝 Contributing

1. Fork & clone the repo.
2. Ensure `npm run generate:manifest` & `npm run render` succeed before pushing.
3. Open a PR with a clear description of the change and testing steps.

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
