import { GoogleGenerativeAI } from "@google/generative-ai";
import { SimulationResponse } from "../types";

/**
 * Utility: Raw Response Sanitizer
 * LLMs often wrap JSON output in markdown code blocks (```json ... ```).
 * This helper strips those artifacts to ensure valid JSON parsing, 
 * preventing syntax errors in the frontend.
 */
const cleanJsonString = (str: string): string => {
  let cleaned = str.replace(/```json/g, '').replace(/```/g, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned;
};

/**
 * FAULT TOLERANCE STRATEGY (Smart Fallback)
 * Instead of crashing the UI when an API error occurs, this function
 * generates a specific Mermaid.js graph representing the error state.
 * This allows the application to fail gracefully and inform the user visually.
 */
const getFallbackResponse = (error: any): SimulationResponse => {
  const msg = error.toString().toLowerCase();
  
  // CASE 1: RATE LIMITING (HTTP 429)
  // Handles quota exhaustion scenarios common in hackathons.
  if (msg.includes("429") || msg.includes("quota") || msg.includes("exhausted")) {
    return {
      mermaidGraph: `graph TD;
        Error[⛔ QUOTA EXCEEDED]:::error
        Desc[API Limit Reached]:::base
        Wait[Please wait a moment...]:::skip
        Error --> Desc --> Wait
        classDef error fill:#ef4444,stroke:#7f1d1d,stroke-width:2px,color:#fff
        classDef base fill:#1f2937,stroke:#374151,color:#fff
        classDef skip fill:#374151,stroke:#4b5563,stroke-dasharray: 5 5,color:#9ca3af`,
      explanation: "**API Limit Reached:** We have hit the daily/per-minute limit for the Google Gemini API. There is no issue with your code; the service is currently unresponsive. Please wait a moment and try again.",
      timeComplexity: "Unknown",
      spaceComplexity: "Unknown",
      optimizationTip: "Try again later."
    };
  }

  // CASE 2: MALFORMED RESPONSE
  // Handles cases where the LLM produces invalid JSON.
  if (msg.includes("json") || msg.includes("syntax")) {
    return {
      mermaidGraph: `graph TD;
        Error[⚠️ PARSING ERROR]:::error
        Desc[AI Response Malformed]:::base
        Retry[Try Simplifying Code]:::result
        Error --> Desc --> Retry
        classDef error fill:#f59e0b,stroke:#b45309,color:#000
        classDef base fill:#1f2937,stroke:#374151,color:#fff
        classDef result fill:#d1fae5,stroke:#059669,color:#000`,
      explanation: "**Data Processing Error:** The Artificial Intelligence encountered a technical error during response generation.",
      timeComplexity: "?",
      spaceComplexity: "?",
      optimizationTip: "Simplify the code snippet."
    };
  }

  // CASE 3: GENERIC / UNKNOWN ERROR
  // Fallback for unexpected system failures.
  return {
    mermaidGraph: `graph TD;
      Start["Start"]:::base
      Note["⚠️ Complex / Large Logic"]:::skip
      Summary["(... Visualization skipped for performance ...)"]:::skip
      End["Result"]:::result
      Start --> Note --> Summary --> End
      classDef base fill:#d1fae5,stroke:#059669,stroke-width:2px,color:#000
      classDef skip fill:#f3f4f6,stroke:#9ca3af,stroke-width:2px,stroke-dasharray: 5 5,color:#000
      classDef result fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#000`,
    explanation: `**Visualization Threshold Reached:** The system is currently under heavy load or the code is excessively complex. Switched to summary display mode.\n\nError Details: ${msg}`,
    timeComplexity: "O(High)",
    spaceComplexity: "O(High)",
    optimizationTip: "Try creating smaller functions."
  };
};

/**
 * Core Analysis Function
 * Orchestrates the interaction with Google's Gemini 3 Pro model.
 * Uses strict prompt engineering to enforce specific JSON schemas and Mermaid syntax.
 */
export const analyzeCodeWithGemini = async (code: string): Promise<SimulationResponse> => {
  // Note: API Key should ideally be in process.env for security
  const API_KEY = ""; 
  if (!API_KEY) throw new Error("API Key not found.");

  const genAI = new GoogleGenerativeAI(API_KEY);
  
  // Model Configuration
  // Low temperature (0.1) ensures deterministic and consistent code analysis.
  const model = genAI.getGenerativeModel({ 
    model: "gemini-3-pro-preview", 
    generationConfig: {
      responseMimeType: "application/json", 
      temperature: 0.1,
      maxOutputTokens: 8192, 
    }
  });

  // Prompt Engineering:
  // 1. Role Definition (Algorithms Professor)
  // 2. Conditional Logic (Simplification vs. Full Visualization)
  // 3. Structured Output Enforcement (Strict JSON)
  const prompt = `
  You are an expert Algorithms Professor. Analyze this code.

  ### 1. VALIDATION
  If input is NOT code, return: {"mermaidGraph": "graph TD; E[Not Code]", "explanation": "Invalid input."}

  ### 2. STRATEGY
  - **SIMPLE CODE:** Visualize fully.
  - **HUGE LOOPS (>10 steps):** Summarize (Start -> ... -> End).
  - **Keep nodes < 25.**

  ### 3. JSON OUTPUT
  {
    "explanation": "Markdown summary. Escape quotes!",
    "timeComplexity": "Big O",
    "spaceComplexity": "Big O",
    "optimizationTip": "Short tip.",
    "mermaidGraph": "graph TD; ..."
  }
  
  ### MERMAID STYLE
  - style START fill:#d1fae5,stroke:#059669,stroke-width:2px
  - style LOOP fill:#dbeafe,stroke:#2563eb,stroke-width:2px
  - style SKIP fill:#f3f4f6,stroke:#9ca3af,stroke-width:2px,stroke-dasharray: 5 5
  - style END fill:#fef3c7,stroke:#d97706,stroke-width:2px

  CODE:
  ${code}
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log("Gemini Raw:", text);

    try {
      // Parse the sanitized JSON response
      return JSON.parse(cleanJsonString(text));
    } catch (e) {
      throw new Error("JSON Parse Error: " + e);
    }

  } catch (error: any) {
    console.error("Gemini Error:", error);
    // Robust Error Handling: Delegate to fallback logic instead of throwing
    return getFallbackResponse(error.message || error);
  }
};

/**
 * Helper: Converts File object to Base64 for API transmission.
 */
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      const base64Content = base64Data.split(',')[1];
      resolve({ inlineData: { data: base64Content, mimeType: file.type } });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Multimodal Feature: Optical Character Recognition (OCR) via Gemini
 * Extracts raw code text from uploaded images/screenshots.
 */
export const extractCodeFromImage = async (file: File): Promise<string> => {
  const API_KEY = "";
  if (!API_KEY) throw new Error("API Key not found.");
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });
  try {
    const imagePart = await fileToGenerativePart(file);
    // Multimodal Prompt: Instruction + Image Data
    const result = await model.generateContent([`Extract raw code. No markdown.`, imagePart]);
    return result.response.text().trim();
  } catch (error) {
    throw new Error("Failed to read code from image.");
  }
};
