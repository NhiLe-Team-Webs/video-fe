import React from "react";
import {AbsoluteFill, Sequence} from "remotion";
import {VideoLayer} from "./components/VideoLayer";
import {TextLayer} from "./components/TextLayer";
import {TransitionLayer} from "./components/TransitionLayer";
import type {LoadedPlan} from "./types";

type CompositionBuilderProps = {
  plan: LoadedPlan;
};

export const CompositionBuilder: React.FC<CompositionBuilderProps> = ({plan}) => {
  if (!plan.segments.length) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: "#020617",
          color: "#e2e8f0",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 48,
          fontWeight: 600,
        }}
      >
        No segments available
      </AbsoluteFill>
    );
  }

  let cursor = 0;

  return (
    <AbsoluteFill style={{backgroundColor: "#000"}}>
      {plan.segments.map((segment, index) => {
        const from = cursor;
        cursor += segment.durationInFrames;

        return (
          <Sequence
            key={`${segment.clip}-${index}-${from}`}
            from={from}
            durationInFrames={segment.durationInFrames}
          >
            <AbsoluteFill>
              <TransitionLayer effect={segment.effect} durationInFrames={segment.durationInFrames}>
                <VideoLayer clip={segment.clip} />
              </TransitionLayer>

              {segment.text ? (
                <TextLayer
                  text={segment.text}
                  durationInFrames={segment.durationInFrames}
                  segmentIndex={index}
                />
              ) : null}
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
