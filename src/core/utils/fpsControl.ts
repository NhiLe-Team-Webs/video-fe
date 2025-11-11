export type FpsConfig = {
  default: number;
  overrides?: Record<string, number>;
};

const fpsConfig: FpsConfig = {
  default: 30,
  overrides: {
    template0: 30,
    template1: 24,
    template2: 60,
  },
};

export const getFps = (templateId: string) => {
  return fpsConfig.overrides?.[templateId] ?? fpsConfig.default;
};

export const setFpsOverride = (templateId: string, fps: number) => {
  if (!fpsConfig.overrides) {
    fpsConfig.overrides = {};
  }
  fpsConfig.overrides[templateId] = fps;
};

export const getFpsConfig = () => fpsConfig;
