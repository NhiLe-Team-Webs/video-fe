import React, {useCallback, useMemo} from "react";
import {AbsoluteFill} from "remotion";
import {CompositionBuilder} from "../../core/CompositionBuilder";
import {useTheme} from "../../core/hooks/useTheme";
import type {LoadedPlan} from "../../core/types";
import themeConfig from "./theme.json";
import templateConfig from "./template.json";
import {Background} from "../../core/Background";
import {FadeIn} from "../../effects/components/motion/FadeIn";
import {ZoomIn} from "../../effects/components/motion/ZoomIn";
import {SlideUp} from "../../effects/components/motion/SlideUp";
import {useAnimationById} from "../../effects/engines/gsap/useAnimationById";

type TemplateCompositionProps = {
  plan: LoadedPlan;
};

const DEFAULT_ANIMATION_ID = "gsap-fade-in";

export const Template0: React.FC<TemplateCompositionProps> = ({plan}) => {
  const theme = useTheme(themeConfig);
  const effects = {
    fadeIn: FadeIn,
    zoomIn: ZoomIn,
    slideUp: SlideUp,
    none: ({children}: React.PropsWithChildren<{durationInFrames: number}>) => <>{children}</>,
  };

  const planAnimationId = plan.animationId ?? DEFAULT_ANIMATION_ID;
  const defaultAnimation = useMemo(() => useAnimationById(planAnimationId), [planAnimationId]);

  const resolveAnimation = useCallback(
    (segment: LoadedPlan["segments"][number]) => {
      const animationId = segment.animationId ?? planAnimationId;
      if (!animationId) {
        return defaultAnimation;
      }

      if (animationId === planAnimationId) {
        return defaultAnimation;
      }

      return useAnimationById(animationId) ?? defaultAnimation;
    },
    [defaultAnimation, planAnimationId]
  );

  return (
    <AbsoluteFill style={{fontFamily: theme.fontFamily}}>
      <Background color={theme.backgroundColor} accentColor={theme.accentColor} />
      <CompositionBuilder
        plan={plan}
        theme={theme}
        templateConfig={templateConfig}
        effects={effects}
        resolveAnimation={resolveAnimation}
      />
    </AbsoluteFill>
  );
};
