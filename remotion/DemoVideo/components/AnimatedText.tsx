import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { COLORS, TIMING } from "../constants";

type AnimatedTextProps = {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
  springConfig?: {
    damping?: number;
    stiffness?: number;
    mass?: number;
  };
};

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  delay = 0,
  style = {},
  className = "",
  direction = "up",
  springConfig = TIMING.spring.smooth,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    delay,
    config: springConfig,
  });

  // Calculate transform based on direction
  const getTransform = () => {
    const distance = 40;
    switch (direction) {
      case "up":
        return `translateY(${interpolate(progress, [0, 1], [distance, 0])}px)`;
      case "down":
        return `translateY(${interpolate(progress, [0, 1], [-distance, 0])}px)`;
      case "left":
        return `translateX(${interpolate(progress, [0, 1], [distance, 0])}px)`;
      case "right":
        return `translateX(${interpolate(progress, [0, 1], [-distance, 0])}px)`;
      case "none":
        return "none";
      default:
        return "none";
    }
  };

  return (
    <div
      className={className}
      style={{
        opacity: progress,
        transform: getTransform(),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Fade-in component (simpler version)
type FadeInProps = {
  children: React.ReactNode;
  delay?: number;
  durationInFrames?: number;
  style?: React.CSSProperties;
};

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  durationInFrames = 20,
  style = {},
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [delay, delay + durationInFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return <div style={{ opacity, ...style }}>{children}</div>;
};

// Scale-in component
type ScaleInProps = {
  children: React.ReactNode;
  delay?: number;
  springConfig?: {
    damping?: number;
    stiffness?: number;
    mass?: number;
  };
  style?: React.CSSProperties;
};

export const ScaleIn: React.FC<ScaleInProps> = ({
  children,
  delay = 0,
  springConfig = TIMING.spring.snappy,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    delay,
    config: springConfig,
  });

  return (
    <div
      style={{
        opacity: scale,
        transform: `scale(${interpolate(scale, [0, 1], [0.8, 1])})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
