import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Download, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface MermaidDiagramProps {
  /** The raw Mermaid syntax string to be rendered. */
  chart: string;
}

/**
 * Global configuration for the Mermaid rendering engine.
 * 'startOnLoad: false' allows manual control over the rendering lifecycle.
 */
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose', // Allows HTML in nodes if needed
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
});

/**
 * MermaidDiagram Component
 * * Renders dynamic flowcharts, sequence diagrams, and graphs using Mermaid.js.
 * * Features:
 * - Interactive Pan/Zoom capabilities.
 * - High-Resolution PNG Export (via Canvas rasterization).
 * - Fallback to SVG export if Canvas security fails.
 */
const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [error, setError] = useState<string | null>(null);

  /**
   * Effect: Rendering Pipeline
   * Generates a unique ID for each render cycle to prevent DOM conflicts
   * and asynchronously renders the SVG into the state.
   */
  useEffect(() => {
    const renderChart = async () => {
      if (!containerRef.current || !chart) return;
      setError(null);
      try {
        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, chart);
        setSvgContent(svg);
        setZoomLevel(1); // Reset zoom on new chart load
      } catch (err) {
        console.error("Mermaid Render Error:", err);
        setError("Failed to render diagram.");
      }
    };
    renderChart();
  }, [chart]);

  /**
   * Handles the export functionality.
   * * Process: SVG DOM -> Serialized XML -> Base64 -> HTMLImage -> Canvas -> PNG.
   * This complex pipeline is necessary to ensure proper styling, background colors,
   * and high resolution (3x scale) in the downloaded file.
   */
  const handleDownload = () => {
    console.log("⬇️ Download sequence initiated...");

    const svgElement = containerRef.current?.querySelector('svg');
    
    if (!svgElement) {
      alert("Graphic is not ready yet.");
      return;
    }

    // 1. Capture Dimensions
    const bbox = svgElement.getBoundingClientRect();
    const width = bbox.width || 800;
    const height = bbox.height || 600;

    // 2. Clone & Style for Export
    // We clone the node to modify styles (like background) without affecting the UI
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;
    clonedSvg.setAttribute("width", width.toString());
    clonedSvg.setAttribute("height", height.toString());
    clonedSvg.style.backgroundColor = "#0a0a0e"; // Hardcode dark theme background

    // 3. Serialize to XML String
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(clonedSvg);

    // Namespace Injection: Critical for browser compatibility when converting to Image
    if (!svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    // encodeURIComponent ensures UTF-8 characters are preserved correctly
    const base64SVG = window.btoa(unescape(encodeURIComponent(svgString)));
    const dataUrl = `data:image/svg+xml;base64,${base64SVG}`;

    const img = new Image();
    
    // Set Cross-Origin to Anonymous to prevent "Tainted Canvas" security errors
    img.crossOrigin = "Anonymous";

    img.onload = () => {
        console.log("🖼️ Image successfully loaded as Base64.");
        
        // 3x Scaling for High-DPI (Retina) quality export
        const scale = 3; 
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.scale(scale, scale);
        ctx.fillStyle = "#0a0a0e"; 
        ctx.fillRect(0, 0, width, height);

        // Draw the image onto the canvas
        ctx.drawImage(img, 0, 0, width, height);

        try {
            // Attempt to export as PNG
            const pngUrl = canvas.toDataURL('image/png');
            
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = `melita-diagram-${Date.now()}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            console.log("🚀 PNG downloaded successfully.");
        } catch (e) {
            console.error("❌ PNG Conversion Error (Tainted Canvas):", e);
            // Fallback: Graceful degradation to SVG download if Canvas security blocks export
            alert("PNG export blocked due to security restrictions; downloading SVG fallback.");
            downloadSVG(svgString);
        }
    };

    img.onerror = (e) => {
        console.error("❌ Image loading error:", e);
        alert("Image generation failed. Downloading SVG fallback.");
        downloadSVG(svgString);
    };

    img.src = dataUrl;
  };

  /**
   * Helper: Downloads the raw SVG vector file.
   * Used as a fallback mechanism or for users who prefer vector formats.
   */
  const downloadSVG = (svgString: string) => {
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `melita-diagram-${Date.now()}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-400 font-mono p-8 border border-red-900/50 rounded bg-red-950/20">
        <span className="mr-2">⚠️</span> {error}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0a0a0e] rounded-lg border border-gray-800 group">
      
      {/* CONTROL OVERLAY (Top Right) - Visibility on hover */}
      <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        <button onClick={() => setZoomLevel(z => z + 0.1)} className="p-2 bg-gray-800/80 hover:bg-gray-700 text-gray-300 rounded backdrop-blur-sm transition-colors" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
        <button onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.1))} className="p-2 bg-gray-800/80 hover:bg-gray-700 text-gray-300 rounded backdrop-blur-sm transition-colors" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
        <button onClick={() => setZoomLevel(1)} className="p-2 bg-gray-800/80 hover:bg-gray-700 text-gray-300 rounded backdrop-blur-sm transition-colors" title="Reset Zoom"><Maximize2 className="w-4 h-4" /></button>
        
        {/* DOWNLOAD ACTION */}
        <button 
          onClick={handleDownload}
          title="Download Diagram (High-Res PNG)"
          className="p-2 bg-fuchsia-600/90 hover:bg-fuchsia-500 text-white rounded backdrop-blur-sm transition-colors shadow-[0_0_15px_rgba(192,38,211,0.4)] ml-2"
        >
            <Download className="w-4 h-4" />
        </button>
      </div>

      {/* RENDER CONTAINER */}
      <div 
        ref={containerRef}
        className="w-full h-full overflow-auto flex items-center justify-center p-8 cursor-grab active:cursor-grabbing scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent"
        dangerouslySetInnerHTML={{ __html: svgContent }}
        style={{ 
            transform: `scale(${zoomLevel})`, 
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease-out'
        }}
      />
    </div>
  );
};

export default MermaidDiagram;
