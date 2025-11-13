import React from "react";
import {AbsoluteFill} from "remotion";
import {LottieEffect} from "./LottieEffect";

export const LottieShowcase: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at top, rgba(255,255,255,0.2), rgba(15,23,42,1))",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        fontFamily: "monospace",
        color: "#e2e8f0",
        flexDirection: "column",
      }}
    >
      <div>Lottie Showcase</div>
      <div style={{display: "flex", gap: 24}}>
        <LottieEffect style={{width: 120, height: 120}} src="library/animations/lottie/sparkle.json" />
        <LottieEffect style={{width: 120, height: 120}} src="library/animations/lottie/confetti.json" />
        <LottieEffect
          style={{width: 120, height: 120}}
          src="https://assets9.lottiefiles.com/packages/lf20_touohxv0.json"
        />
      </div>
    </AbsoluteFill>
  );
};
