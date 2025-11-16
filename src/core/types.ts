export type SegmentTransition = {
  type?: string;
  duration?: number;
  direction?: string;
  sfx?: string;
};

export type SegmentBroll = {
  id?: string;
  file?: string;
  mode?: "full" | "overlay" | "pictureInPicture" | "card";
  startAt?: number;
  duration?: number;
  playbackRate?: number;
  cardScale?: number;
  backgroundEffect?: string;
};

export type Segment = {
  id?: string;
  clip: string;
  text?: string;
  label?: string;
  title?: string;
  effect?: string;
  duration: number; // seconds
  sfx?: string;
  emotion?: string;
  animationId?: string;
  transitionId?: string;
  transitionIn?: SegmentTransition;
  transitionOut?: SegmentTransition;
  sourceStart?: number; // seconds within the clip (used for long-form footage)
  mute?: boolean;
  silenceAfter?: boolean;
  kind?: string;
  broll?: SegmentBroll | null;
};

export type Plan = {
  templateId: string;
  segments: Segment[];
  music?: string | null;
  animationId?: string;
  transitionId?: string;
  tracks?: PlanTracks;
  meta?: PlanMeta;
};

export type PlanMeta = {
  id?: string;
  sourceVideo?: string;
  transcript?: string;
  duration?: number;
  fps?: number;
};

export type NormalizedSegmentCore = {
  id?: string;
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
  broll?: SegmentBroll | null;
};

export type NormalizedSegment = NormalizedSegmentCore & {
  startFrame: number;
  endFrame: number;
};

export type LoadedPlan = Omit<Plan, "segments"> & {
  segments: NormalizedSegment[];
  durationInFrames: number;
  fps: number;
  meta?: PlanMeta;
  effects: NormalizedEffectEvent[];
  audioEvents: NormalizedAudioEvent[];
};

export type PlanTracks = {
  effects?: EffectTrackEntry[];
  sfx?: SfxTrackEntry[];
};

export type EffectTrackEntry = {
  id: string;
  segmentId?: string;
  start: number;
  duration: number;
  effectKey: string;
  props?: Record<string, unknown>;
  layer?: string;
};

export type SfxTrackEntry = {
  id: string;
  segmentId?: string;
  start: number;
  duration: number;
  src: string;
  volume?: number;
};

export type NormalizedEffectEvent = EffectTrackEntry & {
  startFrame: number;
  durationInFrames: number;
  endFrame: number;
};

export type NormalizedAudioEvent = SfxTrackEntry & {
  startFrame: number;
  durationInFrames: number;
  endFrame: number;
};
