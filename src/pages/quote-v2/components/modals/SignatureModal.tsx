/**
 * SignatureModal Component - T141
 *
 * Expanded signature pad modal triggered by clicking collapsed pad on Sign screen.
 *
 * Features:
 * - Larger canvas (800x300) for easier signing
 * - Same Clear/Accept buttons as SignatureCanvas
 * - FocusLock to trap focus within modal
 * - ARIA labels for accessibility
 * - ESC key closes modal
 * - Backdrop click closes modal
 *
 * Usage:
 * ```tsx
 * <SignatureModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   onSave={(data) => handleSaveSignature(data)}
 * />
 * ```
 */

import React, { useEffect } from 'react';
import FocusLock from 'react-focus-lock';
import { Title } from '@sureapp/canary-design-system';
import { SignatureCanvas } from '../SignatureCanvas';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: string) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({ isOpen, onClose, onSave }) => {
  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = (data: string) => {
    onSave(data);
    onClose();
  };

  return (
    <div
      className="tech-startup-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="signature-modal-title"
    >
      <FocusLock>
        <div
          className="tech-startup-modal-content"
          style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '40px',
            maxWidth: '900px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Title variant="title-3" id="signature-modal-title" style={{ marginBottom: '24px' }}>
            Sign Here
          </Title>

          <SignatureCanvas onSave={handleSave} width={800} height={300} />
        </div>
      </FocusLock>
    </div>
  );
};
