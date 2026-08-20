// Mantém referência às instâncias de Chart.js já criadas, para poder destruí-las
// antes de redesenhar (troca de arquivo CSV).
const rlChartInstances = {};

function rlDestroyChart(key) {
  if (rlChartInstances[key]) {
    rlChartInstances[key].destroy();
    delete rlChartInstances[key];
  }
}

function rlBaseTooltip() {
  return {
    backgroundColor: RL_COLORS.surface,
    borderColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    titleColor: RL_COLORS.textDim,
    bodyColor: "#EDEFF4",
    padding: 10,
    titleFont: { family: "Inter", size: 12 },
    bodyFont: { family: "Inter", size: 12.5 },
    cornerRadius: 8,
    displayColors: false,
  };
}

function rlBaseGrid() {
  return {
    color: "rgba(255,255,255,0.06)",
    drawTicks: false,
  };
}

function rlBaseTicks() {
  return {
    color: RL_COLORS.textFaint,
    font: { family: "JetBrains Mono", size: 10.5 },
  };
}

function rlRenderMainChart(analysis) {
  rlDestroyChart("main");
  const ctx = document.getElementById("rl-main-chart");
  const grad = ctx.getContext("2d").createLinearGradient(0, 0, 0, 260);
  grad.addColorStop(0, "rgba(245,185,66,0.38)");
  grad.addColorStop(1, "rgba(245,185,66,0)");

  const datasets = [
    {
      label: analysis.primary,
      data: analysis.chartData.map((d) => d.value),
      borderColor: RL_COLORS.gold,
      backgroundColor: grad,
      borderWidth: 2.5,
      tension: 0.35,
      pointRadius: 0,
      pointHoverRadius: 4,
      fill: true,
    },
  ];

  if (analysis.secondary) {
    const grad2 = ctx.getContext("2d").createLinearGradient(0, 0, 0, 260);
    grad2.addColorStop(0, "rgba(79,209,197,0.25)");
    grad2.addColorStop(1, "rgba(79,209,197,0)");
    datasets.push({
      label: analysis.secondary,
      data: analysis.chartData.map((d) => d.value2),
      borderColor: RL_COLORS.teal,
      backgroundColor: grad2,
      borderWidth: 2,
      tension: 0.35,
      pointRadius: 0,
      pointHoverRadius: 4,
      fill: true,
    });
  }

  rlChartInstances.main = new Chart(ctx, {
    type: "line",
    data: { labels: analysis.chartData.map((d) => d.label), datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...rlBaseTooltip(),
          callbacks: { label: (ctx) => `${ctx.dataset.label}: ${rlFmt(ctx.parsed.y, 1)}` },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: rlBaseTicks() },
        y: {
          grid: rlBaseGrid(),
          ticks: { ...rlBaseTicks(), callback: (v) => rlFmt(v) },
        },
      },
    },
  });
}

function rlRenderBarChart(analysis) {
  rlDestroyChart("bar");
  const ctx = document.getElementById("rl-bar-chart");
  rlChartInstances.bar = new Chart(ctx, {
    type: "bar",
    data: {
      labels: analysis.categoryData.map((d) => d.name),
      datasets: [
        {
          data: analysis.categoryData.map((d) => d.value),
          backgroundColor: analysis.categoryData.map((_, i) => RL_PALETTE[i % RL_PALETTE.length]),
          borderRadius: 6,
          maxBarThickness: 44,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          ...rlBaseTooltip(),
          callbacks: { label: (ctx) => rlFmt(ctx.parsed.y, 1) },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: rlBaseTicks() },
        y: { grid: rlBaseGrid(), ticks: { ...rlBaseTicks(), callback: (v) => rlFmt(v) } },
      },
    },
  });
}

function rlRenderDonutChart(analysis) {
  rlDestroyChart("donut");
  const ctx = document.getElementById("rl-donut-chart");
  rlChartInstances.donut = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: analysis.categoryData.map((d) => d.name),
      datasets: [
        {
          data: analysis.categoryData.map((d) => d.value),
          backgroundColor: analysis.categoryData.map((_, i) => RL_PALETTE[i % RL_PALETTE.length]),
          borderColor: RL_COLORS.surface,
          borderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      plugins: {
        legend: { display: false },
        tooltip: {
          ...rlBaseTooltip(),
          callbacks: { label: (ctx) => `${ctx.label}: ${rlFmt(ctx.parsed, 1)}` },
        },
      },
    },
  });
}

function rlRenderSparkline(canvas, values, color) {
  if (!canvas || values.length < 2) return;
  const key = canvas.id;
  rlDestroyChart(key);
  rlChartInstances[key] = new Chart(canvas, {
    type: "line",
    data: {
      labels: values.map((_, i) => i),
      datasets: [
        {
          data: values,
          borderColor: color,
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.35,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { display: false }, y: { display: false } },
      elements: { line: { borderJoinStyle: "round" } },
    },
  });
}
