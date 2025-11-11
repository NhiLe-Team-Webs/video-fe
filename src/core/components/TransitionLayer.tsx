import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";

type TransitionLayerProps = React.PropsWithChildren<{
  effect?: string;
  durationInFrames: number;
}>;

const getEnvelope = (frame: number, durationInFrames: number) => {
  const window = Math.max(10, Math.floor(durationInFrames * 0.15));
  const fadeIn = interpolate(frame, [0, window], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [durationInFrames - window, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return {fadeIn, fadeOut, envelope: Math.min(fadeIn, fadeOut)};
};

export const TransitionLayer: React.FC<TransitionLayerProps> = ({
  effect = "none",
  durationInFrames,
  children,
}) => {
  const frame = useCurrentFrame();
  const {envelope, fadeIn} = getEnvelope(frame, durationInFrames);

  const scale =
    effect === "zoom_in"
      ? interpolate(frame, [0, durationInFrames], [0.92, 1.05], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;

  const opacity = effect === "fade_in" ? envelope : 1;
  const showOverlay = effect === "fade_in";

  return (
    <AbsoluteFill style={{overflow: "hidden"}}>
      <AbsoluteFill style={{transform: `scale(${scale})`, opacity, transition: "transform 150ms linear"}}>
        {children}
      </AbsoluteFill>

      {showOverlay ? (
        <AbsoluteFill
          style={{
            backgroundColor: "#000",
            opacity: 1 - fadeIn,
            pointerEvents: "none",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
