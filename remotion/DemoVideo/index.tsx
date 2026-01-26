import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";

import { TIMING, COLORS } from "./constants";
import { HookScene } from "./scenes/HookScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { SolutionScene } from "./scenes/SolutionScene";
import { HowItWorksScene } from "./scenes/HowItWorksScene";
import { AppDemoScene } from "./scenes/AppDemoScene";
import { TrustScene } from "./scenes/TrustScene";
import { CtaScene } from "./scenes/CtaScene";

export const DemoVideo: React.FC = () => {
  const transitionDuration = TIMING.transitionDuration;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      <TransitionSeries>
        {/* Scene 1: Hook */}
        <TransitionSeries.Sequence durationInFrames={TIMING.hookScene}>
          <HookScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        {/* Scene 2: Problem */}
        <TransitionSeries.Sequence durationInFrames={TIMING.problemScene}>
          <ProblemScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        {/* Scene 3: Solution */}
        <TransitionSeries.Sequence durationInFrames={TIMING.solutionScene}>
          <SolutionScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        {/* Scene 4: How It Works */}
        <TransitionSeries.Sequence durationInFrames={TIMING.howItWorksScene}>
          <HowItWorksScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        {/* Scene 5: App Demo */}
        <TransitionSeries.Sequence durationInFrames={TIMING.appDemoScene}>
          <AppDemoScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        {/* Scene 6: Trust */}
        <TransitionSeries.Sequence durationInFrames={TIMING.trustScene}>
          <TrustScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        {/* Scene 7: CTA / Closing */}
        <TransitionSeries.Sequence durationInFrames={TIMING.ctaScene}>
          <CtaScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
