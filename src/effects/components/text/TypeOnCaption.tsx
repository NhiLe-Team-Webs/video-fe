import React from "react";
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from "remotion";
import {palette, typography} from "../../../styles/designTokens";

export type TypeOnCaptionProps = {
  text?: string;
  caret?: boolean;
  color?: string;
};

export const TypeOnCaption: React.FC<TypeOnCaptionProps> = ({
  text = "Type on caption",
  caret = true,
  color = palette.brightestWhite,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const safeText = text ?? "";
  const charsPerSecond = 12;
  const visibleChars = Math.min(safeText.length, Math.floor((frame / fps) * charsPerSecond));

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "0 80px 120px",
        fontFamily: typography.body,
        fontSize: 48,
        color,
        letterSpacing: 0.1,
        textTransform: "uppercase",
      }}
    >
      <span>
        {safeText.slice(0, visibleChars)}
        {caret && <span style={{opacity: frame % 30 < 15 ? 1 : 0}}>▋</span>}
      </span>
    </AbsoluteFill>
  );
};

