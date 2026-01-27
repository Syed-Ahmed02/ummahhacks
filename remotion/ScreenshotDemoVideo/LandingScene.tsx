import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Img,
  staticFile,
} from "remotion";
import { COLORS } from "./constants";

export const LandingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Text animation - appears first
  const textProgress = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const textTranslateY = interpolate(textProgress, [0, 1], [-40, 0]);

  // Image animation - slides up from bottom, slower and smoother
  const imageProgress = spring({
    frame,
    fps,
    delay: 20,
    config: { damping: 30, stiffness: 25 },
  });

  // Image comes straight up from bottom (no rotation)
  const imageTranslateY = interpolate(imageProgress, [0, 1], [600, 0]);
  const imageScale = interpolate(imageProgress, [0, 1], [0.9, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Subtle gradient background */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 40%, ${COLORS.primary}12 0%, transparent 50%)`,
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
        {/* Text - centered, large and bold */}
        <div
          style={{
            opacity: textProgress,
            transform: `translateY(${textTranslateY}px)`,
            textAlign: "center",
            marginBottom: 40,
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: COLORS.foreground,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              marginBottom: 12,
            }}
          >
            Keep Your Neighbors'
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: COLORS.primary,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            Lights On
          </div>
        </div>

        {/* Screenshot image - slides up from bottom */}
        <div
          style={{
            opacity: imageProgress,
            transform: `translateY(${imageTranslateY}px) scale(${imageScale})`,
            width: "100%",
            maxWidth: 900,
          }}
        >
          <div
            style={{
              width: "100%",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: `
                0 50px 100px -30px rgba(0, 0, 0, 0.3),
                0 30px 60px -20px rgba(0, 0, 0, 0.2),
                0 0 0 1px ${COLORS.border}
              `,
            }}
          >
            <Img
              src={staticFile("remotion/landing_page.png")}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
            />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
