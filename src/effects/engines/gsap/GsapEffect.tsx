import React, {useEffect, useRef} from "react";
import {GsapAdapter, type GsapSetup} from "./GsapAdapter";
import {useGsapFrame} from "./useGsapFrame";

type GsapEffectProps = React.PropsWithChildren<{
  durationInFrames: number;
  setup: GsapSetup;
  className?: string;
  style?: React.CSSProperties;
}>;

export const GsapEffect: React.FC<GsapEffectProps> = ({
  durationInFrames,
  setup,
  className,
  style,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const adapterRef = useRef<GsapAdapter>(new GsapAdapter());
  const {progress, fps} = useGsapFrame(durationInFrames);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    adapterRef.current.mount({
      element,
      fps,
      durationInFrames,
      setup,
    });

    return () => {
      adapterRef.current.reset();
    };
  }, [durationInFrames, fps, setup]);

  useEffect(() => {
    adapterRef.current.render(progress);
  }, [progress]);

  useEffect(
    () => () => {
      adapterRef.current.dispose();
    },
    []
  );

  return (
    <div ref={ref} className={className} style={{willChange: "transform, opacity", ...style}}>
      {children}
    </div>
  );
};
