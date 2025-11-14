import {springTiming} from "@remotion/transitions";
import {slide} from "@remotion/transitions/slide";
import type {TransitionDefinition} from "../transitionTypes";

const buildSpringTiming = (durationInFrames: number) =>
  springTiming({
    durationInFrames,
    config: {
      damping: 180,
      stiffness: 120,
      mass: 0.9,
    },
  });

export const slideTransitions: TransitionDefinition[] = [
  {
    id: "transition.slide-right",
    name: "Slide Right Push",
    description: "Incoming scene pushes the previous one sideways with a subtle overshoot.",
    tags: ["energetic", "narrative", "b-roll"],
    durationInFrames: 28,
    timing: buildSpringTiming(28),
    presentation: slide({direction: "from-right"}),
    sample: {
      enteringLabel: "New Topic",
      exitingLabel: "Summary",
      accent: "#f472b6",
    },
  },
  {
    id: "transition.slide-left",
    name: "Slide Left Push",
    description: "Classic swipe left, similar to CapCut/short-form editors.",
    tags: ["shorts", "mobile", "energetic"],
    durationInFrames: 26,
    timing: buildSpringTiming(26),
    presentation: slide({direction: "from-left"}),
    sample: {
      enteringLabel: "Clip Next",
      exitingLabel: "Clip Prev",
      accent: "#22d3ee",
    },
  },
  {
    id: "transition.slide-up",
    name: "Slide Up Reveal",
    description: "Vertical push used in UI/product explainers.",
    tags: ["ui", "product", "clean"],
    durationInFrames: 30,
    timing: buildSpringTiming(30),
    presentation: slide({direction: "from-bottom"}),
    sample: {
      enteringLabel: "Feature",
      exitingLabel: "Context",
      accent: "#a855f7",
    },
  },
  {
    id: "transition.slide-down",
    name: "Slide Down Reveal",
    description: "Reverse vertical swipe for recaps or chapter breaks.",
    tags: ["story", "chapter"],
    durationInFrames: 24,
    timing: buildSpringTiming(24),
    presentation: slide({direction: "from-top"}),
    sample: {
      enteringLabel: "Recap",
      exitingLabel: "Chapter",
      accent: "#f97316",
    },
  },
  {
    id: "transition.parallax-push",
    name: "Parallax Push",
    description: "Faster push with extra overshoot for dynamic travel footage.",
    tags: ["travel", "b-roll", "energetic"],
    durationInFrames: 20,
    timing: springTiming({
      durationInFrames: 20,
      config: {
        damping: 120,
        stiffness: 260,
        mass: 0.7,
      },
    }),
    presentation: slide({direction: "from-right"}),
    sample: {
      enteringLabel: "City",
      exitingLabel: "Drone",
      accent: "#fde047",
    },
  },
];
