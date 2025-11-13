import {EffectComponentMap} from "../../../types/EffectTypes";
import {GradientPulse} from "./GradientPulse";
import {ParticleField} from "./ParticleField";

export {GradientPulse, ParticleField};

export const backgroundEffectComponents: EffectComponentMap = {
  "background.gradientPulse": GradientPulse,
  "background.particleField": ParticleField,
};

