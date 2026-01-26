import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { COLORS, CONTENT, TIMING } from "../constants";

export const HowItWorksScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title fade
  const titleFade = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  const steps = CONTENT.howItWorks.steps;
  const stepIcons = ["💵", "🛡️", "✅"];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Subtle gradient */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(180deg, ${COLORS.primary}08 0%, transparent 50%)`,
        }}
      />

      {/* Content */}
      <div
        style={{
          padding: "60px 48px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Section title */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.foreground,
            textAlign: "center",
            marginBottom: 48,
            opacity: titleFade,
            transform: `translateY(${interpolate(titleFade, [0, 1], [30, 0])}px)`,
          }}
        >
          {CONTENT.howItWorks.title}
        </div>

        {/* Steps */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 20,
          }}
        >
          {steps.map((step, index) => {
            const stepSpring = spring({
              frame,
              fps,
              delay: 30 + index * 40,
              config: { damping: 200 },
            });

            const numberSpring = spring({
              frame,
              fps,
              delay: 40 + index * 40,
              config: { damping: 20, stiffness: 200 },
            });

            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 24,
                  padding: "24px 32px",
                  backgroundColor: COLORS.backgroundAlt,
                  borderRadius: 16,
                  border: `1px solid ${COLORS.border}`,
                  opacity: stepSpring,
                  transform: `translateX(${interpolate(stepSpring, [0, 1], [100, 0])}px)`,
                }}
              >
                {/* Number badge */}
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: COLORS.primary,
                    color: COLORS.foreground,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    fontWeight: 700,
                    flexShrink: 0,
                    opacity: numberSpring,
                    transform: `scale(${numberSpring})`,
                  }}
                >
                  {step.number}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{stepIcons[index]}</span>
                    <h3
                      style={{
                        fontSize: 28,
                        fontWeight: 600,
                        color: COLORS.foreground,
                        margin: 0,
                      }}
                    >
                      {step.title}
                    </h3>
                  </div>
                  <p
                    style={{
                      fontSize: 20,
                      color: COLORS.mutedForeground,
                      margin: 0,
                      lineHeight: 1.4,
                    }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
