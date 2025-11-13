import React from "react";
import type {NormalizedSegment} from "../core/types";
import {fadeIn} from "./animations/fadeIn";
import {zoomIn} from "./animations/zoomIn";

type ClipLayerProps = {
  segment: NormalizedSegment;
  index: number;
};

const animationMap: Record<string, React.FC<React.PropsWithChildren>> = {
  fade_in: fadeIn,
  zoom_in: zoomIn,
};

const DefaultAnimation: React.FC<React.PropsWithChildren> = ({children}) => <>{children}</>;

export const ClipLayer: React.FC<ClipLayerProps> = ({segment, index}) => {
  const Animation = animationMap[segment.effect] ?? DefaultAnimation;

  return (
    <Animation>
      <div className="clip-layer">
        <strong>{`Segment ${index + 1}`}</strong>
        <p>{segment.text}</p>
        <small>{segment.clip}</small>
      </div>
    </Animation>
  );
};
