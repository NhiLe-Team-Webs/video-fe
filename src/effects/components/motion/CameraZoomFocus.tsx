import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";

export type CameraZoomFocusProps = React.PropsWithChildren<{
  durationInFrames: number;
  focus?: number;
  offsetX?: number;
  offsetY?: number;
}>;

export const CameraZoomFocus: React.FC<CameraZoomFocusProps> = ({
  children,
  durationInFrames,
  focus = 1.2,
  offsetX = 0,
  offsetY = 0,
}) => {
  const frame = useCurrentFrame();
  const zoomDuration = Math.max(12, Math.floor(durationInFrames * 0.25));
  const zoomOutStart = durationInFrames - zoomDuration;

  const scale = interpolate(
    frame,
    [0, zoomDuration, zoomOutStart, durationInFrames],
    [1, focus, focus, 1],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  const translateX = interpolate(
    frame,
    [0, zoomDuration, zoomOutStart, durationInFrames],
    [0, offsetX, offsetX, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );
  const translateY = interpolate(
    frame,
    [0, zoomDuration, zoomOutStart, durationInFrames],
    [0, offsetY, offsetY, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
        transformOrigin: "center",
        transition: "transform 80ms linear",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

