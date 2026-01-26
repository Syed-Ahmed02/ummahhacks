import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { COLORS, TIMING } from "../constants";

// Simple icon components (SVG-based)
const icons = {
  dollar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v12M9 9.5c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2s-.9 2-2 2h-2c-1.1 0-2 .9-2 2s.9 2 2 2h2c1.1 0 2-.9 2-2" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  banknote: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18" />
      <path d="M18 17V9M13 17V5M8 17v-3" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  lightning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  water: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  ),
  flame: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
};

export type IconName = keyof typeof icons;

type IconRevealProps = {
  icon: IconName;
  delay?: number;
  size?: number;
  color?: string;
  backgroundColor?: string;
  style?: React.CSSProperties;
};

export const IconReveal: React.FC<IconRevealProps> = ({
  icon,
  delay = 0,
  size = 64,
  color = COLORS.foreground,
  backgroundColor = COLORS.primary,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    delay,
    config: TIMING.spring.snappy,
  });

  const rotation = interpolate(scale, [0, 1], [-180, 0]);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 4,
        backgroundColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color,
        opacity: scale,
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        ...style,
      }}
    >
      <div style={{ width: size * 0.5, height: size * 0.5 }}>
        {icons[icon]}
      </div>
    </div>
  );
};

// Simple icon without animation (for use in animated containers)
type IconProps = {
  icon: IconName;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
};

export const Icon: React.FC<IconProps> = ({
  icon,
  size = 24,
  color = "currentColor",
  style = {},
}) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      {icons[icon]}
    </div>
  );
};

// Utility icons row animation
type UtilityIconsProps = {
  delay?: number;
  size?: number;
  gap?: number;
};

export const UtilityIcons: React.FC<UtilityIconsProps> = ({
  delay = 0,
  size = 56,
  gap = 24,
}) => {
  const utilityIcons: { icon: IconName; color: string; label: string }[] = [
    { icon: "lightning", color: COLORS.electric, label: "Electric" },
    { icon: "water", color: COLORS.water, label: "Water" },
    { icon: "flame", color: COLORS.gas, label: "Gas" },
    { icon: "heart", color: COLORS.heating, label: "Heat" },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {utilityIcons.map((item, index) => (
        <IconReveal
          key={item.label}
          icon={item.icon}
          delay={delay + index * 8}
          size={size}
          color={COLORS.background}
          backgroundColor={item.color}
        />
      ))}
    </div>
  );
};
