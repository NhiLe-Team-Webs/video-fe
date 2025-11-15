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
        fontFamily: typography.headline,
        fontSize: 68,
        fontWeight: 800,
        color,
        letterSpacing: 0.4,
        textTransform: "uppercase",
        textShadow: "0 18px 40px rgba(0,0,0,0.55)",
      }}
    >
      <div
        style={{
          padding: "26px 42px",
          borderRadius: 36,
          background: "rgba(5,8,16,0.55)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 25px 55px rgba(0,0,0,0.55)",
          minWidth: "60%",
          textAlign: "center",
        }}
      >
        <span style={{display: "inline-block"}}>
          {safeText.slice(0, visibleChars)}
          {caret && <span style={{opacity: frame % 30 < 15 ? 1 : 0, marginLeft: 6}}>▋</span>}
        </span>
      </div>
    </AbsoluteFill>
  );
};
