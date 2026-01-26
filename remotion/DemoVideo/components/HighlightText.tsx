import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { TIMING } from "../constants";

type HighlightTextProps = {
  text: string;
  highlightWord: string;
  highlightColor?: string;
  delay?: number;
  durationInFrames?: number;
  style?: React.CSSProperties;
};

export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  highlightWord,
  highlightColor = "#3b82f6",
  delay = 0,
  durationInFrames = 18,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const highlightIndex = text.indexOf(highlightWord);
  const hasHighlight = highlightIndex >= 0;
  const preText = hasHighlight ? text.slice(0, highlightIndex) : text;
  const postText = hasHighlight
    ? text.slice(highlightIndex + highlightWord.length)
    : "";

  const highlightProgress = spring({
    fps,
    frame,
    config: { damping: 200 },
    delay,
    durationInFrames,
  });

  const scaleX = Math.max(0, Math.min(1, highlightProgress));

  return (
    <span style={style}>
      {hasHighlight ? (
        <>
          <span>{preText}</span>
          <span style={{ position: "relative", display: "inline-block" }}>
            <span
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "50%",
                height: "1.05em",
                transform: `translateY(-50%) scaleX(${scaleX})`,
                transformOrigin: "left center",
                backgroundColor: highlightColor,
                borderRadius: "0.18em",
                zIndex: 0,
              }}
            />
            <span style={{ position: "relative", zIndex: 1 }}>
              {highlightWord}
            </span>
          </span>
          <span>{postText}</span>
        </>
      ) : (
        <span>{text}</span>
      )}
    </span>
  );
};

// Underline animation variant
type UnderlineTextProps = {
  children: React.ReactNode;
  color?: string;
  delay?: number;
  thickness?: number;
  style?: React.CSSProperties;
};

export const UnderlineText: React.FC<UnderlineTextProps> = ({
  children,
  color = "#3b82f6",
  delay = 0,
  thickness = 4,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    fps,
    frame,
    config: { damping: 200 },
    delay,
  });

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        ...style,
      }}
    >
      {children}
      <span
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          height: thickness,
          width: `${progress * 100}%`,
          backgroundColor: color,
          borderRadius: thickness / 2,
        }}
      />
    </span>
  );
};

// Gradient text animation
type GradientTextProps = {
  children: React.ReactNode;
  colors?: string[];
  delay?: number;
  style?: React.CSSProperties;
};

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  colors = ["#3b82f6", "#8b5cf6", "#ec4899"],
  delay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = spring({
    fps,
    frame,
    config: { damping: 200 },
    delay,
  });

  const gradientPosition = interpolate(frame, [0, 60], [0, 100], {
    extrapolateRight: "extend",
  });

  return (
    <span
      style={{
        opacity,
        background: `linear-gradient(90deg, ${colors.join(", ")})`,
        backgroundSize: "200% 100%",
        backgroundPosition: `${gradientPosition}% 0`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        ...style,
      }}
    >
      {children}
    </span>
  );
};
