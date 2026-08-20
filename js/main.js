(function () {
  let rows = [];
  let columns = [];
  let isSample = true;
  let fileName = RL_SAMPLE_NAME;

  const el = {
    dropzone: document.getElementById("rl-dropzone"),
    fileInput: document.getElementById("rl-file-input"),
    uploadBtn: document.getElementById("rl-upload-btn"),
    error: document.getElementById("rl-error"),
    sourceBadge: document.getElementById("rl-source-badge"),

    ingest: document.getElementById("rl-ingest"),
    ingestFile: document.getElementById("rl-ingest-file"),
    ingestCount: document.getElementById("rl-ingest-count"),
    ingestTotal: document.getElementById("rl-ingest-total"),
    ingestBarFill: document.getElementById("rl-ingest-bar-fill"),

    empty: document.getElementById("rl-empty"),
    dashboard: document.getElementById("rl-dashboard"),
    kpiGrid: document.getElementById("rl-kpi-grid"),

    mainChartTitle: document.getElementById("rl-main-chart-title"),
    mainChartSub: document.getElementById("rl-main-chart-sub"),
    mainLegend: document.getElementById("rl-main-legend"),

    barTitle: document.getElementById("rl-bar-title"),
    barSub: document.getElementById("rl-bar-sub"),
    donutSub: document.getElementById("rl-donut-sub"),
    donutLegend: document.getElementById("rl-donut-legend"),

    tableToggle: document.getElementById("rl-table-toggle"),
    tableToggleLabel: document.getElementById("rl-table-toggle-label"),
    tableWrap: document.getElementById("rl-table-wrap"),
    tableHead: document.getElementById("rl-table-head"),
    tableBody: document.getElementById("rl-table-body"),

    summaryInput: document.getElementById("rl-summary-input"),
    summarizeBtn: document.getElementById("rl-summarize-btn"),
    summarizeLabel: document.getElementById("rl-summarize-label"),
    summaryError: document.getElementById("rl-summary-error"),
    summaryResult: document.getElementById("rl-summary-result"),
    charCount: document.getElementById("rl-char-count"),
  };

  rlHydrateIcons();

  // ---------- Upload / drag & drop ----------

  el.uploadBtn.addEventListener("click", () => el.fileInput.click());
  el.dropzone.addEventListener("click", () => el.fileInput.click());
  el.fileInput.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) parseFile(file);
    e.target.value = "";
  });

  ["dragover"].forEach((evt) =>
    el.dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      el.dropzone.classList.add("drag");
    })
  );
  ["dragleave", "dragend"].forEach((evt) =>
    el.dropzone.addEventListener(evt, () => el.dropzone.classList.remove("drag"))
  );
  el.dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    el.dropzone.classList.remove("drag");
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) parseFile(file);
  });

  function parseFile(file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = Papa.parse(String(ev.target.result), { header: true, skipEmptyLines: true });
      runIngest(parsed.data, parsed.meta.fields || [], file.name, false);
    };
    reader.onerror = () => showError("Não foi possível ler o arquivo.");
    reader.readAsText(file);
  }

  function showError(msg) {
    el.error.textContent = msg;
    el.error.hidden = false;
  }

  function clearError() {
    el.error.hidden = true;
  }

  // ---------- Animação de ingestão ----------

  function runIngest(data, cols, name, sample) {
    if (!data.length) {
      showError("Não conseguimos ler esse arquivo. Verifique se é um CSV válido.");
      return;
    }
    clearError();
    el.dashboard.hidden = true;
    el.empty.hidden = true;
    el.ingest.hidden = false;
    el.ingestFile.textContent = name;
    el.ingestTotal.textContent = data.length;
    el.ingestCount.textContent = "0";
    el.ingestBarFill.style.width = "0%";

    const start = performance.now();
    const duration = Math.min(1100, Math.max(500, data.length * 12));

    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      const count = Math.round(p * data.length);
      el.ingestCount.textContent = count;
      el.ingestBarFill.style.width = `${p * 100}%`;
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        rows = data;
        columns = cols;
        fileName = name;
        isSample = sample;
        el.tableWrap.hidden = true;
        el.tableToggle.classList.remove("open");
        setTimeout(() => {
          el.ingest.hidden = true;
          render();
        }, 160);
      }
    }
    requestAnimationFrame(tick);
  }

  // ---------- Renderização do dashboard ----------

  function updateBadge() {
    el.sourceBadge.classList.add("visible");
    if (isSample) {
      el.sourceBadge.innerHTML = `<span class="rl-icon" data-icon="sparkles"></span> dados de exemplo — envie o seu CSV para substituir`;
    } else {
      el.sourceBadge.innerHTML = `<span class="rl-icon" data-icon="file"></span> ${fileName}`;
    }
    rlHydrateIcons(el.sourceBadge);
  }

  function renderKpis(analysis) {
    const spark = analysis.chartData.slice(-8).map((d) => d.value);
    const cards = [
      { id: "kpi-total", label: "Total", target: analysis.total, decimals: 0, suffix: "", color: RL_COLORS.gold, icon: "sparkles" },
      { id: "kpi-avg", label: "Média", target: analysis.avg, decimals: 1, suffix: "", color: RL_COLORS.teal, icon: "trending-up" },
      { id: "kpi-peak", label: "Pico", target: analysis.peak.value, decimals: 0, suffix: ` · ${analysis.peak.label}`, color: RL_COLORS.coral, icon: "trending-up" },
      {
        id: "kpi-variation",
        label: "Variação",
        target: Math.abs(analysis.variation),
        decimals: 1,
        suffix: "%",
        color: analysis.variation >= 0 ? RL_COLORS.teal : RL_COLORS.coral,
        icon: analysis.variation >= 0 ? "trending-up" : "trending-down",
        delta: analysis.variation >= 0 ? "em alta" : "em queda",
        deltaGood: analysis.variation >= 0,
      },
    ];

    el.kpiGrid.innerHTML = cards
      .map(
        (c) => `
      <div class="kpi-card">
        <div class="kpi-top">
          <span class="kpi-label">${c.label}</span>
          <span class="rl-icon" data-icon="${c.icon}" style="color:${c.color}"></span>
        </div>
        <div class="kpi-value" style="color:${c.color}">
          <span id="${c.id}-value">0</span><span class="kpi-suffix">${c.suffix}</span>
        </div>
        <div class="kpi-bottom">
          ${c.delta ? `<span class="kpi-delta ${c.deltaGood ? "up" : "down"}"><span class="rl-icon" data-icon="${c.deltaGood ? "trending-up" : "trending-down"}"></span>${c.delta}</span>` : "<span></span>"}
          <canvas class="kpi-spark" id="${c.id}-spark"></canvas>
        </div>
      </div>`
      )
      .join("");

    rlHydrateIcons(el.kpiGrid);

    cards.forEach((c) => {
      const valueEl = document.getElementById(`${c.id}-value`);
      rlCountUp(c.target, { decimals: c.decimals, onUpdate: (v) => (valueEl.textContent = v) });
      rlRenderSparkline(document.getElementById(`${c.id}-spark`), spark, c.color);
    });
  }

  function renderLegend(container, items) {
    container.innerHTML = items
      .map((it) => `<span class="rl-legend-item"><span class="rl-legend-dot" style="background:${it.color}"></span>${it.name}</span>`)
      .join("");
  }

  function renderTable() {
    el.tableHead.innerHTML = `<tr>${columns.map((c) => `<th>${c}</th>`).join("")}</tr>`;
    el.tableBody.innerHTML = rows
      .map((r) => `<tr>${columns.map((c) => `<td>${r[c] ?? ""}</td>`).join("")}</tr>`)
      .join("");
    el.tableToggleLabel.textContent = `Ver ${rows.length} linhas de dados brutos`;
  }

  el.tableToggle.addEventListener("click", () => {
    const open = el.tableWrap.hidden;
    el.tableWrap.hidden = !open;
    el.tableToggle.classList.toggle("open", open);
  });

  function render() {
    updateBadge();
    const analysis = rlAnalyzeRows(rows, columns);

    if (!analysis || !analysis.primary) {
      el.dashboard.hidden = true;
      el.empty.hidden = false;
      return;
    }

    el.empty.hidden = true;
    el.dashboard.hidden = false;

    renderKpis(analysis);

    el.mainChartTitle.textContent = `${analysis.primary} ao longo do tempo`;
    el.mainChartSub.textContent = `${analysis.labelCol} → ${analysis.primary}${analysis.secondary ? " · " + analysis.secondary : ""}`;
    rlRenderMainChart(analysis);
    if (analysis.secondary) {
      renderLegend(el.mainLegend, [
        { name: analysis.primary, color: RL_COLORS.gold },
        { name: analysis.secondary, color: RL_COLORS.teal },
      ]);
    } else {
      el.mainLegend.innerHTML = "";
    }

    const catLabel = analysis.categoryCol || "Maiores valores";
    el.barTitle.textContent = catLabel;
    el.barSub.textContent = `soma de ${analysis.primary} por ${analysis.categoryCol || analysis.labelCol}`;
    el.donutSub.textContent = `share de ${analysis.primary}`;
    rlRenderBarChart(analysis);
    rlRenderDonutChart(analysis);
    renderLegend(
      el.donutLegend,
      analysis.categoryData.map((d, i) => ({ name: d.name, color: RL_PALETTE[i % RL_PALETTE.length] }))
    );

    renderTable();
  }

  // ---------- Resumo de texto ----------

  el.summaryInput.addEventListener("input", () => {
    el.charCount.textContent = `${el.summaryInput.value.length} caracteres`;
    el.summaryError.hidden = true;
  });

  el.summarizeBtn.addEventListener("click", () => {
    const text = el.summaryInput.value.trim();
    el.summaryError.hidden = true;
    el.summaryResult.hidden = true;

    if (!text) {
      el.summaryError.textContent = "Cole um texto para resumir.";
      el.summaryError.hidden = false;
      return;
    }
    if (text.split(/\s+/).length < 12) {
      el.summaryError.textContent = "Cole um texto um pouco mais longo para gerar um resumo útil.";
      el.summaryError.hidden = false;
      return;
    }

    el.summarizeBtn.disabled = true;
    el.summarizeLabel.textContent = "Resumindo...";

    // Executado de forma assíncrona apenas para dar tempo da UI de "carregando" aparecer;
    // o resumo em si roda 100% localmente (ver js/summarize.js), sem chamadas de rede.
    setTimeout(() => {
      try {
        const bullets = rlSummarizeText(text, 4);
        el.summaryResult.innerHTML = `<ul>${bullets.map((b) => `<li>${b}</li>`).join("")}</ul>`;
        el.summaryResult.hidden = false;
      } catch {
        el.summaryError.textContent = "Não foi possível gerar o resumo agora.";
        el.summaryError.hidden = false;
      } finally {
        el.summarizeBtn.disabled = false;
        el.summarizeLabel.textContent = "Resumir texto";
      }
    }, 350);
  });

  // ---------- Inicialização com dados de exemplo ----------

  const initial = Papa.parse(RL_SAMPLE_CSV, { header: true, skipEmptyLines: true });
  rows = initial.data;
  columns = initial.meta.fields;
  render();
})();
