import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { COLORS, TIMING } from "../constants";

export const AppDemoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title fade
  const titleFade = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  // Phone slide up
  const phoneSlide = spring({
    frame,
    fps,
    delay: 20,
    config: { damping: 200 },
  });

  // Phone switching animation
  const switchProgress = spring({
    frame,
    fps,
    delay: 120,
    config: { damping: 200 },
  });

  // Stats animation
  const statsProgress = spring({
    frame,
    fps,
    delay: 40,
    config: { damping: 200 },
  });

  const poolAmount = Math.floor(interpolate(statsProgress, [0, 1], [0, 2847]));
  const familiesHelped = Math.floor(interpolate(statsProgress, [0, 1], [0, 23]));

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
          background: `
            radial-gradient(circle at 30% 20%, ${COLORS.primary}15 0%, transparent 40%),
            radial-gradient(circle at 70% 80%, ${COLORS.secondary}15 0%, transparent 40%)
          `,
        }}
      />

      {/* Content */}
      <div
        style={{
          padding: "48px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: COLORS.foreground,
            textAlign: "center",
            marginBottom: 12,
            opacity: titleFade,
          }}
        >
          See it in action
        </div>

        <div
          style={{
            fontSize: 20,
            color: COLORS.mutedForeground,
            textAlign: "center",
            marginBottom: 32,
            opacity: titleFade,
          }}
        >
          Simple, transparent, community-powered
        </div>

        {/* Phone mockup */}
        <div
          style={{
            width: 340,
            backgroundColor: COLORS.backgroundAlt,
            borderRadius: 24,
            border: `2px solid ${COLORS.border}`,
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            opacity: phoneSlide,
            transform: `translateY(${interpolate(phoneSlide, [0, 1], [60, 0])}px)`,
          }}
        >
          {/* Phone notch */}
          <div
            style={{
              height: 32,
              backgroundColor: COLORS.background,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 80,
                height: 6,
                backgroundColor: COLORS.border,
                borderRadius: 3,
              }}
            />
          </div>

          {/* App content */}
          <div style={{ padding: 20, color: COLORS.foreground }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 14,
                  color: COLORS.mutedForeground,
                  marginBottom: 4,
                }}
              >
                Your Community Pool
              </div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>Toronto, ON</div>
            </div>

            {/* Stats grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <StatBox
                label="Pool Balance"
                value={`$${poolAmount.toLocaleString()}`}
                color={COLORS.success}
              />
              <StatBox
                label="Families Helped"
                value={familiesHelped.toString()}
                color={COLORS.primary}
              />
              <StatBox label="Your Total" value="$52" color={COLORS.secondary} />
              <StatBox label="This Week" value="$5" color={COLORS.warning} />
            </div>

            {/* Recent activity */}
            <div
              style={{
                backgroundColor: COLORS.background,
                borderRadius: 12,
                padding: 16,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  color: COLORS.mutedForeground,
                  marginBottom: 12,
                }}
              >
                Recent Impact
              </div>
              <ActivityItem emoji="⚡" label="Electric bill paid" amount={187} />
              <ActivityItem emoji="💧" label="Water bill paid" amount={94} />
              <ActivityItem emoji="🔥" label="Gas bill paid" amount={156} />
            </div>
          </div>
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 24,
          }}
        >
          {["Real-time tracking", "Weekly reports", "Full control"].map(
            (text, i) => {
              const pillFade = spring({
                frame,
                fps,
                delay: 60 + i * 10,
                config: { damping: 200 },
              });
              return (
                <div
                  key={i}
                  style={{
                    opacity: pillFade,
                    transform: `translateY(${interpolate(pillFade, [0, 1], [10, 0])}px)`,
                    backgroundColor: COLORS.backgroundAlt,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 20,
                    padding: "8px 16px",
                    fontSize: 14,
                    color: COLORS.mutedForeground,
                    fontWeight: 500,
                  }}
                >
                  {text}
                </div>
              );
            }
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const StatBox: React.FC<{ label: string; value: string; color: string }> = ({
  label,
  value,
  color,
}) => (
  <div
    style={{
      backgroundColor: COLORS.background,
      borderRadius: 12,
      padding: 14,
    }}
  >
    <div
      style={{ fontSize: 12, color: COLORS.mutedForeground, marginBottom: 4 }}
    >
      {label}
    </div>
    <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
  </div>
);

const ActivityItem: React.FC<{
  emoji: string;
  label: string;
  amount: number;
}> = ({ emoji, label, amount }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 0",
      borderBottom: `1px solid ${COLORS.border}`,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span>{emoji}</span>
      <span style={{ fontSize: 14, color: COLORS.foreground }}>{label}</span>
    </div>
    <div style={{ fontSize: 14, fontWeight: 600 }}>${amount}</div>
  </div>
);
