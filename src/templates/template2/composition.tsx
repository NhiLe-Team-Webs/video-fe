import React, {useCallback, useMemo} from "react";
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
import {useAnimationById} from "../../library/animations/useAnimationById";

const effects = {
  fadeIn: BaseFadeIn,
  zoomIn: BaseZoomIn,
  slideUp: BaseSlideUp,
  none: ({children}: React.PropsWithChildren<{durationInFrames: number}>) => <>{children}</>,
};

const DEFAULT_ANIMATION_ID = "gsap-zoom-pop";

export const Template2: React.FC<{plan: LoadedPlan}> = ({plan}) => {
  const theme = useTheme(themeConfig);
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
