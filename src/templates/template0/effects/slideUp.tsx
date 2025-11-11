import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";

type SlideUpProps = React.PropsWithChildren<{
  durationInFrames: number;
}>;

export const SlideUp: React.FC<SlideUpProps> = ({children, durationInFrames}) => {
  const frame = useCurrentFrame();
  const translateY = interpolate(frame, [0, durationInFrames], [80, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [0, Math.min(25, durationInFrames)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{transform: `translateY(${translateY}px)`, opacity}}>
      {children}
    </AbsoluteFill>
  );
};
