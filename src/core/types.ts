export type Segment = {
  clip: string;
  text?: string;
  effect?: string;
  duration: number; // seconds
  sfx?: string;
  emotion?: string;
  animationId?: string;
  transitionId?: string;
  sourceStart?: number; // seconds within the clip (used for long-form footage)
  mute?: boolean;
};

export type Plan = {
  templateId: string;
  segments: Segment[];
  music?: string | null;
  animationId?: string;
  transitionId?: string;
};

export type NormalizedSegmentCore = {
  clip: string;
  text: string;
  effect: string;
  duration: number;
  durationInFrames: number;
  sfx?: string;
  emotion?: string;
  animationId?: string;
  transitionId?: string;
  sourceStart?: number;
  mute: boolean;
};

export type NormalizedSegment = NormalizedSegmentCore & {
  startFrame: number;
  endFrame: number;
};

export type LoadedPlan = Omit<Plan, "segments"> & {
  segments: NormalizedSegment[];
  durationInFrames: number;
  fps: number;
};
