import {createTimeline, type GsapTimeline} from "./gsapConfig";

export type GsapSetup = (params: {
  timeline: GsapTimeline;
  element: HTMLElement;
  fps: number;
  durationInFrames: number;
}) => void;

export class GsapAdapter {
  private timeline: GsapTimeline = createTimeline();

  mount(options: {element: HTMLElement; fps: number; durationInFrames: number; setup: GsapSetup}) {
    const {element, fps, durationInFrames, setup} = options;
    this.timeline.clear();
    this.timeline.pause(0);
    setup({timeline: this.timeline, element, fps, durationInFrames});
  }

  render(progress: number) {
    this.timeline.progress(progress, false);
  }

  reset() {
    this.timeline.kill();
    this.timeline = createTimeline();
  }

  dispose() {
    this.reset();
  }
}
