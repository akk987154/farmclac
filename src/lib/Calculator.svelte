<script>
  import { calculateHourlyCost } from './calculators.js';
  import { Doughnut } from 'svelte-chartjs';
  import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
  import { costBreakdownOptions } from './chartConfig.js';
  ChartJS.register(ArcElement, Tooltip, Legend, Title);

  let purchasePrice = 400000;
  let salvageValue = 80000;
  let usefulLifeHours = 10000;
  let fuelPrice = 7.5;
  let fuelConsumption = 15;
  let annualMaintenance = 15000;
  let annualInsurance = 5000;
  let annualStorage = 3000;
  let operatorWage = 30;
  let hoursPerYear = 800;

  $: result = calculateHourlyCost({
    purchasePrice, salvageValue, usefulLifeHours,
    fuelPrice, fuelConsumptionPerHour: fuelConsumption,
    annualMaintenance, annualInsurance, annualStorage,
    operatorWage, hoursPerYear,
  });

  $: chartData = {
    labels: result.costBreakdown.map(b => b.name),
    datasets: [{
      data: result.costBreakdown.map(b => b.value),
      backgroundColor: ['#16a34a', '#dc2626', '#ea580c', '#2563eb', '#7c3aed', '#0891b2'],
    }],
  };
</script>

<div class="calculator">
  <h2>⚙️ 运营参数设置</h2>

  <div class="inputs-grid">
    <div class="input-section">
      <h3>🛒 购买信息</h3>
      <label>购买价格 (元) <input type="number" bind:value={purchasePrice} /></label>
      <label>预计残值 (元) <input type="number" bind:value={salvageValue} /></label>
      <label>预计使用寿命 (小时) <input type="number" bind:value={usefulLifeHours} /></label>
      <label>年使用小时数 <input type="number" bind:value={hoursPerYear} /></label>
    </div>

    <div class="input-section">
      <h3>⛽ 运营成本</h3>
      <label>柴油价格 (元/升) <input type="number" bind:value={fuelPrice} step="0.1" /></label>
      <label>油耗 (升/小时) <input type="number" bind:value={fuelConsumption} step="0.1" /></label>
      <label>年维护费 (元) <input type="number" bind:value={annualMaintenance} /></label>
      <label>年保险费 (元) <input type="number" bind:value={annualInsurance} /></label>
      <label>年仓储费 (元) <input type="number" bind:value={annualStorage} /></label>
      <label>操作工工资 (元/小时) <input type="number" bind:value={operatorWage} /></label>
    </div>
  </div>

  <div class="results">
    <h2>📊 运营成本分析</h2>
    <div class="results-grid">
      <div class="result-card primary">
        <span class="label">每小时总成本</span>
        <span class="value">{result.totalPerHour.toFixed(2)} <small>元/小时</small></span>
      </div>
      <div class="result-card">
        <span class="label">年度总成本</span>
        <span class="value">{result.annualTotalCost.toLocaleString()} <small>元/年</small></span>
      </div>
      <div class="result-card">
        <span class="label">折旧/小时</span>
        <span class="value">{result.depreciationPerHour.toFixed(2)} <small>元/小时</small></span>
      </div>
      <div class="result-card">
        <span class="label">燃油/小时</span>
        <span class="value">{result.fuelCostPerHour.toFixed(2)} <small>元/小时</small></span>
      </div>
      <div class="result-card">
        <span class="label">维护/小时</span>
        <span class="value">{result.maintenancePerHour.toFixed(2)} <small>元/小时</small></span>
      </div>
      <div class="result-card">
        <span class="label">预计使用年限</span>
        <span class="value">{result.ownershipYears.toFixed(1)} <small>年</small></span>
      </div>
    </div>

    <div class="chart-wrap">
      <Doughnut data={chartData} options={costBreakdownOptions} />
    </div>
  </div>
</div>

<style>
  .calculator { max-width: 56rem; margin: 0 auto; }
  h2 { font-size: 1.25rem; font-weight: 700; color: #1a2e1a; margin: 1.5rem 0 1rem; }
  .inputs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
  @media (max-width: 640px) { .inputs-grid { grid-template-columns: 1fr; } }
  .input-section { background: #fff; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.25rem; }
  .input-section h3 { font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.75rem; }
  label { display: block; font-size: 0.8125rem; color: #6b7280; margin-bottom: 0.5rem; }
  input { display: block; width: 100%; margin-top: 0.25rem; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.9375rem; }
  input:focus { outline: none; border-color: #16a34a; box-shadow: 0 0 0 2px rgba(22,163,74,0.15); }
  .results { margin-top: 2rem; }
  .results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem; }
  .result-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem; text-align: center; }
  .result-card.primary { border-color: #16a34a; background: #f0fdf4; }
  .result-card .label { display: block; font-size: 0.75rem; color: #6b7280; margin-bottom: 0.25rem; }
  .result-card .value { font-size: 1.375rem; font-weight: 700; color: #1a2e1a; }
  .result-card .value small { font-size: 0.75rem; font-weight: 400; color: #9ca3af; }
  .chart-wrap { max-width: 28rem; margin: 1.5rem auto; }
</style>
