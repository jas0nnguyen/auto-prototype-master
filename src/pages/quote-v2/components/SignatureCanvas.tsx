/**
 * SignatureCanvas Component - T139
 *
 * Wrapper around react-signature-canvas for capturing user signatures.
 *
 * Features:
 * - Drawing with mouse or touch input
 * - Clear button to reset canvas
 * - Save validation (prevents empty signatures)
 * - Exports to base64 PNG data URL
 *
 * Props:
 * - onSave: Callback receiving base64 PNG data when signature accepted
 * - width: Canvas width (default: 500px)
 * - height: Canvas height (default: 200px)
 *
 * Usage:
 * ```tsx
 * <SignatureCanvas
 *   onSave={(data) => console.log('Signature saved:', data)}
 *   width={800}
 *   height={300}
 * />
 * ```
 */

import React, { useRef } from 'react';
import SignaturePad from 'react-signature-canvas';
import { Button, Layout } from '@sureapp/canary-design-system';
import './SignatureCanvas.css';

interface SignatureCanvasProps {
  onSave: (data: string) => void;
  width?: number;
  height?: number;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  onSave,
  width = 500,
  height = 200,
}) => {
  const sigPadRef = useRef<SignaturePad>(null);

  /**
   * Clear the signature canvas
   */
  const handleClear = () => {
    sigPadRef.current?.clear();
  };

  /**
   * Save the signature and export as base64 PNG
   * Validates that signature is not empty before saving
   */
  const handleSave = () => {
    if (sigPadRef.current?.isEmpty()) {
      alert('Please provide a signature');
      return;
    }

    // Export canvas to base64 PNG data URL
    const dataURL = sigPadRef.current?.toDataURL('image/png');
    if (dataURL) {
      onSave(dataURL);
    }
  };

  return (
    <div className="signature-canvas-container">
      <SignaturePad
        ref={sigPadRef}
        canvasProps={{
          width,
          height,
          className: 'signature-canvas',
        }}
      />

      <Layout display="flex" gap="medium" flexJustify="flex-end" style={{ marginTop: '16px' }}>
        <Button variant="secondary" onClick={handleClear}>
          Clear
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Accept Signature
        </Button>
      </Layout>
    </div>
  );
};
