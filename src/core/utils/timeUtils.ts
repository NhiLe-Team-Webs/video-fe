import {interpolate} from "remotion";

export const getProgressInSegment = (frame: number, start: number, end: number) => {
  if (end - start === 0) {
    return 0;
  }
  return Math.min(Math.max((frame - start) / (end - start), 0), 1);
};

export const fadeInOut = (frame: number, durationInFrames: number, fadeFrames = 15) => {
  const fadeIn = interpolate(frame, [0, fadeFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [durationInFrames - fadeFrames, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return Math.min(fadeIn, fadeOut);
};
