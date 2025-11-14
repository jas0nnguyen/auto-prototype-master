import React, { useEffect, useRef } from 'react';
import { Layout, Title, Text } from '@sureapp/canary-design-system';
import './LoadingAnimation.css';

/**
 * LoadingAnimation Component (T219)
 *
 * Displays animated loading progress with:
 * - Bouncing car icon
 * - Progress bar
 * - Step list with status indicators (spinner for active, checkmark for completed)
 *
 * Performance optimization (T219):
 * - Uses will-change for GPU acceleration during animation
 * - Removes will-change after completion to free GPU memory
 *
 * Used in LoadingPrefill (Screen 04) and LoadingValidation (Screen 08)
 */

export interface LoadingStep {
  label: string;
  status: 'pending' | 'loading' | 'completed';
}

interface LoadingAnimationProps {
  steps: LoadingStep[];
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ steps }) => {
  const completedCount = steps.filter(s => s.status === 'completed').length;
  const totalSteps = steps.length;
  const progressPercent = (completedCount / totalSteps) * 100;
  const carIconRef = useRef<HTMLDivElement>(null);
  const allCompleted = completedCount === totalSteps;

  /**
   * Performance Optimization (T219)
   *
   * Remove will-change after all animations complete to prevent
   * unnecessary GPU memory usage.
   */
  useEffect(() => {
    if (allCompleted && carIconRef.current) {
      // Wait for final animation to complete before removing will-change
      const timeout = setTimeout(() => {
        if (carIconRef.current) {
          carIconRef.current.style.willChange = 'auto';
        }
      }, 1000); // Wait 1s after completion

      return () => clearTimeout(timeout);
    }
  }, [allCompleted]);

  return (
    <div className="loading-animation-container">
      <Layout display="flex-column" gap="large" flexAlign="center">
        {/* Car Icon with Bounce Animation (T219: ref for will-change optimization) */}
        <div ref={carIconRef} className="loading-car-icon">
          <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 11l1.5-4.5h11L19 11m-1.5 5a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0zM9.5 16a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0zM5 11h14v5H5v-5z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <Title variant="title-2">Processing Your Quote</Title>

        {/* Progress Bar */}
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Steps List */}
        <Layout display="flex-column" gap="small" style={{ width: '100%', maxWidth: '400px' }}>
          {steps.map((step, index) => (
            <div key={index} className={`loading-step loading-step-${step.status}`}>
              <div className="step-indicator">
                {step.status === 'pending' && (
                  <div className="step-dot" />
                )}
                {step.status === 'loading' && (
                  <div className="spinner" />
                )}
                {step.status === 'completed' && (
                  <svg
                    className="checkmark"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 10l4 4L16 6"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              <Text
                variant="body-regular"
                style={{
                  fontWeight: step.status === 'loading' ? 600 : 400,
                  color: step.status === 'completed' ? '#10b981' : step.status === 'loading' ? '#1a202c' : '#718096'
                }}
              >
                {step.label}
              </Text>
            </div>
          ))}
        </Layout>
      </Layout>
    </div>
  );
};
