# 🚜 FarmCalc — 农机运营成本与ROI计算器

**FarmCalc** calculates hourly operating costs, ROI, and depreciation schedules for farm machinery. Built as a static single-page app.

---

## 中文

### 功能

- ⚙️ **运营成本计算器** — 输入购买价、油耗、维护费等，输出每小时/每年成本及饼图
- 💰 **ROI分析** — 计算投资回报率、回本周期、现金流柱状图
- 📉 **折旧表** — 支持直线法、双倍余额递减法、年数总和法三种折旧方式
- 📊 Chart.js 可视化图表
- 📱 全响应式设计
- 🇨🇳 中文界面

### 快速开始

```bash
npm install
npm run dev        # 开发模式 http://localhost:5173
npm run build      # 生产构建到 dist/
npm run preview    # 预览生产构建
```

### 计算引擎

运营成本公式：

```
每小时成本 = 折旧/小时 + 燃油/小时 + 维护/小时 + 保险/小时 + 仓储/小时 + 人工/小时
```

ROI = (总利润 / 购买价) × 100%

支持三种折旧方法：直线法、双倍余额递减法、年数总和法

### 技术栈

Svelte 5 · Vite · Chart.js · svelte-chartjs

---

## English

### Features

- ⚙️ **Operating Cost Calculator** — Input purchase price, fuel consumption, maintenance etc. Outputs hourly & annual cost with pie chart
- 💰 **ROI Analysis** — Calculates ROI, payback period, cash flow bar chart
- 📉 **Depreciation Table** — Straight-line, declining balance, and sum-of-years-digits methods
- 📊 Chart.js visualizations
- 📱 Fully responsive
- 🇺🇸 Chinese UI (code in English)

### Quick Start

```bash
npm install
npm run dev        # Dev at http://localhost:5173
npm run build      # Build to dist/
```

### Calculation Engine

```
Hourly Cost = Depreciation/hr + Fuel/hr + Maintenance/hr + Insurance/hr + Storage/hr + Labor/hr
```

ROI = (Total Profit / Purchase Price) × 100%

Three depreciation methods supported: Straight-line, Double-declining balance, Sum-of-years-digits.

### Tech Stack

Svelte 5 · Vite · Chart.js · svelte-chartjs

### Deploy

Output is purely static (HTML/CSS/JS). Deploy to any static host:

```bash
npm run build
# Upload dist/ to Netlify, Vercel, GitHub Pages, etc.
```
