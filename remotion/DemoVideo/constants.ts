// Video Configuration
export const VIDEO_CONFIG = {
  width: 1080,
  height: 1350, // LinkedIn 4:5 portrait
  fps: 30,
  durationInFrames: 1200, // 40 seconds
};

// Colors - Dark theme
export const COLORS = {
  background: "#0a0a0a",
  backgroundAlt: "#111111",
  foreground: "#fafafa",
  primary: "#3b82f6", // Blue
  primaryLight: "#60a5fa",
  secondary: "#8b5cf6", // Purple
  muted: "#71717a",
  mutedForeground: "#a1a1aa",
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  border: "#27272a",
  // Utility-specific colors
  electric: "#fbbf24", // Yellow/gold
  water: "#06b6d4", // Cyan
  gas: "#f97316", // Orange
  heating: "#ef4444", // Red
};

// Typography
export const TYPOGRAPHY = {
  heading: {
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  body: {
    fontWeight: 400,
    letterSpacing: "0",
  },
  mono: {
    fontFamily: "monospace",
  },
};

// Animation timing (in frames at 30fps)
export const TIMING = {
  // Scene durations
  hookScene: 90, // 3 seconds
  problemScene: 120, // 4 seconds
  solutionScene: 150, // 5 seconds
  howItWorksScene: 300, // 10 seconds
  appDemoScene: 240, // 8 seconds
  trustScene: 150, // 5 seconds
  ctaScene: 150, // 5 seconds

  // Transition duration
  transitionDuration: 20,

  // Animation configs
  spring: {
    smooth: { damping: 200 },
    snappy: { damping: 20, stiffness: 200 },
    bouncy: { damping: 8 },
    heavy: { damping: 15, stiffness: 80, mass: 2 },
  },
};

// Text content
export const CONTENT = {
  hook: {
    question: "What if $1/week could keep your neighbor's lights on?",
  },
  problem: {
    headline: "Families in your community",
    subheadline: "are one bill away from losing",
    utilities: ["electricity", "water", "heat", "gas"],
    endText: "Right now.",
  },
  solution: {
    introducing: "Introducing",
    name: "Community Invest",
    tagline: "Neighborhood utility insurance",
    subtitle: "Keep Your Neighbors' Lights On",
  },
  howItWorks: {
    title: "How It Works",
    steps: [
      {
        number: "1",
        title: "Contribute weekly",
        description: "Give as little as $1/week to your community pool",
        icon: "dollar",
      },
      {
        number: "2",
        title: "AI verifies bills",
        description: "Our AI catches fraud and validates urgent utility bills",
        icon: "shield",
      },
      {
        number: "3",
        title: "Direct payment",
        description: "We pay the utility company directly. No cash to individuals.",
        icon: "check",
      },
    ],
  },
  trust: {
    headline: "Built on trust, not faith",
    points: [
      { text: "100% goes to bills", icon: "banknote" },
      { text: "AI fraud protection", icon: "shield" },
      { text: "Complete transparency", icon: "eye" },
      { text: "Weekly public reports", icon: "chart" },
    ],
  },
  cta: {
    headline: "Join your community pool",
    subheadline: "today",
    buttons: ["Start Contributing", "Get Help"],
    closing: "Keep Your Neighbors' Lights On",
  },
};

// Scene start frames (calculated based on durations and transitions)
export const getSceneStartFrames = () => {
  const t = TIMING;
  const overlap = t.transitionDuration;

  return {
    hook: 0,
    problem: t.hookScene - overlap,
    solution: t.hookScene + t.problemScene - overlap * 2,
    howItWorks: t.hookScene + t.problemScene + t.solutionScene - overlap * 3,
    appDemo:
      t.hookScene +
      t.problemScene +
      t.solutionScene +
      t.howItWorksScene -
      overlap * 4,
    trust:
      t.hookScene +
      t.problemScene +
      t.solutionScene +
      t.howItWorksScene +
      t.appDemoScene -
      overlap * 5,
    cta:
      t.hookScene +
      t.problemScene +
      t.solutionScene +
      t.howItWorksScene +
      t.appDemoScene +
      t.trustScene -
      overlap * 6,
  };
};
