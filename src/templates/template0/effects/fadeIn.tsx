import React from "react";
import {AbsoluteFill} from "remotion";
import {GsapFadeIn} from "../../../library/animations/gsap/FadeIn";

type FadeInProps = React.PropsWithChildren<{
  durationInFrames: number;
}>;

export const FadeIn: React.FC<FadeInProps> = ({children, durationInFrames}) => {
  return (
    <AbsoluteFill>
      <GsapFadeIn durationInFrames={durationInFrames}>{children}</GsapFadeIn>
    </AbsoluteFill>
  );
};
