import React from "react";
import {AbsoluteFill} from "remotion";
import {useDebugContext} from "../context/DebugContext";

export const DebugPanel: React.FC = () => {
  const {info, overlayVisible} = useDebugContext();

  if (!overlayVisible || !info) {
    return null;
  }

  return (
    <AbsoluteFill style={{pointerEvents: "none"}}>
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          background: "rgba(15, 23, 42, 0.85)",
          borderRadius: 16,
          padding: "16px 20px",
          color: "#e2e8f0",
          fontFamily: "monospace",
          fontSize: 14,
          boxShadow: "0 30px 70px rgba(2,6,23,0.6)",
        }}
      >
        <div style={{fontWeight: 600, marginBottom: 8}}>Debug Panel</div>
        <div>Frame: {info.frame}</div>
        <div>FPS: {info.fps}</div>
        <div>Segment: {Number.isFinite(info.segmentIndex ?? NaN) ? info.segmentIndex : "-"}</div>
        {info.segment ? (
          <>
            <div>Text: {info.segment.text}</div>
            <div>Animation: {info.segment.animationId ?? "inherit"}</div>
            <div>SFX: {info.segment.sfx ?? "n/a"}</div>
            <div>Emotion: {info.segment.emotion ?? "n/a"}</div>
          </>
        ) : (
          <div>No segment active</div>
        )}
      </div>
    </AbsoluteFill>
  );
};
