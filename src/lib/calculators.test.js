import { describe, it, expect } from 'vitest';
import {
  calculateHourlyCost,
  calculateROI,
  calculateDepreciation,
  calculateBreakeven,
} from './calculators.js';

// 这些测试的核心目的：锁住"输入 0 或空值不得产生 Infinity / NaN"这一约定。
// 原始实现直接做除法，hoursPerYear=0 会让整列结果变成 Infinity，
// 并顺着 .toFixed() / Chart.js dataset 渲染到界面上。见 src/lib/calculators.js 顶部注释。

const BASE_COST_INPUT = {
  purchasePrice: 400000,
  salvageValue: 80000,
  usefulLifeHours: 10000,
  fuelPrice: 7.5,
  fuelConsumptionPerHour: 15,
  annualMaintenance: 15000,
  annualInsurance: 5000,
  annualStorage: 3000,
  operatorWage: 30,
  hoursPerYear: 800,
};

/** 断言对象里所有数值字段都是有限数 */
function expectAllFinite(obj) {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'number') {
      expect(Number.isFinite(value), `${key} 应为有限数，实际为 ${value}`).toBe(true);
    }
  }
}

describe('calculateHourlyCost', () => {
  it('正常输入下给出正确的每小时成本', () => {
    const r = calculateHourlyCost(BASE_COST_INPUT);

    expectAllFinite(r);
    // 折旧 320000/10000 = 32；燃油 15*7.5 = 112.5；维护 15000/800 = 18.75；
    // 保险 5000/800 = 6.25；仓储 3000/800 = 3.75；人工 30
    expect(r.depreciationPerHour).toBeCloseTo(32, 6);
    expect(r.fuelCostPerHour).toBeCloseTo(112.5, 6);
    expect(r.maintenancePerHour).toBeCloseTo(18.75, 6);
    expect(r.insurancePerHour).toBeCloseTo(6.25, 6);
    expect(r.storagePerHour).toBeCloseTo(3.75, 6);
    expect(r.totalPerHour).toBeCloseTo(203.25, 6);
    expect(r.ownershipYears).toBeCloseTo(12.5, 6);
    expect(r.annualTotalCost).toBeCloseTo(203.25 * 800, 6);
  });

  it('hoursPerYear 为 0 时不产生 Infinity', () => {
    const r = calculateHourlyCost({ ...BASE_COST_INPUT, hoursPerYear: 0 });

    expectAllFinite(r);
    expect(r.maintenancePerHour).toBe(0);
    expect(r.insurancePerHour).toBe(0);
    expect(r.storagePerHour).toBe(0);
    expect(r.ownershipYears).toBe(0);
    expect(r.annualTotalCost).toBe(0);
  });

  it('usefulLifeHours 为 0 时不产生 Infinity', () => {
    const r = calculateHourlyCost({ ...BASE_COST_INPUT, usefulLifeHours: 0 });

    expectAllFinite(r);
    expect(r.depreciationPerHour).toBe(0);
    expect(r.annualDepreciation).toBe(0);
  });

  it('清空数字输入（空串 / null / undefined）时退化为 0 而不是 NaN', () => {
    const r = calculateHourlyCost({
      ...BASE_COST_INPUT,
      purchasePrice: '',
      salvageValue: null,
      usefulLifeHours: undefined,
      fuelPrice: '',
      hoursPerYear: '',
    });

    expectAllFinite(r);
    // costBreakdown 每个分项也必须是有限数（Chart.js dataset 直接消费它）
    for (const item of r.costBreakdown) {
      expect(Number.isFinite(item.value), `${item.name} 应为有限数`).toBe(true);
    }
  });
});

describe('calculateROI', () => {
  const BASE_ROI_INPUT = {
    purchasePrice: 400000,
    annualRevenue: 120000,
    annualCosts: 50000,
    years: 5,
  };

  it('正常输入下给出正确的 ROI 与总利润', () => {
    const r = calculateROI(BASE_ROI_INPUT);

    expectAllFinite({ roi: r.roi, totalProfit: r.totalProfit });
    // 5 年收入 600000，成本 250000 + 400000 = 650000，总利润 -50000
    expect(r.totalRevenue).toBe(600000);
    expect(r.totalCosts).toBe(650000);
    expect(r.totalProfit).toBe(-50000);
    expect(r.roi).toBeCloseTo(-12.5, 6);
    expect(r.cashFlows).toHaveLength(5);
  });

  it('回本年份按线性插值计算', () => {
    // 年净现金流 70000，购置价 400000 → 第 5 年 350000 仍为负，第 6 年转正
    const r = calculateROI({ ...BASE_ROI_INPUT, years: 6 });
    // 第 5 年累计 350000-400000 = -50000，第 6 年 420000-400000 = 20000
    // 插值 = 5 + 50000/70000 ≈ 5.71
    expect(r.paybackYears).toBeCloseTo(5.71, 2);
  });

  it('purchasePrice 为 0 时不产生 Infinity / NaN', () => {
    const r = calculateROI({ ...BASE_ROI_INPUT, purchasePrice: 0 });

    expectAllFinite({ roi: r.roi, totalProfit: r.totalProfit });
    expect(r.roi).toBe(0);
  });

  it('净现金流为 0 时不会因为插值除零而崩溃（输入 0 时是合法的零利润场景）', () => {
    const r = calculateROI({
      purchasePrice: 0,
      annualRevenue: 100,
      annualCosts: 100,
      years: 3,
    });

    expectAllFinite({ roi: r.roi, paybackYears: r.paybackYears });
    expect(r.paybackYears).toBe(0);
    expect(r.cashFlows).toHaveLength(3);
  });

  it('始终无法回本时返回 "N+" 形式', () => {
    const r = calculateROI({ ...BASE_ROI_INPUT, annualRevenue: 10000, annualCosts: 50000 });
    expect(r.paybackYears).toBe('5+');
  });

  it('years 为 0 / 负数时返回空的现金流序列', () => {
    for (const years of [0, -3]) {
      const r = calculateROI({ ...BASE_ROI_INPUT, years });
      expect(r.cashFlows).toHaveLength(0);
      expect(r.paybackYears).toBe('0+');
    }
  });
});

describe('calculateDepreciation', () => {
  it('直线法在年限内折到残值', () => {
    const schedule = calculateDepreciation({
      purchasePrice: 400000,
      salvageValue: 80000,
      years: 10,
      method: 'straight',
    });

    // year 0 是期初，共 11 行
    expect(schedule).toHaveLength(11);
    expect(schedule[0].bookValue).toBe(400000);
    expect(schedule[10].bookValue).toBe(80000);
    for (const row of schedule) {
      expect(Number.isFinite(row.bookValue)).toBe(true);
      expect(row.bookValue).toBeGreaterThanOrEqual(80000);
    }
  });

  it('每一行都满足 账面价值 + 累计折旧 = 购置价（回归：原实现每年差一个年折旧额）', () => {
    for (const method of ['straight', 'declining', 'sum-years']) {
      const schedule = calculateDepreciation({
        purchasePrice: 400000,
        salvageValue: 80000,
        years: 10,
        method,
      });

      for (const row of schedule) {
        expect(
          row.bookValue + row.accumulatedDepreciation,
          `${method} 法 第 ${row.year} 年账面价值与累计折旧不自洽`
        ).toBeCloseTo(400000, 2);
      }
    }
  });

  it('双倍余额递减法不会折到残值以下，也不会出现负折旧', () => {
    const schedule = calculateDepreciation({
      purchasePrice: 400000,
      salvageValue: 80000,
      years: 10,
      method: 'declining',
    });

    for (const row of schedule) {
      expect(row.depreciation).toBeGreaterThanOrEqual(0);
      expect(row.bookValue).toBeGreaterThanOrEqual(80000);
    }
    expect(schedule[10].bookValue).toBe(80000);
  });

  it('年数总和法折旧额逐年递减', () => {
    const schedule = calculateDepreciation({
      purchasePrice: 400000,
      salvageValue: 80000,
      years: 5,
      method: 'sum-years',
    });

    const expenses = schedule.filter((r) => r.year > 0).map((r) => r.depreciation);
    for (let i = 1; i < expenses.length; i++) {
      expect(expenses[i]).toBeLessThan(expenses[i - 1]);
    }
  });

  it('years 为 0 时不产生 NaN', () => {
    const schedule = calculateDepreciation({
      purchasePrice: 400000,
      salvageValue: 80000,
      years: 0,
      method: 'straight',
    });

    expect(schedule).toHaveLength(1);
    expect(schedule[0].bookValue).toBe(400000);
    expectAllFinite(schedule[0]);
  });
});

describe('calculateBreakeven', () => {
  it('每小时有利润时给出回本小时数', () => {
    expect(calculateBreakeven({ purchasePrice: 300000, revenuePerHour: 200, costPerHour: 50 })).toBe(2000);
  });

  it('每小时不赚钱时返回 Infinity', () => {
    expect(calculateBreakeven({ purchasePrice: 300000, revenuePerHour: 50, costPerHour: 50 })).toBe(Infinity);
    expect(calculateBreakeven({ purchasePrice: 300000, revenuePerHour: 10, costPerHour: 50 })).toBe(Infinity);
  });
});
