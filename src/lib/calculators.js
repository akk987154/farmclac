// 农机运营成本与ROI计算引擎
//
// 数值健壮性约定：
// 所有对外导出的函数都先经 num() 归一化输入，再用 safeDiv() 做除法。
// 表单里的 <input type="number"> 在清空时会给到 '' / null / undefined，
// 用户也可以合法地输入 0，这两种情况都会让裸除法产生 Infinity 或 NaN，
// 并顺着 .toFixed() / .toLocaleString() / Chart.js dataset 一路渲染到界面上。
// 因此这里在计算层统一兜底，而不是指望每个调用点各自校验。

/** 归一化为有限数值，非有限值回退到 fallback */
function num(value, fallback = 0) {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** 安全除法：除数为 0（或非有限）时返回 0，避免 Infinity / NaN */
function safeDiv(numerator, denominator) {
  const d = num(denominator);
  if (d === 0) return 0;
  return num(numerator) / d;
}

/** 归一化为非负整数（用于年限、年使用小时数等计数型参数） */
function count(value) {
  const n = Math.floor(num(value));
  return n > 0 ? n : 0;
}

export function calculateHourlyCost({
  purchasePrice,
  salvageValue,
  usefulLifeHours,
  fuelPrice,
  fuelConsumptionPerHour,
  annualMaintenance,
  annualInsurance,
  annualStorage,
  operatorWage,
  hoursPerYear,
}) {
  const price = num(purchasePrice);
  const salvage = num(salvageValue);
  const lifeHours = num(usefulLifeHours);
  const hours = num(hoursPerYear);

  // 注意：hoursPerYear 为 0 时不能直接相除，否则一整列结果都会变成 Infinity
  const ownershipYears = safeDiv(lifeHours, hours);

  // 折旧
  const totalDepreciation = price - salvage;
  const depreciationPerHour = safeDiv(totalDepreciation, lifeHours);
  const annualDepreciation = safeDiv(totalDepreciation, ownershipYears);

  // 燃油成本
  const fuelCostPerHour = num(fuelConsumptionPerHour) * num(fuelPrice);
  const annualFuelCost = fuelCostPerHour * hours;

  // 维护成本 (按小时分摊)
  const maintenancePerHour = safeDiv(annualMaintenance, hours);

  // 保险 + 仓储 (按小时分摊)
  const insurancePerHour = safeDiv(annualInsurance, hours);
  const storagePerHour = safeDiv(annualStorage, hours);

  // 人工
  const operatorCostPerHour = num(operatorWage);

  // 总成本
  const totalPerHour =
    depreciationPerHour +
    fuelCostPerHour +
    maintenancePerHour +
    insurancePerHour +
    storagePerHour +
    operatorCostPerHour;

  const annualTotalCost = totalPerHour * hours;

  return {
    depreciationPerHour,
    fuelCostPerHour,
    maintenancePerHour,
    insurancePerHour,
    storagePerHour,
    operatorCostPerHour,
    totalPerHour,
    annualDepreciation,
    annualFuelCost,
    annualMaintenance: num(annualMaintenance),
    annualInsurance: num(annualInsurance),
    annualStorage: num(annualStorage),
    annualTotalCost,
    ownershipYears,
    costBreakdown: [
      { name: '折旧', value: round(depreciationPerHour) },
      { name: '燃油', value: round(fuelCostPerHour) },
      { name: '维护', value: round(maintenancePerHour) },
      { name: '保险', value: round(insurancePerHour) },
      { name: '仓储', value: round(storagePerHour) },
      { name: '人工', value: round(operatorCostPerHour) },
    ],
  };
}

export function calculateROI({ purchasePrice, annualRevenue, annualCosts, years }) {
  const price = num(purchasePrice);
  const revenue = num(annualRevenue);
  const costs = num(annualCosts);
  const period = count(years);

  let cumulativeCashFlow = -price;
  const cashFlows = [];
  let paybackYear = null;

  const netCashFlow = revenue - costs;

  for (let y = 1; y <= period; y++) {
    cumulativeCashFlow += netCashFlow;
    cashFlows.push({
      year: y,
      revenue,
      costs,
      netCashFlow,
      cumulativeCashFlow: round(cumulativeCashFlow),
    });

    // 回本年份：只在首次转正的年度计算一次
    if (paybackYear === null && cumulativeCashFlow >= 0) {
      const prevYearCF = cumulativeCashFlow - netCashFlow;
      // netCashFlow 为 0 时无法做线性插值，直接落在该年度年末
      const fraction = netCashFlow > 0 ? Math.abs(prevYearCF) / netCashFlow : 0;
      paybackYear = y - 1 + fraction;
    }
  }

  const totalRevenue = revenue * period;
  const totalCosts = costs * period + price;
  const totalProfit = totalRevenue - totalCosts;
  const roi = safeDiv(totalProfit, price) * 100;

  return {
    roi: round(roi),
    totalProfit: round(totalProfit),
    totalRevenue: round(totalRevenue),
    totalCosts: round(totalCosts),
    paybackYears: paybackYear !== null ? round(paybackYear) : `${period}+`,
    cashFlows,
  };
}

export function calculateDepreciation({ purchasePrice, salvageValue, years, method = 'straight' }) {
  const price = num(purchasePrice);
  const salvage = num(salvageValue);
  const period = count(years);

  const depreciableAmount = price - salvage;
  const schedule = [];
  let bookValue = price;

  for (let y = 0; y <= period; y++) {
    let depExpense = 0;

    if (y > 0) {
      if (method === 'straight') {
        depExpense = safeDiv(depreciableAmount, period);
      } else if (method === 'declining') {
        depExpense = period > 0 ? bookValue * (2 / period) : 0;
        // 不允许折到残值以下，也不允许出现负折旧
        if (bookValue - depExpense < salvage) {
          depExpense = Math.max(0, bookValue - salvage);
        }
      } else if (method === 'sum-years') {
        const sum = (period * (period + 1)) / 2;
        depExpense = safeDiv(depreciableAmount * (period - y + 1), sum);
      }
    }

    // 先扣减当年折旧，再记录期末账面价值。
    // 原实现把 push 放在扣减之前，导致每一行的"账面价值"都是年初值，
    // 于是 账面价值 + 累计折旧 = 购置价 + 一个年折旧额，表与图都不自洽。
    bookValue -= depExpense;
    if (bookValue < salvage) bookValue = salvage;

    schedule.push({
      year: y,
      bookValue: round(bookValue),
      depreciation: round(depExpense),
      accumulatedDepreciation: round(price - bookValue),
    });
  }

  return schedule;
}

export function calculateBreakeven({ purchasePrice, revenuePerHour, costPerHour }) {
  const profitPerHour = num(revenuePerHour) - num(costPerHour);
  // 每小时不赚钱时永远无法回本，保留 Infinity 作为语义化结果
  if (profitPerHour <= 0) return Infinity;
  return round(safeDiv(purchasePrice, profitPerHour));
}

/** 保留两位小数；NaN / Infinity 一律归零，避免渲染出 "NaN" 字样 */
function round(n) {
  return Math.round(num(n) * 100) / 100;
}
