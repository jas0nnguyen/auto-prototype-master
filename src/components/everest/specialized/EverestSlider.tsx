import React, { useState, useRef } from 'react';
import './EverestSlider.css';

/**
 * EverestSlider Component
 *
 * Custom range slider for numeric inputs
 * - Thumb size: 28px
 * - Blue track (#3b82f6)
 * - Shows current value
 * - Step support for increments
 *
 * Usage:
 * <EverestSlider
 *   label="Deductible"
 *   value={500}
 *   onChange={(value) => setDeductible(value)}
 *   min={250}
 *   max={2000}
 *   step={250}
 *   formatValue={(v) => `$${v}`}
 * />
 */

export interface EverestSliderProps {
  /** Current value */
  value: number;
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Label text */
  label?: string;
  /** Minimum value */
  min: number;
  /** Maximum value */
  max: number;
  /** Step increment */
  step?: number;
  /** Format value for display */
  formatValue?: (value: number) => string;
  /** Disabled state */
  disabled?: boolean;
  /** Optional CSS class name */
  className?: string;
  /** Optional ID */
  id?: string;
  /** Optional name for form submission */
  name?: string;
}

export const EverestSlider: React.FC<EverestSliderProps> = ({
  value,
  onChange,
  label,
  min,
  max,
  step = 1,
  formatValue = (v) => v.toString(),
  disabled = false,
  className = '',
  id,
  name,
}) => {
  const sliderId = id || name || `slider-${Math.random().toString(36).substr(2, 9)}`;
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Calculate percentage for fill
  const percentage = ((value - min) / (max - min)) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div className={`everest-slider-container ${className}`}>
      {/* Label and Value */}
      <div className="everest-slider-header">
        {label && (
          <label htmlFor={sliderId} className="everest-slider-label">
            {label}
          </label>
        )}
        <span className="everest-slider-value" aria-live="polite">
          {formatValue(value)}
        </span>
      </div>

      {/* Slider */}
      <div
        ref={sliderRef}
        className={`everest-slider-wrapper ${isDragging ? 'everest-slider-dragging' : ''}`}
      >
        <div className="everest-slider-track">
          <div
            className="everest-slider-fill"
            style={{ width: `${percentage}%` }}
            aria-hidden="true"
          />
        </div>
        <input
          type="range"
          id={sliderId}
          name={name}
          className="everest-slider-input"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onMouseDown={handleMouseDown}
          disabled={disabled}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={formatValue(value)}
        />
      </div>

      {/* Min/Max Labels */}
      <div className="everest-slider-labels">
        <span className="everest-slider-label-min">{formatValue(min)}</span>
        <span className="everest-slider-label-max">{formatValue(max)}</span>
      </div>
    </div>
  );
};
