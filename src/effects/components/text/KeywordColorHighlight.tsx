import React, {useMemo} from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type KeywordColorHighlightProps = {
  text?: string;
  keywords?: string | string[];
  highlightColors?: string[];
  baseColor?: string;
  align?: "center" | "bottom";
  durationInFrames: number;
};

type HighlightSegment = {
  text: string;
  isKeyword: boolean;
  highlightIndex?: number;
};

const normalizeHex = (hex: string) => {
  const raw = hex.replace("#", "").trim();
  const expanded =
    raw.length === 3
      ? raw
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    return [255, 255, 255];
  }
  const value = parseInt(expanded, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

const mixColors = (from: string, to: string, t: number) => {
  const [r1, g1, b1] = normalizeHex(from);
  const [r2, g2, b2] = normalizeHex(to);
  const clamp = (num: number) => Math.round(Math.max(0, Math.min(255, num)));
  const lerp = (start: number, end: number) => clamp(start + (end - start) * t);
  const toHex = (value: number) => value.toString(16).padStart(2, "0");
  return `#${[lerp(r1, r2), lerp(g1, g2), lerp(b1, b2)].map(toHex).join("")}`;
};

const blendWithWhite = (hex: string, amount: number) => {
  const [r, g, b] = normalizeHex(hex);
  const blend = (channel: number) =>
    Math.round(channel + (255 - channel) * Math.min(1, Math.max(0, amount)));
  const toHex = (value: number) => value.toString(16).padStart(2, "0");
  return `#${[blend(r), blend(g), blend(b)].map(toHex).join("")}`;
};

const parseKeywords = (input?: string | string[]): string[] => {
  if (!input) {
    return [];
  }
  if (Array.isArray(input)) {
    return input
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0);
  }
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .filter((item) => item.length > 0);
      }
    } catch {
      // ignore
    }
    return input
      .split(/[,;|]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return [];
};

const buildSegments = (text: string, keywords: string[]): HighlightSegment[] => {
  if (!text) {
    return [];
  }
  const normalized = text.toLowerCase();
  const matches: Array<{start: number; length: number}> = [];
  const normalizedKeywords = keywords
    .map((keyword) => (keyword || "").trim())
    .filter((keyword) => keyword.length > 0);

  if (!normalizedKeywords.length) {
    return [{text, isKeyword: true, highlightIndex: 0}];
  }

  normalizedKeywords.forEach((keyword) => {
    const search = keyword.toLowerCase();
    let index = 0;
    while (index < normalized.length) {
      const found = normalized.indexOf(search, index);
      if (found === -1) {
        break;
      }
      matches.push({start: found, length: keyword.length});
      index = found + search.length;
    }
  });

  if (!matches.length) {
    return [{text, isKeyword: true, highlightIndex: 0}];
  }

  matches.sort((a, b) => (a.start !== b.start ? a.start - b.start : b.length - a.length));
  const filtered: Array<{start: number; length: number}> = [];
  let cursor = 0;
  matches.forEach((match) => {
    if (match.start < cursor) {
      return;
    }
    filtered.push(match);
    cursor = match.start + match.length;
  });

  if (!filtered.length) {
    return [{text, isKeyword: true, highlightIndex: 0}];
  }

  const segments: HighlightSegment[] = [];
  let pointer = 0;
  filtered.forEach((match, matchIndex) => {
    if (match.start > pointer) {
      segments.push({
        text: text.slice(pointer, match.start),
        isKeyword: false,
      });
    }
    segments.push({
      text: text.slice(match.start, match.start + match.length),
      isKeyword: true,
      highlightIndex: matchIndex,
    });
    pointer = match.start + match.length;
  });
  if (pointer < text.length) {
    segments.push({
      text: text.slice(pointer),
      isKeyword: false,
    });
  }
  return segments;
};

export const KeywordColorHighlight: React.FC<KeywordColorHighlightProps> = ({
  text,
  keywords,
  highlightColors = ["#22d3ee", "#facc15", "#f472b6"],
  baseColor = "#f8fafc",
  align = "bottom",
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fallbackText = "This actually highlights ACTUALLY.";
  const textContent = text && text.trim() ? text.trim() : fallbackText;
  const resolvedKeywords = useMemo(() => {
    const parsed = parseKeywords(keywords);
    if (parsed.length) {
      return parsed;
    }
    return ["ACTUALLY"];
  }, [keywords]);
  const segments = useMemo(
    () => buildSegments(textContent, resolvedKeywords),
    [textContent, resolvedKeywords]
  );

  const fadeInFrames = Math.min(10, Math.max(6, Math.round(fps * 0.18)));
  const fadeOutFrames = Math.min(16, Math.max(10, Math.round(fps * 0.2)));
  const fadeOutStart = Math.max(
    fadeInFrames + 6,
    Math.min(Math.max(durationInFrames - fadeOutFrames, 0), Math.max(durationInFrames - 1, 0))
  );

  const containerOpacity = interpolate(
    frame,
    [0, fadeInFrames, fadeOutStart, durationInFrames],
    [0, 1, 1, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  const containerTranslate = interpolate(
    frame,
    [0, fadeInFrames, fadeOutStart, durationInFrames],
    [22, 0, 0, 28],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  const highlightRise = Math.max(3, Math.round(fps * 0.08));

  return (
    <AbsoluteFill
      style={{
        justifyContent: align === "center" ? "center" : "flex-end",
        alignItems: "center",
        pointerEvents: "none",
        padding: align === "bottom" ? "0 32px 72px" : "32px",
      }}
    >
      <div
        style={{
          opacity: containerOpacity,
          transform: `translateY(${containerTranslate}px)`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <h2
          style={{
            color: baseColor,
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: 1.2,
            lineHeight: 1.2,
            maxWidth: "90%",
            textTransform: "uppercase",
          }}
        >
          {segments.map((segment, index) => {
            if (!segment.isKeyword) {
              return (
                <span key={`${segment.text}-${index}`} style={{whiteSpace: "pre-wrap"}}>
                  {segment.text}
                </span>
              );
            }
            const highlightIndex = segment.highlightIndex ?? 0;
            const targetColor = highlightColors[
              highlightIndex % highlightColors.length
            ];
            const highlightStart = fadeInFrames;
            const riseProgress = interpolate(
              frame,
              [highlightStart, highlightStart + highlightRise],
              [0, 1],
              {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
            );
            const fadeProgress =
              frame < fadeOutStart
                ? 1
                : interpolate(
                    frame,
                    [fadeOutStart, durationInFrames],
                    [1, 0],
                    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
                  );
            const highlightIntensity = Math.min(riseProgress, fadeProgress);
            const currentColor = mixColors(baseColor, targetColor, highlightIntensity);
            const glowColor = targetColor;
            const gradientWidth = 0.4 + highlightIntensity * 0.6;

            return (
                <span
                  key={`${segment.text}-${index}`}
                  style={{
                    position: "relative",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 4px",
                    whiteSpace: "pre-wrap",
                    color: currentColor,
                  }}
                >
                <span
                  style={{
                    position: "absolute",
                    inset: "0",
                    borderRadius: 6,
                    background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)`,
                    opacity: highlightIntensity * 0.4,
                    transform: `scaleX(${gradientWidth})`,
                    transformOrigin: "left",
                    pointerEvents: "none",
                  }}
                />
                <span style={{position: "relative", zIndex: 1}}>{segment.text}</span>
              </span>
            );
          })}
        </h2>
      </div>
    </AbsoluteFill>
  );
};
