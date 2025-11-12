/**
 * useMockServices Custom Hook (T040)
 *
 * This hook orchestrates multiple mock service calls to simulate realistic
 * data fetching during LoadingPrefill and LoadingValidation screens.
 *
 * WHAT THIS HOOK DOES:
 * Simulates sequential API calls to external services:
 * 1. Insurance history lookup (prior claims, coverage)
 * 2. VIN decoder (vehicle details from VIN)
 * 3. Vehicle valuation (market value, replacement cost)
 * 4. Safety ratings (NHTSA crash test scores)
 * 5. MVR lookup (driver's motor vehicle record)
 *
 * WHY MOCK THESE SERVICES?
 * - No real API keys needed
 * - Faster development
 * - Predictable behavior for testing
 * - Demo-ready without external dependencies
 *
 * REALISTIC BEHAVIOR:
 * - Each step takes 2-3 seconds (simulates network latency)
 * - Steps run sequentially (like real API calls)
 * - Status updates as each step completes
 * - Total time: 10-15 seconds (realistic for quote generation)
 */

import { useState, useCallback } from 'react';

/**
 * Mock service step definition
 */
export interface MockServiceStep {
  /** Unique identifier for the step */
  id: string;
  /** Display label shown to user */
  label: string;
  /** Current status of the step */
  status: 'pending' | 'loading' | 'completed' | 'error';
  /** Optional error message if step fails */
  error?: string;
}

/**
 * Mock service configuration
 */
export interface MockServiceConfig {
  /** Which services to run (all enabled by default) */
  enabledServices?: {
    insuranceHistory?: boolean;
    vinDecoder?: boolean;
    vehicleValuation?: boolean;
    safetyRatings?: boolean;
    mvrLookup?: boolean;
  };
  /** Delay range for each step (min/max in milliseconds) */
  delayRange?: {
    min: number;
    max: number;
  };
  /** Whether to simulate random failures (for testing error handling) */
  simulateErrors?: boolean;
  /** Error probability (0-1) if simulateErrors is true */
  errorProbability?: number;
}

/**
 * useMockServices Hook Return Type
 */
export interface UseMockServicesResult {
  /** Array of service steps with current status */
  steps: MockServiceStep[];
  /** Overall loading state (true if any step is loading) */
  isLoading: boolean;
  /** Whether all steps completed successfully */
  isComplete: boolean;
  /** Whether any step failed */
  hasError: boolean;
  /** Start the mock service sequence */
  start: () => void;
  /** Reset all steps to pending */
  reset: () => void;
  /** Current step being processed (0-indexed) */
  currentStepIndex: number;
  /** Total number of steps */
  totalSteps: number;
}

/**
 * Default service steps
 */
const DEFAULT_STEPS: Omit<MockServiceStep, 'status'>[] = [
  {
    id: 'insurance-history',
    label: 'Checking insurance history...',
  },
  {
    id: 'vin-decoder',
    label: 'Decoding VIN...',
  },
  {
    id: 'vehicle-valuation',
    label: 'Calculating vehicle value...',
  },
  {
    id: 'safety-ratings',
    label: 'Retrieving safety ratings...',
  },
  {
    id: 'mvr-lookup',
    label: 'Verifying driver record...',
  },
];

/**
 * useMockServices Hook
 *
 * Usage:
 * ```typescript
 * // In LoadingPrefill.tsx
 * const {
 *   steps,
 *   isLoading,
 *   isComplete,
 *   start,
 * } = useMockServices({
 *   delayRange: { min: 2000, max: 3000 },
 * });
 *
 * useEffect(() => {
 *   start(); // Start sequence when component mounts
 * }, [start]);
 *
 * useEffect(() => {
 *   if (isComplete) {
 *     navigate('/next-page'); // Navigate when complete
 *   }
 * }, [isComplete, navigate]);
 *
 * return (
 *   <div>
 *     {steps.map((step) => (
 *       <div key={step.id}>
 *         <span>{step.label}</span>
 *         {step.status === 'loading' && <Spinner />}
 *         {step.status === 'completed' && <CheckIcon />}
 *         {step.status === 'error' && <ErrorIcon />}
 *       </div>
 *     ))}
 *   </div>
 * );
 * ```
 *
 * @param config - Configuration options
 * @returns Hook result with steps state and control functions
 */
export function useMockServices(config: MockServiceConfig = {}): UseMockServicesResult {
  /**
   * Destructure config with defaults
   */
  const {
    enabledServices = {},
    delayRange = { min: 2000, max: 3000 },
    simulateErrors = false,
    errorProbability = 0.1,
  } = config;

  /**
   * Filter steps based on enabled services
   */
  const filteredSteps = DEFAULT_STEPS.filter((step) => {
    switch (step.id) {
      case 'insurance-history':
        return enabledServices.insuranceHistory !== false;
      case 'vin-decoder':
        return enabledServices.vinDecoder !== false;
      case 'vehicle-valuation':
        return enabledServices.vehicleValuation !== false;
      case 'safety-ratings':
        return enabledServices.safetyRatings !== false;
      case 'mvr-lookup':
        return enabledServices.mvrLookup !== false;
      default:
        return true;
    }
  });

  /**
   * Initialize steps state with 'pending' status
   */
  const [steps, setSteps] = useState<MockServiceStep[]>(
    filteredSteps.map((step) => ({ ...step, status: 'pending' as const }))
  );

  /**
   * Current step index
   */
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);

  /**
   * Random delay generator
   *
   * Returns a random delay between min and max
   */
  const getRandomDelay = useCallback(() => {
    const { min, max } = delayRange;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }, [delayRange]);

  /**
   * Simulate a single service call
   *
   * @param stepIndex - Index of the step to simulate
   * @returns Promise that resolves after delay
   */
  const simulateServiceCall = useCallback(
    async (stepIndex: number): Promise<void> => {
      // Update step to 'loading'
      setSteps((prev) =>
        prev.map((step, idx) =>
          idx === stepIndex ? { ...step, status: 'loading' as const } : step
        )
      );

      // Wait for random delay
      const delay = getRandomDelay();
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Simulate error (if enabled)
      if (simulateErrors && Math.random() < errorProbability) {
        setSteps((prev) =>
          prev.map((step, idx) =>
            idx === stepIndex
              ? {
                  ...step,
                  status: 'error' as const,
                  error: 'Service temporarily unavailable',
                }
              : step
          )
        );
        throw new Error(`Step ${stepIndex} failed`);
      }

      // Update step to 'completed'
      setSteps((prev) =>
        prev.map((step, idx) =>
          idx === stepIndex ? { ...step, status: 'completed' as const } : step
        )
      );
    },
    [getRandomDelay, simulateErrors, errorProbability]
  );

  /**
   * Start the mock service sequence
   *
   * Runs each step sequentially, updating status as it goes.
   */
  const start = useCallback(async () => {
    // Reset if already started
    setCurrentStepIndex(0);

    // Run steps sequentially
    for (let i = 0; i < filteredSteps.length; i++) {
      setCurrentStepIndex(i);

      try {
        await simulateServiceCall(i);
      } catch (error) {
        console.error(`[useMockServices] Step ${i} failed:`, error);
        // Continue to next step even if this one fails
        // (or you could stop here by breaking)
      }
    }

    // Mark sequence as complete
    setCurrentStepIndex(filteredSteps.length);
  }, [filteredSteps.length, simulateServiceCall]);

  /**
   * Reset all steps to pending
   */
  const reset = useCallback(() => {
    setSteps(filteredSteps.map((step) => ({ ...step, status: 'pending' as const })));
    setCurrentStepIndex(-1);
  }, [filteredSteps]);

  /**
   * Computed states
   */
  const isLoading = steps.some((step) => step.status === 'loading');
  const isComplete = currentStepIndex === filteredSteps.length && !isLoading;
  const hasError = steps.some((step) => step.status === 'error');

  /**
   * Return hook result
   */
  return {
    steps,
    isLoading,
    isComplete,
    hasError,
    start,
    reset,
    currentStepIndex,
    totalSteps: filteredSteps.length,
  };
}

/**
 * ============================================================================
 * LEARNING SUMMARY: MOCK SERVICES & ORCHESTRATION
 * ============================================================================
 *
 * KEY CONCEPTS:
 *
 * 1. SERVICE ORCHESTRATION
 *    - Coordinate multiple async operations
 *    - Run in sequence or parallel
 *    - Track overall progress
 *    - Handle errors gracefully
 *
 * 2. STATE MACHINE PATTERN
 *    - Each step has defined states (pending → loading → completed/error)
 *    - State transitions controlled by logic
 *    - Predictable behavior
 *
 * 3. ASYNC OPERATIONS WITH SETTIMEOUT
 *    - setTimeout simulates network delay
 *    - Wrapped in Promise for async/await
 *    - Cancellable (if needed)
 *
 * 4. USEEFFECT FOR AUTO-START
 *    - Component mounts → start sequence
 *    - Completion → trigger navigation
 *    - Cleanup on unmount (if needed)
 *
 * 5. USECALLBACK FOR STABLE REFERENCES
 *    - Prevents recreating functions on every render
 *    - Important for useEffect dependencies
 *    - Better performance
 *
 * ANALOGIES:
 *
 * - useMockServices = Assembly Line
 *   - Multiple stations (steps)
 *   - Product moves through each (sequential)
 *   - Each takes time (delay)
 *   - Final product at end (complete quote)
 *
 * - Service Steps = Checkpoint System
 *   - Runner starts (pending)
 *   - Reaches checkpoint (loading)
 *   - Checks in (completed)
 *   - Or fails (error)
 *
 * - Sequential Execution = Relay Race
 *   - First runner starts
 *   - Finishes, passes baton
 *   - Next runner starts
 *   - All must complete for team win
 *
 * BEST PRACTICES:
 *
 * 1. Realistic Timing
 *    - 2-3 seconds per step (realistic API calls)
 *    - Random delays (more realistic)
 *    - Total time reasonable (10-15 seconds)
 *
 * 2. Visual Feedback
 *    - Show current step
 *    - Progress indicator
 *    - Completed steps marked
 *    - Errors clearly shown
 *
 * 3. Error Handling
 *    - Continue on errors (optional)
 *    - Show which step failed
 *    - Allow retry
 *    - Don't block entire flow
 *
 * 4. Configurable Behavior
 *    - Enable/disable steps
 *    - Adjust timing
 *    - Simulate errors for testing
 *
 * 5. Auto-Start Pattern
 *    - Start on mount
 *    - Navigate on complete
 *    - Reset if needed
 *
 * REAL-WORLD USE CASES:
 *
 * - Quote generation (this feature)
 * - Multi-step form submission
 * - Data import/migration
 * - Report generation
 * - Document processing
 * - Payment processing
 * - Account setup wizards
 *
 * TESTING CONSIDERATIONS:
 *
 * - Mock setTimeout for fast tests
 * - Test error handling
 * - Test all completion states
 * - Test navigation after complete
 * - Test reset functionality
 */
