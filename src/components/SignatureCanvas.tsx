"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import SignatureCanvas from "react-signature-canvas";

interface SignatureCanvasProps {
  onSave: (dataUrl: string) => void;
  onClear: () => void;
  width?: number;
  height?: number;
  backgroundColor?: string;
  penColor?: string;
  autoSave?: boolean;
  initialDataUrl?: string; // For restoring signature from saved file
}

export default function SignatureCanvasComponent({
  onSave,
  onClear,
  width = 400,
  height = 200,
  backgroundColor = "#ffffff",
  penColor = "#000000",
  autoSave = false,
  initialDataUrl,
}: SignatureCanvasProps) {
  const sigPadRef = useRef<SignatureCanvas>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width, height });
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isRestored, setIsRestored] = useState(false);

  const saveSignature = useCallback(() => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      const dataUrl = sigPadRef.current.toDataURL("image/png");
      onSave(dataUrl);
    }
  }, [onSave]);

  // Calculate responsive canvas size
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        const containerWidth = canvasRef.current.parentElement?.offsetWidth || window.innerWidth - 64;
        const isMobile = window.innerWidth < 768;
        const calculatedWidth = isMobile ? Math.min(containerWidth, width) : width;
        const calculatedHeight = isMobile ? Math.min(calculatedWidth * 0.5, height) : height;
        
        setCanvasSize({
          width: calculatedWidth,
          height: calculatedHeight,
        });

        // Resize canvas if it exists
        if (sigPadRef.current) {
          const canvas = sigPadRef.current.getCanvas();
          canvas.width = calculatedWidth;
          canvas.height = calculatedHeight;
          // Clear and redraw if needed
          sigPadRef.current.clear();
        }
      }
    };

    // Initial size
    const timer = setTimeout(updateSize, 100);
    window.addEventListener("resize", updateSize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateSize);
    };
  }, [width, height]);

  // Auto-save on canvas change
  useEffect(() => {
    if (!autoSave || !sigPadRef.current) return;

    const canvas = sigPadRef.current.getCanvas();
    const handleCanvasChange = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveSignature();
      }, 500); // Debounce 500ms
    };

    // Listen to canvas drawing events
    canvas.addEventListener("mouseup", handleCanvasChange);
    canvas.addEventListener("touchend", handleCanvasChange);

    return () => {
      canvas.removeEventListener("mouseup", handleCanvasChange);
      canvas.removeEventListener("touchend", handleCanvasChange);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [autoSave, saveSignature]);

  const handleClear = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
      onClear();
    }
  };

  // Restore signature from initialDataUrl if provided
  useEffect(() => {
    if (initialDataUrl && sigPadRef.current) {
      const img = new Image();
      img.onload = () => {
        if (sigPadRef.current) {
          const canvas = sigPadRef.current.getCanvas();
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            setIsRestored(true);
          }
        }
      };
      img.onerror = () => {
        console.error('Failed to load signature image');
      };
      img.src = initialDataUrl;
    } else if (!initialDataUrl && isRestored) {
      // Reset flag when dataUrl is cleared
      setIsRestored(false);
    }
  }, [initialDataUrl, isRestored]);

  // Expose save function via ref
  useEffect(() => {
    if (sigPadRef.current) {
      (sigPadRef.current as any).saveSignature = saveSignature;
    }
  }, [saveSignature]);

  return (
    <div className="space-y-3 w-full">
      <div
        ref={canvasRef}
        className="border-2 border-gray-300 rounded-lg bg-white w-full overflow-hidden"
        style={{ 
          maxWidth: `${width}px`,
          aspectRatio: `${width} / ${height}`,
          minHeight: "150px",
        }}
      >
        <SignatureCanvas
          ref={sigPadRef}
          canvasProps={{
            width: canvasSize.width,
            height: canvasSize.height,
            className: "signature-canvas",
            style: {
              width: "100%",
              height: "100%",
              touchAction: "none",
              display: "block",
            },
          }}
          backgroundColor={backgroundColor}
          penColor={penColor}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleClear}
          className="flex-1 sm:flex-initial px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium transition"
        >
          Clear
        </button>
      </div>
      <p className="text-xs text-gray-500 text-center sm:text-left">
        Draw your signature above
      </p>
    </div>
  );
}

