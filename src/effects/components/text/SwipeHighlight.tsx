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
        fontSize: 74,
        fontWeight: 900,
        color: palette.brightestWhite,
        letterSpacing: 1.6,
        textTransform: "uppercase",
        textShadow: "0 18px 40px rgba(0,0,0,0.45)",
      }}
    >
      <span style={{position: "relative", padding: "0 14px 8px", display: "inline-block"}}>
        <span
          style={{
            position: "absolute",
            left: 0,
            bottom: 2,
            height: "55%",
            width: `${width}%`,
            background: highlightColor,
            borderRadius: 14,
            filter: "blur(0.8px)",
            boxShadow: `0 12px 30px ${highlightColor}55`,
          }}
        />
        <span style={{position: "relative", zIndex: 1}}>{text}</span>
      </span>
    </AbsoluteFill>
  );
};
