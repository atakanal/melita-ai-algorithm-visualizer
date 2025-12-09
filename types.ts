export interface SimulationResponse {
  explanation: string;
  mermaidGraph: string;
  timeComplexity: string;
  spaceComplexity: string;
  optimizationTip: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  code: string;
  response: SimulationResponse;
}

// Global declaration for Mermaid CDN
declare global {
  interface Window {
    mermaid: any;
  }
}