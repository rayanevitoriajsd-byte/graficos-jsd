# JSD Telecom — painel de operações

Painel de atendimento feito em HTML, CSS e JavaScript puros. Ele abre com dados
demonstrativos e permite substituir tudo por um arquivo CSV, sem servidor ou
etapa de configuração.

## Como usar

1. Abra `index.html` no navegador.
2. Use **Importar CSV** ou arraste o arquivo para a área no fim do painel.
3. Escolha uma pessoa no filtro para recalcular todos os relatórios.

O arquivo `data/exemplo.csv` traz um modelo pronto para teste.

## Colunas do CSV

| Coluna | Conteúdo |
| --- | --- |
| Data | Dia ou período do registro |
| Agente | Nome da pessoa ou operador |
| Ativas | Quantidade de atendimentos ativos |
| Receptivas | Quantidade de atendimentos receptivos |
| TME | Tempo médio de espera, em segundos ou `HH:MM:SS` |
| TMA | Tempo médio de atendimento, em segundos ou `HH:MM:SS` |
| Aderencia | Percentual de aderência |
| NS20 | Nível de serviço em até 20 segundos |
| Abandono | Percentual de abandono |
| NPS | Nota de NPS |

Também são aceitas variações comuns de cabeçalho, como `Operador`, `Pessoa`,
`Ativos`, `Receptivos`, `Nivel de servico` e `Taxa de abandono`.

Os dados são processados somente no navegador. Chart.js e Papa Parse são
carregados por CDN.
