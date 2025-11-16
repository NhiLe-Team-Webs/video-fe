import React from "react";
import {AbsoluteFill, Sequence} from "remotion";
import {TransitionSeries} from "@remotion/transitions";
import type {TransitionDefinition} from "../../transitions/transitionTypes";
import type {LoadedPlan, NormalizedSegment} from "../types";

type TransitionManagerProps = {
  plan: LoadedPlan;
  resolveTransition?: (params: {
    segment: NormalizedSegment;
    nextSegment?: NormalizedSegment;
    index?: number;
  }) => TransitionDefinition | null;
  children: (segment: NormalizedSegment, index: number) => React.ReactNode;
};


export const TransitionManager: React.FC<TransitionManagerProps> = ({
  plan,
  resolveTransition,
  children,
}) => {
  if (!plan.segments.length) {
    return null;
  }

  // If no transition resolver provided, render segments without transitions
  if (!resolveTransition) {
    return (
      <AbsoluteFill>
        {plan.segments.map((segment, index) => (
          <Sequence
            key={`segment-${index}`}
            name={`segment-${index}`}
            from={segment.startFrame}
            durationInFrames={segment.durationInFrames}
          >
            {children(segment, index)}
          </Sequence>
        ))}
      </AbsoluteFill>
    );
  }

  // Render segments with transitions between them
  return (
    <AbsoluteFill>
      <TransitionSeries>
        {plan.segments.map((segment, index) => {
          const nextSegment = plan.segments[index + 1];
          const transitionConfig = resolveTransition({
            segment,
            nextSegment,
            index,
          });

          // Calculate transition duration in frames
          const transitionDurationInFrames = transitionConfig
            ? Math.round((segment.transitionOut?.duration ?? 0.6) * plan.fps)
            : 0;

          // Adjust segment duration to account for transition overlap
          const segmentDuration = segment.durationInFrames - transitionDurationInFrames;

          return (
            <React.Fragment key={`segment-${index}`}>
              <TransitionSeries.Sequence
                durationInFrames={Math.max(0, segmentDuration)}
              >
                <Sequence
                  name={`segment-${index}`}
                  from={segment.startFrame}
                  durationInFrames={segment.durationInFrames}
                >
                  {children(segment, index)}
                </Sequence>
              </TransitionSeries.Sequence>

              {/* Add transition between current and next segment */}
              {nextSegment && transitionConfig && transitionDurationInFrames > 0 && (
                <TransitionSeries.Transition
                  timing={transitionConfig.timing}
                  presentation={transitionConfig.presentation}
                />
              )}
            </React.Fragment>
          );
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};