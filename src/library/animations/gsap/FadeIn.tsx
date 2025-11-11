import React, {useEffect, useMemo, useRef} from "react";
import {useCurrentFrame, useVideoConfig} from "remotion";
import {createTimeline} from "./gsapConfig";

type GsapFadeInProps = React.PropsWithChildren<{
  durationInFrames: number;
}>;

export const GsapFadeIn: React.FC<GsapFadeInProps> = ({children, durationInFrames}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const timeline = useMemo(() => createTimeline(), []);

  useEffect(() => {
    if (!wrapperRef.current) {
      return;
    }

    const seconds = Math.max(durationInFrames, 1) / fps;

    timeline.clear();
    timeline.fromTo(
      wrapperRef.current,
      {opacity: 0, y: 40},
      {
        opacity: 1,
        y: 0,
        duration: seconds,
      }
    );

    return () => {
      timeline.kill();
    };
  }, [durationInFrames, fps, timeline]);

  useEffect(() => {
    const progress = Math.min(Math.max(frame / Math.max(durationInFrames, 1), 0), 1);
    timeline.progress(progress, false);
  }, [frame, durationInFrames, timeline]);

  return (
    <div ref={wrapperRef} style={{willChange: "opacity, transform"}}>
      {children}
    </div>
  );
};
