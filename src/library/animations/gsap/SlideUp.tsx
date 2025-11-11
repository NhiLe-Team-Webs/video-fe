import React from "react";
import {GsapEffect} from "./GsapEffect";

type SlideUpProps = React.PropsWithChildren<{
  durationInFrames: number;
  distance?: number;
}>;

export const GsapSlideUp: React.FC<SlideUpProps> = ({
  children,
  durationInFrames,
  distance = 60,
}) => {
  return (
    <GsapEffect
      durationInFrames={durationInFrames}
      setup={({timeline, element, fps, durationInFrames: frames}) => {
        timeline.fromTo(
          element,
          {opacity: 0, y: distance},
          {
            opacity: 1,
            y: 0,
            duration: Math.max(frames, 1) / fps,
          }
        );
      }}
    >
      {children}
    </GsapEffect>
  );
};
