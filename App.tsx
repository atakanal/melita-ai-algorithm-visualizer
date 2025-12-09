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
        setError("⚠️ İnternet bağlantısı kesildi! Lütfen bağlantınızı kontrol edin.");
      }
    };
    window.addEventListener('offline', handleOffline);
    return () => window.removeEventListener('offline', handleOffline);
  }, [isAnalyzing]);

  const handleVisualize = async () => {
    // Check connectivity before starting
    if (!navigator.onLine) {
      setError("🌐 İnternet bağlantısı yok. Lütfen bağlanıp tekrar deneyin.");
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
            setError("⚠️ İnternet bağlantısı koptu.");
            return;
        }
      }

      // Handle specific timeout error
      if (err.message === "TIMEOUT_ERROR") {
        console.error("Zaman aşımı gerçekleşti.");
        setError("⏳ İşlem çok uzun sürdü (20sn). Kodunuz çok karmaşık olabilir veya sunucu yanıt vermiyor.");
        controller.abort("timeout");
      } 
      else {
        console.error(err);
        setError(err.message || "Beklenmedik bir hata oluştu.");
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