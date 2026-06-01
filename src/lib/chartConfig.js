export const costBreakdownOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'bottom' },
    title: { display: true, text: '每小时成本构成 (元/小时)' },
  },
};

export const depreciationChartOptions = {
  responsive: true,
  interaction: { intersect: false, mode: 'index' },
  plugins: {
    legend: { position: 'bottom' },
    title: { display: true, text: '折旧与账面价值 (元)' },
  },
  scales: {
    y: {
      ticks: { callback: (v) => `¥${v.toLocaleString()}` },
    },
  },
};

export const cashFlowChartOptions = {
  responsive: true,
  interaction: { intersect: false, mode: 'index' },
  plugins: {
    legend: { position: 'bottom' },
    title: { display: true, text: '现金流分析 (元)' },
  },
  scales: {
    y: {
      ticks: { callback: (v) => `¥${v.toLocaleString()}` },
    },
  },
};
