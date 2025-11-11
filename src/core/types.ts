export type Segment = {
  clip: string;
  text?: string;
  effect?: string;
  duration: number; // seconds
  sfx?: string;
  emotion?: string;
};

export type Plan = {
  templateId: string;
  segments: Segment[];
  music?: string;
};

export type NormalizedSegment = {
  clip: string;
  text: string;
  effect: string;
  duration: number;
  durationInFrames: number;
  sfx?: string;
  emotion?: string;
};

export type LoadedPlan = Omit<Plan, "segments"> & {
  segments: NormalizedSegment[];
  durationInFrames: number;
};
