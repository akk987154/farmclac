<script>
  import { calculateROI } from './calculators.js';
  import { Bar } from 'svelte-chartjs';
  import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title } from 'chart.js';
  import { cashFlowChartOptions } from './chartConfig.js';
  ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title);

  let purchasePrice = 400000;
  let annualRevenue = 120000;
  let annualCosts = 50000;
  let years = 5;

  $: roi = calculateROI({ purchasePrice, annualRevenue, annualCosts, years });

  $: chartData = {
    labels: roi.cashFlows.map(cf => `第${cf.year}年`),
    datasets: [
      {
        label: '净现金流 (元)',
        data: roi.cashFlows.map(cf => cf.netCashFlow),
        backgroundColor: roi.cashFlows.map(cf => cf.netCashFlow >= 0 ? '#16a34a' : '#dc2626'),
      },
      {
        label: '累计现金流 (元)',
        data: roi.cashFlows.map(cf => cf.cumulativeCashFlow),
        borderColor: '#2563eb',
        borderWidth: 2,
        type: 'line',
        fill: false,
      },
    ],
  };
</script>

<div class="roi-calc">
  <h2>💰 投资回报分析</h2>

  <div class="inputs-grid">
    <div class="input-section">
      <h3>📋 投资参数</h3>
      <label>购买价格 (元) <input type="number" bind:value={purchasePrice} /></label>
      <label>年预期收入 (元) <input type="number" bind:value={annualRevenue} /></label>
      <label>年运营成本 (元) <input type="number" bind:value={annualCosts} /></label>
      <label>分析年限 <input type="number" bind:value={years} min="1" max="30" /></label>
    </div>
  </div>

  <div class="results-grid">
    <div class="result-card primary">
      <span class="label">ROI 投资回报率</span>
      <span class="value">{roi.roi}%</span>
    </div>
    <div class="result-card">
      <span class="label">总利润</span>
      <span class="value">¥{roi.totalProfit.toLocaleString()}</span>
    </div>
    <div class="result-card">
      <span class="label">回本周期</span>
      <span class="value">{roi.paybackYears} 年</span>
    </div>
    <div class="result-card">
      <span class="label">总成本</span>
      <span class="value">¥{roi.totalCosts.toLocaleString()}</span>
    </div>
  </div>

  <div class="chart-wrap">
    <Bar data={chartData} options={cashFlowChartOptions} />
  </div>
</div>

<style>
  .roi-calc { max-width: 56rem; margin: 0 auto; }
  h2 { font-size: 1.25rem; font-weight: 700; color: #1a2e1a; margin: 1.5rem 0 1rem; }
  .inputs-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
  .input-section { background: #fff; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.25rem; }
  .input-section h3 { font-size: 0.875rem; font-weight: 600; margin-bottom: 0.75rem; }
  label { display: block; font-size: 0.8125rem; color: #6b7280; margin-bottom: 0.5rem; }
  input { display: block; width: 100%; margin-top: 0.25rem; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.9375rem; }
  input:focus { outline: none; border-color: #16a34a; box-shadow: 0 0 0 2px rgba(22,163,74,0.15); }
  .results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 0.75rem; margin: 1.5rem 0; }
  .result-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem; text-align: center; }
  .result-card.primary { border-color: #16a34a; background: #f0fdf4; }
  .result-card .label { display: block; font-size: 0.75rem; color: #6b7280; margin-bottom: 0.25rem; }
  .result-card .value { font-size: 1.375rem; font-weight: 700; color: #1a2e1a; }
  .chart-wrap { max-width: 100%; margin: 1.5rem auto; height: 350px; }
</style>
