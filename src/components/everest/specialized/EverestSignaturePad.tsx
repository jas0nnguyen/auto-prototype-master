import React, { useRef, useState, useEffect } from 'react';
import './EverestSignaturePad.css';

/**
 * EverestSignaturePad Component
 *
 * Canvas-based signature capture with touch and mouse support
 * - Expanded canvas area
 * - Blue signature stroke (#3b82f6)
 * - Clear button
 * - Export as data URL
 *
 * Usage:
 * <EverestSignaturePad
 *   onSignatureChange={(dataUrl) => setSignature(dataUrl)}
 *   label="Sign here"
 * />
 */

export interface EverestSignaturePadProps {
  /** Callback when signature changes (provides data URL) */
  onSignatureChange?: (dataUrl: string | null) => void;
  /** Label text */
  label?: string;
  /** Placeholder text shown in empty canvas */
  placeholder?: string;
  /** Optional CSS class name */
  className?: string;
  /** Canvas width */
  width?: number;
  /** Canvas height */
  height?: number;
}

export const EverestSignaturePad: React.FC<EverestSignaturePadProps> = ({
  onSignatureChange,
  label = 'Signature',
  placeholder = 'Sign here',
  className = '',
  width = 600,
  height = 200,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Configure drawing style
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [width, height]);

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      // Mouse event
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);

    // Prevent scrolling on touch devices
    if ('touches' in e) {
      e.preventDefault();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    setIsEmpty(false);

    // Prevent scrolling on touch devices
    if ('touches' in e) {
      e.preventDefault();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    setIsDrawing(false);

    // Export signature as data URL
    const canvas = canvasRef.current;
    if (canvas && onSignatureChange) {
      const dataUrl = canvas.toDataURL('image/png');
      onSignatureChange(dataUrl);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);

    if (onSignatureChange) {
      onSignatureChange(null);
    }
  };

  return (
    <div className={`everest-signature-container ${className}`}>
      {/* Label */}
      {label && <div className="everest-signature-label">{label}</div>}

      {/* Canvas wrapper */}
      <div className="everest-signature-wrapper">
        <canvas
          ref={canvasRef}
          className="everest-signature-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          aria-label={label}
        />

        {/* Placeholder */}
        {isEmpty && <div className="everest-signature-placeholder">{placeholder}</div>}

        {/* Clear button */}
        {!isEmpty && (
          <button
            type="button"
            className="everest-signature-clear"
            onClick={clearSignature}
            aria-label="Clear signature"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};
