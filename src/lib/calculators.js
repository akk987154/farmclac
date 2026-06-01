// 农机运营成本与ROI计算引擎

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
  const ownershipYears = usefulLifeHours / hoursPerYear;

  // 折旧
  const totalDepreciation = purchasePrice - salvageValue;
  const depreciationPerHour = totalDepreciation / usefulLifeHours;
  const annualDepreciation = totalDepreciation / ownershipYears;

  // 燃油成本
  const fuelCostPerHour = fuelConsumptionPerHour * fuelPrice;
  const annualFuelCost = fuelCostPerHour * hoursPerYear;

  // 维护成本 (按小时分摊)
  const maintenancePerHour = annualMaintenance / hoursPerYear;

  // 保险 + 仓储 (按小时分摊)
  const insurancePerHour = annualInsurance / hoursPerYear;
  const storagePerHour = annualStorage / hoursPerYear;

  // 人工
  const operatorCostPerHour = operatorWage;

  // 总成本
  const totalPerHour =
    depreciationPerHour +
    fuelCostPerHour +
    maintenancePerHour +
    insurancePerHour +
    storagePerHour +
    operatorCostPerHour;

  const annualTotalCost = totalPerHour * hoursPerYear;

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
    annualMaintenance,
    annualInsurance,
    annualStorage,
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
  let cumulativeCashFlow = -purchasePrice;
  const cashFlows = [];

  for (let y = 1; y <= years; y++) {
    const netCashFlow = annualRevenue - annualCosts;
    cumulativeCashFlow += netCashFlow;
    cashFlows.push({
      year: y,
      revenue: annualRevenue,
      costs: annualCosts,
      netCashFlow,
      cumulativeCashFlow: round(cumulativeCashFlow),
    });

    if (cumulativeCashFlow >= 0 && cashFlows.filter(cf => cf.cumulativeCashFlow >= 0).length === 1) {
      const prevYearCF = cumulativeCashFlow - netCashFlow;
      const fraction = Math.abs(prevYearCF) / netCashFlow;
      cashFlows.paybackYear = y - 1 + fraction;
    }
  }

  const totalRevenue = annualRevenue * years;
  const totalCosts = annualCosts * years + purchasePrice;
  const totalProfit = totalRevenue - totalCosts;
  const roi = (totalProfit / purchasePrice) * 100;

  return {
    roi: round(roi),
    totalProfit: round(totalProfit),
    totalRevenue: round(totalRevenue),
    totalCosts: round(totalCosts),
    paybackYears: cashFlows.paybackYear ? round(cashFlows.paybackYear) : years + '+',
    cashFlows,
  };
}

export function calculateDepreciation({ purchasePrice, salvageValue, years, method = 'straight' }) {
  const depreciableAmount = purchasePrice - salvageValue;
  const schedule = [];
  let bookValue = purchasePrice;

  for (let y = 0; y <= years; y++) {
    let depExpense = 0;

    if (y > 0) {
      if (method === 'straight') {
        depExpense = depreciableAmount / years;
      } else if (method === 'declining') {
        depExpense = bookValue * (2 / years);
        if (bookValue - depExpense < salvageValue) {
          depExpense = bookValue - salvageValue;
        }
      } else if (method === 'sum-years') {
        const sum = (years * (years + 1)) / 2;
        depExpense = (depreciableAmount * (years - y + 1)) / sum;
      }
    }

    schedule.push({
      year: y,
      bookValue: round(bookValue),
      depreciation: round(depExpense),
      accumulatedDepreciation: round(purchasePrice - bookValue + depExpense),
    });

    bookValue -= depExpense;
    if (bookValue < salvageValue) bookValue = salvageValue;
  }

  return schedule;
}

export function calculateBreakeven({ purchasePrice, revenuePerHour, costPerHour }) {
  const profitPerHour = revenuePerHour - costPerHour;
  if (profitPerHour <= 0) return Infinity;
  return round(purchasePrice / profitPerHour);
}

function round(n) {
  return Math.round(n * 100) / 100;
}
