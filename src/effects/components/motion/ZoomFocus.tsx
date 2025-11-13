import React from "react";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";

export type ZoomFocusProps = React.PropsWithChildren<{
  focus?: number;
}>;

export const ZoomFocus: React.FC<ZoomFocusProps> = ({children, focus = 1.08}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({frame, fps, config: {mass: 0.8, stiffness: 110}});
  const scale = interpolate(progress, [0, 1], [0.9, focus]);

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale})`,
        filter: `drop-shadow(0 20px 60px rgba(0,0,0,0.35))`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

