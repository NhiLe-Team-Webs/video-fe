import React from "react";
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from "remotion";

export type TypeOnCaptionProps = {
  text: string;
  caret?: boolean;
  color?: string;
};

export const TypeOnCaption: React.FC<TypeOnCaptionProps> = ({
  text,
  caret = true,
  color = "#ffffff",
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const charsPerSecond = 12;
  const visibleChars = Math.min(text.length, Math.floor((frame / fps) * charsPerSecond));

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "0 80px 120px",
        fontFamily: "Space Grotesk, sans-serif",
        fontSize: 48,
        color,
      }}
    >
      <span>
        {text.slice(0, visibleChars)}
        {caret && <span style={{opacity: frame % 30 < 15 ? 1 : 0}}>▋</span>}
      </span>
    </AbsoluteFill>
  );
};

