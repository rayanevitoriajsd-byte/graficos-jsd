const RL_COLORS = {
  active: "#E9A23B",
  activeSoft: "rgba(233,162,59,.14)",
  receptive: "#2E8279",
  receptiveSoft: "rgba(46,130,121,.14)",
  ink: "#18262B",
  muted: "#66777D",
  faint: "#94A2A7",
  grid: "rgba(60,86,92,.09)",
};

const RL_PROFILES = {
  "Lorhana Sandra Neves Sousa": {
    initials: "LN",
    strengths: ["QA & Pesquisa", "Comunicação forte", "Muito versátil"],
    identification: "RH",
    interest: "Atendimento ao usuário",
    activity: "Conversar com usuários e entender problemas.",
  },
  "Edy Ferreira": { initials: "EF", strengths: ["Agilidade", "Resolução"], identification: "Operações", interest: "Performance", activity: "Atendimento multicanal." },
  "Emilie Martins": { initials: "EM", strengths: ["Empatia", "Retenção"], identification: "CX", interest: "Experiência do cliente", activity: "Atendimento receptivo e retenção." },
  "Wilclefison Maia": { initials: "WM", strengths: ["Análise", "Organização"], identification: "Suporte", interest: "Soluções técnicas", activity: "Diagnóstico e resolução de chamados." },
  "Wellington Costa": { initials: "WC", strengths: ["Negociação", "Objetividade"], identification: "Operações", interest: "Relacionamento", activity: "Atendimento ativo e acompanhamento." },
};

const RL_SAMPLE_AGENTS = [
  ["Lorhana Sandra Neves Sousa", 31, 76, 36, 268, 97.8, 86.4, 1.8, 91],
  ["Edy Ferreira", 38, 83, 34, 254, 96.1, 83.7, 2.4, 88],
  ["Emilie Martins", 35, 79, 39, 278, 95.4, 89.2, 1.5, 93],
  ["Wilclefison Maia", 29, 71, 42, 291, 94.8, 81.5, 2.9, 86],
  ["Wellington Costa", 27, 68, 37, 263, 97.1, 87.1, 1.9, 90],
  ["Uriel Constate", 25, 64, 44, 301, 93.9, 78.8, 3.2, 84],
  ["Amilton Santos", 23, 58, 41, 287, 95.8, 84.1, 2.3, 89],
  ["Ivan Pereira", 21, 55, 46, 316, 92.7, 76.9, 3.8, 82],
  ["Thiago Alves", 19, 52, 40, 281, 96.3, 85.5, 2.1, 90],
  ["Ana Beatriz Lima", 18, 49, 35, 249, 98.2, 91.3, 1.2, 95],
  ["Marcos Vinicius", 16, 46, 48, 327, 91.8, 73.4, 4.1, 79],
];

const RL_SAMPLE_DATES = ["12/08", "13/08", "14/08", "15/08", "16/08", "17/08", "18/08", "19/08"];

function rlBuildSampleRows() {
  const rows = [];
  RL_SAMPLE_DATES.forEach((date, day) => {
    RL_SAMPLE_AGENTS.forEach((agent, index) => {
      const wave = ((day * 3 + index * 2) % 7) - 3;
      rows.push({
        Data: date,
        Agente: agent[0],
        Ativas: Math.max(4, agent[1] + wave),
        Receptivas: Math.max(12, agent[2] + wave * 2),
        TME: agent[3] + (wave * 2),
        TMA: agent[4] + (wave * 5),
        Aderencia: Math.min(100, agent[5] + wave * .18).toFixed(1),
        NS20: Math.min(100, agent[6] + wave * .3).toFixed(1),
        Abandono: Math.max(0, agent[7] - wave * .09).toFixed(1),
        NPS: Math.min(100, agent[8] + wave * .35).toFixed(0),
      });
    });
  });
  return rows;
}

const RL_SAMPLE_NAME = "dados-demonstrativos.csv";
