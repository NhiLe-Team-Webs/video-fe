import React from "react";
import {AbsoluteFill} from "remotion";
import lottieRegistry from "../../registry/lottieRegistry.json";
import {LottieEffect} from "./LottieEffect";

export const LottieShowcase: React.FC = () => {
  const entries = Object.values(lottieRegistry);
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at top, rgba(255,255,255,0.2), rgba(15,23,42,1))",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        fontFamily: "Inter, sans-serif",
        color: "#e2e8f0",
        flexDirection: "column",
      }}
    >
      <div>Lottie Showcase</div>
      <div style={{display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center"}}>
        {entries.length === 0 ? (
          <div style={{opacity: 0.6}}>No Lottie assets ingested yet.</div>
        ) : (
          entries.map((entry) => (
            <div key={entry.key} style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 8}}>
              <LottieEffect
                style={{width: Math.min(180, entry.width || 180), height: Math.min(180, entry.height || 180)}}
                src={entry.publicPath}
              />
              <span style={{fontSize: 12, textTransform: "uppercase", letterSpacing: 1}}>{entry.id}</span>
            </div>
          ))
        )}
      </div>
    </AbsoluteFill>
  );
};
