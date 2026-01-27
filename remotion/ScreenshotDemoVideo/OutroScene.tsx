import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { COLORS, OUTRO_CONTENT } from "./constants";

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation - longer duration
  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const titleTranslateY = interpolate(titleProgress, [0, 1], [40, 0]);

  // CTA animation - longer duration
  const ctaProgress = spring({
    frame,
    fps,
    delay: 25,
    config: { damping: 18, stiffness: 100 },
  });

  const ctaScale = interpolate(ctaProgress, [0, 1], [0.85, 1]);
  const ctaTranslateY = interpolate(ctaProgress, [0, 1], [30, 0]);

  // Trust badges animation - longer duration
  const badgesProgress = spring({
    frame,
    fps,
    delay: 50,
    config: { damping: 15, stiffness: 80 },
  });

  const badgesTranslateY = interpolate(badgesProgress, [0, 1], [20, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Gradient background */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 45%, ${COLORS.primary}18 0%, transparent 50%)`,
        }}
      />

      {/* Centered content container */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 40px",
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: COLORS.foreground,
            marginBottom: 12,
            opacity: titleProgress,
            transform: `translateY(${titleTranslateY}px)`,
            letterSpacing: "-0.03em",
            textAlign: "center",
          }}
        >
          {OUTRO_CONTENT.title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 38,
            fontWeight: 500,
            color: COLORS.mutedForeground,
            marginBottom: 50,
            opacity: titleProgress,
            textAlign: "center",
          }}
        >
          {OUTRO_CONTENT.subtitle}
        </div>

        {/* CTA Button */}
        <div
          style={{
            opacity: ctaProgress,
            transform: `scale(${ctaScale}) translateY(${ctaTranslateY}px)`,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              backgroundColor: COLORS.primary,
              color: "white",
              padding: "24px 52px",
              borderRadius: 18,
              fontSize: 34,
              fontWeight: 700,
              boxShadow: `
                0 20px 50px -15px ${COLORS.primary}70,
                0 10px 30px -10px rgba(0, 0, 0, 0.2)
              `,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 34, height: 34 }}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            Start Contributing
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            marginTop: 32,
            fontSize: 30,
            fontWeight: 600,
            color: COLORS.primary,
            opacity: ctaProgress,
          }}
        >
          {OUTRO_CONTENT.cta}
        </div>

        {/* Trust badges */}
        <div
          style={{
            marginTop: 60,
            display: "flex",
            justifyContent: "center",
            gap: 48,
            opacity: badgesProgress,
            transform: `translateY(${badgesTranslateY}px)`,
          }}
        >
          {[
            { icon: "shield", text: "AI-Verified Bills" },
            { icon: "lock", text: "Secure Payments" },
            { icon: "heart", text: "100% to Utilities" },
          ].map((badge, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: COLORS.mutedForeground,
                fontSize: 20,
                fontWeight: 500,
              }}
            >
              <TrustIcon type={badge.icon as "shield" | "lock" | "heart"} />
              <span>{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Trust icon component
const TrustIcon: React.FC<{ type: "shield" | "lock" | "heart" }> = ({
  type,
}) => {
  const iconStyle = {
    width: 24,
    height: 24,
    color: COLORS.primary,
  };

  switch (type) {
    case "shield":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={iconStyle}
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "lock":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={iconStyle}
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case "heart":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={iconStyle}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    default:
      return null;
  }
};
