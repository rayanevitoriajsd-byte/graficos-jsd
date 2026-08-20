(function () {
  let rawRows = rlBuildSampleRows();
  let normalizedRows = [];
  let columns = Object.keys(rawRows[0]);
  let fileName = RL_SAMPLE_NAME;
  let isSample = true;
  let selectedAgent = "all";

  const el = {
    fileInput: document.getElementById("rl-file-input"),
    uploadBtn: document.getElementById("rl-upload-btn"),
    dropzone: document.getElementById("rl-dropzone"),
    importCard: document.querySelector(".import-card"),
    error: document.getElementById("rl-error"),
    sourceBadge: document.getElementById("rl-source-badge"),
    lastUpdate: document.getElementById("rl-last-update"),
    dateRange: document.getElementById("rl-date-range"),
    agentFilter: document.getElementById("rl-agent-filter"),
    profile: document.getElementById("rl-profile"),
    scopeLabel: document.getElementById("rl-scope-label"),
    volumeKpis: document.getElementById("rl-volume-kpis"),
    serviceKpis: document.getElementById("rl-service-kpis"),
    donutCenter: document.getElementById("rl-donut-center"),
    mixLegend: document.getElementById("rl-mix-legend"),
    activeRanking: document.getElementById("rl-active-ranking"),
    receptiveRanking: document.getElementById("rl-receptive-ranking"),
    activeRankingTotal: document.getElementById("rl-active-ranking-total"),
    receptiveRankingTotal: document.getElementById("rl-receptive-ranking-total"),
    ingest: document.getElementById("rl-ingest"),
    ingestFile: document.getElementById("rl-ingest-file"),
    ingestCount: document.getElementById("rl-ingest-count"),
    ingestTotal: document.getElementById("rl-ingest-total"),
    ingestBarFill: document.getElementById("rl-ingest-bar-fill"),
    tableHead: document.getElementById("rl-table-head"),
    tableBody: document.getElementById("rl-table-body"),
  };

  const aliases = {
    date: ["data", "date", "dia", "periodo"],
    agent: ["agente", "agent", "operador", "pessoa", "nome", "colaborador"],
    active: ["ativas", "ativos", "atendimentosativos", "qtdeativas", "qtdeativos", "outbound"],
    receptive: ["receptivas", "receptivos", "atendimentosreceptivos", "qtdereceptivas", "qtdereceptivos", "inbound"],
    tme: ["tme", "tempoespera", "tempomediodeespera"],
    tma: ["tma", "tempoatendimento", "tempomediodeatendimento"],
    adherence: ["aderencia", "aderência", "adherence"],
    ns20: ["ns20", "ns20s", "nivelservico", "niveldeservico", "servicelevel"],
    abandonment: ["abandono", "taxaabandono", "abandonment"],
    nps: ["nps", "netpromoterscore"],
  };

  function key(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  }
  function findColumn(cols, names) {
    const wanted = names.map(key);
    return cols.find((col) => wanted.includes(key(col))) || cols.find((col) => wanted.some((name) => key(col).includes(name)));
  }
  function timeSeconds(value) {
    const text = String(value == null ? "" : value).trim();
    if (text.includes(":")) {
      const parts = text.split(":").map(Number);
      if (parts.some(Number.isNaN)) return 0;
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      return parts[0] * 60 + parts[1];
    }
    const number = rlToNumber(value);
    return Number.isFinite(number) ? number : 0;
  }
  function percentage(value) {
    const number = rlToNumber(value);
    if (!Number.isFinite(number)) return 0;
    return number > 0 && number <= 1 ? number * 100 : number;
  }
  function normalize(data, cols) {
    const map = {};
    Object.keys(aliases).forEach((metric) => { map[metric] = findColumn(cols, aliases[metric]); });
    if (!map.agent || (!map.active && !map.receptive)) {
      throw new Error("O CSV precisa ter uma coluna de Agente e ao menos uma coluna de Ativas ou Receptivas.");
    }
    return data.map((row, index) => ({
      date: String(row[map.date] || `Linha ${index + 1}`),
      agent: String(row[map.agent] || "Não identificado").trim(),
      active: map.active ? Math.max(0, rlToNumber(row[map.active]) || 0) : 0,
      receptive: map.receptive ? Math.max(0, rlToNumber(row[map.receptive]) || 0) : 0,
      tme: map.tme ? timeSeconds(row[map.tme]) : 0,
      tma: map.tma ? timeSeconds(row[map.tma]) : 0,
      adherence: map.adherence ? percentage(row[map.adherence]) : 0,
      ns20: map.ns20 ? percentage(row[map.ns20]) : 0,
      abandonment: map.abandonment ? percentage(row[map.abandonment]) : 0,
      nps: map.nps ? percentage(row[map.nps]) : 0,
    })).filter((row) => row.agent);
  }
  function escape(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character]));
  }
  function formatTime(seconds) {
    const safe = Math.max(0, Math.round(seconds || 0));
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const secs = safe % 60;
    return hours > 0 ? [hours, minutes, secs].map((part) => String(part).padStart(2, "0")).join(":") : `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  function average(rows, field) {
    const valid = rows.filter((row) => row[field] > 0);
    if (!valid.length) return 0;
    const weight = valid.reduce((sum, row) => sum + row.active + row.receptive, 0);
    return weight ? valid.reduce((sum, row) => sum + row[field] * (row.active + row.receptive), 0) / weight : valid.reduce((sum, row) => sum + row[field], 0) / valid.length;
  }
  function dateStamp(value) {
    const text = String(value || "").trim();
    let match = text.match(/^(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?$/);
    if (match) {
      let year = Number(match[3] || 2000);
      if (year < 100) year += 2000;
      return new Date(year, Number(match[2]) - 1, Number(match[1])).getTime();
    }
    match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).getTime();
    const parsed = Date.parse(text);
    return Number.isFinite(parsed) ? parsed : null;
  }
  function aggregate(rows) {
    const active = rows.reduce((sum, row) => sum + row.active, 0);
    const receptive = rows.reduce((sum, row) => sum + row.receptive, 0);
    const dates = new Map();
    const agents = new Map();
    rows.forEach((row) => {
      const daily = dates.get(row.date) || { date: row.date, active: 0, receptive: 0, tmeSum: 0, tmeWeight: 0, tmaSum: 0, tmaWeight: 0 };
      const rowWeight = row.active + row.receptive || 1;
      daily.active += row.active;
      daily.receptive += row.receptive;
      if (row.tme > 0) { daily.tmeSum += row.tme * rowWeight; daily.tmeWeight += rowWeight; }
      if (row.tma > 0) { daily.tmaSum += row.tma * rowWeight; daily.tmaWeight += rowWeight; }
      dates.set(row.date, daily);
      const person = agents.get(row.agent) || { name: row.agent, active: 0, receptive: 0 };
      person.active += row.active; person.receptive += row.receptive; agents.set(row.agent, person);
    });
    return {
      active, receptive, total: active + receptive,
      tme: average(rows, "tme"), tma: average(rows, "tma"), adherence: average(rows, "adherence"),
      ns20: average(rows, "ns20"), abandonment: average(rows, "abandonment"), nps: average(rows, "nps"),
      trend: Array.from(dates.values()).map((day) => ({
        ...day,
        tme: day.tmeWeight ? day.tmeSum / day.tmeWeight : 0,
        tma: day.tmaWeight ? day.tmaSum / day.tmaWeight : 0,
      })).sort((a, b) => {
        const left = dateStamp(a.date);
        const right = dateStamp(b.date);
        return left != null && right != null ? left - right : 0;
      }),
      agents: Array.from(agents.values()),
    };
  }
  function initials(name) {
    return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  }
  function renderProfile(agent) {
    if (agent === "all") {
      el.profile.className = "profile-card team-profile";
      el.profile.innerHTML = `<span class="avatar"><span class="rl-icon" data-icon="users"></span></span><div class="profile-main"><h3>Visão consolidada da equipe</h3><div class="profile-tags"><span class="profile-tag">${new Set(normalizedRows.map((row) => row.agent)).size} pessoas</span><span class="profile-tag">Todos os canais</span><span class="profile-tag">Performance geral</span></div></div><div class="profile-details"><span><b>Escopo:</b> operação completa</span><span><b>Leitura:</b> resultados somados e médias ponderadas</span></div>`;
    } else {
      const profile = RL_PROFILES[agent] || { initials: initials(agent), strengths: ["Atendimento", "Relacionamento"], identification: "Operações", interest: "Experiência do usuário", activity: "Atendimento e acompanhamento de usuários." };
      el.profile.className = "profile-card";
      el.profile.innerHTML = `<span class="avatar">${escape(profile.initials)}</span><div class="profile-main"><h3>${escape(agent)}</h3><div class="profile-tags">${profile.strengths.map((tag) => `<span class="profile-tag">${escape(tag)}</span>`).join("")}</div></div><div class="profile-details"><span><b>Identificação:</b> ${escape(profile.identification)}</span><span><b>Interesse:</b> ${escape(profile.interest)}</span><span><b>Atividade:</b> ${escape(profile.activity)}</span></div>`;
    }
    rlHydrateIcons(el.profile);
  }
  function metricCard(card, service) {
    return `<article class="metric-card ${service ? "service-card" : ""}" style="--card-color:${card.color};--card-soft:${card.soft}"><div class="metric-head"><span class="metric-icon"><span class="rl-icon" data-icon="${card.icon}"></span></span>${card.trend ? `<span class="metric-trend">${card.trend}</span>` : ""}</div><div class="metric-value">${card.value}</div><span class="metric-label">${card.label}</span></article>`;
  }
  function renderRanking(container, agents, field, color) {
    const sorted = [...agents].sort((a, b) => b[field] - a[field]).slice(0, 10);
    const max = sorted[0] ? sorted[0][field] : 0;
    container.innerHTML = sorted.length ? sorted.map((agent, index) => `<div class="ranking-row"><span class="rank-num">${String(index + 1).padStart(2, "0")}</span><span class="rank-name" title="${escape(agent.name)}">${escape(agent.name)}</span><span class="rank-bar"><i style="width:${max ? agent[field] / max * 100 : 0}%;background:${color}"></i></span><span class="rank-value">${rlFmt(agent[field])}</span></div>`).join("") : '<div class="empty-rank">Sem dados para este ranking.</div>';
  }
  function renderTable() {
    el.tableHead.innerHTML = `<tr>${columns.map((column) => `<th>${escape(column)}</th>`).join("")}</tr>`;
    el.tableBody.innerHTML = rawRows.slice(0, 250).map((row) => `<tr>${columns.map((column) => `<td>${escape(row[column])}</td>`).join("")}</tr>`).join("");
  }
  function render() {
    const filtered = selectedAgent === "all" ? normalizedRows : normalizedRows.filter((row) => row.agent === selectedAgent);
    const data = aggregate(filtered);
    const scope = selectedAgent === "all" ? "Toda a equipe" : selectedAgent;
    renderProfile(selectedAgent);
    el.scopeLabel.textContent = scope;
    el.sourceBadge.textContent = isSample ? "Dados demonstrativos" : fileName;
    el.lastUpdate.textContent = `Atualizado às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    if (data.trend.length) {
      const firstDate = data.trend[0].date;
      const lastDate = data.trend[data.trend.length - 1].date;
      el.dateRange.innerHTML = `<span class="rl-icon" data-icon="calendar"></span> ${escape(firstDate === lastDate ? firstDate : `${firstDate} — ${lastDate}`)}`;
      rlHydrateIcons(el.dateRange);
    }
    const volume = [
      { label: "Atendimentos ativos", value: rlFmt(data.active), icon: "activity", color: "var(--active)", soft: "var(--active-soft)", trend: "Ativos" },
      { label: "Atendimentos receptivos", value: rlFmt(data.receptive), icon: "phone", color: "var(--receptive)", soft: "var(--receptive-soft)", trend: "Receptivos" },
      { label: "Total de atendimentos", value: rlFmt(data.total), icon: "headset", color: "var(--blue)", soft: "var(--blue-soft)", trend: "Consolidado" },
    ];
    const service = [
      { label: "TME · espera média", value: formatTime(data.tme), icon: "clock", color: "var(--blue)", soft: "var(--blue-soft)" },
      { label: "TMA · atendimento médio", value: formatTime(data.tma), icon: "phone", color: "var(--primary)", soft: "var(--primary-soft)" },
      { label: "Aderência", value: `${rlFmt(data.adherence, 1)}%`, icon: "user-check", color: "var(--receptive)", soft: "var(--receptive-soft)" },
      { label: "NS ≤ 20s", value: `${rlFmt(data.ns20, 1)}%`, icon: "timer", color: "var(--active)", soft: "var(--active-soft)" },
      { label: "Abandono", value: `${rlFmt(data.abandonment, 1)}%`, icon: "user-x", color: "var(--danger)", soft: "#fae8e8" },
      { label: "NPS", value: rlFmt(data.nps, 0), icon: "smile", color: "var(--purple)", soft: "var(--purple-soft)" },
    ];
    el.volumeKpis.innerHTML = volume.map((card) => metricCard(card, false)).join("");
    el.serviceKpis.innerHTML = service.map((card) => metricCard(card, true)).join("");
    rlHydrateIcons(el.volumeKpis); rlHydrateIcons(el.serviceKpis);
    rlRenderTrendChart(data.trend);
    rlRenderTimeChart(data.trend);
    rlRenderMixChart(data.active, data.receptive);
    const activeShare = data.total ? data.active / data.total * 100 : 0;
    const receptiveShare = data.total ? data.receptive / data.total * 100 : 0;
    el.donutCenter.innerHTML = `<strong>${rlFmt(data.total)}</strong><span>total atendido</span>`;
    el.mixLegend.innerHTML = `<div><span><i class="active-dot"></i>Ativos</span><strong>${rlFmt(activeShare, 1)}%</strong></div><div><span><i class="receptive-dot"></i>Receptivos</span><strong>${rlFmt(receptiveShare, 1)}%</strong></div>`;
    renderRanking(el.activeRanking, data.agents, "active", RL_COLORS.active);
    renderRanking(el.receptiveRanking, data.agents, "receptive", RL_COLORS.receptive);
    el.activeRankingTotal.textContent = rlFmt(data.active);
    el.receptiveRankingTotal.textContent = rlFmt(data.receptive);
    renderTable();
  }
  function populateFilter(preserve) {
    const agents = Array.from(new Set(normalizedRows.map((row) => row.agent))).sort((a, b) => a.localeCompare(b, "pt-BR"));
    el.agentFilter.innerHTML = `<option value="all">Toda a equipe</option>${agents.map((agent) => `<option value="${escape(agent)}">${escape(agent)}</option>`).join("")}`;
    selectedAgent = preserve && agents.includes(preserve) ? preserve : "all";
    el.agentFilter.value = selectedAgent;
  }
  function showError(message) { el.error.textContent = message; el.error.hidden = false; }
  function parseFile(file) {
    if (!file.name.toLowerCase().endsWith(".csv")) { showError("Selecione um arquivo no formato CSV."); return; }
    Papa.parse(file, {
      header: true, skipEmptyLines: "greedy",
      complete(result) {
        try {
          const parsedColumns = result.meta.fields || [];
          const parsedRows = result.data || [];
          if (!parsedRows.length || !parsedColumns.length) throw new Error("O arquivo está vazio ou não possui cabeçalhos.");
          const prepared = normalize(parsedRows, parsedColumns);
          if (!prepared.length) throw new Error("Não encontramos linhas de atendimento válidas.");
          runIngest(parsedRows, parsedColumns, prepared, file.name);
        } catch (error) { showError(error.message || "Não foi possível interpretar o arquivo."); }
      },
      error() { showError("Não foi possível ler o arquivo CSV."); },
    });
  }
  function runIngest(nextRaw, nextColumns, nextNormalized, name) {
    el.error.hidden = true;
    el.ingest.hidden = false;
    el.ingestFile.textContent = name;
    el.ingestTotal.textContent = nextRaw.length;
    const started = performance.now();
    const duration = Math.min(900, Math.max(420, nextRaw.length * 8));
    function tick(now) {
      const progress = Math.min(1, (now - started) / duration);
      el.ingestCount.textContent = Math.round(nextRaw.length * progress);
      el.ingestBarFill.style.width = `${progress * 100}%`;
      if (progress < 1) return requestAnimationFrame(tick);
      rawRows = nextRaw; columns = nextColumns; normalizedRows = nextNormalized; fileName = name; isSample = false;
      populateFilter(); render();
      window.setTimeout(() => { el.ingest.hidden = true; el.ingestBarFill.style.width = "0"; }, 300);
    }
    requestAnimationFrame(tick);
  }
  el.uploadBtn.addEventListener("click", () => el.fileInput.click());
  el.dropzone.addEventListener("click", () => el.fileInput.click());
  el.fileInput.addEventListener("change", (event) => { const file = event.target.files && event.target.files[0]; if (file) parseFile(file); event.target.value = ""; });
  ["dragenter", "dragover"].forEach((eventName) => el.importCard.addEventListener(eventName, (event) => { event.preventDefault(); el.importCard.classList.add("drag"); }));
  ["dragleave", "drop"].forEach((eventName) => el.importCard.addEventListener(eventName, (event) => { event.preventDefault(); el.importCard.classList.remove("drag"); }));
  el.importCard.addEventListener("drop", (event) => { const file = event.dataTransfer.files && event.dataTransfer.files[0]; if (file) parseFile(file); });
  el.agentFilter.addEventListener("change", () => { selectedAgent = el.agentFilter.value; render(); });
  normalizedRows = normalize(rawRows, columns);
  populateFilter();
  rlHydrateIcons();
  render();
})();
