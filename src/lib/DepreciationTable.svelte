<script>
  import { calculateDepreciation } from './calculators.js';
  import { Line } from 'svelte-chartjs';
  import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend, Title } from 'chart.js';
  import { depreciationChartOptions } from './chartConfig.js';
  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend, Title);

  let purchasePrice = 400000;
  let salvageValue = 80000;
  let years = 10;
  let method = 'straight';

  $: schedule = calculateDepreciation({ purchasePrice, salvageValue, years, method });

  $: chartData = {
    labels: schedule.map(s => `第${s.year}年`),
    datasets: [
      {
        label: '账面价值 (元)',
        data: schedule.map(s => s.bookValue),
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22,163,74,0.15)',
        fill: true,
        tension: 0.4,
      },
      {
        label: '累计折旧 (元)',
        data: schedule.map(s => s.accumulatedDepreciation),
        borderColor: '#ea580c',
        backgroundColor: 'rgba(234,88,12,0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const methods = [
    { value: 'straight', label: '直线折旧法' },
    { value: 'declining', label: '双倍余额递减法' },
    { value: 'sum-years', label: '年数总和法' },
  ];
</script>

<div class="depreciation">
  <h2>📉 折旧分析</h2>

  <div class="inputs-grid">
    <div class="input-section">
      <h3>📋 折旧参数</h3>
      <label>购买价格 (元) <input type="number" bind:value={purchasePrice} /></label>
      <label>预计残值 (元) <input type="number" bind:value={salvageValue} /></label>
      <label>折旧年限 <input type="number" bind:value={years} min="1" max="40" /></label>
      <label>折旧方法
        <select bind:value={method} class="select-input">
          {#each methods as m}
            <option value={m.value}>{m.label}</option>
          {/each}
        </select>
      </label>
    </div>
  </div>

  <div class="chart-wrap">
    <Line data={chartData} options={depreciationChartOptions} />
  </div>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>年份</th>
          <th>账面价值 (元)</th>
          <th>年折旧额 (元)</th>
          <th>累计折旧 (元)</th>
        </tr>
      </thead>
      <tbody>
        {#each schedule.filter(s => s.year > 0) as row}
          <tr>
            <td>{row.year}</td>
            <td class="mono">¥{row.bookValue.toLocaleString()}</td>
            <td class="mono">¥{row.depreciation.toLocaleString()}</td>
            <td class="mono">¥{row.accumulatedDepreciation.toLocaleString()}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .depreciation { max-width: 56rem; margin: 0 auto; }
  h2 { font-size: 1.25rem; font-weight: 700; color: #1a2e1a; margin: 1.5rem 0 1rem; }
  .inputs-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
  .input-section { background: #fff; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.25rem; }
  .input-section h3 { font-size: 0.875rem; font-weight: 600; margin-bottom: 0.75rem; }
  label { display: block; font-size: 0.8125rem; color: #6b7280; margin-bottom: 0.5rem; }
  input, select { display: block; width: 100%; margin-top: 0.25rem; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.9375rem; }
  input:focus, select:focus { outline: none; border-color: #16a34a; box-shadow: 0 0 0 2px rgba(22,163,74,0.15); }
  .select-input { background: #fff; cursor: pointer; }
  .chart-wrap { max-width: 100%; margin: 1.5rem auto; height: 350px; }
  .table-wrap { overflow-x: auto; margin-top: 1rem; }
  table { width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 0.5rem; overflow: hidden; }
  th { background: #f9fafb; text-align: right; padding: 0.625rem 1rem; font-size: 0.75rem; font-weight: 600; color: #6b7280; }
  th:first-child { text-align: center; }
  td { text-align: right; padding: 0.5rem 1rem; font-size: 0.8125rem; border-top: 1px solid #f3f4f6; }
  td:first-child { text-align: center; font-weight: 600; }
  .mono { font-family: 'SF Mono', monospace; font-size: 0.75rem; }
  tbody tr:nth-child(even) { background: #fafafa; }
</style>
