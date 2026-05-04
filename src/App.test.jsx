import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import App from './App.jsx';

vi.mock('react-chartjs-2', () => ({
  Line: ({ data, options }) => (
    <div data-testid="line-chart">
      <span>{data.labels.join(',')}</span>
      <span>{data.datasets[0].label}</span>
      <span>{options.scales.percent.title.text}</span>
    </div>
  ),
}));

const mockPerformanceData = {
  sp500: {
    '2026-04-01': 1.5,
    '2026-04-02': 2.1,
  },
  nasdaq: {
    '2026-04-01': 1.2,
    '2026-04-03': 2.8,
  },
  bot_equity: {
    '2026-04-01': 10000,
    '2026-04-02': 10150,
  },
};

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  global.fetch = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('renders loading state before performance data resolves', () => {
  global.fetch.mockReturnValue(new Promise(() => {}));

  render(<App />);

  expect(screen.getByText(/loading performance data/i)).toBeInTheDocument();
});

test('renders normalized chart labels and return axis after fetching performance data', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => mockPerformanceData,
  });

  render(<App />);

  expect(await screen.findByText(/trading bot vs. market indices/i)).toBeInTheDocument();
  expect(screen.getByTestId('line-chart')).toHaveTextContent(
    '2026-04-01,2026-04-02,2026-04-03'
  );
  expect(screen.getByText(/bot return %/i)).toBeInTheDocument();
  expect(screen.getByText(/^return$/i)).toBeInTheDocument();
  expect(screen.getByText(/last updated:/i)).toBeInTheDocument();
});

test('shows backend index errors when benchmark series are empty', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      ...mockPerformanceData,
      sp500: {},
      nasdaq: {},
      index_errors: {
        sp500: 'No close price data returned for ^GSPC',
        nasdaq: 'No close price data returned for ^IXIC',
      },
    }),
  });

  render(<App />);

  expect(await screen.findByText(/some series are not available/i)).toBeInTheDocument();
  expect(screen.getByText(/S&P 500: No close price data returned for \^GSPC/i)).toBeInTheDocument();
  expect(screen.getByText(/NASDAQ: No close price data returned for \^IXIC/i)).toBeInTheDocument();
});

test('shows an error when the API request fails', async () => {
  global.fetch.mockResolvedValue({
    ok: false,
    json: async () => ({}),
  });

  render(<App />);

  expect(await screen.findByText(/failed to fetch performance data/i)).toBeInTheDocument();
});

test('shows an error when required series are missing', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => ({ sp500: {}, nasdaq: {} }),
  });

  render(<App />);

  expect(await screen.findByText(/missing "bot_equity" series/i)).toBeInTheDocument();
});

test('shows an error when a series contains non-numeric values', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      ...mockPerformanceData,
      sp500: {
        '2026-04-01': 'N/A',
      },
    }),
  });

  render(<App />);

  expect(await screen.findByText(/invalid value for "sp500"/i)).toBeInTheDocument();
});

test('shows an empty state when all series are empty', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => ({ sp500: {}, nasdaq: {}, bot_equity: {} }),
  });

  render(<App />);

  expect(await screen.findByText(/no performance data available/i)).toBeInTheDocument();
});

test('refresh button fetches updated performance data', async () => {
  const user = userEvent.setup();
  global.fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => mockPerformanceData,
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...mockPerformanceData,
        sp500: {
          ...mockPerformanceData.sp500,
          '2026-04-04': 3.3,
        },
      }),
    });

  render(<App />);

  await screen.findByTestId('line-chart');
  await user.click(screen.getByRole('button', { name: /refresh/i }));

  expect(await screen.findByText(/2026-04-04/)).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledTimes(2);
});
