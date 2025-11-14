import React from 'react';
import './EverestLoadingAnimation.css';

/**
 * EverestLoadingAnimation Component
 *
 * Animated loading indicator with car icon and progress bar
 * - Animated car icon (blue)
 * - Progress bar with smooth animation
 * - Loading message
 * - Centered overlay layout
 *
 * Usage:
 * <EverestLoadingAnimation
 *   message="Calculating your quote..."
 *   progress={65}
 * />
 */

export interface EverestLoadingAnimationProps {
  /** Loading message to display */
  message?: string;
  /** Progress percentage (0-100), if provided shows progress bar */
  progress?: number;
  /** Optional CSS class name */
  className?: string;
  /** Show as full-page overlay */
  overlay?: boolean;
}

export const EverestLoadingAnimation: React.FC<EverestLoadingAnimationProps> = ({
  message = 'Loading...',
  progress,
  className = '',
  overlay = false,
}) => {
  return (
    <div
      className={`everest-loading ${overlay ? 'everest-loading-overlay' : ''} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="everest-loading-content">
        {/* Animated Car Icon */}
        <div className="everest-loading-icon">
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="everest-loading-car"
          >
            <path
              d="M5 11L6.5 6H17.5L19 11M5 11V17H6M5 11H19M19 11V17H18M6 17V18C6 18.5523 6.44772 19 7 19C7.55228 19 8 18.5523 8 18V17M6 17H8M18 17V18C18 18.5523 17.5523 19 17 19C16.4477 19 16 18.5523 16 18V17M18 17H16M8 17H16M8 17C8 15.8954 8.89543 15 10 15C11.1046 15 12 15.8954 12 17M16 17C16 15.8954 14.6569 15 13 15C11.3431 15 12 15.8954 12 17M12 17H12.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Loading Message */}
        <div className="everest-loading-message">{message}</div>

        {/* Progress Bar (optional) */}
        {progress !== undefined && (
          <div className="everest-loading-progress-container">
            <div
              className="everest-loading-progress-bar"
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        )}

        {/* Spinner Dots (when no progress provided) */}
        {progress === undefined && (
          <div className="everest-loading-dots">
            <span className="everest-loading-dot"></span>
            <span className="everest-loading-dot"></span>
            <span className="everest-loading-dot"></span>
          </div>
        )}
      </div>
    </div>
  );
};
