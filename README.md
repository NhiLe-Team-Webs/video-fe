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
- **Manifest Generator** – `npm run generate:manifest` scans `/src/effects`, extracts metadata, and rewrites `manifest.json` for backend sync. Tag/type/emotion fields are ready for AI selection heuristics.

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
 │   ├─ layers/                      # Video/Text/Transition overlay primitives
 │   └─ context/DebugContext.tsx     # Debug overlay state & hotkeys
 ├─ effects/
 │   ├─ taxonomy/                    # Naming schema & enums (Module 1)
 │   ├─ registry/                    # effects.json + lottie/manifest data
 │   ├─ engines/                     # GSAP + Lottie primitives
 │   ├─ components/                  # Category-specific reusable effects
 │   └─ hooks/                       # useEffectByKey, future loaders
 ├─ preview/                         # Remotion preview panels + galleries
 │   ├─ TemplatePreviewPanel.tsx
 │   ├─ PlanPreviewPanel.tsx
 │   └─ hooks/useQuickReload.ts
 ├─ orchestrator/                    # Plan loader + runtime resolver
 │   ├─ loadPlan.ts                  # Normalizes plan JSON + FPS
 │   └─ PlanOrchestrator.tsx         # Entry composition
 └─ templates/
     └─ template{0,1,2}/             # Template compositions, themes, rules
```

## 🧠 Effect Taxonomy Layer

- `src/effects/taxonomy/effectCategories.ts` + `effectTaxonomy.ts` define the canonical naming schema (`category.effectName`) and make keys type-safe.
- `src/effects/components/` holds reusable Remotion-ready building blocks organized by category with their own indexes for tree-shaking.
- `src/effects/registry/effects.json` is the metadata registry consumed by resolvers, galleries, and backend tooling.
- `src/effects/hooks/useEffectByKey.ts` exposes a simple API: `const effect = useEffectByKey("text.popUp");` which returns `{Component, metadata}`.
- `npm run effects:classify` validates taxonomy ↔ component ↔ metadata coverage and can backfill stub entries via `--write`.

## 🎞 Lottie Intake Pipeline

- Place any `.json` animations inside `public/assets/library/animations/lottie/<category>/`.
- Run `npm run validate:lottie` to sanity-check structure, FPS, expressions, and asset references.
- Run `npm run intake:lottie` to rebuild `src/effects/registry/lottieRegistry.json`.
- Run `npm run manifest:lottie` (or `npm run generate:manifest`) to sync `src/effects/registry/manifest.json` so `useAnimationById` and previews can load the new assets.
- `AnimationPreviewApp` and `LottieShowcase` automatically surface every valid Lottie entry from the registry.
- Set `REMOTION_SOURCE_WATCH=true` when starting Remotion Studio if you want the legacy quick-reload watcher to poll `plan.json` / template files via HTTP; it is disabled by default to avoid 404 spam during renders.

## 🧩 Manifest Generator Roadmap

The CLI (`scripts/generateEffectRegistry.ts`) already covers Feature 1 (basic scanning). Planned extensions (see `generateEffectRegistry.ts` comments) include metadata parsing, versioning, configurable filters, smart updates, and optional watcher mode.

## 🤝 Contributing

1. Fork & clone the repo.
2. Ensure `npm run generate:manifest` & `npm run render` succeed before pushing.
3. Open a PR with a clear description of the change and testing steps.

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
