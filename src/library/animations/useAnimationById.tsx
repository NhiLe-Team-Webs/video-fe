import React from "react";
import manifest from "./manifest.json";
import {
  GsapBounce,
  GsapEffect,
  GsapFadeIn,
  GsapRotateIn,
  GsapSlideUp,
  GsapZoomPop,
  LottieEffect,
} from "./index";

type GsapEntry = {
  type: "gsap";
  id: string;
  component: keyof typeof gsapMap;
  tags?: string[];
};

type LottieEntry = {
  type: "lottie";
  id: string;
  path: string;
  tags?: string[];
};

const gsapMap = {
  GsapFadeIn,
  GsapSlideUp,
  GsapZoomPop,
  GsapRotateIn,
  GsapBounce,
} as const;

const animationIndex = (() => {
  const gsapEntries: GsapEntry[] =
    manifest.gsap?.map((entry) => ({
      type: "gsap",
      id: entry.id,
      component: entry.component as keyof typeof gsapMap,
      tags: entry.tags,
    })) ?? [];

  const lottieEntries: LottieEntry[] =
    manifest.lottie?.map((entry) => ({
      type: "lottie",
      ...entry,
    })) ?? [];

  return [...gsapEntries, ...lottieEntries];
})();

export const listAllAnimations = () => animationIndex;

export const useAnimationById = (id: string) => {
  const entry = animationIndex.find((item) => item.id === id);
  if (!entry) {
    return null;
  }

  if (entry.type === "gsap") {
    const Component = (gsapMap as Record<string, typeof GsapEffect>)[entry.component] ?? GsapEffect;
    return (props: React.ComponentProps<typeof Component>) => <Component {...props} />;
  }

  return (props: React.ComponentProps<typeof LottieEffect>) => (
    <LottieEffect {...props} src={entry.path} />
  );
};
