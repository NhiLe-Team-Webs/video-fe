import React, {useMemo, useState} from "react";
import {AbsoluteFill, Series, useVideoConfig} from "remotion";
import {listAllAnimations, useAnimationById} from "./useAnimationById";

const animations = listAllAnimations();

const clampNumber = (value: number, fallback: number, min = 0) => {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(min, value);
};

export const AnimationPreview: React.FC = () => {
  const {fps} = useVideoConfig();
  const [animationId, setAnimationId] = useState(animations[0]?.id ?? "");
  const [durationSeconds, setDurationSeconds] = useState(3);
  const [delaySeconds, setDelaySeconds] = useState(0);
  const [repeatCount, setRepeatCount] = useState(1);

  const animation = useAnimationById(animationId);
  const durationInFrames = Math.max(1, Math.round(clampNumber(durationSeconds, 3, 0.2) * fps));
  const delayInFrames = Math.max(0, Math.round(clampNumber(delaySeconds, 0, 0) * fps));
  const repeats = Math.max(1, Math.round(clampNumber(repeatCount, 1, 1)));

  const renderAnimatedContent = useMemo(() => {
    if (!animation) {
      return null;
    }

    if (animation.type === "gsap") {
      const Animated = animation.Component;
      return (
        <Animated durationInFrames={durationInFrames}>
          <div
            style={{
              padding: "24px 32px",
              borderRadius: 24,
              backgroundColor: "#f8fafc",
              color: "#0f172a",
              fontSize: 48,
              fontWeight: 700,
              boxShadow: "0 30px 60px rgba(15, 23, 42, 0.35)",
            }}
          >
            {animationId}
          </div>
        </Animated>
      );
    }

    const LottieComponent = animation.Component;
    const loop = repeatCount !== 1;

    return (
      <div
        style={{
          padding: 32,
          borderRadius: 24,
          backgroundColor: "rgba(15,23,42,0.3)",
          boxShadow: "0 25px 50px rgba(15,23,42,0.45)",
        }}
      >
        <LottieComponent
          {...animation.props}
          loop={loop}
          style={{width: 240, height: 240}}
        />
      </div>
    );
  }, [animation, animationId, durationInFrames, repeatCount]);

  const infoPanel = useMemo(() => {
    if (!animation) {
      return null;
    }

    return (
      <div style={{fontSize: 14, opacity: 0.8}}>
        <div>Type: {animation.animationType ?? animation.type}</div>
        {animation.tags ? <div>Tags: {animation.tags.join(", ")}</div> : null}
        {animation.emotions ? <div>Emotions: {animation.emotions.join(", ")}</div> : null}
      </div>
    );
  }, [animation]);

  return (
    <AbsoluteFill
      style={{
        fontFamily: "Inter, sans-serif",
        background: "radial-gradient(circle at top, rgba(56,189,248,0.35), rgba(15,23,42,1))",
        color: "#f8fafc",
        padding: 32,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: 360,
          background: "rgba(15, 23, 42, 0.55)",
          padding: 20,
          borderRadius: 20,
          backdropFilter: "blur(8px)",
        }}
      >
        <label style={{display: "flex", flexDirection: "column", gap: 6}}>
          Animation
          <select value={animationId} onChange={(e) => setAnimationId(e.target.value)}>
            {animations.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.id}
              </option>
            ))}
          </select>
        </label>
        <label style={{display: "flex", flexDirection: "column", gap: 6}}>
          Duration (seconds)
          <input
            type="number"
            min={0.2}
            step={0.1}
            value={durationSeconds}
            onChange={(e) => setDurationSeconds(parseFloat(e.target.value))}
          />
        </label>
        <label style={{display: "flex", flexDirection: "column", gap: 6}}>
          Delay (seconds)
          <input
            type="number"
            min={0}
            step={0.1}
            value={delaySeconds}
            onChange={(e) => setDelaySeconds(parseFloat(e.target.value))}
          />
        </label>
        <label style={{display: "flex", flexDirection: "column", gap: 6}}>
          Repeat count
          <input
            type="number"
            min={1}
            step={1}
            value={repeatCount}
            onChange={(e) => setRepeatCount(parseInt(e.target.value, 10))}
          />
        </label>
        {infoPanel}
      </div>

      <AbsoluteFill style={{alignItems: "center", justifyContent: "center"}}>
        {animation ? (
          <Series>
            {delayInFrames > 0 ? (
              <Series.Sequence durationInFrames={delayInFrames}>
                <AbsoluteFill style={{alignItems: "center", justifyContent: "center"}}>
                  <div style={{opacity: 0.5}}>Delay...</div>
                </AbsoluteFill>
              </Series.Sequence>
            ) : null}
            {Array.from({length: repeats}).map((_, index) => (
              <Series.Sequence key={`${animationId}-${index}`} durationInFrames={durationInFrames}>
                <AbsoluteFill style={{alignItems: "center", justifyContent: "center"}}>
                  {renderAnimatedContent}
                </AbsoluteFill>
              </Series.Sequence>
            ))}
          </Series>
        ) : (
          <div>No animation selected</div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
