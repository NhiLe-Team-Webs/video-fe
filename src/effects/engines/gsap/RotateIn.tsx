import React from "react";
import {GsapEffect} from "./GsapEffect";

type RotateInProps = React.PropsWithChildren<{
  durationInFrames: number;
  angle?: number;
}>;

export const GsapRotateIn: React.FC<RotateInProps> = ({
  children,
  durationInFrames,
  angle = -20,
}) => {
  return (
    <GsapEffect
      durationInFrames={durationInFrames}
      setup={({timeline, element, fps, durationInFrames: frames}) => {
        timeline.fromTo(
          element,
          {opacity: 0, rotate: angle, transformOrigin: "50% 50%"},
          {
            opacity: 1,
            rotate: 0,
            duration: Math.max(frames, 1) / fps,
            ease: "power3.out",
          }
        );
      }}
    >
      {children}
    </GsapEffect>
  );
};
