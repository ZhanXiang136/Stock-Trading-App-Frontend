const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const PERFORMANCE_ENDPOINT = import.meta.env.DEV
  ? '/api/performance'
  : `${API_BASE_URL.replace(/\/$/, '')}/api/performance`;

export async function fetchPerformanceData({ signal } = {}) {
  let response;

  try {
    response = await fetch(PERFORMANCE_ENDPOINT, { signal });
  } catch (error) {
    throw new Error('Unable to reach the performance API. Confirm the backend is running.');
  }

  if (!response.ok) {
    throw new Error('Failed to fetch performance data');
  }

  return response.json();
}
