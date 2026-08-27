// Converte valores de célula de CSV (que podem vir como "R$ 1.234,56", "42%", etc.)
// em número, respeitando tanto o padrão 1.234,56 (pt-BR) quanto 1,234.56 (en-US).
function rlToNumber(v) {
  if (typeof v === "number") return v;
  if (v == null) return NaN;
  let s = String(v).trim();
  if (s === "") return NaN;
  s = s.replace(/[^0-9,.\-]/g, "");
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  if (lastComma > -1 && lastDot > -1) {
    if (lastComma > lastDot) s = s.replace(/\./g, "").replace(",", ".");
    else s = s.replace(/,/g, "");
  } else if (lastComma > -1) {
    const decimals = s.length - lastComma - 1;
    s = decimals <= 2 ? s.replace(",", ".") : s.replace(/,/g, "");
  }
  return parseFloat(s);
}

function rlFmt(n, decimals = 0) {
  if (n == null || isNaN(n)) return "—";
  return n.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Anima um número de 0 até `target`, chamando onUpdate(valorFormatado) a cada frame.
function rlCountUp(target, { duration = 900, decimals = 0, onUpdate }) {
  const start = performance.now();
  const to = isNaN(target) ? 0 : target;
  function tick(now) {
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    onUpdate(rlFmt(to * eased, decimals));
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function rlDebounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}
