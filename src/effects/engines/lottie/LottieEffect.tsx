import React, {useEffect, useMemo, useState} from "react";
import {Lottie, type LottieAnimationData, type LottieProps} from "@remotion/lottie";
import {staticFile} from "remotion";

export type LottieEffectProps = Omit<LottieProps, "animationData"> & {
  src: string;
  loader?: React.ReactNode;
};

const resolveSrc = (src: string) => {
  if (src.startsWith("http")) {
    return src;
  }
  return staticFile(src.replace(/^\//, ""));
};

const animationCache = new Map<string, Promise<LottieAnimationData>>();
const animationDataCache = new Map<string, LottieAnimationData>();

const fetchAnimation = (src: string) => {
  if (animationDataCache.has(src)) {
    return Promise.resolve(animationDataCache.get(src)!);
  }

  if (animationCache.has(src)) {
    return animationCache.get(src)!;
  }

  const promise = fetch(resolveSrc(src))
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch Lottie animation: ${response.statusText}`);
      }
      return response.json() as Promise<LottieAnimationData>;
    })
    .then((data) => {
      animationDataCache.set(src, data);
      animationCache.delete(src);
      return data;
    })
    .catch((error) => {
      animationCache.delete(src);
      throw error;
    });

  animationCache.set(src, promise);
  return promise;
};

export const LottieEffect: React.FC<LottieEffectProps> = ({src, loader, loop = true, ...rest}) => {
  const memoizedSrc = useMemo(() => src, [src]);
  const [animationData, setAnimationData] = useState<LottieAnimationData | null>(
    animationDataCache.get(memoizedSrc) ?? null
  );

  useEffect(() => {
    let active = true;
    fetchAnimation(memoizedSrc)
      .then((data) => {
        if (active) {
          setAnimationData(data);
        }
      })
      .catch((error) => {
        console.warn("Failed to load Lottie animation", memoizedSrc, error);
      });

    return () => {
      active = false;
    };
  }, [memoizedSrc]);

  if (!animationData) {
    return <>{loader ?? null}</>;
  }

  return <Lottie animationData={animationData} loop={loop} {...rest} />;
};
