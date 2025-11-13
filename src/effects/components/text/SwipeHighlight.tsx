import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";

export type SwipeHighlightProps = {
  text: string;
  highlightColor?: string;
};

export const SwipeHighlight: React.FC<SwipeHighlightProps> = ({
  text,
  highlightColor = "#56ccf2",
}) => {
  const frame = useCurrentFrame();
  const width = interpolate(frame, [0, 20], [0, 100], {extrapolateRight: "clamp"});

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, sans-serif",
        fontSize: 56,
        color: "#0b0b0b",
      }}
    >
      <span style={{position: "relative", padding: "0 8px"}}>
        <span
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            height: "40%",
            width: `${width}%`,
            background: highlightColor,
            borderRadius: 6,
            transition: "width 80ms ease-out",
          }}
        />
        <span style={{position: "relative"}}>{text}</span>
      </span>
    </AbsoluteFill>
  );
};

