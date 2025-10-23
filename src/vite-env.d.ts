/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Base URL for the backend API
   *
   * @example
   * // Development (with Vite proxy)
   * VITE_API_BASE_URL='/api/v1'
   *
   * @example
   * // Production (deployed backend)
   * VITE_API_BASE_URL='https://your-backend.vercel.app/api/v1'
   *
   * @example
   * // Local backend via tunnel (for testing deployed frontend)
   * VITE_API_BASE_URL='https://your-tunnel.ngrok.io/api/v1'
   */
  readonly VITE_API_BASE_URL?: string;

  /**
   * API request timeout in milliseconds
   * @default 10000
   */
  readonly VITE_API_TIMEOUT?: string;

  /**
   * Enable mock services for development
   * @default 'true'
   */
  readonly VITE_ENABLE_MOCK_SERVICES?: string;

  /**
   * Mock service scenario
   * @default 'realistic'
   */
  readonly VITE_MOCK_SCENARIO?: string;

  /**
   * Environment name
   * @default 'development'
   */
  readonly VITE_ENV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
