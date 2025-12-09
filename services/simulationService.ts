import { SimulationResponse } from '../types';

/**
 * DEPRECATED: This service is no longer used.
 * Real logic is in geminiService.ts.
 */
export const simulateAIResponse = async (code: string): Promise<SimulationResponse> => {
  throw new Error("Simulation service is deprecated. Use Gemini API.");
};