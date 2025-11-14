import type {TransitionPresentation, TransitionTiming} from "@remotion/transitions";
import {linearTiming, springTiming} from "@remotion/transitions";
import {fade} from "@remotion/transitions/fade";
import {slide} from "@remotion/transitions/slide";
import {wipe} from "@remotion/transitions/wipe";

export type TransitionDefinition = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  durationInFrames: number;
  timing: TransitionTiming;
  presentation?: TransitionPresentation<Record<string, unknown>>;
  sample?: {
    enteringLabel: string;
    exitingLabel: string;
    accent: string;
  };
};

export const DEFAULT_TRANSITION_ID = "transition.cross-fade";

const transitionList: TransitionDefinition[] = [
  {
    id: "transition.cross-fade",
    name: "Cross Fade",
    description: "Soft dissolve that blends the outgoing shot into the next scene.",
    tags: ["universal", "emotive", "safe"],
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
    id: "transition.slide-right",
    name: "Slide Right Push",
    description: "Incoming scene pushes the previous one sideways with a subtle overshoot.",
    tags: ["energetic", "narrative"],
    durationInFrames: 28,
    timing: springTiming({
      durationInFrames: 28,
      config: {
        damping: 180,
        stiffness: 120,
        mass: 0.9,
      },
    }),
    presentation: slide({direction: "from-right"}),
    sample: {
      enteringLabel: "New Topic",
      exitingLabel: "Summary",
      accent: "#f472b6",
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
    id: "transition.flash-cut",
    name: "Flash Cut",
    description: "Ultra-fast tonal flash that suggests emphasis without hard cuts.",
    tags: ["promo", "punchy"],
    durationInFrames: 8,
    timing: linearTiming({durationInFrames: 8}),
    presentation: fade(),
    sample: {
      enteringLabel: "Call To Action",
      exitingLabel: "Hook",
      accent: "#facc15",
    },
  },
];

const transitionRegistry = transitionList.reduce<Record<string, TransitionDefinition>>((acc, transition) => {
  acc[transition.id] = transition;
  return acc;
}, {});

export const listRegisteredTransitions = () => transitionList;

export const getTransitionById = (id?: string | null): TransitionDefinition | null => {
  if (!id) {
    return null;
  }

  return transitionRegistry[id] ?? null;
};
