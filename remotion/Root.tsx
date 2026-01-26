import React from "react";
import {
  Composition,
  Folder,
  AbsoluteFill,
  useCurrentFrame,
  spring,
  useVideoConfig,
  interpolate,
} from "remotion";
import { VIDEO_CONFIG, TIMING } from "./DemoVideo/constants";
import { DemoVideo } from "./DemoVideo";

// Very simple test component to verify Remotion works
const SimpleTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          color: "#3b82f6",
          fontSize: 72,
          fontFamily: "system-ui, sans-serif",
          fontWeight: 700,
          opacity,
          transform: `translateY(${interpolate(opacity, [0, 1], [50, 0])}px)`,
        }}
      >
        Community Invest
      </div>
      <div
        style={{
          color: "#a1a1aa",
          fontSize: 28,
          fontFamily: "system-ui, sans-serif",
          marginTop: 20,
          opacity,
        }}
      >
        Keep Your Neighbors' Lights On
      </div>
      <div
        style={{
          color: "#71717a",
          fontSize: 18,
          fontFamily: "system-ui, sans-serif",
          marginTop: 40,
          opacity,
        }}
      >
        Frame: {frame}
      </div>
    </AbsoluteFill>
  );
};

// Calculate total duration
const calculateTotalDuration = () => {
  const scenes = [
    TIMING.hookScene,
    TIMING.problemScene,
    TIMING.solutionScene,
    TIMING.howItWorksScene,
    TIMING.appDemoScene,
    TIMING.trustScene,
    TIMING.ctaScene,
  ];
  const totalScenes = scenes.reduce((sum, duration) => sum + duration, 0);
  const totalTransitions = (scenes.length - 1) * TIMING.transitionDuration;
  return totalScenes - totalTransitions;
};

export const RemotionRoot: React.FC = () => {
  const totalDuration = calculateTotalDuration();

  return (
    <>
      <Composition
        id="SimpleTest"
        component={SimpleTest}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1350}
      />

      <Folder name="Community-Invest">
        <Composition
          id="DemoVideo"
          component={DemoVideo}
          durationInFrames={totalDuration}
          fps={VIDEO_CONFIG.fps}
          width={VIDEO_CONFIG.width}
          height={VIDEO_CONFIG.height}
        />
      </Folder>
    </>
  );
};
