const rlChartInstances = {};
function rlDestroyChart(key) {
  if (rlChartInstances[key]) {
    rlChartInstances[key].destroy();
    delete rlChartInstances[key];
  }
}
function rlTooltip() {
  return {
    backgroundColor: "#18262B",
    titleColor: "#AEBABE",
    bodyColor: "#FFFFFF",
    displayColors: true,
    usePointStyle: true,
    padding: 11,
    cornerRadius: 9,
    titleFont: { family: "DM Sans", size: 11 },
    bodyFont: { family: "DM Sans", size: 12, weight: "600" },
  };
}
function rlShortTime(seconds) {
  const safe = Math.max(0, Math.round(seconds || 0));
  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
function rlRenderTrendChart(trend) {
  rlDestroyChart("trend");
  const canvas = document.getElementById("rl-trend-chart");
  rlChartInstances.trend = new Chart(canvas, {
    type: "bar",
    data: {
      labels: trend.map((item) => item.date),
      datasets: [
        { label: "Ativos", data: trend.map((item) => item.active), backgroundColor: RL_COLORS.active, borderRadius: 5, borderSkipped: false, maxBarThickness: 30, stack: "calls" },
        { label: "Receptivos", data: trend.map((item) => item.receptive), backgroundColor: RL_COLORS.receptive, borderRadius: 5, borderSkipped: false, maxBarThickness: 30, stack: "calls" },
        { type: "line", label: "Total", data: trend.map((item) => item.active + item.receptive), borderColor: RL_COLORS.ink, backgroundColor: RL_COLORS.ink, borderWidth: 2, pointRadius: 2.5, pointHoverRadius: 5, pointBackgroundColor: "#FFFFFF", pointBorderWidth: 2, tension: .32, fill: false, order: 0, stack: "total" },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: { legend: { display: false }, tooltip: rlTooltip() },
      scales: {
        x: { stacked: true, grid: { display: false }, border: { display: false }, ticks: { color: RL_COLORS.faint, font: { family: "DM Sans", size: 10 } } },
        y: { stacked: true, beginAtZero: true, border: { display: false }, grid: { color: RL_COLORS.grid, drawTicks: false }, ticks: { color: RL_COLORS.faint, padding: 9, font: { family: "DM Sans", size: 10 } } },
      },
    },
  });
}
function rlRenderTimeChart(trend) {
  rlDestroyChart("time");
  const canvas = document.getElementById("rl-time-chart");
  const context = canvas.getContext("2d");
  const tmaGradient = context.createLinearGradient(0, 0, 0, 280);
  tmaGradient.addColorStop(0, "rgba(20,93,86,.18)");
  tmaGradient.addColorStop(1, "rgba(20,93,86,0)");
  rlChartInstances.time = new Chart(canvas, {
    type: "line",
    data: {
      labels: trend.map((item) => item.date),
      datasets: [
        { label: "TME", data: trend.map((item) => item.tme), yAxisID: "yTme", borderColor: "#4C7FC2", backgroundColor: "#4C7FC2", borderWidth: 2.3, pointRadius: 2.5, pointHoverRadius: 5, pointBackgroundColor: "#FFFFFF", pointBorderWidth: 2, tension: .35, fill: false },
        { label: "TMA", data: trend.map((item) => item.tma), yAxisID: "yTma", borderColor: "#145D56", backgroundColor: tmaGradient, borderWidth: 2.5, pointRadius: 2.5, pointHoverRadius: 5, pointBackgroundColor: "#FFFFFF", pointBorderWidth: 2, tension: .35, fill: true },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: { legend: { display: false }, tooltip: { ...rlTooltip(), callbacks: { label: (context) => ` ${context.dataset.label}: ${rlShortTime(context.parsed.y)}` } } },
      scales: {
        x: { grid: { display: false }, border: { display: false }, ticks: { color: RL_COLORS.faint, font: { family: "DM Sans", size: 10 } } },
        yTme: { position: "left", grace: "12%", border: { display: false }, grid: { display: false }, title: { display: true, text: "TME", color: "#4C7FC2", font: { family: "DM Sans", size: 9, weight: "700" } }, ticks: { color: "#4C7FC2", padding: 7, callback: (value) => rlShortTime(value), font: { family: "DM Sans", size: 9 } } },
        yTma: { position: "right", grace: "12%", border: { display: false }, grid: { color: RL_COLORS.grid, drawTicks: false }, title: { display: true, text: "TMA", color: "#145D56", font: { family: "DM Sans", size: 9, weight: "700" } }, ticks: { color: "#145D56", padding: 7, callback: (value) => rlShortTime(value), font: { family: "DM Sans", size: 9 } } },
      },
    },
  });
}
function rlRenderMixChart(active, receptive) {
  rlDestroyChart("mix");
  const canvas = document.getElementById("rl-mix-chart");
  rlChartInstances.mix = new Chart(canvas, {
    type: "doughnut",
    data: { labels: ["Ativos", "Receptivos"], datasets: [{ data: [active, receptive], backgroundColor: [RL_COLORS.active, RL_COLORS.receptive], borderColor: "#FFFFFF", borderWidth: 5, hoverOffset: 3 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: "72%", plugins: { legend: { display: false }, tooltip: { ...rlTooltip(), callbacks: { label: (context) => ` ${context.label}: ${rlFmt(context.parsed)}` } } } },
  });
}
