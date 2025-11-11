import type {Segment} from "../types";

export const secondsToFrames = (seconds: number, fps = 30) => {
  const clampedSeconds = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  return Math.round(clampedSeconds * fps);
};

export const totalFrames = (segments: Array<Pick<Segment, "duration">>, fps = 30) => {
  return segments.reduce((total, segment) => total + secondsToFrames(segment?.duration ?? 0, fps), 0);
};
