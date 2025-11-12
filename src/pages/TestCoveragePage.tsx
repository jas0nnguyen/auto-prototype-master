import React, { useState } from 'react';
import { quoteApi } from '../services/quote-api';

/**
 * Simple test page to verify Medical Payments slider functionality
 * Access at: http://localhost:5173/test-coverage
 */
export const TestCoveragePage: React.FC = () => {
  const [quoteNumber] = useState('DZCH74DEZX');
  const [biLiability, setBiLiability] = useState('100000/300000');
  const [pdLiability, setPdLiability] = useState('50000');
  const [medicalPayments, setMedicalPayments] = useState(5000);
  const [premium, setPremium] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
  };

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    addLog(`Updating coverage: BI=${biLiability}, PD=${pdLiability}, Medical=$${medicalPayments}`);

    try {
      const payload = {
        coverage_bodily_injury_limit: biLiability,
        coverage_property_damage_limit: pdLiability,
        coverage_medical_payments_limit: medicalPayments,
        coverage_collision: true,
        coverage_comprehensive: true,
      };

      addLog(`Payload: ${JSON.stringify(payload)}`);

      const response = await quoteApi.updateQuoteCoverage(quoteNumber, payload);

      setPremium(response.premium);
      addLog(`✅ Success! Premium: $${response.premium}`);
    } catch (err: any) {
      const errorMsg = err.message || 'Unknown error';
      setError(errorMsg);
      addLog(`❌ Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', fontFamily: 'system-ui' }}>
      <h1>🧪 Medical Payments Test Page</h1>
      <p>Testing that Medical Payments slider updates pricing via API</p>

      <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
            Bodily Injury Liability
          </label>
          <select
            value={biLiability}
            onChange={(e) => setBiLiability(e.target.value)}
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          >
            <option value="100000/300000">$100,000 / $300,000</option>
            <option value="250000/500000">$250,000 / $500,000</option>
            <option value="500000/1000000">$500,000 / $1,000,000</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
            Property Damage Liability: ${pdLiability}
          </label>
          <input
            type="range"
            min="50000"
            max="500000"
            step="50000"
            value={pdLiability}
            onChange={(e) => setPdLiability(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
            Medical Payments: ${medicalPayments.toLocaleString()}
          </label>
          <input
            type="range"
            min="1000"
            max="25000"
            step="1000"
            value={medicalPayments}
            onChange={(e) => setMedicalPayments(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <button
          onClick={handleUpdate}
          disabled={loading}
          style={{
            background: loading ? '#ccc' : '#2196F3',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            width: '100%'
          }}
        >
          {loading ? 'Updating...' : 'Update Coverage & Get Price'}
        </button>

        <div style={{ marginTop: '30px', padding: '20px', background: '#e3f2fd', borderRadius: '8px' }}>
          <div style={{ color: '#666', fontSize: '14px' }}>Current Premium</div>
          <div style={{ fontSize: '32px', color: '#1976D2', fontWeight: 'bold' }}>
            {premium !== null ? `$${premium}` : (error ? 'Error' : 'Click button to load')}
          </div>
        </div>

        {error && (
          <div style={{ marginTop: '20px', padding: '15px', background: '#ffebee', borderRadius: '4px', color: '#c62828' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div style={{ marginTop: '30px', padding: '15px', background: '#f5f5f5', borderRadius: '4px', maxHeight: '300px', overflowY: 'auto' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Request Log</h3>
          {logs.map((log, idx) => (
            <div key={idx} style={{ fontFamily: 'monospace', fontSize: '12px', marginBottom: '5px' }}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
