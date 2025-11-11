import React, {useEffect, useMemo, useState} from "react";
import {Lottie, type LottieAnimationData, type LottieProps} from "@remotion/lottie";
import {staticFile} from "remotion";

type LottieEffectProps = Omit<LottieProps, "animationData"> & {
  src: string;
  loader?: React.ReactNode;
};

const resolveSrc = (src: string) => {
  if (src.startsWith("http")) {
    return src;
  }
  return staticFile(src.replace(/^\//, ""));
};

const fetchAnimation = async (src: string) => {
  const response = await fetch(resolveSrc(src));
  if (!response.ok) {
    throw new Error(`Failed to fetch Lottie animation: ${response.statusText}`);
  }

  return (await response.json()) as LottieAnimationData;
};

export const LottieEffect: React.FC<LottieEffectProps> = ({src, loader, loop = true, ...rest}) => {
  const memoizedSrc = useMemo(() => src, [src]);
  const [animationData, setAnimationData] = useState<LottieAnimationData | null>(null);

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
