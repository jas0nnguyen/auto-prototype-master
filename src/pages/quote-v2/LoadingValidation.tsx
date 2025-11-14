import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EverestLayout } from '../../components/everest/layout/EverestLayout';
import { EverestLoadingAnimation } from '../../components/everest/specialized/EverestLoadingAnimation';
import { EverestText } from '../../components/everest/core/EverestText';
import { useQuoteByNumber } from '../../hooks/useQuote';
import './LoadingValidation.css';

/**
 * LoadingValidation Screen (Screen 08 of 16) - Everest Design
 *
 * Displays loading animation while finalizing the quote:
 * 1. Vehicle valuation (~2s) - simulates external lookup
 * 2. Driver records check (~2s) - simulates MVR lookup
 * 3. Finalizing premium calculation (~1s) - final recalculation
 *
 * Design:
 * - Full-page loading animation with car icon
 * - Cycling status messages with progress bar
 * - No card wrapper (full screen experience)
 * - Auto-navigates to Review screen when complete
 */

const LoadingValidation: React.FC = () => {
  const navigate = useNavigate();
  const { quoteNumber } = useParams<{ quoteNumber: string }>();

  // Get quote data to verify it exists
  const { data: quote } = useQuoteByNumber(quoteNumber);

  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Vehicle valuation...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // T098: LoadingValidation orchestration
    // Note: Premium calculation already happened in Coverage/AddOns screens
    // This screen simulates final validation checks before Review
    const runValidation = async () => {
      try {
        if (!quote) {
          throw new Error('Quote not found. Please start over.');
        }

        // Step 1: Vehicle valuation (0-33%)
        setCurrentStep('Vehicle valuation...');
        setProgress(10);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProgress(33);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 2: Driver records check (33-66%)
        setCurrentStep('Driver records check...');
        setProgress(40);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProgress(66);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 3: Finalizing premium calculation (66-100%)
        setCurrentStep('Finalizing premium calculation...');
        setProgress(75);
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress(100);
        await new Promise(resolve => setTimeout(resolve, 500));

        // Navigate to review screen after all steps complete
        setTimeout(() => {
          navigate(`/quote-v2/review/${quoteNumber}`);
        }, 500);

      } catch (err) {
        console.error('[LoadingValidation] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to finalize quote. Please try again.');
        setProgress(0);
      }
    };

    if (quote) {
      runValidation();
    }
  }, [navigate, quote, quoteNumber]);

  return (
    <EverestLayout noBackgroundImage>
      <div className="loading-validation-container">
        <EverestLoadingAnimation
          message={currentStep}
          progress={progress}
          overlay
        />

        {error && (
          <div className="loading-validation-error">
            <EverestText variant="body" className="loading-validation-error-message">
              {error}
            </EverestText>
            <EverestText variant="small">
              <a href="/quote-v2/get-started" className="loading-validation-retry-link">
                Start over
              </a>
            </EverestText>
          </div>
        )}
      </div>
    </EverestLayout>
  );
};

export default LoadingValidation;
