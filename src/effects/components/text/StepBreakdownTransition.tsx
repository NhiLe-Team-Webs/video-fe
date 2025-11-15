import React, {useMemo} from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {palette, typography} from "../../../styles/designTokens";

type StepItem = {
  title: string;
  description?: string;
};

const fallbackSteps: StepItem[] = [
  {title: "Email Marketing", description: "Automations & nurture journeys"},
  {title: "SEO Foundations", description: "Content pillars + on-page"},
  {title: "Paid Social", description: "Story ads + retargeting"},
  {title: "Analytics", description: "Dashboards & KPI reviews"},
];

const parseSteps = (input?: StepItem[] | string): StepItem[] => {
  if (!input) {
    return fallbackSteps;
  }

  const normalize = (items: StepItem[]) =>
    items
      .filter((item) => item && typeof item.title === "string")
      .map((item) => ({
        title: item.title,
        description: item.description,
      }));

  if (Array.isArray(input)) {
    const normalized = normalize(input);
    return normalized.length > 0 ? normalized : fallbackSteps;
  }

  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) {
        const normalized = normalize(parsed as StepItem[]);
        return normalized.length > 0 ? normalized : fallbackSteps;
      }
    } catch {
      return fallbackSteps;
    }
  }

  return fallbackSteps;
};

export type StepBreakdownTransitionProps = {
  topic?: string;
  steps?: StepItem[] | string;
  durationInFrames?: number;
  accentColor?: string;
  backgroundColor?: string;
};

const formatIndex = (value: number) => value.toString().padStart(2, "0");

export const StepBreakdownTransition: React.FC<StepBreakdownTransitionProps> = ({
  topic = "Digital Marketing",
  steps,
  durationInFrames = 120,
  accentColor = palette.primaryRed,
  backgroundColor = palette.deepBlack,
}) => {
  const frame = useCurrentFrame();
  const resolvedSteps = useMemo(() => parseSteps(steps), [steps]);
  const stepCount = resolvedSteps.length;
  const stageDuration = durationInFrames / Math.max(stepCount, 1);
  const activeIndex = Math.min(stepCount - 1, Math.max(0, Math.floor(frame / Math.max(stageDuration, 1))));
  const stageFrame = frame - activeIndex * stageDuration;
  const currentStep = resolvedSteps[activeIndex] ?? resolvedSteps[0];

  const listDim = interpolate(stageFrame, [0, stageDuration * 0.2, stageDuration * 0.8, stageDuration], [0, 0.3, 0.3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const detailOpacity = interpolate(
    stageFrame,
    [0, stageDuration * 0.2, stageDuration * 0.75, stageDuration],
    [0, 1, 1, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  const detailOffset = interpolate(
    stageFrame,
    [0, stageDuration * 0.2, stageDuration],
    [60, 0, -20],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  return (
    <AbsoluteFill
      style={{
        fontFamily: typography.body,
        color: palette.brightestWhite,
        background: backgroundColor,
        display: "flex",
        flexDirection: "row",
        padding: "90px 120px",
        gap: 80,
        pointerEvents: "none",
      }}
    >
      <div style={{flex: 1.2, display: "flex", flexDirection: "column", gap: 32}}>
        <div
          style={{
            fontSize: 58,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: 2,
            color: accentColor,
            fontFamily: typography.headline,
          }}
        >
          {topic}
        </div>

        <div style={{display: "flex", flexDirection: "column", gap: 18}}>
          {resolvedSteps.map((step, index) => {
            const appearStart = index * 6;
            const appearEnd = appearStart + 18;
            const baseOpacity = interpolate(frame, [appearStart, appearEnd], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const isActive = index === activeIndex;
            const highlightScale = interpolate(
              stageFrame,
              [0, Math.min(stageDuration * 0.3, 20)],
              [1, 1.05],
              {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
            );

            return (
            <div
              key={`${step.title}-${index}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                opacity: baseOpacity * (isActive ? 1 : 1 - listDim),
                transform: `translateX(${isActive ? 0 : -6}px) scale(${isActive ? highlightScale : 1})`,
                transition: "transform 200ms ease",
              }}
            >
                <div style={{color: accentColor, fontWeight: 700}}>{`/${step.title}`}</div>
                <div
                style={{
                  height: 1,
                  flex: 1,
                  background: `rgba(248,250,252,${isActive ? 0.45 : 0.1})`,
                }}
              />
            </div>
            );
          })}
        </div>
      </div>
      <div style={{flex: 1}}>
        <div
            style={{
              borderRadius: 32,
              background: "rgba(15,23,42,0.65)",
              backdropFilter: "blur(12px)",
              padding: "64px 52px",
              minHeight: 320,
              color: palette.brightestWhite,
              opacity: detailOpacity,
              transform: `translateX(${detailOffset}px)`,
              boxShadow: "0 35px 80px rgba(0,0,0,0.45)",
            }}
        >
          <div style={{display: "flex", alignItems: "baseline", gap: 16, color: accentColor}}>
            <div style={{fontSize: 64, fontWeight: 800}}>{formatIndex(activeIndex + 1)}</div>
            <div style={{textTransform: "uppercase", letterSpacing: 4, opacity: 0.8}}>Step</div>
          </div>
          <div style={{marginTop: 18, fontSize: 40, fontWeight: 700}}>{currentStep.title}</div>
          {currentStep.description && (
            <div style={{marginTop: 16, fontSize: 22, lineHeight: 1.5, opacity: 0.85}}>{currentStep.description}</div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
