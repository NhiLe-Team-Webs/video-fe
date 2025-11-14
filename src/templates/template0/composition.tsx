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
import {getAnimationById} from "../../effects/engines/gsap/useAnimationById";
import {DEFAULT_TRANSITION_ID, resolveTransitionById} from "../../transitions/useTransitionById";

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
  const planTransitionId = plan.transitionId ?? DEFAULT_TRANSITION_ID;
  const defaultAnimation = useMemo(() => getAnimationById(planAnimationId), [planAnimationId]);
  const defaultTransition = useMemo(
    () => resolveTransitionById(planTransitionId) ?? resolveTransitionById(DEFAULT_TRANSITION_ID),
    [planTransitionId]
  );

  const animationCache = useMemo(() => {
    const cache: { [key: string]: ReturnType<typeof getAnimationById> } = {};
    return (animationId: string) => {
      if (cache[animationId]) {
        return cache[animationId];
      }
      cache[animationId] = getAnimationById(animationId);
      return cache[animationId];
    };
  }, []);

  const resolveAnimation = useCallback(
    (segment: LoadedPlan["segments"][number]) => {
      const animationId = segment.animationId ?? planAnimationId;
      if (!animationId) {
        return defaultAnimation;
      }

      if (animationId === planAnimationId) {
        return defaultAnimation;
      }

      return animationCache(animationId) ?? defaultAnimation;
    },
    [defaultAnimation, planAnimationId, animationCache]
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
