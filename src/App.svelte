<script>
  import Calculator from './lib/Calculator.svelte'
  import ROICalculator from './lib/ROICalculator.svelte'
  import DepreciationTable from './lib/DepreciationTable.svelte'
</script>

<header>
  <h1>🚜 FarmCalc</h1>
  <p>农机运营成本 · 投资回报 · 折旧分析</p>
</header>

<main>
  <Calculator />
  <ROICalculator />
  <DepreciationTable />
</main>

<footer>
  <p>结果仅供参考，实际成本请结合当地油价、人工与维修报价核算。</p>
</footer>

<style>
  header {
    text-align: center;
    padding: 2rem 0 1rem;
    background: linear-gradient(180deg, #f0fdf4 0%, #fafaf5 100%);
  }
  header h1 { font-size: 2rem; font-weight: 800; color: #14532d; margin: 0; }
  header p { font-size: 0.9rem; color: #4b5563; margin-top: 0.35rem; }

  main { max-width: 60rem; margin: 0 auto; padding: 0 1rem 3rem; }

  footer {
    border-top: 1px solid #e5e7eb;
    padding: 1.5rem 1rem;
    text-align: center;
    font-size: 0.75rem;
    color: #6b7280;
  }
</style>
