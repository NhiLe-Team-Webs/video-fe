import React from "react";
import {AbsoluteFill} from "remotion";
import {CompositionBuilder} from "../../core/CompositionBuilder";
import {useTheme} from "../../core/hooks/useTheme";
import type {LoadedPlan} from "../../core/types";
import themeConfig from "./theme.json";
import templateConfig from "./template.json";
import {Background} from "../../library/components/Background";
import {FadeIn} from "./effects/fadeIn";
import {ZoomIn} from "./effects/zoomIn";
import {SlideUp} from "./effects/slideUp";

type TemplateCompositionProps = {
  plan: LoadedPlan;
};

export const Template0: React.FC<TemplateCompositionProps> = ({plan}) => {
  const theme = useTheme(themeConfig);
  const effects = {
    fadeIn: FadeIn,
    zoomIn: ZoomIn,
    slideUp: SlideUp,
    none: ({children}: React.PropsWithChildren<{durationInFrames: number}>) => <>{children}</>,
  };

  return (
    <AbsoluteFill style={{fontFamily: theme.fontFamily}}>
      <Background color={theme.backgroundColor} accentColor={theme.accentColor} />
      <CompositionBuilder plan={plan} theme={theme} templateConfig={templateConfig} effects={effects} />
    </AbsoluteFill>
  );
};
