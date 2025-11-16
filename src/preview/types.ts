export type TransitionType = "cut" | "crossfade" | "slide" | "fadeCamera" | "slideWhoosh";
export type TransitionDirection = "left" | "right" | "up" | "down";

export type TransitionPlan = {
  type?: TransitionType;
  duration?: number;
  direction?: TransitionDirection;
  sfx?: string;
};

export type SegmentBrollPlan = {
  id?: string;
  file?: string;
  mode?: "full" | "overlay" | "pictureInPicture" | "card";
  startAt?: number;
  duration?: number;
  playbackRate?: number;
  cardScale?: number;
  backgroundEffect?: string;
};

export type SegmentPlan = {
  id: string;
  clip?: string;
  sourceStart?: number;
  duration: number;
  text?: string;
  effect?: string;
  label?: string;
  title?: string;
  playbackRate?: number;
  transitionIn?: TransitionPlan;
  transitionOut?: TransitionPlan;
  silenceAfter?: boolean;
  broll?: SegmentBrollPlan | null;
  animationId?: string;
};

export type HighlightPlan = {
  id: string;
  start: number;
  duration: number;
  type?: string;
  text?: string;
  title?: string;
  keyword?: string;
  sfx?: string;
  layout?: string;
  position?: "top" | "center" | "bottom";
};

export type EffectTrackEntry = {
  id: string;
  segmentId?: string;
  start: number;
  duration: number;
  effectKey: string;
  layer?: "base" | "overlay";
  props?: Record<string, unknown>;
};

export type SfxTrackEntry = {
  id: string;
  segmentId?: string;
  start: number;
  duration: number;
  src: string;
  volume?: number;
};

export type PlanTracks = {
  effects?: EffectTrackEntry[];
  sfx?: SfxTrackEntry[];
};

export type EditingPlan = {
  templateId?: string;
  animationId?: string;
  transitionId?: string;
  music?: string | null;
  segments: SegmentPlan[];
  highlights?: HighlightPlan[];
  meta?: {
    sourceVideo?: string;
    id?: string;
    fps?: number;
    duration?: number;
    [key: string]: unknown;
  };
  tracks?: PlanTracks;
};
