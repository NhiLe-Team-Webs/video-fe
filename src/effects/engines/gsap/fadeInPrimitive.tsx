import React from "react";
import {GsapEffect} from "./GsapEffect";

type GsapFadeInPrimitiveProps = React.PropsWithChildren<{
  durationInFrames: number;
}>;

export const GsapFadeInPrimitive: React.FC<GsapFadeInPrimitiveProps> = ({children, durationInFrames}) => {
  return (
    <GsapEffect
      durationInFrames={durationInFrames}
      setup={({timeline, element, fps, durationInFrames: frames}) => {
        timeline.fromTo(
          element,
          {opacity: 0, y: 40},
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
