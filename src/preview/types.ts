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
  mode?: "full" | "overlay" | "pictureInPicture";
  startAt?: number;
  duration?: number;
  playbackRate?: number;
};

export type SegmentPlan = {
  id: string;
  sourceStart?: number;
  duration: number;
  label?: string;
  title?: string;
  playbackRate?: number;
  transitionIn?: TransitionPlan;
  transitionOut?: TransitionPlan;
  silenceAfter?: boolean;
  broll?: SegmentBrollPlan | null;
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

export type EditingPlan = {
  segments: SegmentPlan[];
  highlights?: HighlightPlan[];
  meta?: {
    sourceVideo?: string;
  };
};
