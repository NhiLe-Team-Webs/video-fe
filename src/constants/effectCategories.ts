export enum EffectCategory {
  Text = "text",
  Motion = "motion",
  Chart = "chart",
  Background = "background",
  Overlay = "overlay",
}

export const effectCategoryList: Array<{
  id: EffectCategory;
  label: string;
  description: string;
}> = [
  {
    id: EffectCategory.Text,
    label: "Text & Titles",
    description:
      "Typography-driven effects like callouts, subtitles, captions, and kinetic text.",
  },
  {
    id: EffectCategory.Motion,
    label: "Camera & Motion",
    description:
      "Camera style moves such as pans, zooms, slides, parallax, and orbital shifts.",
  },
  {
    id: EffectCategory.Chart,
    label: "Charts & Data",
    description:
      "Data visualizations, stat cards, comparison blocks, and graphic explainers.",
  },
  {
    id: EffectCategory.Background,
    label: "Background Layers",
    description:
      "Visual beds such as gradients, particles, grids, or animated textures.",
  },
  {
    id: EffectCategory.Overlay,
    label: "Overlays & UI",
    description:
      "Lower-thirds, badges, audio visualizers, frames, and screen overlays.",
  },
];

export type EffectCategoryId = `${EffectCategory}`;

