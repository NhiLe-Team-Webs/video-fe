import React, {ReactNode} from "react";
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from "remotion";

type AppIntroLowerThirdProps = {
  appName?: string;
  tagline?: string;
  link?: string;
  iconSrc?: string;
  iconElement?: ReactNode;
  colorTheme?: string;
  align?: "left" | "right";
  durationInFrames: number;
};

const normalizeHex = (hex: string) => {
  const cleaned = hex.replace("#", "").trim();
  const expanded =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : cleaned;
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    return [255, 255, 255];
  }
  const value = parseInt(expanded, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

const fadeColor = (hex: string, amount: number) => {
  const [r, g, b] = normalizeHex(hex);
  const clamp = (v: number) => Math.min(255, Math.max(0, v));
  const mix = (channel: number) =>
    Math.round(channel + (255 - channel) * Math.min(1, Math.max(0, amount)));
  const toHex = (value: number) => clamp(value).toString(16).padStart(2, "0");
  return `#${[mix(r), mix(g), mix(b)].map(toHex).join("")}`;
};

export const AppIntroLowerThird: React.FC<AppIntroLowerThirdProps> = ({
  appName = "ATLAS",
  tagline = "Custom AI revenue engine",
  link = "youratlas.com",
  iconSrc,
  iconElement,
  colorTheme = "#22d3ee",
  align = "left",
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const fadeInFrames = Math.min(18, Math.max(10, Math.round(fps * 0.2)));
  const fadeOutFrames = Math.min(16, Math.max(10, Math.round(fps * 0.22)));
  const fadeOutStart = Math.max(
    fadeInFrames + 16,
    Math.min(Math.max(durationInFrames - fadeOutFrames, 0), Math.max(durationInFrames - 1, 0))
  );

  const horizonGap = Math.max(24, Math.round(width * 0.03));
  const containerWidth = Math.min(520, Math.max(360, width * 0.55));

  const opacity = interpolate(
    frame,
    [0, fadeInFrames, fadeOutStart, durationInFrames],
    [0, 1, 1, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  const translateY = interpolate(
    frame,
    [0, fadeInFrames, fadeOutStart, durationInFrames],
    [48, 0, 0, 32],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  const iconPulse = interpolate(
    frame,
    [0, fadeInFrames],
    [0.88, 1],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  const titleDelay = fadeInFrames * 0.35;
  const titleTranslate = interpolate(
    frame,
    [titleDelay, titleDelay + 12],
    [align === "left" ? -28 : 28, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  const taglineDelay = fadeInFrames + 5;
  const taglineOpacity = interpolate(
    frame,
    [taglineDelay, taglineDelay + 10],
    [0, 1],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  const linkDelay = taglineDelay + 6;
  const linkOpacity = interpolate(
    frame,
    [linkDelay, linkDelay + 12],
    [0, 1],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  const glowColor = fadeColor(colorTheme, 0.4);
  const accentBorder = fadeColor(colorTheme, 0.35);
  const sweepTranslate = interpolate(
    frame,
    [0, fadeInFrames, fadeOutStart, durationInFrames],
    [-130, 60, 120, 200],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  const iconContent =
    iconElement ??
    (iconSrc ? (
      <img src={iconSrc} alt={appName} style={{width: "100%", height: "100%"}} />
    ) : (
      <span
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#fff",
        }}
      >
        {appName.charAt(0)}
      </span>
    ));

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: horizonGap,
          left: align === "left" ? horizonGap : "auto",
          right: align === "right" ? horizonGap : "auto",
          opacity,
          transform: `translateY(${translateY}px)`,
          width: containerWidth,
          borderRadius: 26,
          padding: "12px 20px 18px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: "rgba(15,23,42,0.68)",
          boxShadow: "0 25px 60px rgba(2,6,23,0.7)",
          border: `1px solid ${accentBorder}`,
          backdropFilter: "blur(16px)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `radial-gradient(circle at 30% 30%, ${glowColor}, ${colorTheme})`,
            border: `1px solid ${accentBorder}`,
            transform: `scale(${iconPulse})`,
            boxShadow: `0 10px 30px rgba(34,115,255,0.35)`,
          }}
        >
          {iconContent}
        </div>

        <div style={{flex: 1, display: "flex", flexDirection: "column", gap: 6}}>
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 1.1,
              color: "#fff",
              textTransform: "uppercase",
              transform: `translateX(${titleTranslate}px)`,
            }}
          >
            {appName}
          </div>
          <div
            style={{
              fontSize: 16,
              color: "rgba(248,250,252,0.82)",
              opacity: taglineOpacity,
              transform: `translateY(${taglineOpacity * 4 - 4}px)`,
            }}
          >
            {tagline}
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: colorTheme,
              opacity: linkOpacity,
              position: "relative",
              display: "inline-flex",
              paddingBottom: 2,
            }}
          >
            {link}
            <span
              style={{
                position: "absolute",
                left: 0,
                bottom: -2,
                width: "100%",
                height: 3,
                background: `linear-gradient(90deg, rgba(255,255,255,0), ${colorTheme}, rgba(255,255,255,0))`,
                transform: `scaleX(${linkOpacity})`,
                transformOrigin: "left",
                opacity: linkOpacity,
              }}
            />
          </div>

        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(120deg, transparent, rgba(255,255,255,0.25), transparent)`,
            transform: `translateX(${sweepTranslate}px)`,
            pointerEvents: "none",
            opacity: 0.4,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
