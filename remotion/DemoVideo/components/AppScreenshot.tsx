import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Img,
} from "remotion";
import { COLORS, TIMING } from "../constants";

type AppScreenshotProps = {
  src?: string;
  delay?: number;
  title?: string;
  mockContent?: React.ReactNode;
};

export const AppScreenshot: React.FC<AppScreenshotProps> = ({
  src,
  delay = 0,
  title,
  mockContent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideUp = spring({
    frame,
    fps,
    delay,
    config: TIMING.spring.smooth,
  });

  const translateY = interpolate(slideUp, [0, 1], [60, 0]);

  return (
    <div
      style={{
        opacity: slideUp,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {title && (
        <div
          style={{
            fontSize: 18,
            color: COLORS.mutedForeground,
            marginBottom: 12,
            fontWeight: 500,
          }}
        >
          {title}
        </div>
      )}
      <div
        style={{
          width: 340,
          backgroundColor: COLORS.backgroundAlt,
          borderRadius: 24,
          border: `2px solid ${COLORS.border}`,
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Phone notch / status bar */}
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

        {/* Content area */}
        <div style={{ padding: 20, minHeight: 400 }}>
          {src ? (
            <Img
              src={src}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: 12,
              }}
            />
          ) : mockContent ? (
            mockContent
          ) : (
            <MockDashboard />
          )}
        </div>
      </div>
    </div>
  );
};

// Mock Dashboard UI
const MockDashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animate stats
  const statProgress = spring({
    frame,
    fps,
    delay: 20,
    config: TIMING.spring.smooth,
  });

  const poolAmount = Math.floor(interpolate(statProgress, [0, 1], [0, 2847]));
  const familiesHelped = Math.floor(interpolate(statProgress, [0, 1], [0, 23]));
  const contribution = Math.floor(interpolate(statProgress, [0, 1], [0, 52]));

  return (
    <div style={{ color: COLORS.foreground }}>
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
        <StatBox
          label="Your Total"
          value={`$${contribution}`}
          color={COLORS.secondary}
        />
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
        <ActivityItem type="electric" amount={187} time="2h ago" />
        <ActivityItem type="water" amount={94} time="5h ago" />
        <ActivityItem type="gas" amount={156} time="1d ago" />
      </div>
    </div>
  );
};

const StatBox: React.FC<{
  label: string;
  value: string;
  color: string;
}> = ({ label, value, color }) => (
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
  type: "electric" | "water" | "gas";
  amount: number;
  time: string;
}> = ({ type, amount, time }) => {
  const colors: Record<string, string> = {
    electric: COLORS.electric,
    water: COLORS.water,
    gas: COLORS.gas,
  };

  const labels: Record<string, string> = {
    electric: "Electric bill paid",
    water: "Water bill paid",
    gas: "Gas bill paid",
  };

  return (
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
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors[type],
          }}
        />
        <span style={{ fontSize: 14, color: COLORS.foreground }}>
          {labels[type]}
        </span>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>${amount}</div>
        <div style={{ fontSize: 11, color: COLORS.mutedForeground }}>{time}</div>
      </div>
    </div>
  );
};

// Mock Contribution Setup UI
export const MockContributionSetup: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sliderProgress = spring({
    frame,
    fps,
    delay: 30,
    durationInFrames: 60,
    config: TIMING.spring.smooth,
  });

  const sliderValue = interpolate(sliderProgress, [0, 1], [0, 65]);
  const amount = Math.floor(interpolate(sliderProgress, [0, 1], [1, 10]));

  return (
    <div style={{ color: COLORS.foreground }}>
      {/* Header */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          Set Your Contribution
        </div>
        <div style={{ fontSize: 14, color: COLORS.mutedForeground }}>
          Choose how much to give weekly
        </div>
      </div>

      {/* Amount display */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 32,
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: COLORS.primary,
          }}
        >
          ${amount}
        </div>
        <div style={{ fontSize: 16, color: COLORS.mutedForeground }}>
          per week
        </div>
      </div>

      {/* Slider */}
      <div style={{ marginBottom: 32, padding: "0 12px" }}>
        <div
          style={{
            height: 8,
            backgroundColor: COLORS.border,
            borderRadius: 4,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: "100%",
              width: `${sliderValue}%`,
              backgroundColor: COLORS.primary,
              borderRadius: 4,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: `${sliderValue}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: 24,
              height: 24,
              backgroundColor: COLORS.foreground,
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 8,
            fontSize: 12,
            color: COLORS.mutedForeground,
          }}
        >
          <span>$1</span>
          <span>$25</span>
        </div>
      </div>

      {/* Impact preview */}
      <div
        style={{
          backgroundColor: COLORS.background,
          borderRadius: 12,
          padding: 16,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 14,
            color: COLORS.mutedForeground,
            marginBottom: 8,
          }}
        >
          Your yearly impact
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.success }}>
          ${amount * 52}
        </div>
        <div
          style={{
            fontSize: 12,
            color: COLORS.mutedForeground,
            marginTop: 4,
          }}
        >
          helps ~{Math.max(1, Math.floor((amount * 52) / 150))} families
        </div>
      </div>

      {/* CTA Button */}
      <div
        style={{
          marginTop: 24,
          backgroundColor: COLORS.primary,
          borderRadius: 12,
          padding: 16,
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 600 }}>Start Contributing</span>
      </div>
    </div>
  );
};
