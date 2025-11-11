import type {Segment} from "../types";

export const clampSeconds = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return 0;
  }
  return seconds;
};

export const secondsToFrames = (seconds: number, fps = 30) => {
  return Math.round(clampSeconds(seconds) * fps);
};

export const framesToSeconds = (frames: number, fps = 30) => {
  if (!Number.isFinite(frames) || frames < 0) {
    return 0;
  }
  return frames / fps;
};

export const totalFrames = (segments: Array<Pick<Segment, "duration">>, fps = 30) => {
  return segments.reduce((total, segment) => total + secondsToFrames(segment?.duration ?? 0, fps), 0);
};

export type TimelineSegment<T> = T & {start: number; end: number};

export const calcFrameRange = <T extends {duration: number}>(segments: T[], fps = 30): TimelineSegment<T>[] => {
  let current = 0;

  return segments.map((segment) => {
    const start = current;
    const end = current + secondsToFrames(segment.duration, fps);
    current = end;
    return {...segment, start, end};
  });
};
