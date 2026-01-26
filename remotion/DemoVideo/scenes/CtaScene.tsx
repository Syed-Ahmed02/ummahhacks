import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { COLORS, CONTENT, TIMING } from "../constants";

export const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Headline fade
  const headlineFade = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  // Subheadline with gradient
  const subFade = spring({
    frame,
    fps,
    delay: 15,
    config: { damping: 200 },
  });

  // Buttons
  const buttonsFade = spring({
    frame,
    fps,
    delay: 30,
    config: { damping: 20, stiffness: 200 },
  });

  // Closing tagline
  const closingFade = spring({
    frame,
    fps,
    delay: 60,
    config: { damping: 200 },
  });

  // Logo
  const logoFade = spring({
    frame,
    fps,
    delay: 80,
    config: { damping: 200 },
  });

  // Pulse animation for primary button
  const pulse = interpolate(frame % 60, [0, 30, 60], [1, 1.02, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Vibrant gradient overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 30% 30%, ${COLORS.primary}20 0%, transparent 40%),
            radial-gradient(circle at 70% 70%, ${COLORS.secondary}20 0%, transparent 40%)
          `,
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
        {/* Main CTA headline */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: COLORS.foreground,
            marginBottom: 8,
            opacity: headlineFade,
            transform: `translateY(${interpolate(headlineFade, [0, 1], [30, 0])}px)`,
          }}
        >
          {CONTENT.cta.headline}
        </div>

        {/* Gradient subheadline */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            marginBottom: 48,
            opacity: subFade,
            transform: `scale(${interpolate(subFade, [0, 1], [0.9, 1])})`,
            background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {CONTENT.cta.subheadline}
        </div>

        {/* CTA Buttons */}
        <div
          style={{
            display: "flex",
            gap: 20,
            justifyContent: "center",
            marginBottom: 64,
            opacity: buttonsFade,
            transform: `translateY(${interpolate(buttonsFade, [0, 1], [20, 0])}px)`,
          }}
        >
          {/* Primary button */}
          <div
            style={{
              padding: "20px 40px",
              borderRadius: 16,
              fontSize: 24,
              fontWeight: 600,
              backgroundColor: COLORS.primary,
              color: COLORS.foreground,
              boxShadow: `0 10px 40px ${COLORS.primary}40`,
              transform: `scale(${pulse})`,
            }}
          >
            {CONTENT.cta.buttons[0]}
          </div>

          {/* Secondary button */}
          <div
            style={{
              padding: "20px 40px",
              borderRadius: 16,
              fontSize: 24,
              fontWeight: 600,
              backgroundColor: "transparent",
              color: COLORS.foreground,
              border: `2px solid ${COLORS.border}`,
            }}
          >
            {CONTENT.cta.buttons[1]}
          </div>
        </div>

        {/* Closing tagline */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: COLORS.mutedForeground,
            marginBottom: 32,
            opacity: closingFade,
          }}
        >
          {CONTENT.cta.closing}
        </div>

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            opacity: logoFade,
          }}
        >
          {/* Logo icon */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: COLORS.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke={COLORS.foreground}
              strokeWidth="1.5"
              style={{ width: 28, height: 28 }}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <circle cx="9" cy="9" r="1" fill={COLORS.foreground} />
              <circle cx="15" cy="9" r="1" fill={COLORS.foreground} />
            </svg>
          </div>

          {/* Logo text */}
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: COLORS.foreground,
            }}
          >
            Community Invest
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
