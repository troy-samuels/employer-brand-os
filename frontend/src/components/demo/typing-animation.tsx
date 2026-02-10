/**
 * @module components/demo/typing-animation
 * Provides reusable typing and reveal text presentation helpers.
 */

"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface TypingAnimationProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
  highlightPatterns?: {
    pattern: RegExp;
    className: string;
  }[];
  cursor?: boolean;
  delay?: number;
}

/**
 * Types out a string with optional syntax highlighting and cursor animation.
 * @param props - Typing animation configuration.
 * @returns The rendered typing animation element.
 */
export function TypingAnimation({
  text,
  speed = 30,
  className,
  onComplete,
  highlightPatterns = [],
  cursor = true,
  delay = 0,
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    let typingTimer: ReturnType<typeof setInterval> | null = null;
    indexRef.current = 0;

    const resetTimer = setTimeout(() => {
      setDisplayedText("");
      setIsComplete(false);
    }, 0);

    const startTimer = setTimeout(() => {
      typingTimer = setInterval(() => {
        if (indexRef.current < text.length) {
          setDisplayedText(text.slice(0, indexRef.current + 1));
          indexRef.current += 1;
          return;
        }

        if (typingTimer) {
          clearInterval(typingTimer);
        }
        setIsComplete(true);
        onComplete?.();
      }, speed);
    }, delay);

    return () => {
      clearTimeout(resetTimer);
      clearTimeout(startTimer);
      if (typingTimer) {
        clearInterval(typingTimer);
      }
    };
  }, [delay, onComplete, speed, text]);

  // Apply highlighting to displayed text
  const highlightText = (content: string) => {
    if (highlightPatterns.length === 0) {
      return content;
    }

    let result: (string | React.ReactElement)[] = [content];

    highlightPatterns.forEach(({ pattern, className: highlightClass }, patternIndex) => {
      result = result.flatMap((part, partIndex) => {
        if (typeof part !== "string") return part;

        const segments: (string | React.ReactElement)[] = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        const regex = new RegExp(
          pattern.source,
          pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`,
        );

        while ((match = regex.exec(part)) !== null) {
          if (match.index > lastIndex) {
            segments.push(part.slice(lastIndex, match.index));
          }
          segments.push(
            <span
              key={`highlight-${patternIndex}-${partIndex}-${match.index}`}
              className={highlightClass}
            >
              {match[0]}
            </span>,
          );
          lastIndex = regex.lastIndex;
        }

        if (lastIndex < part.length) {
          segments.push(part.slice(lastIndex));
        }

        return segments.length > 0 ? segments : [part];
      });
    });

    return result;
  };

  return (
    <span className={cn("inline", className)}>
      {highlightText(displayedText)}
      {cursor && !isComplete && (
        <span className="inline-block w-2 h-5 ml-0.5 bg-current animate-pulse" />
      )}
    </span>
  );
}

// Streaming version for real API responses
interface StreamingTextProps {
  className?: string;
  highlightPatterns?: {
    pattern: RegExp;
    className: string;
  }[];
}

/**
 * Provides imperative helpers for streaming text UIs.
 * @param props - Streaming text view configuration.
 * @returns Stream state, control methods, and rendered component.
 */
export function StreamingText({
  className,
  highlightPatterns = [],
}: StreamingTextProps) {
  const [text, setText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const append = (chunk: string) => {
    setText((prev) => prev + chunk);
  };

  const start = () => {
    setText("");
    setIsStreaming(true);
  };

  const stop = () => {
    setIsStreaming(false);
  };

  const highlightText = (content: string) => {
    if (highlightPatterns.length === 0) {
      return content;
    }

    let result: (string | React.ReactElement)[] = [content];

    highlightPatterns.forEach(({ pattern, className: highlightClass }, patternIndex) => {
      result = result.flatMap((part, partIndex) => {
        if (typeof part !== "string") return part;

        const segments: (string | React.ReactElement)[] = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        const regex = new RegExp(
          pattern.source,
          pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`,
        );

        while ((match = regex.exec(part)) !== null) {
          if (match.index > lastIndex) {
            segments.push(part.slice(lastIndex, match.index));
          }
          segments.push(
            <span
              key={`highlight-${patternIndex}-${partIndex}-${match.index}`}
              className={highlightClass}
            >
              {match[0]}
            </span>,
          );
          lastIndex = regex.lastIndex;
        }

        if (lastIndex < part.length) {
          segments.push(part.slice(lastIndex));
        }

        return segments.length > 0 ? segments : [part];
      });
    });

    return result;
  };

  return {
    text,
    isStreaming,
    append,
    start,
    stop,
    component: (
      <span className={cn("inline", className)}>
        {highlightText(text)}
        {isStreaming && (
          <span className="inline-block w-2 h-5 ml-0.5 bg-current animate-pulse" />
        )}
      </span>
    ),
  };
}

// Dramatic reveal animation for section headers
interface RevealTextProps {
  text: string;
  className?: string;
  delay?: number;
}

/**
 * Reveals text with delayed fade and transform animation.
 * @param props - Reveal text options.
 * @returns The reveal text element.
 */
export function RevealText({ text, className, delay = 0 }: RevealTextProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <span
      className={cn(
        "inline-block transition-all duration-700",
        isVisible
          ? "opacity-100 translate-y-0 blur-0"
          : "opacity-0 translate-y-4 blur-sm",
        className,
      )}
    >
      {text}
    </span>
  );
}
