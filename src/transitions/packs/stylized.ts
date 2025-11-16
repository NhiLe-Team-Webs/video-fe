import {linearTiming, springTiming} from "@remotion/transitions";
import {fade} from "@remotion/transitions/fade";
import {wipe} from "@remotion/transitions/wipe";
import {flip} from "@remotion/transitions/flip";
import {clockWipe} from "@remotion/transitions/clock-wipe";
import type {TransitionDefinition} from "../transitionTypes";
import {COMPOSITION_HEIGHT, COMPOSITION_WIDTH} from "../../core/constants/video";

const DEFAULT_TRANSITION_WIDTH = COMPOSITION_WIDTH;
const DEFAULT_TRANSITION_HEIGHT = COMPOSITION_HEIGHT;

export const stylizedTransitions: TransitionDefinition[] = [
  {
    id: "transition.flip-board",
    name: "Flip Board",
    description: "3D flip that feels like turning cards in a storyboard.",
    tags: ["stylized", "case-study", "presentation"],
    durationInFrames: 30,
    timing: springTiming({
      durationInFrames: 30,
      config: {damping: 160, stiffness: 130, mass: 1},
    }),
    presentation: flip({direction: "from-right"}),
    sample: {
      enteringLabel: "Insight",
      exitingLabel: "Setup",
      accent: "#7dd3fc",
    },
  },
  {
    id: "transition.clock-sweep",
    name: "Clock Sweep",
    description: "Circular wipe inspired by news and infographic packages.",
    tags: ["news", "infographic", "clean"],
    durationInFrames: 32,
    timing: linearTiming({durationInFrames: 32}),
    presentation: clockWipe({width: DEFAULT_TRANSITION_WIDTH, height: DEFAULT_TRANSITION_HEIGHT}) as any,
    sample: {
      enteringLabel: "Data",
      exitingLabel: "Intro",
      accent: "#fde047",
    },
  },
  {
    id: "transition.light-sweep",
    name: "Light Sweep",
    description: "Quick wipe with bright accent – good for product shots.",
    tags: ["product", "sleek", "ui"],
    durationInFrames: 22,
    timing: linearTiming({durationInFrames: 22}),
    presentation: wipe({direction: "from-left"}),
    sample: {
      enteringLabel: "Hero",
      exitingLabel: "Detail",
      accent: "#fbbf24",
    },
  },
  {
    id: "transition.film-burn",
    name: "Film Burn Fade",
    description: "Warm fade inspired by camera light leaks.",
    tags: ["cinematic", "travel", "nostalgic"],
    durationInFrames: 34,
    timing: linearTiming({durationInFrames: 34}),
    presentation: fade(),
    sample: {
      enteringLabel: "Memory",
      exitingLabel: "Scene",
      accent: "#fb7185",
    },
  },
];
