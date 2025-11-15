import React from "react";
import {AbsoluteFill, Img, Video, staticFile} from "remotion";

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".mkv", ".avi", ".webm"];
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif"];

const isType = (clip: string, extensions: string[]) => {
  const lower = clip.toLowerCase();
  return extensions.some((ext) => lower.endsWith(ext));
};

const resolveSource = (clip: string) => {
  if (/^https?:\/\//.test(clip)) {
    return clip;
  }

  return staticFile(clip);
};

type VideoLayerProps = {
  clip: string;
  startFrom?: number; // seconds within source
  durationSeconds?: number;
  muted?: boolean;
};

export const VideoLayer: React.FC<VideoLayerProps> = ({clip, startFrom = 0, durationSeconds, muted = true}) => {
  const src = resolveSource(clip);
  const isVideo = isType(clip, VIDEO_EXTENSIONS);
  const isImage = isType(clip, IMAGE_EXTENSIONS);
  const endAt = typeof durationSeconds === "number" ? startFrom + durationSeconds : undefined;

  return (
    <AbsoluteFill style={{backgroundColor: "#000", overflow: "hidden"}}>
      {isVideo ? (
        <Video
          src={src}
          muted={muted}
          startFrom={Math.max(0, Math.floor(startFrom))}
          endAt={typeof endAt === "number" ? Math.max(startFrom, Math.floor(endAt)) : undefined}
          playbackRate={1}
          style={{width: "100%", height: "100%", objectFit: "cover"}}
        />
      ) : isImage ? (
        <Img src={src} style={{width: "100%", height: "100%", objectFit: "cover"}} alt="segment asset" />
      ) : (
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
            fontSize: 32,
            fontWeight: 600,
            background:
              "linear-gradient(120deg, rgba(17,24,39,1) 0%, rgba(30,58,138,1) 50%, rgba(15,118,110,1) 100%)",
          }}
        >
          Missing asset
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
