import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {palette, typography} from "../../../styles/designTokens";

export type SwipeHighlightProps = {
  text?: string;
  highlightColor?: string;
};

export const SwipeHighlight: React.FC<SwipeHighlightProps> = ({
  text = "Swipe Highlight",
  highlightColor = palette.primaryRed,
}) => {
  const frame = useCurrentFrame();
  const width = interpolate(frame, [0, 20], [0, 100], {extrapolateRight: "clamp"});

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontFamily: typography.headline,
        fontSize: 56,
        color: palette.brightestWhite,
        letterSpacing: 1.2,
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
          }}
        />
        <span style={{position: "relative"}}>{text}</span>
      </span>
    </AbsoluteFill>
  );
};

