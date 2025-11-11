import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";

type FadeInProps = React.PropsWithChildren<{
  durationInFrames: number;
}>;

export const FadeIn: React.FC<FadeInProps> = ({children, durationInFrames}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, Math.min(20, durationInFrames)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{opacity}}>
      {children}
    </AbsoluteFill>
  );
};
