import { EffectCategory } from "./effectCategories";
import { EffectKey, EffectTaxonomyEntry } from "../../types/EffectTypes";

export const effectTaxonomy: Record<
  EffectCategory,
  readonly EffectTaxonomyEntry[]
> = {
  [EffectCategory.Text]: [
    {
      key: "text.popUp",
      label: "Pop Up Title",
      description: "3D-styled pop up for hooks or emphasis titles.",
      category: EffectCategory.Text,
      intents: ["hook", "title", "feature-callout"],
      defaultDuration: 1.2,
    },
    {
      key: "text.typeOn",
      label: "Type-On Caption",
      description: "Typewriter reveal for subtitles or punch lines.",
      category: EffectCategory.Text,
      intents: ["subtitle", "quote", "narration"],
      defaultDuration: 2,
    },
    {
      key: "text.swipeHighlight",
      label: "Swipe Highlight",
      description: "Highlight bar slides under the selected words.",
      category: EffectCategory.Text,
      intents: ["emphasis", "data-point"],
      defaultDuration: 1,
    },
    {
      key: "text.popUp3D",
      label: "3D Pop-Up Text",
      description: "Sit-up / lay-down 3D text animation for bold hooks.",
      category: EffectCategory.Text,
      intents: ["hook", "cta", "hero"],
      defaultDuration: 1.5,
    },
    {
      key: "text.sideFloat",
      label: "Side Float Text",
      description: "Soft drift labels that float in from screen edges.",
      category: EffectCategory.Text,
      intents: ["supporting-text", "callout"],
      defaultDuration: 1.8,
    },
    {
      key: "text.sideFloatLeft",
      label: "Side Float Left",
      description: "Preset for left-side supporting text.",
      category: EffectCategory.Text,
      intents: ["supporting-text"],
      defaultDuration: 1.8,
    },
    {
      key: "text.sideFloatRight",
      label: "Side Float Right",
      description: "Preset for right-side supporting text.",
      category: EffectCategory.Text,
      intents: ["supporting-text"],
      defaultDuration: 1.8,
    },
    {
      key: "text.sequentialList",
      label: "Sequential List Reveal",
      description: "Stacked list appearing sequentially with zoom + fade.",
      category: EffectCategory.Text,
      intents: ["list", "callout"],
      defaultDuration: 2.5,
    },
    {
      key: "text.stepBreakdown",
      label: "Step Breakdown Transition",
      description: "Highlight topic list entries, then spotlight each step with its own card.",
      category: EffectCategory.Text,
      intents: ["curriculum", "process", "chapter-break"],
      defaultDuration: 3,
    },
    {
      key: "text.centralConcept",
      label: "Central Concept Map",
      description: "Circular concept map with a bold core idea and orbiting sub-topics.",
      category: EffectCategory.Text,
      intents: ["concept-map", "structure"],
      defaultDuration: 2.8,
    },
  ],
  [EffectCategory.Motion]: [
    {
      key: "motion.zoomFocus",
      label: "Zoom Focus",
      description: "Quick zoom into focal element with easing.",
      category: EffectCategory.Motion,
      intents: ["beat-emphasis", "before-after", "hook"],
      defaultDuration: 0.8,
    },
    {
      key: "motion.slidePan",
      label: "Slide Pan",
      description: "Horizontal camera pan for transitions.",
      category: EffectCategory.Motion,
      intents: ["transition", "b-roll"],
      defaultDuration: 1.5,
    },
    {
      key: "motion.fadeIn",
      label: "Hero Fade-In",
      description: "Opacity fade for smooth intros.",
      category: EffectCategory.Motion,
      intents: ["intro", "transition"],
      defaultDuration: 1,
    },
    {
      key: "motion.slideUp",
      label: "Slide Up Reveal",
      description: "Vertical slide + fade reveal.",
      category: EffectCategory.Motion,
      intents: ["reveal", "text-entry"],
      defaultDuration: 1,
    },
    {
      key: "motion.zoomIn",
      label: "Zoom In Pulse",
      description: "Subtle zoom punch for emphasis.",
      category: EffectCategory.Motion,
      intents: ["emphasis", "hero"],
      defaultDuration: 1,
    },
    {
      key: "motion.cameraZoomFocus",
      label: "Camera Zoom Focus",
      description: "Punch-in / punch-out camera style move to highlight speaker.",
      category: EffectCategory.Motion,
      intents: ["emphasis", "hero"],
      defaultDuration: 2,
    },
  ],
  [EffectCategory.Chart]: [
    {
      key: "chart.statCard",
      label: "Stat Card Flip",
      description: "Card flips in with metric counter.",
      category: EffectCategory.Chart,
      intents: ["metric", "kpi-highlight"],
      defaultDuration: 1.2,
    },
    {
      key: "chart.timelineReveal",
      label: "Timeline Reveal",
      description: "Roadmap timeline draws from left to right.",
      category: EffectCategory.Chart,
      intents: ["roadmap", "process"],
      defaultDuration: 2.4,
    },
  ],
  [EffectCategory.Background]: [
    {
      key: "background.gradientPulse",
      label: "Gradient Pulse",
      description: "Animated gradient breathing effect.",
      category: EffectCategory.Background,
      intents: ["ambient", "loop"],
      defaultDuration: 3,
    },
    {
      key: "background.particleField",
      label: "Particle Field",
      description: "Soft particle drift for depth.",
      category: EffectCategory.Background,
      intents: ["ambient", "tech"],
      defaultDuration: 4,
    },
  ],
  [EffectCategory.Overlay]: [
    {
      key: "overlay.lowerThird",
      label: "Lower Third",
      description: "Presenter lower-third with badge + subtitle.",
      category: EffectCategory.Overlay,
      intents: ["speaker-id", "cta"],
      defaultDuration: 1.5,
    },
    {
      key: "overlay.badgePulse",
      label: "Badge Pulse",
      description: "Circular badge pulses for emphasis.",
      category: EffectCategory.Overlay,
      intents: ["cta", "stat"],
      defaultDuration: 0.9,
    },
    {
      key: "overlay.sectionTitle",
      label: "Section Title Overlay",
      description: "Dimmed background + center card for section transitions.",
      category: EffectCategory.Overlay,
      intents: ["divider", "section-break"],
      defaultDuration: 2,
    },
    {
      key: "overlay.iconHighlight",
      label: "Icon Highlight",
      description: "Animated icon cue that fades in, floats, then fades out to reinforce concepts.",
      category: EffectCategory.Overlay,
      intents: ["callout", "concept-highlight"],
      defaultDuration: 1.8,
    },
  ],
};

export const allEffectKeys: EffectKey[] = Object.values(effectTaxonomy).flatMap(
  (entries) => entries.map((entry) => entry.key as EffectKey)
);

export const isEffectKey = (value: string): value is EffectKey =>
  allEffectKeys.includes(value as EffectKey);
