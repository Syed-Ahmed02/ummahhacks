/**
 * OpenRouter AI provider configuration
 * 
 * Uses OpenRouter to access various AI models including Google Gemini Pro Vision
 * for bill verification and analysis.
 */

import { createOpenRouter } from "@openrouter/ai-sdk-provider";

// Initialize OpenRouter client
export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

/**
 * Gemini Pro Vision model for image analysis
 * Best for: Bill document analysis, OCR, fraud detection
 */
export const geminiVision = openrouter("google/gemini-2.0-flash-001");

/**
 * Gemini Pro model for text analysis (fallback)
 * Best for: Text-only analysis, structured data extraction
 */
export const geminiPro = openrouter("google/gemini-2.0-flash-001");

/**
 * Alternative vision model (Claude 3 Haiku - faster, cheaper)
 * Use for high-volume or lower-stakes analysis
 */
export const claudeVision = openrouter("anthropic/claude-3-haiku");
