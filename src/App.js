import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/performance");
        if (!res.ok) throw new Error("Failed to fetch performance data");
        const json = await res.json();
        setData(json);
        setLastUpdated(new Date()); // ⏰ store timestamp when data was fetched
      } catch (err) {
        setError(err.message);
        console.error("API Error:", err);
      }
    };

    fetchPerformance();
  }, []); // 🔁 Only fetch on page load

  if (error) return <p className="error">Error: {error}</p>;
  if (!data) return <p>Loading...</p>;

  const labels = Object.keys(data.sp500);
  const sp500Values = Object.values(data.sp500);
  const nasdaqValues = Object.values(data.nasdaq);
  const botEquityLine = Object.values(data.bot_equity);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Bot Equity (Flat Line)",
        data: botEquityLine,
        borderColor: "blue",
        fill: false,
      },
      {
        label: "S&P 500 %",
        data: sp500Values,
        borderColor: "green",
        fill: false,
      },
      {
        label: "NASDAQ %",
        data: nasdaqValues,
        borderColor: "red",
        fill: false,
      },
    ],
  };

  return (
    <div className="chart-container">
      <h2>Trading Bot vs. Market Indices (30d)</h2>
      <Line data={chartData} />
      {lastUpdated && (
        <p className="last-updated">
          Last Updated: {lastUpdated.toLocaleString()} EST
        </p>
      )}
    </div>
  );
}

export default App;
