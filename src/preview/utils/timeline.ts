import type {SegmentPlan, TransitionPlan} from "../types";

export type TimelineSegment = {
  segment: SegmentPlan;
  from: number;
  duration: number;
  transitionInFrames: number;
  transitionOutFrames: number;
  audioCrossfade: boolean;
};

const toFrames = (seconds: number | undefined, fps: number) => {
  if (!seconds || !Number.isFinite(seconds)) {
    return 0;
  }
  return Math.max(0, Math.round(seconds * fps));
};

const resolveTransitionDuration = (
  transition: TransitionPlan | undefined,
  fps: number,
  fallbackSeconds: number,
  maxDurationFrames: number
) => {
  if (!transition) {
    return 0;
  }

  const targetSeconds =
    typeof transition.duration === "number" && transition.duration > 0
      ? transition.duration
      : fallbackSeconds;
  const frames = toFrames(targetSeconds, fps);
  return Math.min(Math.max(frames, 0), Math.floor(maxDurationFrames));
};

export const buildTimeline = (
  segments: SegmentPlan[],
  fps: number,
  fallbackTransitionSeconds: number
): TimelineSegment[] => {
  const timeline: TimelineSegment[] = [];
  let fallbackAnchorSeconds = 0;

  segments.forEach((segment, index) => {
    const durationFrames = Math.max(1, toFrames(segment.duration, fps));
    const maxTransitionFrames = durationFrames / 2;
    const allowIn = index > 0 ? segments[index - 1].silenceAfter !== false : false;
    const allowOut = segment.silenceAfter !== false;

    const normalizedSegment: SegmentPlan = {...segment};
    const incomingTransition = allowIn ? normalizedSegment.transitionIn : undefined;
    let outgoingTransition = allowOut ? normalizedSegment.transitionOut : undefined;

    if (allowOut && !outgoingTransition) {
      const nextSegment = segments[index + 1];
      if (nextSegment?.transitionIn) {
        outgoingTransition = nextSegment.transitionIn;
      }
    }

    const transitionInFrames = allowIn
      ? resolveTransitionDuration(incomingTransition, fps, fallbackTransitionSeconds, maxTransitionFrames)
      : 0;
    const transitionOutFrames = allowOut
      ? resolveTransitionDuration(outgoingTransition, fps, fallbackTransitionSeconds, maxTransitionFrames)
      : 0;

    const startSeconds =
      typeof normalizedSegment.sourceStart === "number" && Number.isFinite(normalizedSegment.sourceStart)
        ? normalizedSegment.sourceStart
        : fallbackAnchorSeconds;
    const from = Math.max(0, toFrames(startSeconds, fps));
    fallbackAnchorSeconds = Math.max(fallbackAnchorSeconds, startSeconds + (segment.duration ?? 0));

    timeline.push({
      segment: normalizedSegment,
      from,
      duration: durationFrames,
      transitionInFrames,
      transitionOutFrames,
      audioCrossfade: allowIn,
    });
  });

  return timeline;
};

export const getTimelineDuration = (timeline: TimelineSegment[]) => {
  if (!timeline.length) {
    return 0;
  }

  return timeline.reduce((max, entry) => Math.max(max, entry.from + entry.duration), 0);
};
