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

type ScreenshotSceneProps = {
  image: string;
  title: string;
  subtitle: string;
};

export const ScreenshotScene: React.FC<ScreenshotSceneProps> = ({
  image,
  title,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Text animation - appears instantly (no fade)
  const textProgress = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Text visible for first 0.5 seconds, then disappears instantly
  const textOpacity = frame < 15 ? 1 : 0;

  const textTranslateY = interpolate(textProgress, [0, 1], [-30, 0]);

  // Image animation - starts at frame 20, fades in and scales to fullscreen
  const imageStartFrame = 20;
  const imageProgress = spring({
    frame: Math.max(0, frame - imageStartFrame),
    fps,
    config: { damping: 20, stiffness: 50 },
  });

  // Image scales from smaller to fullscreen
  const imageScale = interpolate(imageProgress, [0, 1], [0.7, 1]);
  const imageOpacity = interpolate(
    frame,
    [imageStartFrame, imageStartFrame + 15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

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
          background: `radial-gradient(circle at 50% 40%, ${COLORS.primary}10 0%, transparent 50%)`,
        }}
      />

      {/* Text - centered, shows for first 0.5s then fades out */}
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
          opacity: textOpacity,
          transform: `translateY(${textTranslateY}px)`,
          zIndex: 10,
          padding: "0 40px",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: COLORS.foreground,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: COLORS.primary,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            textAlign: "center",
          }}
        >
          {subtitle}
        </div>
      </div>

      {/* Fullscreen image - fades in and scales up after text */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: imageOpacity,
          transform: `scale(${imageScale})`,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: `
                0 50px 100px -30px rgba(0, 0, 0, 0.35),
                0 30px 60px -20px rgba(0, 0, 0, 0.25)
              `,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: COLORS.background,
            }}
          >
            <Img
              src={staticFile(image)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
