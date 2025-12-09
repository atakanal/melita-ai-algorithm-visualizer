import React, { useState, useRef, useEffect } from 'react';
import InputPanel from './components/InputPanel';
import OutputPanel from './components/OutputPanel';
import { analyzeCodeWithGemini } from './services/geminiService';
import { SimulationResponse } from './types';

// Max execution time for API requests (30 seconds)
const TIMEOUT_DURATION = 30000;

/**
 * Main application component.
 * Manages the code input, API communication, and visualization state.
 */
function App() {
  const [code, setCode] = useState('');
  const [simulationData, setSimulationData] = useState<SimulationResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref to manage request cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  // Monitor network status to cancel active requests if offline
  useEffect(() => {
    const handleOffline = () => {
      if (isAnalyzing && abortControllerRef.current) {
        abortControllerRef.current.abort("offline");
        setIsAnalyzing(false);
        setError("⚠️ Internet connection lost! Please check your network connection.");
      }
    };
    window.addEventListener('offline', handleOffline);
    return () => window.removeEventListener('offline', handleOffline);
  }, [isAnalyzing]);

  const handleVisualize = async () => {
    // Check connectivity before starting
    if (!navigator.onLine) {
      setError("🌐 No internet connection detected. Please connect to the network and try again.");
      return;
    }

    // Cancel any previous pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsAnalyzing(true);
    setError(null);
    setSimulationData(null);

    try {
      const apiPromise = analyzeCodeWithGemini(code);
      
      // Create a timeout promise to enforce the time limit
      const timeoutPromise = new Promise<never>((_, reject) => {
        const id = setTimeout(() => {
          clearTimeout(id);
          reject(new Error("TIMEOUT_ERROR"));
        }, TIMEOUT_DURATION);
      });

      // Race the API call against the timeout
      const result = await Promise.race([apiPromise, timeoutPromise]);

      if (controller.signal.aborted) return;
      setSimulationData(result);

    } catch (err: any) {
      // Handle request abortion (manual stop or offline)
      if (controller.signal.aborted) {
        if (controller.signal.reason === "stop") return;
        if (controller.signal.reason === "offline") {
            setError("⚠️ Network connection lost.");
            return;
        }
      }

      // Handle specific timeout error
      if (err.message === "TIMEOUT_ERROR") {
        console.error("Operation timed out.");
        setError("⏳ The operation took too long (20s). Your code may be too complex or the server is unresponsive.");
        controller.abort("timeout");
      } 
      else {
        console.error(err);
        setError(err.message || "An unexpected error occurred.");
      }
    } finally {
      // Only reset loading state if not aborted externally
      if (!controller.signal.aborted || error) {
        setIsAnalyzing(false);
      }
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort("stop");
      abortControllerRef.current = null;
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <div className="w-[40%] h-full">
        <InputPanel 
          code={code} 
          setCode={setCode} 
          onVisualize={handleVisualize} 
          onStop={handleStop} 
          isAnalyzing={isAnalyzing}
        />
      </div>
      <div className="w-[60%] h-full border-l border-gray-800">
        <OutputPanel 
          data={simulationData} 
          isLoading={isAnalyzing} 
          error={error} 
        />
      </div>
    </div>
  );
}

export default App;
