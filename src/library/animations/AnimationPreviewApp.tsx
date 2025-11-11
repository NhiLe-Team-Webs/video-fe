import React, {useMemo, useState} from "react";
import {AbsoluteFill, Sequence} from "remotion";
import {useAnimationById, listAllAnimations} from "./useAnimationById";

const animations = listAllAnimations();

export const AnimationPreviewApp: React.FC = () => {
  const [selectedId, setSelectedId] = useState(animations[0]?.id ?? "");
  const animation = useAnimationById(selectedId);

  const content = useMemo(() => {
    if (!animation) {
      return null;
    }

    if (animation.type === "gsap") {
      const Component = animation.Component;
      return (
        <Component durationInFrames={90}>
          <div
            style={{
              padding: 24,
              borderRadius: 16,
              color: "#0f172a",
              fontSize: 48,
              fontWeight: 700,
              backgroundColor: "#fef3c7",
            }}
          >
            {selectedId}
          </div>
        </Component>
      );
    }

    const Component = animation.Component;
    return (
      <Component {...animation.props} style={{width: 220, height: 220}} />
    );
  }, [animation, selectedId]);

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at top, rgba(56,189,248,0.3), rgba(15,23,42,1))",
        color: "#e2e8f0",
        fontFamily: "monospace",
        padding: 32,
      }}
    >
      <div style={{marginBottom: 16}}>
        <label htmlFor="animation-selector">Animation:</label>
        <select
          id="animation-selector"
          style={{marginLeft: 12}}
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
        >
          {animations.map((animation) => (
            <option key={animation.id} value={animation.id}>
              {animation.id}
            </option>
          ))}
        </select>
      </div>

      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill style={{alignItems: "center", justifyContent: "center"}}>{content}</AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
