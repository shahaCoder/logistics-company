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
      if (canvasRef.current && sigPadRef.current) {
        const containerWidth = canvasRef.current.parentElement?.offsetWidth || window.innerWidth - 64;
        const isMobile = window.innerWidth < 768;
        const calculatedWidth = isMobile ? Math.min(containerWidth, width) : width;
        const calculatedHeight = isMobile ? Math.min(calculatedWidth * 0.5, height) : height;
        
        // Save current signature before resize
        let currentDataUrl: string | null = null;
        try {
          if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
            currentDataUrl = sigPadRef.current.toDataURL("image/png");
          }
        } catch (error) {
          console.warn('Failed to save signature before resize:', error);
        }
        
        setCanvasSize({
          width: calculatedWidth,
          height: calculatedHeight,
        });

        // Resize canvas if it exists
        const canvas = sigPadRef.current.getCanvas();
        const ctx = canvas.getContext('2d');
        if (ctx && currentDataUrl) {
          canvas.width = calculatedWidth;
          canvas.height = calculatedHeight;
          
          // Restore signature after resize
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, calculatedWidth, calculatedHeight);
            // Trigger save after restore to ensure it's saved
            setTimeout(() => {
              if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
                saveSignature();
              }
            }, 50);
          };
          img.onerror = () => {
            console.error('Failed to restore signature after resize');
          };
          img.src = currentDataUrl;
        } else if (ctx) {
          // Just resize if no signature to restore
          canvas.width = calculatedWidth;
          canvas.height = calculatedHeight;
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
        if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
          saveSignature();
        }
      }, 200); // Debounce 200ms (reduced for faster save)
    };

    // Listen to canvas drawing events
    canvas.addEventListener("mouseup", handleCanvasChange);
    canvas.addEventListener("touchend", handleCanvasChange);
    canvas.addEventListener("mouseleave", handleCanvasChange); // Save when mouse leaves canvas
    canvas.addEventListener("pointerup", handleCanvasChange); // Also listen to pointer events

    return () => {
      canvas.removeEventListener("mouseup", handleCanvasChange);
      canvas.removeEventListener("touchend", handleCanvasChange);
      canvas.removeEventListener("mouseleave", handleCanvasChange);
      canvas.removeEventListener("pointerup", handleCanvasChange);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        // Save immediately on unmount if there's pending save
        if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
          saveSignature();
        }
      }
    };
  }, [autoSave, saveSignature]);

  const handleClear = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
      setIsRestored(false);
      onClear();
    }
  };

  // Save signature when component loses focus or unmounts
  useEffect(() => {
    const handleBlur = () => {
      if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
        // Small delay to ensure drawing is complete
        setTimeout(() => {
          saveSignature();
        }, 100);
      }
    };

    const handleBeforeUnload = () => {
      if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
        saveSignature();
      }
    };

    // Add blur listener to canvas container
    const container = canvasRef.current;
    if (container) {
      container.addEventListener('blur', handleBlur, true);
    }
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (container) {
        container.removeEventListener('blur', handleBlur, true);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Save on unmount if there's a signature
      if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
        saveSignature();
      }
    };
  }, [saveSignature]);

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
    <div className="w-full">
      {/* Canvas on the left */}
      <div className="flex flex-col items-start gap-3">
        <div
          ref={canvasRef}
          className="border-2 border-gray-300 rounded-lg bg-white overflow-hidden"
          style={{ 
            maxWidth: `${width}px`,
            width: "100%",
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
        
        {/* Clear button and instruction below canvas */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={false}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
          <p className="text-xs text-gray-500">
            Draw your signature above
          </p>
        </div>
      </div>
    </div>
  );
}

