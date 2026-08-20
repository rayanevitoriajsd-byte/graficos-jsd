// Recebe as linhas (array de objetos) e colunas de um CSV já parseado pelo PapaParse
// e devolve tudo que o dashboard precisa: KPIs, série principal e agrupamento por categoria.
function rlAnalyzeRows(data, cols) {
  if (!data.length || !cols.length) return null;

  const labelCol = cols[0];
  const otherCols = cols.slice(1);

  const numericCols = otherCols.filter((c) => {
    const vals = data.map((r) => rlToNumber(r[c])).filter((v) => !isNaN(v));
    return vals.length >= data.length * 0.6 && vals.length > 0;
  });

  const nonNumeric = otherCols.filter((c) => !numericCols.includes(c));
  let categoryCol = null;
  for (const c of nonNumeric) {
    const uniq = new Set(data.map((r) => r[c]));
    if (uniq.size >= 2 && uniq.size <= 6) {
      categoryCol = c;
      break;
    }
  }

  const primary = numericCols[0] || null;
  const secondary = numericCols[1] || null;
  if (!primary) return { labelCol, primary: null };

  const chartData = data
    .map((r) => ({
      label: String(r[labelCol] ?? ""),
      value: rlToNumber(r[primary]),
      value2: secondary ? rlToNumber(r[secondary]) : undefined,
    }))
    .filter((d) => !isNaN(d.value));

  const values = chartData.map((d) => d.value);
  const total = values.reduce((a, b) => a + b, 0);
  const avg = total / (values.length || 1);

  let peakIdx = 0;
  values.forEach((v, i) => {
    if (v > values[peakIdx]) peakIdx = i;
  });
  const peak = chartData[peakIdx];

  const first = values[0] || 0;
  const last = values[values.length - 1] || 0;
  const variation = first !== 0 ? ((last - first) / Math.abs(first)) * 100 : 0;

  let categoryData;
  if (categoryCol) {
    const map = {};
    data.forEach((r) => {
      const k = String(r[categoryCol] ?? "Outro");
      const v = rlToNumber(r[primary]);
      map[k] = (map[k] || 0) + (isNaN(v) ? 0 : v);
    });
    categoryData = Object.entries(map).map(([name, value]) => ({ name, value }));
  } else {
    const sorted = [...chartData].sort((a, b) => b.value - a.value);
    const top = sorted.slice(0, 5);
    const restSum = sorted.slice(5).reduce((a, b) => a + b.value, 0);
    categoryData = top.map((d) => ({ name: d.label, value: d.value }));
    if (restSum > 0) categoryData.push({ name: "Outros", value: restSum });
  }

  return {
    labelCol,
    primary,
    secondary,
    categoryCol,
    chartData,
    categoryData,
    total,
    avg,
    peak,
    variation,
    rowCount: data.length,
  };
}
