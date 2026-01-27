// Video Configuration for Screenshot Demo
export const VIDEO_CONFIG = {
  width: 1080,
  height: 1350, // LinkedIn 4:5 portrait
  fps: 30,
};

// Light theme colors matching globals.css
export const COLORS = {
  // Base colors (light theme)
  background: "#ffffff",
  backgroundAlt: "#f8f8f8",
  foreground: "#252525",

  // Primary green (converted from oklch(0.65 0.18 132))
  primary: "#6b9b59",
  primaryLight: "#8ab87a",
  primaryDark: "#4d7a3f",

  // Muted colors
  muted: "#f5f5f5",
  mutedForeground: "#898989",

  // Accent colors
  accent: "#f5f5f5",
  accentForeground: "#333333",

  // Status colors
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",

  // Border
  border: "#e5e5e5",
};

// Animation timing (in frames at 30fps)
export const TIMING = {
  // Scene durations - each screenshot scene
  sceneDefault: 60, // 2 seconds per scene

  // Outro
  outroScene: 60, // 2 seconds

  // Transition duration
  transitionDuration: 30, // 1 second

  // Animation configs
  spring: {
    smooth: { damping: 200 },
    snappy: { damping: 20, stiffness: 200 },
    bouncy: { damping: 12 },
    heavy: { damping: 15, stiffness: 80, mass: 2 },
  },
};

// Screenshot scene type (simplified - no security badge)
type ScreenshotScene = {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  zoomOrigin?: "center" | "left";
};

// Screenshot scenes configuration (excluding landing - it has its own component)
export const SCREENSHOT_SCENES: ScreenshotScene[] = [
  {
    id: "payment",
    image: "remotion/stripe_payment.png",
    title: "Subscribe Weekly",
    subtitle: "Secure Stripe Payments",
    zoomOrigin: "center",
  },
  {
    id: "campaign",
    image: "remotion/support_campaign.png",
    title: "Support Real Families",
    subtitle: "In Your Community",
  },
  {
    id: "review",
    image: "remotion/bill_review_page.png",
    title: "Every Request",
    subtitle: "Carefully Reviewed",
    zoomOrigin: "left",
  },
  {
    id: "verification",
    image: "remotion/ai_verification.png",
    title: "AI Fraud Detection",
    subtitle: "Protects Your Contribution",
  },
];

// Outro content
export const OUTRO_CONTENT = {
  title: "Join Today",
  subtitle: "Start making a difference",
};
