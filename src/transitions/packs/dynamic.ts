import {linearTiming, springTiming} from "@remotion/transitions";
import {fade} from "@remotion/transitions/fade";
import {slide} from "@remotion/transitions/slide";
import {wipe} from "@remotion/transitions/wipe";
import type {TransitionDefinition} from "../transitionTypes";

export const dynamicTransitions: TransitionDefinition[] = [
  {
    id: "transition.flash-cut",
    name: "Flash Cut",
    description: "Ultra-fast tonal flash that suggests emphasis without hard cuts.",
    tags: ["promo", "punchy", "shorts"],
    durationInFrames: 8,
    timing: linearTiming({durationInFrames: 8}),
    presentation: fade(),
    sample: {
      enteringLabel: "CTA",
      exitingLabel: "Hook",
      accent: "#facc15",
    },
  },
  {
    id: "transition.whip-pan-right",
    name: "Whip Pan Right",
    description: "Aggressive push ideal for energetic vlogs.",
    tags: ["vlog", "energetic", "travel"],
    durationInFrames: 16,
    timing: springTiming({
      durationInFrames: 16,
      config: {damping: 90, stiffness: 260, mass: 0.7},
    }),
    presentation: slide({direction: "from-right"}),
    sample: {
      enteringLabel: "Next Scene",
      exitingLabel: "Current",
      accent: "#fb7185",
    },
  },
  {
    id: "transition.whip-pan-left",
    name: "Whip Pan Left",
    description: "Mirrored whip pan to keep cuts feeling rhythmic.",
    tags: ["vlog", "travel", "energetic"],
    durationInFrames: 16,
    timing: springTiming({
      durationInFrames: 16,
      config: {damping: 90, stiffness: 260, mass: 0.7},
    }),
    presentation: slide({direction: "from-left"}),
    sample: {
      enteringLabel: "Next Shot",
      exitingLabel: "Previous",
      accent: "#22c55e",
    },
  },
  {
    id: "transition.glitch-wipe",
    name: "Glitch Swipe",
    description: "Hard wipe with neon accent – great for tech explainers.",
    tags: ["tech", "gaming", "energetic"],
    durationInFrames: 14,
    timing: linearTiming({durationInFrames: 14}),
    presentation: wipe({direction: "from-right"}),
    sample: {
      enteringLabel: "Update",
      exitingLabel: "Context",
      accent: "#a855f7",
    },
  },
  {
    id: "transition.punch-focus",
    name: "Punch Focus",
    description: "Super quick fade used to highlight stats or key frames.",
    tags: ["sports", "stats", "shorts"],
    durationInFrames: 10,
    timing: linearTiming({durationInFrames: 10}),
    presentation: fade(),
    sample: {
      enteringLabel: "Stat Drop",
      exitingLabel: "Play",
      accent: "#c084fc",
    },
  },
];
