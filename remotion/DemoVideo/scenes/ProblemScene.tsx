import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { COLORS, CONTENT, TIMING } from "../constants";

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in
  const fadeIn = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  // Utilities cycling animation
  const cycleIndex = Math.floor(frame / 25) % CONTENT.problem.utilities.length;

  const textFade = interpolate(
    frame % 25,
    [0, 5, 20, 25],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp" }
  );

  const utilityColors = [COLORS.electric, COLORS.water, COLORS.heating, COLORS.gas];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Warning gradient overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 70%, ${COLORS.error}10 0%, transparent 50%)`,
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
        {/* Main headline */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.foreground,
            marginBottom: 16,
            opacity: fadeIn,
            transform: `translateY(${interpolate(fadeIn, [0, 1], [30, 0])}px)`,
          }}
        >
          {CONTENT.problem.headline}
        </div>

        {/* Subheadline */}
        <div
          style={{
            fontSize: 40,
            fontWeight: 500,
            color: COLORS.mutedForeground,
            marginBottom: 32,
            opacity: fadeIn,
            transform: `translateY(${interpolate(fadeIn, [0, 1], [30, 0])}px)`,
          }}
        >
          {CONTENT.problem.subheadline}
        </div>

        {/* Cycling utility type */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            marginBottom: 48,
            height: 80,
            opacity: textFade,
            color: utilityColors[cycleIndex],
          }}
        >
          {CONTENT.problem.utilities[cycleIndex]}
        </div>

        {/* Utility icons row */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 32,
          }}
        >
          {["⚡", "💧", "🔥", "❤️"].map((icon, i) => {
            const iconSpring = spring({
              frame,
              fps,
              delay: 20 + i * 8,
              config: { damping: 20, stiffness: 200 },
            });
            return (
              <div
                key={i}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  backgroundColor: utilityColors[i],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  opacity: iconSpring,
                  transform: `scale(${iconSpring})`,
                }}
              >
                {icon}
              </div>
            );
          })}
        </div>

        {/* End text */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: COLORS.error,
            marginTop: 48,
            opacity: spring({ frame, fps, delay: 50, config: { damping: 200 } }),
          }}
        >
          {CONTENT.problem.endText}
        </div>
      </div>
    </AbsoluteFill>
  );
};
