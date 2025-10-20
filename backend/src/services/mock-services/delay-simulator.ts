/**
 * Delay Simulator for Mock Services
 *
 * Simulates realistic network latency and processing delays for mock services.
 * Uses LogNormal distribution to model real-world API response times which
 * typically have:
 * - A median response time (most requests)
 * - A long tail (some slow requests)
 * - Occasional very slow outliers
 *
 * LogNormal distribution is ideal for modeling:
 * - Network latency
 * - API response times
 * - Database query times
 * - Any right-skewed positive values
 *
 * Example: If median is 500ms, most requests will be 300-700ms,
 * but some will be 1000-2000ms, and rare outliers could be 3000ms+.
 *
 * Reference: https://en.wikipedia.org/wiki/Log-normal_distribution
 */

/**
 * Delay scenario types for different testing needs
 */
export enum DelayScenario {
  /**
   * Happy path - fast responses, no errors
   * Median: target delay, very low variance
   */
  HAPPY_PATH = 'happy-path',

  /**
   * Realistic - normal distribution of response times
   * Median: target delay, moderate variance, some slow responses
   */
  REALISTIC = 'realistic',

  /**
   * Network issues - high latency, high variance
   * Median: 3x target delay, high variance, frequent slow responses
   */
  NETWORK_ISSUES = 'network-issues',

  /**
   * Server errors - occasional timeouts and errors
   * Some requests take very long or fail
   */
  SERVER_ERRORS = 'server-errors',
}

/**
 * Service delay configuration
 */
export interface DelayConfig {
  /**
   * Base delay in milliseconds (median response time)
   */
  baseDelayMs: number;

  /**
   * Delay scenario to simulate
   */
  scenario: DelayScenario;

  /**
   * Optional variance multiplier (default: 1.0)
   * Higher values = more variance in response times
   */
  varianceMultiplier?: number;

  /**
   * Optional minimum delay (default: 0ms)
   * Useful to ensure some baseline latency
   */
  minDelayMs?: number;

  /**
   * Optional maximum delay (default: no cap)
   * Useful to prevent extremely long delays
   */
  maxDelayMs?: number;
}

/**
 * Delay result with metadata
 */
export interface DelayResult {
  /**
   * Actual delay in milliseconds
   */
  delayMs: number;

  /**
   * Scenario used
   */
  scenario: DelayScenario;

  /**
   * Whether this delay is an outlier (> 95th percentile)
   */
  isOutlier: boolean;

  /**
   * Simulated error (if scenario includes errors)
   */
  simulatedError?: {
    type: 'TIMEOUT' | 'SERVER_ERROR' | 'NETWORK_ERROR';
    message: string;
  };
}

/**
 * Delay Simulator Class
 *
 * Provides methods to simulate realistic delays for mock services.
 */
export class DelaySimulator {
  /**
   * Generate a delay based on LogNormal distribution
   *
   * LogNormal is defined by:
   * - μ (mu): Mean of the natural log
   * - σ (sigma): Standard deviation of the natural log
   *
   * For a given median M and variance σ²:
   * - μ = ln(M)
   * - X = e^(μ + σ*Z) where Z ~ N(0,1)
   *
   * @param config - Delay configuration
   * @returns Promise that resolves after the delay
   */
  static async simulate(config: DelayConfig): Promise<DelayResult> {
    // Determine parameters based on scenario
    const params = this.getScenarioParameters(config);

    // Check if we should simulate an error
    if (params.errorProbability > 0 && Math.random() < params.errorProbability) {
      const error = this.generateSimulatedError();
      return {
        delayMs: 0,
        scenario: config.scenario,
        isOutlier: false,
        simulatedError: error,
      };
    }

    // Generate delay using LogNormal distribution
    const delayMs = this.generateLogNormalDelay(
      params.medianMs,
      params.sigma,
      config.minDelayMs,
      config.maxDelayMs
    );

    // Determine if this is an outlier (> 95th percentile)
    const percentile95 = this.getPercentile95(params.medianMs, params.sigma);
    const isOutlier = delayMs > percentile95;

    // Actually wait for the delay
    await this.wait(delayMs);

    return {
      delayMs,
      scenario: config.scenario,
      isOutlier,
    };
  }

  /**
   * Generate delay using Box-Muller transform to create normal distribution,
   * then exponentiate to get LogNormal distribution
   *
   * Box-Muller: Converts uniform random variables to normal distribution
   * LogNormal: X = exp(μ + σ*Z) where Z ~ N(0,1)
   */
  private static generateLogNormalDelay(
    medianMs: number,
    sigma: number,
    minMs: number = 0,
    maxMs?: number
  ): number {
    // Calculate μ (mean of the log)
    const mu = Math.log(medianMs);

    // Generate standard normal random variable using Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

    // Generate LogNormal value
    const logNormalValue = Math.exp(mu + sigma * z);

    // Apply min/max constraints
    let delay = logNormalValue;
    if (minMs !== undefined) {
      delay = Math.max(delay, minMs);
    }
    if (maxMs !== undefined) {
      delay = Math.min(delay, maxMs);
    }

    return Math.round(delay);
  }

  /**
   * Get scenario-specific parameters
   */
  private static getScenarioParameters(config: DelayConfig): {
    medianMs: number;
    sigma: number;
    errorProbability: number;
  } {
    const varianceMultiplier = config.varianceMultiplier || 1.0;

    switch (config.scenario) {
      case DelayScenario.HAPPY_PATH:
        return {
          medianMs: config.baseDelayMs,
          sigma: 0.1 * varianceMultiplier, // Very low variance
          errorProbability: 0, // No errors
        };

      case DelayScenario.REALISTIC:
        return {
          medianMs: config.baseDelayMs,
          sigma: 0.5 * varianceMultiplier, // Moderate variance
          errorProbability: 0.01, // 1% error rate
        };

      case DelayScenario.NETWORK_ISSUES:
        return {
          medianMs: config.baseDelayMs * 3, // 3x slower
          sigma: 1.0 * varianceMultiplier, // High variance
          errorProbability: 0.10, // 10% error rate
        };

      case DelayScenario.SERVER_ERRORS:
        return {
          medianMs: config.baseDelayMs * 2, // 2x slower
          sigma: 1.5 * varianceMultiplier, // Very high variance
          errorProbability: 0.20, // 20% error rate
        };

      default:
        return {
          medianMs: config.baseDelayMs,
          sigma: 0.5,
          errorProbability: 0,
        };
    }
  }

  /**
   * Calculate 95th percentile for LogNormal distribution
   *
   * P95 = exp(μ + 1.645*σ) where 1.645 is the z-score for 95th percentile
   */
  private static getPercentile95(medianMs: number, sigma: number): number {
    const mu = Math.log(medianMs);
    return Math.exp(mu + 1.645 * sigma);
  }

  /**
   * Generate a simulated error
   */
  private static generateSimulatedError(): {
    type: 'TIMEOUT' | 'SERVER_ERROR' | 'NETWORK_ERROR';
    message: string;
  } {
    const errorTypes = [
      {
        type: 'TIMEOUT' as const,
        message: 'Request timeout - service took too long to respond',
      },
      {
        type: 'SERVER_ERROR' as const,
        message: 'Internal server error - service encountered an error',
      },
      {
        type: 'NETWORK_ERROR' as const,
        message: 'Network error - unable to reach service',
      },
    ];

    return errorTypes[Math.floor(Math.random() * errorTypes.length)];
  }

  /**
   * Wait for specified milliseconds
   */
  private static wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Helper: Create a delay config from environment variables
   *
   * Example usage:
   * const config = DelaySimulator.fromEnv('MOCK_VIN_DECODER_DELAY_MS', DelayScenario.REALISTIC);
   */
  static fromEnv(
    envVarName: string,
    scenario: DelayScenario = DelayScenario.REALISTIC
  ): DelayConfig {
    const baseDelayMs = parseInt(process.env[envVarName] || '500', 10);

    return {
      baseDelayMs,
      scenario,
    };
  }

  /**
   * Helper: Create a delay config from scenario environment variable
   *
   * Reads MOCK_SCENARIO env var and creates appropriate delay config
   */
  static fromScenarioEnv(baseDelayMs: number): DelayConfig {
    const scenarioEnv = (process.env.MOCK_SCENARIO || 'realistic').toLowerCase();

    let scenario: DelayScenario;
    switch (scenarioEnv) {
      case 'happy-path':
        scenario = DelayScenario.HAPPY_PATH;
        break;
      case 'network-issues':
        scenario = DelayScenario.NETWORK_ISSUES;
        break;
      case 'server-errors':
        scenario = DelayScenario.SERVER_ERRORS;
        break;
      default:
        scenario = DelayScenario.REALISTIC;
    }

    return {
      baseDelayMs,
      scenario,
    };
  }

  /**
   * Helper: Log delay result for debugging
   */
  static logDelay(serviceName: string, result: DelayResult): void {
    if (result.simulatedError) {
      console.warn(
        `[${serviceName}] Simulated error: ${result.simulatedError.type} - ${result.simulatedError.message}`
      );
    } else {
      const outlierTag = result.isOutlier ? ' [OUTLIER]' : '';
      console.log(
        `[${serviceName}] Delay: ${result.delayMs}ms (scenario: ${result.scenario})${outlierTag}`
      );
    }
  }
}

/**
 * Example Usage:
 *
 * ```typescript
 * // In a mock service:
 * async decodingVIN(vin: string): Promise<VINDecodeResult> {
 *   // Simulate network delay
 *   const delayConfig = DelaySimulator.fromScenarioEnv(
 *     parseInt(process.env.MOCK_VIN_DECODER_DELAY_MS || '500')
 *   );
 *
 *   const delayResult = await DelaySimulator.simulate(delayConfig);
 *
 *   if (delayResult.simulatedError) {
 *     throw new Error(delayResult.simulatedError.message);
 *   }
 *
 *   // Continue with actual mock logic...
 *   return { ... };
 * }
 * ```
 */
