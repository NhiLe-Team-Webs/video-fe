import React, {useEffect, useRef} from "react";
import {useCurrentFrame, useVideoConfig} from "remotion";
import {createTimeline, type GsapTimeline} from "./gsapConfig";

type SetupParams = {
  timeline: ReturnType<typeof createTimeline>;
  element: HTMLDivElement;
  fps: number;
  durationInFrames: number;
};

type GsapEffectProps = React.PropsWithChildren<{
  durationInFrames: number;
  setup: (params: SetupParams) => void;
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
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const timelineRef = useRef<GsapTimeline | null>(null);

  if (!timelineRef.current) {
    timelineRef.current = createTimeline();
  }

  const timeline = timelineRef.current;

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    timeline.clear();
    timeline.pause(0);
    setup({timeline, element, fps, durationInFrames});

    return () => {
      timeline.kill();
    };
  }, [durationInFrames, fps, setup, timeline]);

  useEffect(() => {
    const safeDuration = Math.max(durationInFrames - 1, 1);
    const progress = Math.min(Math.max(frame / safeDuration, 0), 1);
    timeline.progress(progress, false);
  }, [frame, durationInFrames, timeline]);

  return (
    <div ref={ref} className={className} style={{willChange: "transform, opacity", ...style}}>
      {children}
    </div>
  );
};
