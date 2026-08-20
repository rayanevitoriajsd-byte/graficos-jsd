// Resumidor extrativo simples: pontua frases pela frequência das palavras
// relevantes (descartando stopwords em português) e devolve as melhores frases,
// na ordem em que aparecem no texto original.
//
// Roda 100% no navegador, sem chamada de rede — por isso funciona mesmo abrindo
// o index.html diretamente pelo arquivo (file://), sem precisar de servidor
// nem de chave de API.

const RL_STOPWORDS = new Set([
  "a","o","as","os","um","uma","uns","umas","de","do","da","dos","das","em","no","na","nos","nas",
  "por","para","com","sem","sob","sobre","entre","e","ou","mas","que","se","ao","aos","à","às",
  "é","foi","ser","são","era","eram","foram","tem","têm","há","como","mais","menos","muito","muita",
  "muitos","muitas","também","já","não","sim","este","esta","esse","essa","isso","isto","aquele",
  "aquela","seu","sua","seus","suas","meu","minha","nosso","nossa","pelo","pela","pelos","pelas",
  "quando","onde","porque","pois","assim","então","apenas","cada","todo","toda","todos","todas",
  "outro","outra","outros","outras","the","and","of","to","in","is","was","were","for","on","with",
]);

function rlSplitSentences(text) {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+(?=[A-ZÀ-Ú0-9])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function rlSummarizeText(text, maxSentences = 4) {
  const sentences = rlSplitSentences(text);
  if (sentences.length <= maxSentences) return sentences;

  const freq = {};
  sentences.forEach((s) => {
    const words = s.toLowerCase().match(/[a-zà-ú0-9]+/g) || [];
    words.forEach((w) => {
      if (RL_STOPWORDS.has(w) || w.length < 3) return;
      freq[w] = (freq[w] || 0) + 1;
    });
  });

  const scored = sentences.map((s, i) => {
    const words = s.toLowerCase().match(/[a-zà-ú0-9]+/g) || [];
    const score = words.reduce((acc, w) => acc + (freq[w] || 0), 0) / (words.length || 1);
    // leve bônus para frases com números (costumam carregar dados relevantes)
    const hasNumber = /\d/.test(s) ? 1.15 : 1;
    return { i, s, score: score * hasNumber };
  });

  const top = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.i - b.i);

  return top.map((t) => t.s);
}
