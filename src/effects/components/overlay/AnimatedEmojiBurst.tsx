import React, {useMemo} from "react";
import {AbsoluteFill, interpolate, staticFile, useCurrentFrame} from "remotion";
import {AnimatedEmoji} from "@remotion/animated-emoji";
import {palette} from "../../../styles/designTokens";

type AnimatedEmojiBurstProps = {
  emoji?: string;
  scale?: "0.5" | "1" | "2";
  durationInFrames: number;
};

const DEFAULT_EMOJI = "sparkles";
const ACCENT_EMOJIS = ["heart-eyes", "hug-face", "raised-hands", "clap", "check-mark", "100"];

const accentPlacements = [
  {left: "18%", top: "68%", size: 150, delay: 6},
  {left: "82%", top: "58%", size: 140, delay: 12},
] as const;

const assetPath = ({
  emoji,
  scale,
  format,
}: {
  emoji: string;
  scale: string;
  format: "webm" | "hevc";
}) => {
  const extension = format === "hevc" ? "mp4" : "webm";
  return staticFile(`animated-emoji/${emoji}-${scale}x.${extension}`);
};

const toNumber = (value: string) => Number.isFinite(Number(value)) ? Number(value) : 1;

export const AnimatedEmojiBurst: React.FC<AnimatedEmojiBurstProps> = ({
  emoji = DEFAULT_EMOJI,
  scale = "1",
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const normalizedScale = ["0.5", "1", "2"].includes(scale) ? scale : "1";
  const parsedScale = toNumber(normalizedScale) || 1;

  const resolvedAccents = useMemo(() => {
    const filtered = ACCENT_EMOJIS.filter((candidate) => candidate !== emoji);
    const selections = filtered.slice(0, accentPlacements.length);
    if (selections.length === accentPlacements.length) {
      return selections;
    }
    return Array.from(
      new Set([
        ...selections,
        ...ACCENT_EMOJIS.filter((entry) => entry !== emoji),
      ])
    ).slice(0, accentPlacements.length);
  }, [emoji]);

  const fadeIn = Math.min(14, Math.max(6, Math.round(durationInFrames * 0.18)));
  const fadeOut = Math.min(16, Math.max(8, Math.round(durationInFrames * 0.2)));
  const fadeOutStart = Math.max(fadeIn, durationInFrames - fadeOut);

  const centerSlot = {
    emojiName: emoji,
    left: "48%",
    top: "45%",
    size: 220 * parsedScale,
    delay: 0,
    assetScale: normalizedScale,
  };

  const accentSlots = accentPlacements.map((placement, index) => ({
    emojiName: resolvedAccents[index] ?? ACCENT_EMOJIS[index],
    assetScale: "0.5",
    ...placement,
  }));

  const slots = [centerSlot, ...accentSlots];

  const glowOpacity = interpolate(
    frame,
    [0, fadeIn, fadeOutStart, durationInFrames],
    [0, 0.4, 0.35, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        mixBlendMode: "screen",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 50% 45%, rgba(248, 113, 113, 0.45), transparent 55%)",
          opacity: glowOpacity,
          filter: "blur(60px)",
        }}
      />
      {slots.map((slot, index) => {
        const localFrame = Math.max(0, Math.min(durationInFrames, frame - slot.delay));
        const opacity =
          localFrame <= 0
            ? 0
            : localFrame < fadeIn
            ? localFrame / fadeIn
            : localFrame >= fadeOutStart
            ? Math.max(0, (durationInFrames - localFrame) / fadeOut)
            : 1;
        const horizontalFloat = Math.sin((frame + slot.delay * 4) / (12 + index)) * 10;
        const verticalFloat = Math.cos((frame + slot.delay * 3) / (14 + index)) * 12;
        const scaleValue = interpolate(
          localFrame,
          [0, fadeIn, durationInFrames],
          [0.65, 1, 0.95],
          {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
        );

        return (
          <div
            key={`${slot.emojiName}-${index}`}
            style={{
              position: "absolute",
              left: slot.left,
              top: slot.top,
              width: slot.size,
              height: slot.size,
              transform: `translate(-50%, -50%) translate(${horizontalFloat}px, ${verticalFloat}px) scale(${scaleValue})`,
              opacity,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "-20%",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${palette.primaryRed} 0%, transparent 65%)`,
                filter: "blur(25px)",
                opacity: 0.35 * opacity,
              }}
            />
            <AnimatedEmoji
              emoji={slot.emojiName}
              scale={slot.assetScale}
              playbackRate={index === 0 ? 1 : 1.1 + index * 0.05}
              calculateSrc={assetPath}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
              }}
            />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
