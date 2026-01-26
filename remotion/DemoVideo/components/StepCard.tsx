import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { COLORS, TIMING } from "../constants";
import { Icon, IconName } from "./IconReveal";

type StepCardProps = {
  number: string;
  title: string;
  description: string;
  icon: IconName;
  delay?: number;
  index?: number;
};

export const StepCard: React.FC<StepCardProps> = ({
  number,
  title,
  description,
  icon,
  delay = 0,
  index = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({
    frame,
    fps,
    delay,
    config: TIMING.spring.smooth,
  });

  const iconPop = spring({
    frame,
    fps,
    delay: delay + 10,
    config: TIMING.spring.snappy,
  });

  const translateX = interpolate(slideIn, [0, 1], [100, 0]);

  return (
    <div
      style={{
        opacity: slideIn,
        transform: `translateX(${translateX}px)`,
        display: "flex",
        alignItems: "flex-start",
        gap: 24,
        padding: "24px 32px",
        backgroundColor: COLORS.backgroundAlt,
        borderRadius: 16,
        border: `1px solid ${COLORS.border}`,
        marginBottom: 16,
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
          opacity: iconPop,
          transform: `scale(${iconPop})`,
        }}
      >
        {number}
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
          <Icon icon={icon} size={24} color={COLORS.primary} />
          <h3
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: COLORS.foreground,
              margin: 0,
            }}
          >
            {title}
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
          {description}
        </p>
      </div>
    </div>
  );
};

// Compact version for trust points
type TrustPointProps = {
  text: string;
  icon: IconName;
  delay?: number;
};

export const TrustPoint: React.FC<TrustPointProps> = ({
  text,
  icon,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = spring({
    frame,
    fps,
    delay,
    config: TIMING.spring.smooth,
  });

  const checkPop = spring({
    frame,
    fps,
    delay: delay + 5,
    config: TIMING.spring.snappy,
  });

  const translateY = interpolate(fadeIn, [0, 1], [20, 0]);

  return (
    <div
      style={{
        opacity: fadeIn,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px 24px",
        backgroundColor: COLORS.backgroundAlt,
        borderRadius: 12,
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: COLORS.success + "20",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: checkPop,
          transform: `scale(${checkPop})`,
        }}
      >
        <Icon icon={icon} size={24} color={COLORS.success} />
      </div>
      <span
        style={{
          fontSize: 22,
          fontWeight: 500,
          color: COLORS.foreground,
        }}
      >
        {text}
      </span>
    </div>
  );
};
