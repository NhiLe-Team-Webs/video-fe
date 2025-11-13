import {EffectComponentMap} from "../../../types/EffectTypes";
import {GradientPulse} from "./GradientPulse";
import {ParticleField} from "./ParticleField";
import {NoiseBackdrop} from "./NoiseBackdrop";

export {GradientPulse, ParticleField, NoiseBackdrop};

export const backgroundEffectComponents: EffectComponentMap = {
  "background.gradientPulse": GradientPulse,
  "background.particleField": ParticleField,
  "background.noiseBackdrop": NoiseBackdrop,
};

