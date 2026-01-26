import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";

type TypewriterTextProps = {
  text: string;
  startFrame?: number;
  charFrames?: number;
  cursorBlinkFrames?: number;
  showCursor?: boolean;
  style?: React.CSSProperties;
  cursorStyle?: React.CSSProperties;
};

const getTypedText = ({
  frame,
  fullText,
  startFrame,
  charFrames,
}: {
  frame: number;
  fullText: string;
  startFrame: number;
  charFrames: number;
}): string => {
  const adjustedFrame = Math.max(0, frame - startFrame);
  const typedChars = Math.min(
    fullText.length,
    Math.floor(adjustedFrame / charFrames)
  );
  return fullText.slice(0, typedChars);
};

const Cursor: React.FC<{
  frame: number;
  blinkFrames: number;
  style?: React.CSSProperties;
}> = ({ frame, blinkFrames, style = {} }) => {
  const opacity = interpolate(
    frame % blinkFrames,
    [0, blinkFrames / 2, blinkFrames],
    [1, 0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <span
      style={{
        opacity,
        marginLeft: 2,
        ...style,
      }}
    >
      |
    </span>
  );
};

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  startFrame = 0,
  charFrames = 2,
  cursorBlinkFrames = 16,
  showCursor = true,
  style = {},
  cursorStyle = {},
}) => {
  const frame = useCurrentFrame();

  const typedText = getTypedText({
    frame,
    fullText: text,
    startFrame,
    charFrames,
  });

  const isTypingComplete = typedText.length === text.length;

  return (
    <span style={style}>
      {typedText}
      {showCursor && (
        <Cursor
          frame={frame}
          blinkFrames={cursorBlinkFrames}
          style={{
            ...cursorStyle,
            // Hide cursor after typing if desired
            // opacity: isTypingComplete ? 0 : undefined,
          }}
        />
      )}
    </span>
  );
};

// Word-by-word reveal variant
type WordRevealProps = {
  text: string;
  startFrame?: number;
  framesPerWord?: number;
  style?: React.CSSProperties;
  wordStyle?: React.CSSProperties;
};

export const WordReveal: React.FC<WordRevealProps> = ({
  text,
  startFrame = 0,
  framesPerWord = 8,
  style = {},
  wordStyle = {},
}) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");

  const adjustedFrame = Math.max(0, frame - startFrame);
  const visibleWords = Math.min(
    words.length,
    Math.floor(adjustedFrame / framesPerWord) + 1
  );

  return (
    <span style={style}>
      {words.map((word, index) => {
        const isVisible = index < visibleWords;
        const wordFrame = adjustedFrame - index * framesPerWord;
        const opacity = isVisible
          ? interpolate(wordFrame, [0, framesPerWord / 2], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          : 0;

        return (
          <span
            key={index}
            style={{
              opacity,
              display: "inline-block",
              marginRight: "0.3em",
              ...wordStyle,
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
};
