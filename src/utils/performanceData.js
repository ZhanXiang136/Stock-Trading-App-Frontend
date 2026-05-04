const REQUIRED_SERIES = ['sp500', 'nasdaq', 'bot_equity'];
const SERIES_LABELS = {
  sp500: 'S&P 500',
  nasdaq: 'NASDAQ',
  bot_equity: 'Bot Return',
};

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function assertFiniteSeriesValues(series, seriesName) {
  Object.entries(series).forEach(([date, value]) => {
    if (!Number.isFinite(value)) {
      throw new Error(`Performance data has an invalid value for "${seriesName}" on ${date}`);
    }
  });
}

export function validatePerformanceData(payload) {
  if (!isRecord(payload)) {
    throw new Error('Performance data response must be an object');
  }

  REQUIRED_SERIES.forEach((seriesName) => {
    if (!isRecord(payload[seriesName])) {
      throw new Error(`Performance data is missing "${seriesName}" series`);
    }

    assertFiniteSeriesValues(payload[seriesName], seriesName);
  });

  return payload;
}

export function getNormalizedLabels(performanceData) {
  return Array.from(
    new Set(REQUIRED_SERIES.flatMap((seriesName) => Object.keys(performanceData[seriesName])))
  ).sort();
}

export function hasPerformanceData(performanceData) {
  return getNormalizedLabels(performanceData).length > 0;
}

export function getSeriesWarnings(performanceData) {
  const backendErrors = isRecord(performanceData.index_errors) ? performanceData.index_errors : {};

  return REQUIRED_SERIES.flatMap((seriesName) => {
    if (Object.keys(performanceData[seriesName]).length > 0) return [];

    const backendMessage = backendErrors[seriesName];
    const label = SERIES_LABELS[seriesName];

    return [
      backendMessage
        ? `${label}: ${backendMessage}`
        : `${label}: no data returned by the API`,
    ];
  });
}

export function buildChartData(performanceData) {
  const labels = getNormalizedLabels(performanceData);

  return {
    labels,
    datasets: [
      {
        label: 'Bot Return %',
        data: labels.map((date) => {
          const value = performanceData.bot_equity[date];
          return value === undefined ? null : value;
        }),
        borderColor: '#2563eb',
        backgroundColor: '#2563eb',
        spanGaps: true,
        tension: 0.25,
        yAxisID: 'percent',
      },
      {
        label: 'S&P 500 %',
        data: labels.map((date) => {
          const value = performanceData.sp500[date];
          return value === undefined ? null : value;
        }),
        borderColor: '#16a34a',
        backgroundColor: '#16a34a',
        spanGaps: true,
        tension: 0.25,
        yAxisID: 'percent',
      },
      {
        label: 'NASDAQ %',
        data: labels.map((date) => {
          const value = performanceData.nasdaq[date];
          return value === undefined ? null : value;
        }),
        borderColor: '#dc2626',
        backgroundColor: '#dc2626',
        spanGaps: true,
        tension: 0.25,
        yAxisID: 'percent',
      },
    ],
  };
}
