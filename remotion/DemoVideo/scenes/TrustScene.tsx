import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { COLORS, CONTENT, TIMING } from "../constants";

export const TrustScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Shield animation
  const shieldReveal = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  const checkReveal = spring({
    frame,
    fps,
    delay: 15,
    config: { damping: 8 },
  });

  // Title fade
  const titleFade = spring({
    frame,
    fps,
    delay: 20,
    config: { damping: 200 },
  });

  const trustPoints = [
    { text: "100% goes to bills", icon: "💵" },
    { text: "AI fraud protection", icon: "🛡️" },
    { text: "Complete transparency", icon: "👁️" },
    { text: "Weekly public reports", icon: "📊" },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Success gradient overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 50%, ${COLORS.success}10 0%, transparent 50%)`,
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
        {/* Shield icon */}
        <div
          style={{
            width: 100,
            height: 100,
            margin: "0 auto 32px",
            position: "relative",
            opacity: shieldReveal,
            transform: `scale(${shieldReveal})`,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill={`${COLORS.success}30`}
            stroke={COLORS.success}
            strokeWidth="1.5"
            style={{ width: "100%", height: "100%" }}
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          {/* Checkmark */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) scale(${checkReveal})`,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke={COLORS.success}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 40, height: 40 }}
            >
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.foreground,
            marginBottom: 48,
            opacity: titleFade,
            transform: `translateY(${interpolate(titleFade, [0, 1], [20, 0])}px)`,
          }}
        >
          {CONTENT.trust.headline}
        </div>

        {/* Trust points grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            maxWidth: 700,
            margin: "0 auto",
          }}
        >
          {trustPoints.map((point, index) => {
            const pointFade = spring({
              frame,
              fps,
              delay: 40 + index * 15,
              config: { damping: 200 },
            });

            const iconPop = spring({
              frame,
              fps,
              delay: 45 + index * 15,
              config: { damping: 20, stiffness: 200 },
            });

            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 24px",
                  backgroundColor: COLORS.backgroundAlt,
                  borderRadius: 12,
                  border: `1px solid ${COLORS.border}`,
                  opacity: pointFade,
                  transform: `translateY(${interpolate(pointFade, [0, 1], [20, 0])}px)`,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: `${COLORS.success}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    opacity: iconPop,
                    transform: `scale(${iconPop})`,
                  }}
                >
                  {point.icon}
                </div>
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 500,
                    color: COLORS.foreground,
                  }}
                >
                  {point.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
