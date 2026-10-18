---
version: 1
slug: "src"
primary_target: "src"
related_targets: ["src/pages/OrdersPage.tsx","src/pages/OrderDetailPage.tsx","src/pages/NewOrderPage.tsx","src/pages/DashboardPage.tsx"]
---

# Núcleo da OS (app autenticado)

Modo: Operate. Escopo: tokens globais, navegação (Sidebar, BottomNav, cabeçalhos), lista de OS, detalhe da OS, Nova OS, dashboard. As demais telas herdam os tokens nesta rodada.

Quem chega: dono, atendente ou técnico de um pequeno prestador de serviço, no balcão (desktop) ou em campo (celular, uma mão). Tarefa: achar a OS, ver em que pé está, mover para o próximo status, abrir uma nova.

Restrições confirmadas: manter os 5 status atuais com nomes melhores (Aberta, Em andamento, Aguardando, Finalizada, Cancelada); pagamento continua no Financeiro; nada de cara de ramo único nem de brinquedo; tema escuro de primeira classe; nenhuma tarefa comum com mais toques no celular do que hoje.

Em aberto: numeração sequencial de OS (schema); registrar pagamento a partir da OS.

## Direction contract

THESIS: O padrão da categoria executado com capricho: uma ferramenta de OS que qualquer prestador reconhece de primeira, no nível de acabamento de Conta Azul/Bling, Linear e Jobber. Recusa o template de admin com cinco cards de KPI coloridos e a tela de detalhe que só tem Imprimir e Editar.

OWN-WORLD: Superfícies brancas sobre fundo cinza-frio claro; uma cor de marca azul (ações primárias, seleção, foco), nada mais saturado fora dos status. Status como pílula de fundo tingido com texto escuro do mesmo matiz, sempre com rótulo. Inter com algarismos tabulares; escala curta (12/14/16/20/24). Bordas de 1px, raio 8px, sombra só em sobreposições. Tema escuro com as mesmas regras em grafite azulado.

STORY: O usuário vê o que está em andamento hoje, encontra qualquer OS por número, cliente ou status, e move a OS para o próximo status com um toque, sem abrir o formulário de edição.

FIRST VIEWPORT: Desktop: sidebar branca de 240px à esquerda; cabeçalho com título, busca e "Nova OS" primária à direita; filtros de status em abas com contagem; tabela de OS (nº, cliente, serviços, data, status, valor). Celular: cabeçalho com título, busca abaixo, abas de status roláveis, lista em cards, "Nova OS" como botão flutuante na zona do polegar, barra inferior de 5 itens. Detalhe da OS: nº como título, pílula de status, um único botão primário de próximo passo, ações secundárias discretas, "Excluir" isolado no fim.

FORM: Padrão da categoria (canon), escolhido pelo usuário no lugar das 3 direções sorteadas; seed:bdc30def826eb9b3

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
