import {useCurrentFrame, useVideoConfig} from "remotion";

export const useGsapFrame = (durationInFrames: number) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const safeDuration = Math.max(durationInFrames - 1, 1);
  const clampedFrame = Math.min(Math.max(frame, 0), safeDuration);
  const progress = clampedFrame / safeDuration || 0;

  return {
    frame: clampedFrame,
    progress,
    fps,
    durationInFrames: safeDuration,
  };
};

