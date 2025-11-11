import type {ComponentType} from "react";
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
const gsapComponentMap = gsapMap as Record<string, ComponentType<any>>;

type AnimationResolver =
  | {
      type: "gsap";
      id: string;
      Component: React.ComponentType<Record<string, unknown>>;
      tags?: string[];
    }
  | {
    type: "lottie";
    id: string;
    Component: typeof LottieEffect;
    tags?: string[];
    props: {src: string};
  };

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

export const useAnimationById = (id: string): AnimationResolver | null => {
  const entry = animationIndex.find((item) => item.id === id);
  if (!entry) {
    return null;
  }

  if (entry.type === "gsap") {
    const Component = gsapComponentMap[entry.component] ?? GsapEffect;
    return {
      type: "gsap",
      id: entry.id,
      Component,
      tags: entry.tags,
    };
  }

  return {
    type: "lottie",
    id: entry.id,
    Component: LottieEffect,
    tags: entry.tags,
    props: {src: entry.path},
  };
};
