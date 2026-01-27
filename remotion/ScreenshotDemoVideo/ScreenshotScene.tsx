import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  Img,
  staticFile,
} from "remotion";
import { COLORS } from "./constants";

type ScreenshotSceneProps = {
  image: string;
  title: string;
  subtitle: string;
  zoomOrigin?: "center" | "left"; // undefined = no zoom
};

export const ScreenshotScene: React.FC<ScreenshotSceneProps> = ({
  image,
  title,
  subtitle,
  zoomOrigin,
}) => {
  const frame = useCurrentFrame();

  // Text visible for first 40 frames, then disappears instantly
  const showText = frame < 40;
  
  // Image appears instantly after text disappears (no fade)
  const showImage = frame >= 40;

  // Static zoom - scale and origin based on zoomOrigin prop
  const scale = zoomOrigin ? 1.15 : 1;
  const transformOrigin = zoomOrigin === "left" ? "left center" : "center center";

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

      {/* Text - centered, shows for first 1 second then disappears instantly */}
      {showText && (
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
      )}

      {/* Fullscreen image - appears instantly after text */}
      {showImage && (
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
                  transform: `scale(${scale})`,
                  transformOrigin: transformOrigin,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
