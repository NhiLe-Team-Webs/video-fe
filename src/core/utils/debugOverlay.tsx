import React from "react";
import {AbsoluteFill} from "remotion";
import {isDebug, isDevelopment} from "./env";

type DebugOverlayProps = {
  data: Record<string, unknown>;
};

export const DebugOverlay: React.FC<DebugOverlayProps> = ({data}) => {
  if (!isDevelopment() && !isDebug()) {
    return null;
  }

  return (
    <AbsoluteFill
      style={{
        color: "#0ff",
        fontSize: 16,
        padding: 20,
        fontFamily: "monospace",
        background: "rgba(0,0,0,0.35)",
        pointerEvents: "none",
        textShadow: "0 2px 4px rgba(0,0,0,0.6)",
      }}
    >
      <div style={{marginBottom: 8}}>🎬 DEBUG MODE</div>
      <pre style={{margin: 0}}>{JSON.stringify(data, null, 2)}</pre>
    </AbsoluteFill>
  );
};
