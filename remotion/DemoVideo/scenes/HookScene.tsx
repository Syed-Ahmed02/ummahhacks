import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { COLORS, CONTENT, TIMING } from "../constants";

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in the background gradient
  const bgOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Typewriter effect
  const charsToShow = Math.min(
    CONTENT.hook.question.length,
    Math.floor(Math.max(0, frame - 15) / 2)
  );
  const displayText = CONTENT.hook.question.slice(0, charsToShow);

  // Cursor blink
  const cursorOpacity = interpolate(
    frame % 16,
    [0, 8, 16],
    [1, 0, 1],
    { extrapolateRight: "clamp" }
  );

  // Question mark pulse
  const pulse = spring({
    frame: frame % 60,
    fps,
    config: { damping: 10, stiffness: 100 },
  });
  const questionScale = interpolate(pulse, [0, 1], [1, 1.05]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Subtle gradient overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 30%, ${COLORS.primary}15 0%, transparent 50%)`,
          opacity: bgOpacity,
        }}
      />

      {/* Main content - using absolute positioning for reliability */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          textAlign: "center",
          opacity: bgOpacity,
        }}
      >
        {/* Question mark decoration */}
        <div
          style={{
            fontSize: 120,
            fontWeight: 800,
            color: COLORS.primary,
            opacity: 0.15,
            transform: `scale(${questionScale})`,
            marginBottom: -40,
          }}
        >
          ?
        </div>

        {/* Main question with typewriter effect */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: COLORS.foreground,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}
        >
          <span>{displayText}</span>
          <span style={{ opacity: cursorOpacity, color: COLORS.primary }}>|</span>
        </div>

        {/* Animated dollar signs */}
        <div
          style={{
            marginTop: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          {[0, 1, 2].map((i) => {
            const dollarSpring = spring({
              frame,
              fps,
              delay: 60 + i * 8,
              config: TIMING.spring.bouncy,
            });
            return (
              <div
                key={i}
                style={{
                  fontSize: 32,
                  color: COLORS.success,
                  opacity: dollarSpring,
                  transform: `translateY(${interpolate(
                    dollarSpring,
                    [0, 1],
                    [20, 0]
                  )}px)`,
                }}
              >
                $
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
