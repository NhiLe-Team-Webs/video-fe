import React from "react";
import {AbsoluteFill} from "remotion";
import {GsapFadeInPrimitive} from "../../engines/gsap/fadeInPrimitive";

type FadeInProps = React.PropsWithChildren<{
  durationInFrames: number;
}>;

export const FadeIn: React.FC<FadeInProps> = ({children, durationInFrames}) => {
  return (
    <AbsoluteFill>
      <GsapFadeInPrimitive durationInFrames={durationInFrames}>{children}</GsapFadeInPrimitive>
    </AbsoluteFill>
  );
};
