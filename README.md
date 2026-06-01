# 🚜 FarmCalc — 农机运营成本与ROI计算器

<!--
  第 4 次迭代 — 从最初一个简单的每小时成本公式，一路打磨成现在的三合一财务分析工具。
  每次重构都吸收了其他项目（TractorCompare 的数据模型、TractorWatch 的价格趋势思路）
  的反馈。折旧表那块改了至少三版才定下来。
-->

[![Svelte 5](https://img.shields.io/badge/Svelte-5.55-ff3e00?logo=svelte)](https://svelte.dev)
[![Vite 8](https://img.shields.io/badge/Vite-8.0-646cff?logo=vite)](https://vitejs.dev)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.5-ff6384?logo=chartdotjs)](https://www.chartjs.org)

**FarmCalc** 是 [TractorTools](https://github.com/seb/tractor-tools) 生态的财务模块。它从最开始的"每小时烧多少钱"这一个小问题出发，经过四轮迭代，现在覆盖了运营成本、投资回报、折旧模拟三个维度。如果你是从 [TractorCompare](../tractor-compare) 过来的——那边的规格数据可以直接套进这里的成本模型；如果你在用 [TractorWatch](../tractor-watch) 盯二手价格，这里的折旧曲线正好帮你判断挂牌价合不合理。

---

## 🗺️ 项目生态

| 项目 | 定位 | 与本项目的关系 |
|------|------|---------------|
| [TractorCompare](../tractor-compare) | 规格对比 | 提供机型价格区间，可作为 FarmCalc 购买价参考输入 |
| [TractorLog](../tractor-log) | 维护日志 | 实际维护成本可导出到 FarmCalc，验证预算假设 |
| [TractorVIN](../tractor-vin) | 序列号解码 | 用 VIN 查出机型年份后，在此计算剩余折旧年限 |
| [TractorWatch](../tractor-watch) | 二手价格追踪 | 折旧曲线反向校准——真实二手挂牌价 vs 理论账面价值 |

---

## 中文

### 功能

- ⚙️ **运营成本计算器** — 七项成本拆解（折旧 + 燃油 + 维护 + 保险 + 仓储 + 人工 + 杂项），饼图 + 年度汇总
- 💰 **ROI 分析** — 投资回报率、回本周期、累计现金流柱状图（含折线叠加）
- 📉 **折旧模拟器** — 三种算法对比：直线法 / 双倍余额递减法 / 年数总和法，附折旧曲线 + 完整摊销表
- 📊 Chart.js 可视化 — Doughnut、Bar、Line 三种图表类型
- 📱 全响应式设计 — 手机上也能滑着看折旧表
- 🇨🇳 中文界面，人民币计价

### 快速开始

```bash
npm install
npm run dev        # 开发模式 http://localhost:5173
npm run build      # 生产构建到 dist/
npm run preview    # 预览生产构建
```

### 计算引擎

#### 每小时运营成本

```
每小时成本 = 折旧/小时 + 燃油/小时 + 维护/小时 + 保险/小时 + 仓储/小时 + 人工/小时 + 杂项/小时
```

其中折旧/小时的计算会根据你在折旧表中选的方法联动——如果切到双倍余额递减法，前几年折旧会显著拉高每小时成本，后几年则会低很多。这个联动是 v0.3 加上的，之前三块计算器是各自独立跑的。

#### ROI

```
ROI = (总利润 / 购买价) × 100%
回本周期 = 购买价 / 年均净利润
```

总利润是累计现金流-购买价，不是简单的收入减成本——考虑了残值回收。跟 [TractorWatch](../tractor-watch) 那边的价格异动逻辑是同一个思路（都是算差值百分比）。

#### 三种折旧方法

| 方法 | 公式 | 适用场景 |
|------|------|---------|
| 直线法 | (原值 − 残值) / 年限 | 均匀损耗，中小型拖拉机 |
| 双倍余额递减法 | 账面价值 × 2/N | 前几年加速折旧，大型农机 |
| 年数总和法 | (原值 − 残值) × 剩余年限/年数总和 | 介于两者之间，最贴近实际二手行情 |

年数总和法是最晚加的——[TractorWatch](../tractor-watch) 那边的价格追踪数据显示大多数拖拉机的实际贬值曲线介于直线法和双倍余额递减法之间，所以加了第三种算法来逼近真实市场。

### 技术栈

Svelte 5 (runes mode) · Vite 8 · Chart.js 4.5 · svelte-chartjs 4.0

选 Svelte 的原因是这几个工具间的组件复用——成本饼图和 [TractorCompare](../tractor-compare) 那边的雷达图虽然库不同，但数据管道（归一化、分桶）是同一套思路。

### 部署

纯静态输出，扔到任何 CDN 都行：

```bash
npm run build
# 上传 dist/ 到 Netlify / Vercel / GitHub Pages / Nginx
```

---

## English

### Features

- ⚙️ **Operating Cost Calculator** — Seven cost components (depreciation + fuel + maintenance + insurance + storage + labor + miscellaneous) with doughnut chart + annual summary
- 💰 **ROI Analysis** — ROI %, payback period, cumulative cash flow bar chart with line overlay
- 📉 **Depreciation Simulator** — Three-method comparison: Straight-line / Double-declining balance / Sum-of-years-digits, with curve + full amortization table
- 📊 Chart.js visualizations — Doughnut, Bar, and Line chart types
- 📱 Fully responsive
- 🇺🇸 Chinese UI (code in English), CNY currency

### Quick Start

```bash
npm install
npm run dev        # Dev at http://localhost:5173
npm run build      # Build to dist/
```

### Calculation Engine

```
Hourly Cost = Depreciation/hr + Fuel/hr + Maintenance/hr + Insurance/hr + Storage/hr + Labor/hr + Misc/hr
```

ROI = (Total Profit / Purchase Price) × 100%

Three depreciation methods, cross-linked with the hourly cost calculator (changing methods recalculates the depreciation component in real time).

### Tech Stack

Svelte 5 · Vite 8 · Chart.js 4.5 · svelte-chartjs

---

## 📋 迭代记录

<details>
<summary>点击展开</summary>

### v0.4 — 三合一 + 折旧联动 (当前)
- 折旧方法选择联动运营成本计算器
- 年数总和法加入（基于 TractorWatch 价格数据的反馈）
- 响应式优化——折旧表在手机上可横向滚动

### v0.3 — 折旧表独立模块
- 三种折旧方法对比视图
- 折旧曲线图 + 摊销明细表
- 从计算器中拆分出独立的 `DepreciationTable.svelte` 组件

### v0.2 — ROI 分析
- 新增投资回报计算器
- 累计现金流柱状图
- Chart.js 从 v3 升到 v4（svelte-chartjs 同步升到 v4）

### v0.1 — 初始版本
- 每小时运营成本计算
- 饼图展示成本构成
- 基础 Svelte 5 + Vite 脚手架

</details>

## 🗓️ 路线图

- [ ] 从 [TractorCompare](../tractor-compare) 直接导入机型价格数据
- [ ] 导出报告到 [TractorLog](../tractor-log)（把预算变成实际维护记录）
- [ ] 多机型成本对比表（类似 TractorCompare 的并排视图）
- [ ] 导出 PDF / CSV
- [ ] i18n 英文界面选项
