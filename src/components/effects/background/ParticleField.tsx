import React, {useMemo} from "react";
import {AbsoluteFill, random, useCurrentFrame} from "remotion";

type Particle = {
  x: number;
  y: number;
  scale: number;
  delay: number;
};

const generateParticles = (count: number): Particle[] =>
  new Array(count).fill(null).map((_, index) => ({
    x: random(`x-${index}`),
    y: random(`y-${index}`),
    scale: random(`scale-${index}`) * 0.8 + 0.2,
    delay: random(`delay-${index}`) * 120,
  }));

export type ParticleFieldProps = {
  count?: number;
  color?: string;
};

export const ParticleField: React.FC<ParticleFieldProps> = ({count = 16, color = "rgba(255,255,255,0.4)"}) => {
  const frame = useCurrentFrame();
  const particles = useMemo(() => generateParticles(count), [count]);

  return (
    <AbsoluteFill style={{backgroundColor: "#050607", filter: "blur(0.1px)"}}>
      {particles.map((particle, index) => {
        const yOffset = Math.sin((frame + particle.delay) / 30) * 0.05;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${particle.x * 100}%`,
              top: `${(particle.y + yOffset) * 100}%`,
              width: `${particle.scale * 40}px`,
              height: `${particle.scale * 40}px`,
              borderRadius: "50%",
              background: color,
              filter: "blur(4px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
