import React, {useCallback, useMemo} from "react";
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
import {useAnimationById} from "../../library/animations/useAnimationById";

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
