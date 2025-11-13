import type {ComponentType} from "react";
import manifest from "../../registry/manifest.json";
import {
  GsapBounce,
  GsapFadeInPrimitive,
  GsapRotateIn,
  GsapSlideUpPrimitive,
  GsapZoomPop,
} from "../index";
import {LottieEffect, type LottieEffectProps} from "../lottie/LottieEffect";

type GsapEntry = {
  type: "gsap";
  id: string;
  component: keyof typeof gsapMap;
  tags?: string[];
  animationType?: string;
  emotions?: string[];
};

type LottieEntry = {
  type: "lottie";
  id: string;
  path: string;
  tags?: string[];
  animationType?: string;
  emotions?: string[];
};

const gsapMap = {
  GsapFadeInPrimitive,
  GsapSlideUpPrimitive,
  GsapZoomPop,
  GsapRotateIn,
  GsapBounce,
} as const;
const gsapComponentMap = gsapMap as Record<string, ComponentType<any>>;

export type AnimationResolver =
  | {
      type: "gsap";
      id: string;
      Component: ComponentType<any>;
      tags?: string[];
      animationType?: string;
      emotions?: string[];
    }
  | {
      type: "lottie";
      id: string;
      Component: typeof LottieEffect;
      tags?: string[];
      animationType?: string;
      emotions?: string[];
      props: LottieEffectProps;
    };

const animationIndex = (() => {
  const gsapEntries: GsapEntry[] =
    manifest.gsap?.map((entry) => ({
      type: "gsap",
      id: entry.id,
      component: entry.component as keyof typeof gsapMap,
      tags: entry.tags,
      animationType: entry.type,
      emotions: entry.emotions,
    })) ?? [];

  const lottieEntries: LottieEntry[] =
    manifest.lottie?.map((entry) => ({
      type: "lottie",
      id: entry.id,
      path: entry.path,
      tags: entry.tags,
      animationType: entry.type,
      emotions: entry.emotions,
    })) ?? [];

  return [...gsapEntries, ...lottieEntries];
})();

export const listAllAnimations = () => animationIndex;

const resolveAnimationById = (id: string): AnimationResolver | null => {
  const entry = animationIndex.find((item) => item.id === id);
  if (!entry) {
    return null;
  }

  if (entry.type === "gsap") {
    const Component = gsapComponentMap[entry.component];
    if (!Component) {
      return null;
    }

    return {
      type: "gsap",
      id: entry.id,
      Component,
      tags: entry.tags,
      animationType: entry.animationType,
      emotions: entry.emotions,
    };
  }

  return {
    type: "lottie",
    id: entry.id,
    Component: LottieEffect,
    tags: entry.tags,
    animationType: entry.animationType,
    emotions: entry.emotions,
    props: {src: entry.path},
  };
};

export const useAnimationById = resolveAnimationById;
export const getAnimationById = resolveAnimationById;
