# Trading Bot Dashboard

React dashboard for comparing trading bot equity against S&P 500 and NASDAQ benchmark performance over the last 30 days.

## Tech Stack

- React with Vite
- Chart.js through `react-chartjs-2`
- Fetch API
- React Testing Library
- Vitest

## Setup
# Touch Andy
```bash
npm install
npm start
```

The app runs at `http://localhost:3000` by default.

## Environment

Create a local `.env` file when the backend is not running on the default URL:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

See [.env.example](./.env.example).

In local development, Vite proxies `/api` to `http://127.0.0.1:8000` so the browser does not need backend CORS headers. `VITE_API_BASE_URL` is used for production builds.

The frontend requests:

```text
GET /api/performance
```

## API Contract

The performance endpoint should return three object-based time series keyed by date:

```json
{
  "sp500": {
    "2026-04-01": 1.5,
    "2026-04-02": 2.1
  },
  "nasdaq": {
    "2026-04-01": 1.2,
    "2026-04-02": 2.8
  },
  "bot_equity": {
    "2026-04-01": 10000,
    "2026-04-02": 10150
  }
}
```

Dates should use sortable `YYYY-MM-DD` strings. `sp500` and `nasdaq` values should be cumulative percentage returns for the same window. `bot_equity` values should be absolute account equity values. All values must be finite numbers.

The chart normalizes dates across all three series. Missing dates are rendered as gaps instead of crashing the UI. If all series are empty, the app shows an empty state.

The backend must allow CORS requests from the frontend development origin, usually `http://localhost:5173`.

## Scripts

```bash
npm start
npm test
npm run build
```

## Notes

- Use `VITE_API_BASE_URL` for deployment-specific backend URLs.
- The refresh button manually reloads performance data.
- The app cancels stale requests and validates required numeric response fields before rendering the chart.
