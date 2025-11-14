import React from "react";
import {AbsoluteFill} from "remotion";
import {TransitionSeries} from "@remotion/transitions";
import {VideoLayer} from "./layers/VideoLayer";
import {TextLayer} from "./layers/TextLayer";
import type {LoadedPlan, NormalizedSegment} from "./types";
import type {Theme} from "./hooks/useTheme";
import {AudioLayer} from "./AudioLayer";
import {Overlay} from "./Overlay";
import {FrameIndicator} from "./layers/FrameIndicator";
import {DebugPanel} from "./layers/DebugPanel";
import {DebugProvider} from "./context/DebugContext";
import type {AnimationResolver} from "../effects/engines/gsap/useAnimationById";
import type {TransitionPresentation, TransitionTiming} from "@remotion/transitions";

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

type TransitionConfig = {
  id: string;
  timing: TransitionTiming;
  presentation?: TransitionPresentation<any>;
};

type TransitionContext = {
  segment: NormalizedSegment;
  nextSegment?: NormalizedSegment;
  index: number;
};

type CompositionBuilderProps = {
  plan: LoadedPlan;
  theme?: Theme;
  templateConfig?: TemplateConfig;
  effects?: Record<string, EffectComponent>;
  resolveAnimation?: (segment: NormalizedSegment) => AnimationResolver | null;
  resolveTransition?: (context: TransitionContext) => TransitionConfig | null;
};

const DEFAULT_EFFECT = "none";
const DEFAULT_BGM = "assets/sfx/emotion/applause.mp3";

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

const renderAnimatedContent = (
  animation: AnimationResolver | null | undefined,
  content: React.ReactNode,
  durationInFrames: number
) => {
  if (!animation || !content) {
    return content;
  }

  if (animation.type === "gsap") {
    const Animated = animation.Component;
    return <Animated durationInFrames={durationInFrames}>{content}</Animated>;
  }

  const Animated = animation.Component;
  return (
    <div style={{position: "relative", display: "inline-flex", width: "100%"}}>
      {content}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <Animated {...animation.props} style={{width: 180, height: 180, opacity: 0.85}} />
      </div>
    </div>
  );
};

const BuilderContent: React.FC<CompositionBuilderProps> = ({
  plan,
  theme,
  templateConfig,
  effects = {},
  resolveAnimation,
  resolveTransition,
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
      <TransitionSeries>
        {plan.segments.flatMap<React.ReactNode>((segment, index) => {
          const effectKey = resolveEffect(segment.effect, segment.emotion, templateConfig?.rules);
          const EffectWrapper = effects[effectKey] ?? effects[DEFAULT_EFFECT] ?? React.Fragment;
          const animation = resolveAnimation?.(segment);

          const sequence = (
            <TransitionSeries.Sequence key={`sequence-${segment.clip}-${index}`} durationInFrames={segment.durationInFrames}>
              <AbsoluteFill>
                <EffectWrapper durationInFrames={segment.durationInFrames}>
                  <VideoLayer clip={segment.clip} />
                  <Overlay accentColor={theme?.accentColor} style={theme?.overlayStyle} />
                </EffectWrapper>
                {segment.text
                  ? renderAnimatedContent(
                      animation,
                      <TextLayer
                        text={segment.text}
                        durationInFrames={segment.durationInFrames}
                        segmentIndex={index}
                        style={theme?.textStyle}
                        accentColor={theme?.accentColor}
                      />,
                      segment.durationInFrames
                    )
                  : null}

                {segment.sfx || sfxFallback ? (
                  <AudioLayer
                    src={segment.sfx ?? sfxFallback ?? ""}
                    startFrom={0}
                    endAt={segment.durationInFrames}
                    volume={0.65}
                  />
                ) : null}
              </AbsoluteFill>
            </TransitionSeries.Sequence>
          );

          const nodes: React.ReactNode[] = [sequence];

          if (index < plan.segments.length - 1) {
            const transition = resolveTransition?.({
              segment,
              nextSegment: plan.segments[index + 1],
              index,
            });

            if (transition) {
              nodes.push(
                <TransitionSeries.Transition
                  key={`transition-${segment.clip}-${index}`}
                  timing={transition.timing}
                  presentation={transition.presentation}
                />
              );
            }
          }

          return nodes;
        })}
      </TransitionSeries>
      <FrameIndicator />
      <DebugPanel />
    </AbsoluteFill>
  );
};

export const CompositionBuilder: React.FC<CompositionBuilderProps> = (props) => {
  const debugEnabled = true;

  if (!debugEnabled) {
    return <BuilderContent {...props} />;
  }

  return (
    <DebugProvider plan={props.plan}>
      <BuilderContent {...props} />
    </DebugProvider>
  );
};
