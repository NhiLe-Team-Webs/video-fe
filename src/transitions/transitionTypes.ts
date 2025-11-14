import type {TransitionPresentation, TransitionTiming} from "@remotion/transitions";

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
