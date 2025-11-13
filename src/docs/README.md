## Unified Effects Architecture

### Problem Recap

- `src/library` vs `src/components/effects` both store “animations” without a clear ownership model.
- Lottie JSON and GSAP logic live in different trees, so devs cannot see all assets for a category in one place.
- There is no persistent context (category, intent, tags) baked into the folder structure.
- Resolver / AI modules cannot reason about which effect to pick because taxonomy metadata is separate from implementation paths.

### Goals

1. Single source of truth for *every* visual effect (GSAP/Lottie/native).
2. Taxonomy baked into the directory structure to give context (`text`, `motion`, `overlay`, etc.).
3. Tooling-friendly layout—scripts can derive manifest data without bespoke logic per technology.
4. Developer-friendly APIs (`useEffectByKey`, `useLottieByKey`) that do not require remembering file paths.

### Proposed Structure

```
src/
 └─ effects/
     ├─ taxonomy/                  # Effect categories, enums, helpers
     ├─ registry/
     │    ├─ effects.json          # Visual effects metadata (Module 1 output)
     │    ├─ lottieRegistry.json   # Raw Lottie assets metadata
     │    └─ manifest.json         # GSAP/Lottie manifest for preview/resolver
     ├─ engines/                   # Low-level primitives (gsap/, lottie/)
     ├─ components/                # Category folders exporting ready-to-use effects
     │    ├─ text/
     │    ├─ motion/
     │    ├─ overlay/
     │    ├─ background/
     │    └─ transition/
     ├─ hooks/                     # useEffectByKey, useLottieByKey, etc.
     └─ preview/
          └─ EffectGallery.tsx
```

### How It Solves Current Pain Points

| Pain Point | Solution |
| --- | --- |
| `/library` vs `/components` confusion | Consolidate under `src/effects`. `sources/` holds low-level primitives (GSAP, Lottie), while `components/` publishes category-aware building blocks. |
| Lottie separation | Lottie JSON + wrappers live inside `sources/lottie`; registry + manifest exist in the same subtree. |
| Missing context | Category folders (`components/text/PopUp.tsx`) + taxonomy metadata keep “intent” next to implementation. |
| Resolver scale-up | Resolver only needs taxonomy key → registry entry. Both are generated from `src/effects/registry`. |
| Developer ergonomics | Devs import `useEffectByKey("text.popUp")` or `useLottieByKey("overlay.sparkle")` without chasing file paths. Scripts like `intakeLottie` scan predictable directories. |

### Migration Plan

1. **Move Taxonomy Files**
   - Relocate `src/constants/effectCategories.ts` + `effectTaxonomy.ts` to `src/effects/taxonomy/`.
   - Update imports via TypeScript path alias (`@/effects/taxonomy`).

2. **Unify Registries**
   - Move `src/data/effects.json` → `src/effects/registry/effects.json`.
   - Introduce `src/effects/registry/lottieRegistry.json`.

3. **Restructure Implementation Roots**
   - Move all `src/components/effects/**` into `src/effects/components/**`.
   - Move `src/library/animations/gsap` into `src/effects/engines/gsap`.
   - Keep Lottie JSON assets in `/public/assets/lottie` and wrap them via `src/effects/engines/lottie`.

4. **Hook & API Layer**
   - Keep `useEffectByKey` under `src/effects/hooks`.
   - Add `useLottieByKey` reading from `lottieRegistry.json` and returning `<LottieEffect />`.

5. **Tooling Updates**
   - `npm run validate:lottie` wraps `scripts/validateLottie.ts` to lint all JSON.
   - `npm run intake:lottie` executes `scripts/intakeLottie.ts`, rebuilding `src/effects/registry/lottieRegistry.json`.
   - `npm run manifest:lottie` (or `npm run generate:manifest`) updates `src/effects/registry/manifest.json` so engines and preview apps see the new assets.

6. **Preview & Docs**
   - Mount the unified `EffectGallery` composition in Remotion Studio.
   - Document new structure inside `README.md` (Effect Taxonomy Layer section links to this doc).

### Naming Conventions

- **Taxonomy key**: `<category>.<effectName>` matches folder path `src/effects/components/<category>/<EffectName>.tsx`.
- **Lottie asset key**: `lottie.<category>.<slug>` ensures no conflict with code-based effects.
- **Registry entries** carry `category`, `tags`, and `publicPath` for preview/resolver.

### Resolver Flow (example)

1. Backend plan requests `text.popUp`.
2. Template calls `useEffectByKey("text.popUp")`.
3. Hook loads component from `src/effects/components/text/PopUp`.
4. Component optionally composes GSAP primitives (`src/effects/engines/gsap`) + Lottie assets via `useLottieByKey`.

### Next Steps

1. Implement Module 2 scripts (`intakeLottie`, `validateLottie`, `generateLottieManifest`) inside the new folder structure.
2. Add path aliases (`@/effects/*`) for ergonomics.
3. Gradually migrate existing templates to import from `src/effects/...`, deleting old `src/library` once parity is reached.
