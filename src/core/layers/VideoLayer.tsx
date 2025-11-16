import React from "react";
import {AbsoluteFill, Img, Video, staticFile, useVideoConfig, useCurrentFrame} from "remotion";
import {noise3D} from "@remotion/noise";

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
  shake?: boolean; // apply subtle shake to still images
};

export const VideoLayer: React.FC<VideoLayerProps> = ({
  clip,
  startFrom = 0,
  durationSeconds,
  muted = true,
  shake = false,
}) => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const src = resolveSource(clip);
  const isVideo = isType(clip, VIDEO_EXTENSIONS);
  const isImage = isType(clip, IMAGE_EXTENSIONS);
  const startFrame = Math.max(0, Math.floor(startFrom * fps));
  const endAt = typeof durationSeconds === "number" ? startFrame + Math.max(1, Math.floor(durationSeconds * fps)) : undefined;

  return (
    <AbsoluteFill style={{backgroundColor: "#000", overflow: "hidden"}}>
      {isVideo ? (
        <Video
          src={src}
          muted={muted}
          startFrom={startFrame}
          endAt={endAt}
          playbackRate={1}
          style={{width: "100%", height: "100%", objectFit: "cover"}}
        />
      ) : isImage ? (
        (() => {
          if (!shake) {
            return <Img src={src} style={{width: "100%", height: "100%", objectFit: "cover"}} alt="segment asset" />;
          }
          // subtle smooth shake for still images using noise3D
          const speed = 0.02;
          const maxOffset = 6; // pixels
          const maxRotate = 0.6; // degrees
          const seed = clip || "img";
          const dx = noise3D(seed + "x", frame * speed, 0, 0) * maxOffset;
          const dy = noise3D(seed + "y", frame * speed, 0, 0) * maxOffset;
          const rot = noise3D(seed + "r", frame * speed, 0, 0) * maxRotate;
          const style: React.CSSProperties = {
            width: "110%",
            height: "110%",
            objectFit: "cover",
            transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`,
            willChange: "transform",
          };
          return <Img src={src} style={style} alt="segment asset" />;
        })()
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
