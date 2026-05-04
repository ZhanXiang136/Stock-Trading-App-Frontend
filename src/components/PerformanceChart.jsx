import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { buildChartData } from '../utils/performanceData';

const numberFormatter = new Intl.NumberFormat('en-US');

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index',
  },
  plugins: {
    legend: {
      position: 'bottom',
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.dataset.label || '';
          const value = context.parsed.y;

          if (value === null || value === undefined) {
            return `${label}: No data`;
          }

          return `${label}: ${value.toFixed(2)}%`;
        },
      },
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Date',
      },
    },
    percent: {
      type: 'linear',
      position: 'left',
      title: {
        display: true,
        text: 'Return',
      },
      ticks: {
        callback: (value) => `${numberFormatter.format(value)}%`,
      },
    },
  },
};

function PerformanceChart({ data }) {
  return (
    <div className="chart-frame">
      <Line data={buildChartData(data)} options={chartOptions} />
    </div>
  );
}

export default PerformanceChart;
