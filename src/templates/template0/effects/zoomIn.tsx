import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";

type ZoomInProps = React.PropsWithChildren<{
  durationInFrames: number;
}>;

export const ZoomIn: React.FC<ZoomInProps> = ({children, durationInFrames}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, durationInFrames], [0.9, 1.05], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{transform: `scale(${scale})`, transition: "transform 120ms linear"}}>
      {children}
    </AbsoluteFill>
  );
};
