import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";

import { TIMING, SCREENSHOT_SCENES, COLORS } from "./constants";
import { LandingScene } from "./LandingScene";
import { ScreenshotScene } from "./ScreenshotScene";
import { OutroScene } from "./OutroScene";

export const ScreenshotDemoVideo: React.FC = () => {
  const transitionDuration = TIMING.transitionDuration;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      <TransitionSeries>
        {/* Scene 1: Landing Page - special animation */}
        <TransitionSeries.Sequence durationInFrames={TIMING.sceneDefault}>
          <LandingScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        {/* Screenshot Scenes - payment, campaign, review, verification */}
        {SCREENSHOT_SCENES.map((scene) => (
          <React.Fragment key={scene.id}>
            <TransitionSeries.Sequence durationInFrames={TIMING.sceneDefault}>
              <ScreenshotScene
                image={scene.image}
                title={scene.title}
                subtitle={scene.subtitle}
              />
            </TransitionSeries.Sequence>

            <TransitionSeries.Transition
              presentation={fade()}
              timing={linearTiming({ durationInFrames: transitionDuration })}
            />
          </React.Fragment>
        ))}

        {/* Outro Scene */}
        <TransitionSeries.Sequence durationInFrames={TIMING.outroScene}>
          <OutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};

// Calculate total duration for the composition
export const calculateScreenshotDemoDuration = () => {
  const landingFrames = TIMING.sceneDefault; // Landing scene
  const screenshotFrames = SCREENSHOT_SCENES.length * TIMING.sceneDefault;
  const outroFrames = TIMING.outroScene;
  
  // Total scenes = landing + screenshots + outro
  const totalScenes = 1 + SCREENSHOT_SCENES.length + 1;
  
  // Transitions happen between each scene (totalScenes - 1 transitions)
  const totalTransitions = (totalScenes - 1) * TIMING.transitionDuration;
  
  return landingFrames + screenshotFrames + outroFrames - totalTransitions;
};
