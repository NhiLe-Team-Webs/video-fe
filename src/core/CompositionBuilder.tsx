import React from "react";
import {Sequence, AbsoluteFill} from "remotion";
import {VideoLayer} from "./layers/VideoLayer";
import {AudioLayer} from "./AudioLayer";
import {PlanEffectsLayer} from "./layers/PlanEffectsLayer";
import type {LoadedPlan} from "./types";

type CompositionBuilderProps = {
  plan: LoadedPlan;
};

const BrollCard: React.FC<{scale: number; file: string}> = ({scale, file}) => (
  <div
    style={{
      position: "absolute",
      inset: "15%",
      borderRadius: 32,
      overflow: "hidden",
      transform: `scale(${scale})`,
      transformOrigin: "center",
      border: "1px solid rgba(255,255,255,0.25)",
    }}
  >
    <VideoLayer clip={file} muted durationSeconds={1} startFrom={0} />
  </div>
);

export const CompositionBuilder: React.FC<CompositionBuilderProps> = ({plan}) => {
  if (!plan.segments.length) {
    return null;
  }

  return (
    <AbsoluteFill style={{backgroundColor: "#000"}}>
      {plan.segments.map((segment, index) => (
        <Sequence key={`segment-${index}`} name={`segment-${index}`} durationInFrames={segment.durationInFrames}>
          <AbsoluteFill>
            {!segment.broll?.mode || segment.broll.mode !== "card" ? (
              <VideoLayer
                clip={segment.clip}
                startFrom={segment.sourceStart ?? 0}
                durationSeconds={segment.duration}
                muted={segment.mute}
              />
            ) : (
              <AbsoluteFill
                style={{
                  background: "radial-gradient(circle at center, rgba(10,10,10,0.9), rgba(0,0,0,1))",
                }}
              />
            )}
            {segment.broll?.mode === "card" && segment.broll.file ? (
              <BrollCard scale={segment.broll.cardScale ?? 0.88} file={segment.broll.file} />
            ) : null}
            {segment.sfx && (
              <AudioLayer
                src={segment.sfx}
                startFrom={0}
                endAt={segment.durationInFrames}
                volume={0.5}
              />
            )}
          </AbsoluteFill>
        </Sequence>
      ))}
      <PlanEffectsLayer entries={plan.effects} fps={plan.fps} showSampleContent={false} layerZIndex={5} />
    </AbsoluteFill>
  );
};
