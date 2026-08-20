const RL_COLORS = {
  gold: "#F5B942",
  teal: "#4FD1C5",
  coral: "#FF7A6E",
  violet: "#9B8CFA",
  blue: "#6FA8DC",
  pink: "#E0A9E8",
  surface: "#1B1F2B",
  border: "rgba(255,255,255,0.08)",
  textDim: "#8891A6",
  textFaint: "#565D70",
};

const RL_PALETTE = [
  RL_COLORS.gold,
  RL_COLORS.teal,
  RL_COLORS.coral,
  RL_COLORS.violet,
  RL_COLORS.blue,
  RL_COLORS.pink,
];

// Dataset de exemplo, embutido no código (não depende de fetch de arquivo local,
// então o painel funciona também abrindo o index.html direto, sem servidor).
const RL_SAMPLE_CSV = `Mes,Receita,Novos Clientes,Canal
Jan,18400,120,Google
Fev,19850,132,Google
Mar,21200,145,Organico
Abr,20100,138,Facebook
Mai,24300,161,Google
Jun,26800,178,Organico
Jul,25950,170,Facebook
Ago,29100,192,Google
Set,31400,205,Organico
Out,33850,221,Google
Nov,37200,240,Facebook
Dez,41600,268,Google`;

const RL_SAMPLE_NAME = "dados-exemplo.csv";
