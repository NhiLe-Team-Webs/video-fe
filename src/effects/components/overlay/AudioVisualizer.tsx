import React, {useMemo} from "react";
import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {visualizeAudio, useAudioData} from "@remotion/media-utils";
import {palette, motif} from "../../../styles/designTokens";

export type AudioVisualizerProps = {
  caption?: string;
  voiceLabel?: string;
  colorTheme?: string;
  accentColor?: string;
  align?: "bottom" | "center";
  durationInFrames: number;
  sampleCount?: number;
  audioSrc?: string;
};

const fallbackWave = (frame: number, samples: number) => {
  const values: number[] = [];
  for (let i = 0; i < samples; i += 1) {
    const base = 0.45 + Math.sin(frame * 0.04 + i * 0.2) * 0.35;
    values.push(Math.max(0, Math.min(1, base)));
  }
  return values;
};

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  colorTheme = "#C8102E",
  accentColor = "#F2F2F2",
  align = "center",
  durationInFrames,
  sampleCount = 48,
  audioSrc,
}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const audioData = useAudioData(audioSrc || "");
  const fadeInFrames = Math.min(10, Math.max(6, Math.round(fps * 0.18)));
  const fadeOutFrames = Math.min(16, Math.max(10, Math.round(fps * 0.22)));
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
    [24, 0, 0, 28],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  const waveformHeight = Math.min(120, height * 0.15);
  const panelWidth = Math.min(840, width * 0.9);
  const barWidth = Math.max(5, panelWidth / sampleCount - 4);
  const waveform = useMemo(() => {
    if (audioData) {
      return visualizeAudio({
        audioData,
        frame,
        fps,
        numberOfSamples: sampleCount,
        smoothing: true,
      });
    }
    return fallbackWave(frame, sampleCount);
  }, [audioData, frame, fps, sampleCount]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: align === "center" ? "center" : "flex-end",
        alignItems: "center",
        pointerEvents: "none",
        padding: align === "bottom" ? "0 32px 40px" : "24px",
      }}
    >
      <>
        {audioSrc && <Html5Audio src={audioSrc} />}
        <div
          style={{
            width: panelWidth,
            transform: `translateY(${translateY}px)`,
            opacity,
            display: "flex",
            justifyContent: "center",
            position: "relative",
            background: palette.deepBlack,
            borderRadius: 26,
            border: `1px solid rgba(255,255,255,0.1)`,
            boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: motif.triangleGlow,
              opacity: 0.35, 
              mixBlendMode: motif.overlayBlend as React.CSSProperties['mixBlendMode'],
              filter: "blur(18px)",
              pointerEvents: "none",
            }}
          />
          <svg
            width="100%"
            height={waveformHeight}
            viewBox={`0 0 ${panelWidth} ${waveformHeight}`}
            style={{display: "block", position: "relative", zIndex: 1}}
          >
            <defs>
              <linearGradient id="audioGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={colorTheme} stopOpacity={0.8} />
                <stop offset="70%" stopColor={accentColor} stopOpacity={0.9} />
                <stop offset="100%" stopColor={colorTheme} stopOpacity={0.6} />
              </linearGradient>
            </defs>
            {waveform.map((value, index) => {
              const normalized = Math.max(0, Math.min(1, value));
              const barHeight = normalized * waveformHeight * 0.9;
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
                  opacity={0.5 + normalized * 0.5}
                />
              );
            })}
            <line
              x1={0}
              y1={waveformHeight / 2}
              x2={panelWidth}
              y2={waveformHeight / 2}
              stroke={colorTheme}
              strokeWidth={2}
              strokeDasharray="12 8"
              opacity={0.3}
            />
          </svg>
        </div>
      </>
    </AbsoluteFill>
  );
};
