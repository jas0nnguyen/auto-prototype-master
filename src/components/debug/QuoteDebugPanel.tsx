/**
 * Quote Debug Panel
 *
 * Development-only tool for debugging quote flow
 * Toggle with Cmd+D or Ctrl+D
 */

import { useState, useEffect } from 'react';

interface ApiCall {
  id: string;
  timestamp: string;
  method: string;
  endpoint: string;
  request?: any;
  response?: any;
  duration?: number;
  status?: number;
}

export function QuoteDebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([]);
  const [selectedCall, setSelectedCall] = useState<ApiCall | null>(null);

  // Only show in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  // Keyboard shortcut (Cmd+D or Ctrl+D)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Listen for API calls (would be populated by interceptor)
  useEffect(() => {
    const handleApiCall = (event: CustomEvent<ApiCall>) => {
      setApiCalls((prev) => [event.detail, ...prev].slice(0, 10)); // Keep last 10
    };

    window.addEventListener('api-call' as any, handleApiCall);
    return () => window.removeEventListener('api-call' as any, handleApiCall);
  }, []);

  if (!isVisible) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          padding: '8px 16px',
          background: '#1a1a1a',
          color: '#00ff00',
          borderRadius: 8,
          fontSize: 12,
          fontFamily: 'monospace',
          cursor: 'pointer',
          zIndex: 9999,
          border: '1px solid #333',
        }}
        onClick={() => setIsVisible(true)}
      >
        🐛 Debug Panel (Cmd+D)
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: '50%',
        height: '60%',
        background: '#1a1a1a',
        color: '#e0e0e0',
        borderTopLeftRadius: 8,
        padding: 16,
        zIndex: 9999,
        overflow: 'auto',
        fontFamily: 'monospace',
        fontSize: 12,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          borderBottom: '1px solid #333',
          paddingBottom: 8,
        }}
      >
        <h3 style={{ margin: 0, color: '#00ff00' }}>🐛 Quote Debug Panel</h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: '#333',
            color: '#fff',
            border: 'none',
            padding: '4px 12px',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>

      {/* API Calls List */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ color: '#ffaa00', marginTop: 0 }}>Recent API Calls ({apiCalls.length}/10)</h4>
        {apiCalls.length === 0 ? (
          <p style={{ color: '#666' }}>No API calls yet. Make a quote request to see data.</p>
        ) : (
          <div>
            {apiCalls.map((call) => (
              <div
                key={call.id}
                onClick={() => setSelectedCall(call)}
                style={{
                  padding: 8,
                  marginBottom: 4,
                  background: selectedCall?.id === call.id ? '#2a2a2a' : '#222',
                  borderRadius: 4,
                  cursor: 'pointer',
                  border: selectedCall?.id === call.id ? '1px solid #00ff00' : '1px solid #333',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    <span style={{ color: call.status && call.status < 400 ? '#00ff00' : '#ff4444' }}>
                      [{call.status || '...'}]
                    </span>{' '}
                    <span style={{ color: '#ffaa00' }}>{call.method}</span> {call.endpoint}
                  </span>
                  <span style={{ color: '#666' }}>{call.timestamp}</span>
                </div>
                {call.duration && (
                  <div style={{ fontSize: 10, color: '#666' }}>Duration: {call.duration}ms</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Call Details */}
      {selectedCall && (
        <div>
          <h4 style={{ color: '#ffaa00' }}>Request/Response Details</h4>
          <div style={{ marginBottom: 12 }}>
            <strong style={{ color: '#00ff00' }}>Request:</strong>
            <pre
              style={{
                background: '#111',
                padding: 8,
                borderRadius: 4,
                overflow: 'auto',
                maxHeight: 200,
              }}
            >
              {JSON.stringify(selectedCall.request, null, 2)}
            </pre>
          </div>
          <div>
            <strong style={{ color: '#00ff00' }}>Response:</strong>
            <pre
              style={{
                background: '#111',
                padding: 8,
                borderRadius: 4,
                overflow: 'auto',
                maxHeight: 200,
              }}
            >
              {JSON.stringify(selectedCall.response, null, 2)}
            </pre>
          </div>

          {/* Premium Breakdown (if quote data) */}
          {selectedCall.response?.data?.quote_snapshot?.premium_snapshot && (
            <div style={{ marginTop: 12 }}>
              <h4 style={{ color: '#ffaa00' }}>Premium Calculation Breakdown</h4>
              <pre
                style={{
                  background: '#111',
                  padding: 8,
                  borderRadius: 4,
                  overflow: 'auto',
                }}
              >
                {JSON.stringify(selectedCall.response.data.quote_snapshot.premium_snapshot, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div
        style={{
          marginTop: 16,
          padding: 8,
          background: '#222',
          borderRadius: 4,
          fontSize: 11,
          color: '#999',
        }}
      >
        <strong>Tip:</strong> Press Cmd+D (Mac) or Ctrl+D (Windows/Linux) to toggle this panel.
        <br />
        This panel is only available in development mode.
      </div>
    </div>
  );
}

/**
 * API Call Interceptor
 *
 * Add this to your quote API service to log calls to the debug panel
 */
export function logApiCall(call: ApiCall) {
  if (import.meta.env.DEV) {
    const event = new CustomEvent('api-call', { detail: call });
    window.dispatchEvent(event);
  }
}
