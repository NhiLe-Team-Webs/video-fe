import React from "react";
import {GsapEffect} from "./GsapEffect";

type ZoomPopProps = React.PropsWithChildren<{
  durationInFrames: number;
  fromScale?: number;
}>;

export const GsapZoomPop: React.FC<ZoomPopProps> = ({
  children,
  durationInFrames,
  fromScale = 0.9,
}) => {
  return (
    <GsapEffect
      durationInFrames={durationInFrames}
      setup={({timeline, element, fps, durationInFrames: frames}) => {
        timeline.fromTo(
          element,
          {scale: fromScale, opacity: 0},
          {
            scale: 1,
            opacity: 1,
            ease: "back.out(1.8)",
            duration: Math.max(frames, 1) / fps,
          }
        );
      }}
    >
      {children}
    </GsapEffect>
  );
};
