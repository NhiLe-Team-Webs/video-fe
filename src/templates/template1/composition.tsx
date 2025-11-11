import React from "react";
import {AbsoluteFill} from "remotion";
import {CompositionBuilder} from "../../core/CompositionBuilder";
import {useTheme} from "../../core/hooks/useTheme";
import type {LoadedPlan} from "../../core/types";
import themeConfig from "./theme.json";
import templateConfig from "./template.json";
import {Background} from "../../library/components/Background";
import {FadeIn as BaseFadeIn} from "../template0/effects/fadeIn";
import {ZoomIn as BaseZoomIn} from "../template0/effects/zoomIn";
import {SlideUp as BaseSlideUp} from "../template0/effects/slideUp";

const effects = {
  fadeIn: BaseFadeIn,
  zoomIn: BaseZoomIn,
  slideUp: BaseSlideUp,
  none: ({children}: React.PropsWithChildren<{durationInFrames: number}>) => <>{children}</>,
};

export const Template1: React.FC<{plan: LoadedPlan}> = ({plan}) => {
  const theme = useTheme(themeConfig);

  return (
    <AbsoluteFill style={{fontFamily: theme.fontFamily}}>
      <Background color={theme.backgroundColor} accentColor={theme.accentColor} />
      <CompositionBuilder plan={plan} theme={theme} templateConfig={templateConfig} effects={effects} />
    </AbsoluteFill>
  );
};
