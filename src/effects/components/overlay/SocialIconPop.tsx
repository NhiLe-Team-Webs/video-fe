import React, {useMemo} from "react";
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import type {IconType} from "react-icons";
import {FaFacebookF, FaInstagram, FaLinkedin, FaTwitter, FaYoutube} from "react-icons/fa";
import {SiGoogle, SiTiktok} from "react-icons/si";

type PlatformItem = {
  name: string;
  color?: string;
  iconUrl?: string;
};

const fallbackPlatforms: PlatformItem[] = [
  {name: "Facebook"},
  {name: "Instagram"},
  {name: "TikTok"},
  {name: "YouTube"},
];

const brandColors: Record<string, string> = {
  facebook: "#1877f2",
  instagram: "#f77737",
  tiktok: "#010101",
  youtube: "#ff0000",
  google: "#0f9d58",
  linkedin: "#0a66c2",
  twitter: "#1d9bf0",
};

const platformIconMap: Record<string, IconType> = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  tiktok: SiTiktok,
  youtube: FaYoutube,
  google: SiGoogle,
  linkedin: FaLinkedin,
  twitter: FaTwitter,
};

const parsePlatforms = (input?: PlatformItem[] | string): PlatformItem[] => {
  if (!input) {
    return fallbackPlatforms;
  }

  const normalize = (items: PlatformItem[]) =>
    items
      .filter((item) => item && typeof item.name === "string")
      .map((item) => ({
        name: item.name,
        color: item.color,
        iconUrl: item.iconUrl,
      }));

  if (Array.isArray(input)) {
    const normalized = normalize(input);
    return normalized.length > 0 ? normalized : fallbackPlatforms;
  }

  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) {
        const normalized = normalize(parsed as PlatformItem[]);
        return normalized.length > 0 ? normalized : fallbackPlatforms;
      }
    } catch {
      return fallbackPlatforms;
    }
  }

  return fallbackPlatforms;
};

export type SocialIconPopProps = {
  platforms?: PlatformItem[] | string;
  durationInFrames: number;
  align?: "center" | "top" | "bottom";
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const normalizeHex = (hex: string) => {
  const cleaned = hex.replace("#", "").trim();
  const padded = cleaned.length === 3 ? cleaned[0] + cleaned[0] + cleaned[1] + cleaned[1] + cleaned[2] + cleaned[2] : cleaned;
  if (padded.length !== 6) {
    return [255, 255, 255];
  }
  const value = parseInt(padded, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

const blendWithWhite = (hex: string, amount: number) => {
  const [r, g, b] = normalizeHex(hex);
  const mix = (channel: number) =>
    Math.round(channel + (255 - channel) * Math.min(1, Math.max(0, amount)));
  const toHex = (value: number) => value.toString(16).padStart(2, "0");
  return `#${[mix(r), mix(g), mix(b)].map(toHex).join("")}`;
};

const getIconForPlatform = (name: string) => {
  return platformIconMap[name.toLowerCase()] ?? null;
};

const SocialPlatformIcon: React.FC<{
  platform: PlatformItem;
  frame: number;
  durationInFrames: number;
  fps: number;
  index: number;
  total: number;
}> = ({platform, frame, durationInFrames, fps, index, total}) => {
  const color =
    platform.color ?? brandColors[platform.name.toLowerCase()] ?? "#0f172a";
  const glowColor = blendWithWhite(color, 0.6);
  const IconGlyph = getIconForPlatform(platform.name);
  const appearDelay = index * Math.max(4, Math.round(0.08 * fps));
  const fadeInDuration = Math.min(12, Math.max(8, Math.round(fps * 0.12)));
  const fadeInEnd = appearDelay + fadeInDuration;
  const fadeOutDuration = 14;
  const fadeOutStart = Math.max(
    fadeInEnd + 6,
    Math.min(durationInFrames - fadeOutDuration - index * 2, durationInFrames - fadeOutDuration)
  );
  const fadeOutEnd = Math.min(durationInFrames, fadeOutStart + fadeOutDuration);
  const opacity = interpolate(
    frame,
    [appearDelay, fadeInEnd, fadeOutStart, fadeOutEnd],
    [0, 1, 1, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );
  const scale = interpolate(
    frame,
    [appearDelay, appearDelay + Math.max(4, Math.floor(fadeInDuration * 0.6)), fadeInEnd, fadeOutStart],
    [0.62, 1.25, 1, 0.92],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );
  const rotation = Math.sin((frame - appearDelay) / 10) * 4;
  const floatY = Math.sin((frame - appearDelay) / 9) * 6;
  const floatX = Math.cos((frame - appearDelay) / 12) * 4;
  const spread = 110;
  const baseOffsetX = (index - (total - 1) / 2) * spread;
  const baseOffsetY = (index % 2 === 0 ? -1 : 1) * 16;
  const translateX = baseOffsetX + floatX;
  const translateY = baseOffsetY + floatY;

  return (
    <div
      style={{
        width: 140,
        height: 140,
        borderRadius: 80,
        background: `linear-gradient(135deg, ${color} 0%, ${blendWithWhite(color, 0.2)} 90%)`,
        border: `2px solid ${blendWithWhite(color, 0.35)}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        boxShadow: `0 20px 40px rgba(15, 23, 42, 0.45), inset 0 0 30px rgba(255, 255, 255, 0.15)`,
        transform: `translate(${translateX}px, ${translateY}px) scale(${scale}) rotate(${rotation}deg)`,
        opacity,
        transition: "transform 120ms ease",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -16,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${glowColor}, transparent 65%)`,
          filter: "blur(10px)",
          opacity: opacity * 0.9,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          width: 110,
          height: 110,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {platform.iconUrl ? (
          <img
            src={platform.iconUrl}
            alt={platform.name}
            style={{width: 72, height: 72, objectFit: "contain", filter: "drop-shadow(0 12px 20px rgba(0,0,0,0.35))"}}
          />
        ) : IconGlyph ? (
          <IconGlyph color="#fff" size={56} />
        ) : (
          <span
            style={{
              fontSize: 34,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: 1,
            }}
          >
            {getInitials(platform.name)}
          </span>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: -32,
          fontSize: 17,
          color: "#f8fafc",
          textTransform: "uppercase",
          letterSpacing: 1.4,
          textShadow: "0 1px 4px rgba(0,0,0,0.6)",
          opacity: opacity <= 0.15 ? 0 : 1,
        }}
      >
        {platform.name}
      </div>
    </div>
  );
};

export const SocialIconPop: React.FC<SocialIconPopProps> = ({
  platforms,
  durationInFrames,
  align = "center",
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const resolvedPlatforms = useMemo(() => parsePlatforms(platforms), [platforms]);
  const verticalAlign =
    align === "top" ? "flex-start" : align === "bottom" ? "flex-end" : "center";

  return (
    <AbsoluteFill
      style={{
        justifyContent: verticalAlign,
        alignItems: "center",
        padding: "90px 0",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 32,
        }}
      >
        {resolvedPlatforms.map((platform, index) => (
          <SocialPlatformIcon
            key={`${platform.name}-${index}`}
            platform={platform}
            frame={frame}
            durationInFrames={durationInFrames}
            fps={fps}
            index={index}
            total={resolvedPlatforms.length}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
