import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";

export type SlidePanProps = React.PropsWithChildren<{
  direction?: "left" | "right";
}>;

export const SlidePan: React.FC<SlidePanProps> = ({children, direction = "left"}) => {
  const frame = useCurrentFrame();
  const travel = direction === "left" ? -80 : 80;
  const translateX = interpolate(frame, [0, 25], [travel, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        transform: `translateX(${translateX}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

