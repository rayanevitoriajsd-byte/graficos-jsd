# Relance — painel de dados

MVP de um painel que lê um CSV e mostra os dados em gráficos, com um resumo
automático de texto. HTML, CSS e JS puros (sem build, sem framework) —
basta abrir `index.html` no navegador.

## Estrutura

```
graficos-jsd/
├── index.html          → estrutura da página
├── css/
│   ├── variables.css    → cores, fontes, espaçamentos (design tokens)
│   ├── base.css         → reset e estilos globais
│   ├── layout.css       → grid e responsividade
│   └── components.css   → estilo de cada componente (cards, gráficos, tabela...)
├── js/
│   ├── icons.js          → ícones SVG inline
│   ├── config.js         → paleta de cores e dataset de exemplo
│   ├── utils.js           → parsing de números, formatação, animação de contagem
│   ├── dataAnalysis.js    → detecta colunas do CSV e calcula os KPIs
│   ├── charts.js          → desenha os gráficos (Chart.js)
│   ├── summarize.js       → resumo de texto (roda local, sem API)
│   └── main.js            → liga tudo: eventos, upload, renderização
└── data/
    └── exemplo.csv        → arquivo de exemplo para testar o upload
```

## Como usar

1. Extraia esta pasta em `C:\Users\usuario\Documents\dev\graficos-jsd`.
2. Dê duplo clique em `index.html` (abre direto no navegador padrão).
3. O painel já abre com dados de exemplo. Para usar os seus dados, clique em
   **Carregar CSV** ou arraste um arquivo `.csv` para a área indicada.

Não precisa de servidor local nem de instalar nada — é só abrir o arquivo.

## Como o CSV é interpretado

- A **primeira coluna** vira o eixo (tempo, categoria, etc.).
- As colunas seguintes que forem numéricas viram as métricas dos gráficos
  (a primeira numérica é a métrica principal).
- Se existir uma coluna de texto com poucos valores únicos (até 6), ela é
  usada para agrupar o gráfico de barras e o de rosca.
- Números em formato brasileiro (`1.234,56`) e internacional (`1,234.56`)
  são reconhecidos automaticamente.

## Sobre o resumo de texto

O resumo roda **inteiramente no navegador** (algoritmo extrativo por
frequência de palavras, em `js/summarize.js`) — por isso funciona offline e
sem chave de API, mesmo abrindo o arquivo direto (`file://`).

Se no futuro você quiser trocar por um resumo gerado por IA (ex: API da
Anthropic), isso exige uma chamada de rede autenticada, que por segurança
não pode ser feita direto do navegador com a chave exposta — o caminho
correto seria criar um pequeno backend (Node, por exemplo) que guarda a
chave e repassa a chamada. Posso te ajudar a montar isso quando quiser
evoluir o MVP.

## Bibliotecas usadas (via CDN)

- [Chart.js](https://www.chartjs.org/) — gráficos
- [PapaParse](https://www.papaparse.com/) — leitura de CSV

Ambas carregam de `cdnjs.cloudflare.com`, então é necessário estar
conectado à internet na primeira vez (os arquivos ficam em cache do
navegador depois disso).
