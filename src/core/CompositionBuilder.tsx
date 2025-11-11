import React, {Fragment} from "react";
import {AbsoluteFill, Series} from "remotion";
import {VideoLayer} from "./components/VideoLayer";
import {TextLayer} from "./components/TextLayer";
import type {LoadedPlan} from "./types";
import type {Theme} from "./hooks/useTheme";
import {AudioLayer} from "../library/components/AudioLayer";
import {Overlay} from "../library/components/Overlay";

type TemplateRules = Record<string, string>;

type TemplateConfig = {
  rules?: TemplateRules;
  audio?: {
    bgm?: string;
    sfxFallback?: string;
  };
  bgm?: string;
  sfxFallback?: string;
};

type EffectComponent = React.FC<React.PropsWithChildren<{durationInFrames: number}>>;

type CompositionBuilderProps = {
  plan: LoadedPlan;
  theme?: Theme;
  templateConfig?: TemplateConfig;
  effects?: Record<string, EffectComponent>;
};

const DEFAULT_EFFECT = "none";
const DEFAULT_BGM = "library/audio/bgm_soft.mp3";

const normalizeEffectKey = (value?: string) => {
  if (!value) {
    return DEFAULT_EFFECT;
  }

  return value
    .replace(/[_-](\w)/g, (_, letter: string) => letter.toUpperCase())
    .replace(/^\w/, (char) => char.toLowerCase());
};

const resolveEffect = (segmentEffect: string | undefined, emotion: string | undefined, rules?: TemplateRules) => {
  const emotionKey = emotion ? `emotion:${emotion}` : undefined;
  if (emotionKey && rules && rules[emotionKey]) {
    return normalizeEffectKey(rules[emotionKey]);
  }

  return normalizeEffectKey(segmentEffect);
};

export const CompositionBuilder: React.FC<CompositionBuilderProps> = ({
  plan,
  theme,
  templateConfig,
  effects = {},
}) => {
  if (!plan.segments.length) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: theme?.backgroundColor ?? "#020617",
          color: theme?.primaryColor ?? "#e2e8f0",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 48,
          fontWeight: 600,
        }}
      >
        No segments available
      </AbsoluteFill>
    );
  }

  const bgmSrc = plan.music ?? templateConfig?.audio?.bgm ?? templateConfig?.bgm ?? DEFAULT_BGM;
  const sfxFallback = templateConfig?.audio?.sfxFallback ?? templateConfig?.sfxFallback;

  return (
    <AbsoluteFill style={{backgroundColor: theme?.backgroundColor ?? "#000"}}>
      <AudioLayer src={bgmSrc} loop volume={0.45} endAt={plan.durationInFrames} />
      <Series>
        {plan.segments.map((segment, index) => {
          const effectKey = resolveEffect(segment.effect, segment.emotion, templateConfig?.rules);
          const EffectWrapper = effects[effectKey] ?? effects[DEFAULT_EFFECT] ?? Fragment;

          return (
            <Series.Sequence key={`${segment.clip}-${index}`} durationInFrames={segment.durationInFrames}>
              <AbsoluteFill>
                <EffectWrapper durationInFrames={segment.durationInFrames}>
                  <VideoLayer clip={segment.clip} />
                  <Overlay accentColor={theme?.accentColor} style={theme?.overlayStyle} />
                </EffectWrapper>

                {segment.text ? (
                  <TextLayer
                    text={segment.text}
                    durationInFrames={segment.durationInFrames}
                    segmentIndex={index}
                    style={theme?.textStyle}
                    accentColor={theme?.accentColor}
                  />
                ) : null}

                {segment.sfx || sfxFallback ? (
                  <AudioLayer
                    src={segment.sfx ?? sfxFallback ?? ""}
                    startFrom={0}
                    endAt={segment.durationInFrames}
                    volume={0.65}
                  />
                ) : null}
              </AbsoluteFill>
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};
