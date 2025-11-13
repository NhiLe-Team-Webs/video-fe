import React, {useMemo} from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type KeywordSubtitleHighlightProps = {
  text: string;
  keywords?: string | string[];
  accentColor?: string;
  align?: "center" | "bottom";
  durationInFrames: number;
};

type HighlightSegment = {
  text: string;
  isKeyword: boolean;
  highlightIndex?: number;
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

const blendWithWhite = (hex: string, amount: number) => {
  const [r, g, b] = normalizeHex(hex);
  const channel = (value: number) =>
    Math.round(value + (255 - value) * Math.min(1, Math.max(0, amount)));
  const toHex = (value: number) => value.toString(16).padStart(2, "0");
  return `#${[channel(r), channel(g), channel(b)].map(toHex).join("")}`;
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
      // Fall back to delimiters
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
  const normalizedText = text.toLowerCase();
  const matches: Array<{start: number; length: number}> = [];

  const normalizedKeywords = keywords
    .map((keyword) => (keyword || "").trim())
    .filter((keyword) => keyword.length > 0);

  if (normalizedKeywords.length === 0) {
    return [{text, isKeyword: true, highlightIndex: 0}];
  }

  normalizedKeywords.forEach((keyword) => {
    const normalizedKeyword = keyword.toLowerCase();
    let searchIndex = 0;
    while (searchIndex < normalizedText.length) {
      const found = normalizedText.indexOf(normalizedKeyword, searchIndex);
      if (found === -1) {
        break;
      }
      matches.push({start: found, length: keyword.length});
      searchIndex = found + normalizedKeyword.length;
    }
  });

  if (!matches.length) {
    return [{text, isKeyword: true, highlightIndex: 0}];
  }

  matches.sort((a, b) =>
    a.start !== b.start ? a.start - b.start : b.length - a.length
  );

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

export const KeywordSubtitleHighlight: React.FC<
  KeywordSubtitleHighlightProps
> = ({
  text,
  keywords,
  accentColor = "#38bdf8",
  align = "bottom",
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fallbackText = "I've tried more than 500 AI tools";
  const textContent = text && text.trim() ? text.trim() : fallbackText;
  const parsedKeywords = useMemo(() => parseKeywords(keywords), [keywords]);
  const keywordList = parsedKeywords.length ? parsedKeywords : ["500 AI tools"];
  const segments = useMemo(
    () => buildSegments(textContent, keywordList),
    [textContent, keywordList]
  );

  const keywordCount = segments.filter((segment) => segment.isKeyword).length;
  const fadeInFrames = Math.min(12, Math.max(8, Math.round(fps * 0.18)));
  const fadeOutFrames = Math.min(16, Math.max(10, Math.round(fps * 0.18)));
  const fadeOutStart = Math.min(
    Math.max(durationInFrames - 1, 0),
    Math.max(fadeInFrames + 6, durationInFrames - fadeOutFrames)
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
    [18, 0, 0, 26],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  const highlightDelayStep = Math.max(6, Math.round(fps * 0.08));
  const highlightDuration = Math.max(18, Math.round(fps * 0.36));
  const highlightBarColor = blendWithWhite(accentColor, 0.4);
  const glowColor = blendWithWhite(accentColor, 0.7);

  return (
    <AbsoluteFill
      style={{
        justifyContent: align === "center" ? "center" : "flex-end",
        alignItems: "center",
        pointerEvents: "none",
        padding: align === "bottom" ? "0 32px 70px" : "0 32px",
      }}
    >
      <div
        style={{
          opacity: containerOpacity,
          transform: `translateY(${containerTranslate}px)`,
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
          <div
            style={{
              color: "#f8fafc",
              fontSize: 144,
              fontWeight: 600,
            letterSpacing: 0.6,
            lineHeight: 1.3,
            textAlign: "center",
            textTransform: "none",
            padding: "4px 8px",
            position: "relative",
            maxWidth: "90%",
            backdropFilter: "blur(8px)",
            textShadow: `0 8px 18px rgba(15,23,42,0.4), 0 0 22px ${blendWithWhite(
              accentColor,
              0.4
            )}`,
          }}
        >
          {segments.map((segment, index) => {
            const highlightIndex = segment.highlightIndex ?? 0;
            const highlightStart =
              fadeInFrames +
              highlightIndex * highlightDelayStep +
              6 * Math.min(highlightIndex, keywordCount);
            const highlightProgress = segment.isKeyword
              ? interpolate(
                  frame,
                  [highlightStart, highlightStart + highlightDuration],
                  [0, 1],
                  {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
                )
              : 0;
            const highlightOpacity = Math.min(1, highlightProgress * 1.2);
            const highlightScale = 0.3 + 0.7 * highlightProgress;

            return (
              <span
                key={`${segment.text}-${index}`}
                style={{
                  position: "relative",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  whiteSpace: "pre-wrap",
                  padding: "0 2px",
                }}
              >
                {segment.isKeyword && (
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 999,
                      background: `linear-gradient(90deg, ${blendWithWhite(
                        accentColor,
                        0.1
                      )}, ${highlightBarColor})`,
                      transform: `scaleX(${highlightScale})`,
                      transformOrigin: "left",
                      opacity: highlightOpacity,
                      filter: `blur(${highlightProgress * 1.2}px)`,
                      boxShadow: `0 0 ${10 + highlightProgress * 20}px ${glowColor}`,
                      zIndex: 0,
                    }}
                  />
                )}
                <span
                  style={{
                    position: "relative",
                    zIndex: 1,
                    display: "inline-block",
                  }}
                >
                  {segment.text}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
