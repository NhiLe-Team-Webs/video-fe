import React from "react";
import {Audio, staticFile} from "remotion";

type AudioLayerProps = {
  src: string;
  loop?: boolean;
  startFrom?: number;
  endAt?: number;
  volume?: number;
};

export const AudioLayer: React.FC<AudioLayerProps> = ({
  src,
  loop = false,
  startFrom = 0,
  endAt,
  volume = 1,
}) => {
  if (!src) {
    return null;
  }

  const normalized = src.startsWith("http") ? src : staticFile(src.replace(/^\//, ""));

  return <Audio src={normalized} startFrom={startFrom} endAt={endAt} loop={loop} volume={volume} />;
};
