import React from "react";
import {GsapEffect} from "./GsapEffect";

type BounceProps = React.PropsWithChildren<{
  durationInFrames: number;
  height?: number;
}>;

export const GsapBounce: React.FC<BounceProps> = ({
  children,
  durationInFrames,
  height = 50,
}) => {
  return (
    <GsapEffect
      durationInFrames={durationInFrames}
      setup={({timeline, element, fps, durationInFrames: frames}) => {
        timeline.fromTo(
          element,
          {opacity: 0, y: height},
          {
            opacity: 1,
            y: 0,
            duration: Math.max(frames, 1) / fps,
            ease: "bounce.out",
          }
        );
      }}
    >
      {children}
    </GsapEffect>
  );
};
