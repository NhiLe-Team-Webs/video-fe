import {linearTiming} from "@remotion/transitions";
import {fade} from "@remotion/transitions/fade";
import {wipe} from "@remotion/transitions/wipe";
import type {TransitionDefinition} from "../transitionTypes";

export const essentialTransitions: TransitionDefinition[] = [
  {
    id: "transition.cross-fade",
    name: "Cross Fade",
    description: "Soft dissolve that blends the outgoing shot into the next scene.",
    tags: ["universal", "vlog", "safe"],
    durationInFrames: 18,
    timing: linearTiming({durationInFrames: 18}),
    presentation: fade(),
    sample: {
      enteringLabel: "Clip B",
      exitingLabel: "Clip A",
      accent: "#38bdf8",
    },
  },
  {
    id: "transition.dip-to-black",
    name: "Dip To Black",
    description: "Fade through black – perfect for scene changes or dramatic beats.",
    tags: ["cinematic", "story", "universal"],
    durationInFrames: 24,
    timing: linearTiming({durationInFrames: 24}),
    presentation: fade(),
    sample: {
      enteringLabel: "Scene 2",
      exitingLabel: "Scene 1",
      accent: "#020617",
    },
  },
  {
    id: "transition.dip-to-white",
    name: "Dip To White",
    description: "Bright flash transition popular in tutorials and upbeat explainers.",
    tags: ["tutorial", "energetic"],
    durationInFrames: 20,
    timing: linearTiming({durationInFrames: 20}),
    presentation: fade(),
    sample: {
      enteringLabel: "Step 2",
      exitingLabel: "Step 1",
      accent: "#f8fafc",
    },
  },
  {
    id: "transition.soft-wipe",
    name: "Soft Wipe",
    description: "A gentle directional wipe that keeps typography legible.",
    tags: ["clean", "ui", "product"],
    durationInFrames: 24,
    timing: linearTiming({durationInFrames: 24}),
    presentation: wipe({direction: "from-left"}),
    sample: {
      enteringLabel: "Feature 2",
      exitingLabel: "Feature 1",
      accent: "#34d399",
    },
  },
  {
    id: "transition.match-dissolve",
    name: "Match Dissolve",
    description: "Longer dissolve that mimics a slow cinematic cut.",
    tags: ["cinematic", "b-roll"],
    durationInFrames: 36,
    timing: linearTiming({durationInFrames: 36}),
    presentation: fade(),
    sample: {
      enteringLabel: "B-Roll",
      exitingLabel: "Hero Shot",
      accent: "#f97316",
    },
  },
];
