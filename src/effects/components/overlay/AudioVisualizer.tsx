import React, {useMemo} from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {useAudioData, visualizeAudio} from "@remotion/media-utils";
import {noise3D} from "@remotion/noise";

export type AudioVisualizerProps = {
  caption?: string;
  voiceLabel?: string;
  colorTheme?: string;
  accentColor?: string;
  align?: "bottom" | "center";
  durationInFrames: number;
  audioId?: string;
  sampleCount?: number;
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

const toRGBA = (hex: string, alpha: number) => {
  const [r, g, b] = normalizeHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const fallbackWave = (frame: number, samples: number) => {
  const values: number[] = [];
  for (let i = 0; i < samples; i += 1) {
    const base = 0.5 + Math.sin(frame * 0.04 + i * 0.2) * 0.25;
    values.push(Math.max(0, Math.min(1, base)));
  }
  return values;
};

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  caption = "Voice interaction",
  voiceLabel = "Live transcript",
  colorTheme = "#7c3aed",
  accentColor = "#22d3ee",
  align = "bottom",
  durationInFrames,
  audioId,
  sampleCount = 64,
}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const audioData = audioId ? useAudioData(audioId) : null;
  const waveform = useMemo(() => {
    if (audioData) {
      return visualizeAudio({
        audioData,
        frame,
        samples: sampleCount,
        smoothing: 0.5,
      });
    }
    return fallbackWave(frame, sampleCount);
  }, [audioData, frame, sampleCount]);

  const fadeInFrames = Math.min(12, Math.max(8, Math.round(fps * 0.2)));
  const fadeOutFrames = Math.min(18, Math.max(10, Math.round(fps * 0.22)));
  const fadeOutStart = Math.max(
    fadeInFrames + 12,
    durationInFrames - fadeOutFrames
  );
  const opacity = interpolate(
    frame,
    [0, fadeInFrames, fadeOutStart, durationInFrames],
    [0, 1, 1, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );
  const translateY = interpolate(
    frame,
    [0, fadeInFrames, fadeOutStart, durationInFrames],
    [32, 0, 0, 28],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  const waveformHeight = Math.min(140, height * 0.18);
  const panelWidth = Math.min(820, width * 0.92);
  const barWidth = Math.max(4, panelWidth / sampleCount - 2);

  return (
    <AbsoluteFill
      style={{
        justifyContent: align === "center" ? "center" : "flex-end",
        alignItems: "center",
        pointerEvents: "none",
        padding: align === "bottom" ? "0 32px 40px" : "24px",
      }}
    >
      <div
        style={{
          width: panelWidth,
          transform: `translateY(${translateY}px)`,
          opacity,
          display: "flex",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 40% 40%, rgba(255,255,255,0.12), transparent 65%)`,
            mixBlendMode: "screen",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `rgba(0,0,0,0)`,
          }}
        >
          {Array.from({length: 16}).map((_, idx) => {
            const noiseValue = noise3D(frame / 40, idx / 6, 0);
            const opacity = 0.02 + Math.abs(noiseValue) * 0.08;
            const blur = 18 + Math.abs(noiseValue) * 12;
            return (
              <div
                key={`noise-${idx}`}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(circle at ${Math.sin(
                    frame / 40 + idx
                  ) * 50 + 50}% ${Math.cos(frame / 40 + idx) * 40 + 50}%, rgba(255,255,255,${opacity}), transparent 60%)`,
                  filter: `blur(${blur}px)`,
                  opacity,
                  mixBlendMode: "screen",
                }}
              />
            );
          })}
        </div>
        <svg
          width="100%"
          height={waveformHeight}
          viewBox={`0 0 ${panelWidth} ${waveformHeight}`}
          style={{display: "block"}}
        >
          <defs>
            <linearGradient id="audioGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colorTheme} stopOpacity={0.8} />
              <stop offset="50%" stopColor={accentColor} stopOpacity={0.85} />
              <stop offset="100%" stopColor={colorTheme} stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colorTheme} stopOpacity={0.35} />
              <stop offset="50%" stopColor={accentColor} stopOpacity={0.55} />
              <stop offset="100%" stopColor={colorTheme} stopOpacity={0.35} />
            </linearGradient>
          </defs>
          <g>
            {waveform.map((value, index) => {
              const normalized = Math.max(0, Math.min(1, value));
              const barHeight = normalized * waveformHeight * 0.92;
              const x = index * (barWidth + 2);
              return (
                <rect
                  key={`wave-${index}`}
                  x={x}
                  y={(waveformHeight - barHeight) / 2}
                  width={barWidth}
                  height={barHeight}
                  rx={barWidth / 2}
                  fill="url(#audioGradient)"
                  opacity={0.4 + normalized * 0.6}
                />
              );
            })}
          </g>
          <rect
            x={0}
            y={(waveformHeight - 2) / 2}
            width={panelWidth}
            height={2}
            fill="url(#glowGradient)"
          />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
