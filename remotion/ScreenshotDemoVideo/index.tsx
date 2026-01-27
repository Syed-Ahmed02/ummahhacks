import React from "react";
import { AbsoluteFill, Series } from "remotion";

import { TIMING, SCREENSHOT_SCENES, COLORS } from "./constants";
import { LandingScene } from "./LandingScene";
import { ScreenshotScene } from "./ScreenshotScene";
import { OutroScene } from "./OutroScene";

export const ScreenshotDemoVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      <Series>
        {/* Scene 1: Landing Page - special animation */}
        <Series.Sequence durationInFrames={TIMING.sceneDefault}>
          <LandingScene />
        </Series.Sequence>

        {/* Screenshot Scenes - payment, campaign, review, verification */}
        {SCREENSHOT_SCENES.map((scene) => (
          <Series.Sequence key={scene.id} durationInFrames={TIMING.sceneDefault}>
            <ScreenshotScene
              image={scene.image}
              title={scene.title}
              subtitle={scene.subtitle}
              zoomOrigin={scene.zoomOrigin}
            />
          </Series.Sequence>
        ))}

        {/* Outro Scene */}
        <Series.Sequence durationInFrames={TIMING.outroScene}>
          <OutroScene />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};

// Calculate total duration for the composition
export const calculateScreenshotDemoDuration = () => {
  const landingFrames = TIMING.sceneDefault; // Landing scene
  const screenshotFrames = SCREENSHOT_SCENES.length * TIMING.sceneDefault;
  const outroFrames = TIMING.outroScene;
  
  // No transitions, so total is just sum of all scenes
  return landingFrames + screenshotFrames + outroFrames;
};
