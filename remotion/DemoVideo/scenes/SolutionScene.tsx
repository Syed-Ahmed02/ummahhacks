import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { COLORS, CONTENT, TIMING } from "../constants";

export const SolutionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Intro text fade
  const introFade = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  // Logo reveal animation
  const logoReveal = spring({
    frame,
    fps,
    delay: 30,
    config: { damping: 20, stiffness: 200 },
  });

  const logoRotation = interpolate(logoReveal, [0, 1], [-180, 0]);

  // Name reveal
  const nameReveal = spring({
    frame,
    fps,
    delay: 40,
    config: { damping: 200 },
  });

  // Tagline reveal
  const taglineReveal = spring({
    frame,
    fps,
    delay: 60,
    config: { damping: 200 },
  });

  // Subtitle reveal
  const subtitleReveal = spring({
    frame,
    fps,
    delay: 80,
    config: { damping: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 40%, ${COLORS.primary}20 0%, transparent 50%)`,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          textAlign: "center",
        }}
      >
        {/* "Introducing" text */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: COLORS.mutedForeground,
            marginBottom: 24,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            opacity: introFade,
            transform: `translateY(${interpolate(introFade, [0, 1], [20, 0])}px)`,
          }}
        >
          {CONTENT.solution.introducing}
        </div>

        {/* Logo / Brand icon */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 30,
            backgroundColor: COLORS.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 32px",
            opacity: logoReveal,
            transform: `scale(${logoReveal}) rotate(${logoRotation}deg)`,
            boxShadow: `0 20px 60px ${COLORS.primary}40`,
          }}
        >
          {/* Simple community icon */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke={COLORS.foreground}
            strokeWidth="1.5"
            style={{ width: 60, height: 60 }}
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <circle cx="9" cy="9" r="1" fill={COLORS.foreground} />
            <circle cx="15" cy="9" r="1" fill={COLORS.foreground} />
          </svg>
        </div>

        {/* Product name with gradient */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            marginBottom: 16,
            letterSpacing: "-0.03em",
            opacity: nameReveal,
            transform: `scale(${interpolate(nameReveal, [0, 1], [0.9, 1])})`,
            background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary}, ${COLORS.primaryLight})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {CONTENT.solution.name}
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 500,
            color: COLORS.mutedForeground,
            marginBottom: 32,
            opacity: taglineReveal,
            transform: `translateY(${interpolate(taglineReveal, [0, 1], [20, 0])}px)`,
          }}
        >
          {CONTENT.solution.tagline}
        </div>

        {/* Subtitle with underline */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: COLORS.foreground,
            opacity: subtitleReveal,
            position: "relative",
            display: "inline-block",
          }}
        >
          {CONTENT.solution.subtitle}
          {/* Animated underline */}
          <div
            style={{
              position: "absolute",
              bottom: -4,
              left: 0,
              height: 4,
              width: `${subtitleReveal * 100}%`,
              backgroundColor: COLORS.primary,
              borderRadius: 2,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
