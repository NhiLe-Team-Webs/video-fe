import React from "react";
import {useCurrentFrame} from "remotion";
import {isDebug} from "../utils/env";

export const FrameIndicator: React.FC = () => {
  const frame = useCurrentFrame();

  if (!isDebug()) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        right: 32,
        color: "#0ff",
        fontFamily: "monospace",
        fontSize: 20,
        background: "rgba(0,0,0,0.45)",
        padding: "6px 12px",
        borderRadius: 8,
      }}
    >
      Frame: {frame}
    </div>
  );
};
