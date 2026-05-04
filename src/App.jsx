import { useEffect, useRef, useState } from 'react';
import { fetchPerformanceData } from './api/performance';
import PerformanceChart from './components/PerformanceChart';
import {
  getSeriesWarnings,
  hasPerformanceData,
  validatePerformanceData,
} from './utils/performanceData';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const activeRequestRef = useRef(0);
  const activeControllerRef = useRef(null);

  const loadPerformance = async () => {
    activeControllerRef.current?.abort();

    const requestId = activeRequestRef.current + 1;
    const controller = new AbortController();
    activeRequestRef.current = requestId;
    activeControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const json = await fetchPerformanceData({ signal: controller.signal });

      if (activeRequestRef.current !== requestId) return;

      const validatedData = validatePerformanceData(json);
      setData(validatedData);
      setLastUpdated(new Date());
    } catch (err) {
      if (err.name === 'AbortError' || activeRequestRef.current !== requestId) return;

      setError(err.message);
      console.error('API Error:', err);
    } finally {
      if (activeRequestRef.current === requestId) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadPerformance();

    return () => {
      activeControllerRef.current?.abort();
    };
  }, []);

  if (isLoading && !data) {
    return <p className="status-message">Loading performance data...</p>;
  }

  const hasData = data && hasPerformanceData(data);
  const warnings = data ? getSeriesWarnings(data) : [];

  return (
    <main className="chart-container">
      <div className="chart-header">
        <h1>Trading Bot vs. Market Indices (30d)</h1>
        <button type="button" onClick={loadPerformance} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      {error && <p className="error">Error: {error}</p>}
      {warnings.length > 0 && (
        <div className="warning-panel" role="status">
          <p>Some series are not available from the backend:</p>
          <ul>
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
      {hasData && <PerformanceChart data={data} />}
      {data && !hasData && <p className="empty-state">No performance data available.</p>}
      {lastUpdated && (
        <p className="last-updated">
          Last updated: {lastUpdated.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZoneName: 'short',
          })}
        </p>
      )}
    </main>
  );
}

export default App;
