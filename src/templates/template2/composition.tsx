import React, {useCallback, useMemo} from "react";
import {AbsoluteFill} from "remotion";
import {CompositionBuilder} from "../../core/CompositionBuilder";
import {useTheme} from "../../core/hooks/useTheme";
import type {LoadedPlan} from "../../core/types";
import themeConfig from "./theme.json";
import templateConfig from "./template.json";
import {Background} from "../../core/Background";
import {FadeIn as BaseFadeIn} from "../../effects/components/motion/FadeIn";
import {ZoomIn as BaseZoomIn} from "../../effects/components/motion/ZoomIn";
import {SlideUp as BaseSlideUp} from "../../effects/components/motion/SlideUp";
import {getAnimationById} from "../../effects/engines/gsap/useAnimationById";
import {DEFAULT_TRANSITION_ID, resolveTransitionById} from "../../transitions/useTransitionById";

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
  const planTransitionId = plan.transitionId ?? DEFAULT_TRANSITION_ID;
  const defaultAnimation = useMemo(() => getAnimationById(planAnimationId), [planAnimationId]);
  const defaultTransition = useMemo(
    () => resolveTransitionById(planTransitionId) ?? resolveTransitionById(DEFAULT_TRANSITION_ID),
    [planTransitionId]
  );

  const resolveAnimation = useCallback(
    (segment: LoadedPlan["segments"][number]) => {
      const animationId = segment.animationId ?? planAnimationId;
      if (!animationId) {
        return defaultAnimation;
      }

      if (animationId === planAnimationId) {
        return defaultAnimation;
      }

      return getAnimationById(animationId) ?? defaultAnimation;
    },
    [defaultAnimation, planAnimationId]
  );

  const resolveTransitionConfig = useCallback(
    ({
      segment,
    }: {
      segment: LoadedPlan["segments"][number];
      nextSegment?: LoadedPlan["segments"][number];
      index?: number;
    }) => {
      const transitionId = segment.transitionId ?? planTransitionId;
      if (!transitionId) {
        return defaultTransition ?? null;
      }

      if (transitionId === planTransitionId) {
        return defaultTransition ?? null;
      }

      return resolveTransitionById(transitionId) ?? defaultTransition ?? null;
    },
    [defaultTransition, planTransitionId]
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
        resolveTransition={resolveTransitionConfig}
      />
    </AbsoluteFill>
  );
};
