---
name: Service Flow Pro
description: Gestão de ordens de serviço para pequenos prestadores, no padrão da categoria executado com capricho.
colors:
  primary: "hsl(221 83% 48%)"
  primary-foreground: "hsl(0 0% 100%)"
  accent: "hsl(221 83% 96%)"
  accent-foreground: "hsl(221 83% 36%)"
  destructive: "hsl(0 72% 45%)"
  background: "hsl(220 20% 97%)"
  card: "hsl(0 0% 100%)"
  foreground: "hsl(222 25% 12%)"
  muted-foreground: "hsl(220 9% 38%)"
  secondary: "hsl(220 14% 94%)"
  muted: "hsl(220 14% 95%)"
  border: "hsl(220 13% 89%)"
  input: "hsl(220 13% 80%)"
  status-start: "hsl(221 83% 53%)"
  status-start-fg: "hsl(221 75% 36%)"
  status-start-bg: "hsl(221 90% 95%)"
  status-progress: "hsl(38 92% 50%)"
  status-progress-fg: "hsl(30 90% 28%)"
  status-progress-bg: "hsl(42 96% 91%)"
  status-waiting: "hsl(271 60% 55%)"
  status-waiting-fg: "hsl(271 55% 40%)"
  status-waiting-bg: "hsl(271 80% 95%)"
  status-finished: "hsl(152 60% 40%)"
  status-finished-fg: "hsl(152 65% 25%)"
  status-finished-bg: "hsl(150 55% 92%)"
  status-cancelled: "hsl(220 9% 60%)"
  status-cancelled-fg: "hsl(220 9% 36%)"
  status-cancelled-bg: "hsl(220 14% 93%)"
  dark-background: "hsl(222 24% 8%)"
  dark-card: "hsl(222 20% 11%)"
  dark-foreground: "hsl(220 15% 93%)"
  dark-muted-foreground: "hsl(220 10% 66%)"
  dark-border: "hsl(222 15% 19%)"
  dark-primary: "hsl(221 83% 53%)"
  dark-primary-text: "hsl(217 90% 72%)"
  dark-destructive-text: "hsl(0 85% 72%)"
  dark-ring: "hsl(217 90% 62%)"
typography:
  headline:
    fontFamily: "'Inter Variable', system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: "2rem"
    letterSpacing: "-0.025em"
    fontFeature: "tnum"
  title:
    fontFamily: "'Inter Variable', system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: "1.75rem"
    letterSpacing: "-0.025em"
  body:
    fontFamily: "'Inter Variable', system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
  body-touch:
    fontFamily: "'Inter Variable', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.5rem"
  label:
    fontFamily: "'Inter Variable', system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: "1rem"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "40px"
  button-primary-touch:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    height: "44px"
  button-outline:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    height: "36px"
  button-danger-quiet:
    textColor: "{colors.destructive}"
    rounded: "{rounded.md}"
    height: "40px"
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "40px"
  input-touch:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.md}"
    height: "44px"
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.lg}"
    padding: "16px"
  status-badge-progress:
    backgroundColor: "{colors.status-progress-bg}"
    textColor: "{colors.status-progress-fg}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  filter-chip:
    backgroundColor: "{colors.card}"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.full}"
    padding: "0 12px"
    height: "32px"
  filter-chip-active:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.card}"
    rounded: "{rounded.full}"
    height: "32px"
  nav-item-active:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
    rounded: "{rounded.md}"
    height: "36px"
  fab-new-order:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.full}"
    padding: "0 20px"
    height: "48px"
---

# Design System: Service Flow Pro

## Overview

**Creative North Star: "O Balcão Bem Arrumado"**

Service Flow Pro é o padrão da categoria executado com capricho: uma ferramenta de ordens de serviço que qualquer prestador reconhece de primeira, no nível de acabamento de Conta Azul/Bling, Linear e Jobber/Housecall Pro. Não há identidade temática. O diferencial está na clareza: superfícies brancas sobre um fundo cinza-frio claro, uma única cor de marca azul, e os cinco status da OS como o único lugar onde a cor fala alto.

A densidade é de ferramenta de trabalho, não de painel de vitrine. Linhas de tabela de 56px, listas com divisórias de 1px, números alinhados em coluna, hierarquia feita por peso (500/600) dentro de uma escala curta, e não por tamanho. O tema escuro é de primeira classe e segue as mesmas regras em grafite azulado, com tokens próprios de texto onde os tons de botão não alcançam contraste.

O sistema recusa o template de admin com cinco cards de KPI coloridos e a tela de detalhe que só oferece Imprimir e Editar. Na OS, a ação é mover o status: um botão primário com o próximo passo, desvios discretos, e a exclusão isolada no fim.

**Key Characteristics:**
- Uma cor de marca (azul) para ação primária, seleção, foco e links; nada mais saturado fora dos status.
- Status sempre como pílula de fundo tingido, texto escuro do mesmo matiz e rótulo escrito.
- Inter Variable com algarismos tabulares em todo número, data e valor.
- Bordas de 1px e raio de 8px; sombra de verdade só no que flutua.
- Celular primeiro: ação principal na zona do polegar, barra inferior de 5 itens.

## Colors

Neutros frios quase brancos, um azul de marca e cinco matizes de status, cada um em três papéis (sólido, texto, fundo).

### Primary
- **Azul Ordem** (`primary`): botão primário, "Nova OS", logotipo SF, links de texto ("Ver todas"), anel de foco e seleção de texto (a 18%). No escuro sobe para `dark-primary` no preenchimento de botões.
- **Azul Névoa** (`accent` / `accent-foreground`): item ativo da navegação lateral e avatar de iniciais. É o azul em versão de fundo, para seleção persistente sem gritar.

### Neutral
- **Cinza Balcão** (`background`): fundo de página; os cards brancos assentam sobre ele.
- **Branco Papel** (`card`): cards, tabela, cabeçalho, sidebar, barra inferior, campos.
- **Grafite Tinta** (`foreground`): texto principal; também o preenchimento do filtro de status ativo.
- **Cinza Nota** (`muted-foreground`): rótulos de `dt`, cabeçalhos de tabela, metadados, ícones de navegação inativos.
- **Cinza Linha** (`border`): bordas de 1px de cards, divisórias de lista e de tabela. **Cinza Campo** (`input`): borda de campos, um passo mais escura que `border` para o campo ler como alvo.
- **Cinza Hover** (`secondary`, `muted`): fundo de hover em linhas e itens de navegação (`muted` a 60% nas linhas).

### Status
Cada status tem três tokens: o **sólido** (`status-*`) só aparece como ponto de 6–8px ou barra; o **`-fg`** é texto; o **`-bg`** é fundo de pílula. Ordem do ciclo: Aberta (`start`, azul), Em andamento (`progress`, âmbar), Aguardando (`waiting`, violeta), Finalizada (`finished`, verde), Cancelada (`cancelled`, cinza).

- **Vermelho Alerta** (`destructive`): "Excluir OS", "Prioridade alta", data de OS atrasada, mensagens de erro de campo e borda de campo inválido. No escuro, texto destrutivo usa `dark-destructive-text`.

### Named Rules
**A Regra da Voz Única.** O azul de marca marca ação, seleção e foco, e mais nada. Nenhuma outra cor saturada entra na interface fora dos status e do vermelho de erro.

**A Regra do Rótulo.** Status nunca é só cor: é pílula `-bg` com texto `-fg` e o rótulo escrito ("Em andamento"), com um ponto no tom sólido. O tom sólido nunca vira fundo de texto.

**A Regra do Texto no Escuro.** No tema escuro, `text-primary` e `text-destructive` são remapeados globalmente para `dark-primary-text` e `dark-destructive-text`, porque os tons de botão não passam de 4,5:1 sobre o grafite. Texto colorido novo usa essas classes, não um tom inventado.

## Typography

**Display Font:** nenhuma; o sistema não tem face de display.
**Body Font:** Inter Variable (com system-ui, sans-serif), servida por `@fontsource-variable/inter`.

**Character:** Uma única família neutra e legível, com algarismos tabulares. A personalidade vem do alinhamento e do peso, não de contraste entre faces.

### Hierarchy
- **Headline** (600, 24px, tracking -0.025em, tabular): só para números de resumo: contagem por status e faturamento no Início.
- **Title** (600, 18px, tracking -0.025em): título da página no cabeçalho desktop. Total do formulário de nova OS sobe a 20px (600, tabular).
- **Body touch** (400–600, 16px): campos no celular (o campo cai para 14px a partir de `md`), itens da folha "Mais", título de OS no topo do celular.
- **Body** (400–600, 14px): texto de trabalho: linhas de tabela e lista, títulos de seção de card (600), botões e navegação (500).
- **Label** (500, 12px): pílula de status, cabeçalhos de tabela, rótulos da barra inferior, metadados de linha, mensagem de erro de campo.

### Named Rules
**A Regra dos Algarismos em Coluna.** Todo número de OS, data, quantidade e valor em BRL leva `.tabular` (`font-variant-numeric: tabular-nums`) para alinhar em coluna.

**A Regra do Peso, Não do Tamanho.** Dentro de uma seção, a hierarquia sobe de 400 para 500 para 600 na mesma escala de 12/14px. Tamanhos acima de 18px são reservados para números.

## Layout

Desktop (a partir de `lg`, 1024px): sidebar branca fixa de 240px à esquerda, cabeçalho de 64px fixo no topo com título à esquerda e busca de OS (288px, atalho `/`), ações e avatar à direita. Conteúdo em `max-w-6xl` com 32px laterais e 24px verticais. Telas de detalhe e formulário usam grade de 3 colunas (2 de conteúdo, 1 lateral fixa com resumo); o Início usa 5 colunas (3 + 2).

Celular: coluna única em `max-w-lg` com 16px laterais e 20px verticais; cabeçalho próprio com voltar e ações em ícone; barra inferior de 5 itens (Início, Ordens, Clientes, Financeiro, Mais) respeitando `safe-area-inset-bottom`. Seções que não cabem na barra ficam na folha "Mais", para que tudo do desktop seja alcançável.

Ritmo: cards com 16px de padding (20px no desktop), 16px entre cards (24px no desktop), linhas de lista com 12px verticais, linhas de tabela de 56px e cabeçalho de tabela de 40px. Filtros de status rolam horizontalmente no celular, sangrando até a borda.

### Named Rules
**A Regra do Polegar.** No celular, a ação principal fica fixa logo acima da barra inferior: "Nova OS" como botão flutuante nas listas, e o próximo passo da OS numa barra de ações fixa no detalhe. A página reserva ~80px no fim para que nada fique coberto.

## Elevation & Depth

O sistema é plano, com profundidade feita por linha. Cards se separam do fundo pela borda de 1px e pelo contraste branco sobre cinza-frio; no claro carregam uma sombra de fio quase imperceptível, que some no escuro. Sombra de verdade é exclusiva do que flutua sobre o conteúdo.

### Shadow Vocabulary
- **Fio** (`--shadow-card`: `0 1px 2px 0 hsl(222 25% 12% / 0.04)`; `none` no escuro): cards em repouso.
- **Suave** (`--shadow-md`): popovers e tooltips.
- **Elevada** (`--shadow-lg`): botão flutuante "Nova OS", toasts, diálogos.

### Named Rules
**A Regra da Linha Antes da Sombra.** Superfícies no fluxo da página se definem por borda de 1px, nunca por sombra. Sombra perceptível significa "isto flutua", e só sobreposições a usam.

## Shapes

Raio base de 8px (`--radius`) em cards e na folha de linhas; 6px em botões, campos, selects, itens de navegação e toasts; 4px em detalhes pequenos como o `kbd` da busca. Formas totalmente arredondadas são reservadas para três coisas: pílula de status, filtro de status e o botão flutuante (mais os pontos de status e o avatar). A folha inferior do celular abre com o topo arredondado em 16px. Bordas são sempre de 1px.

## Components

### Buttons
Diretos e sóbrios: cor plana, sem gradiente, sem elevação.
- **Shape:** cantos suaves (6px).
- **Primary:** fundo `primary`, texto branco, 14px/500. Altura de 40px no desktop e no mínimo 44px no celular, já no componente base (`max-md:h-11` em `Button`, `Input`, `SelectTrigger`); 36px dentro do cabeçalho desktop. Elemento que precisa ficar menor no visual (chips de filtro, botões de quantidade, interruptor, abas) mantém o tamanho e ganha área de toque de 44px com um `::after` posicionado. Hover a 90% de opacidade do fundo.
- **Outline:** borda 1px, fundo de card; ações secundárias como Imprimir, Editar e desvios de status.
- **Ghost / ícone:** ações em ícone no topo do celular (Imprimir, Editar) sempre com `aria-label`.
- **Quiet / Danger:** botão fantasma de 40px em `muted-foreground` ("Cancelar OS") ou `destructive` com hover a 10% ("Excluir OS"); ambos passam por um diálogo de confirmação.
- **Focus:** anel de 2px na cor `ring` com afastamento de 2px.

### Status Badge (assinatura)
Pílula `inline-flex` com ponto de 6px no tom sólido, fundo `-bg`, texto `-fg`, 12px/500, padding 2px 8px. Rótulos no feminino (concordam com "ordem"): Aberta, Em andamento, Aguardando, Finalizada, Cancelada; plurais nos filtros e no resumo. No detalhe da OS a pílula cresce para 14px com padding 4px 10px.

### Chips (filtros de status)
- **Style:** pílula de 32px, borda 1px, fundo de card, texto `muted-foreground`, contagem tabular ao lado do rótulo.
- **State:** ativo inverte para fundo `foreground` e texto `background` (contagem a 80%); é botão com `aria-pressed`. Ordem: Todas, depois o ciclo de vida.

### Cards / Containers
- **Corner Style:** 8px.
- **Background:** `card`.
- **Shadow Strategy:** fio (ver Elevation & Depth).
- **Border:** 1px `border`, `overflow-hidden`; listas e tabelas internas usam divisórias de 1px em vez de cards aninhados.
- **Internal Padding:** 16px, 20px no desktop. Cabeçalho de seção de 48px com título 14px/600 e link à direita.
- **Resumo por status:** um único card segmentado (2×2 no celular, 4 colunas no desktop) com divisórias; cada célula tem ponto + plural + número de 24px e abre a lista filtrada.

### Inputs / Fields
- **Style:** borda 1px `input`, fundo `card`, raio 6px, padding 8px 12px; 40px de altura no desktop, 44px no celular (base do componente) e 44px em todas as larguras nos formulários de OS (`.input-field`); texto 16px no celular e 14px a partir de `md` (inclui `Textarea` e `SelectTrigger`). Erro de campo: mensagem com `id`, `role="alert"` e `text-destructive`, ligada ao campo por `aria-describedby` e `aria-invalid`.
- **Focus:** anel de 2px `ring` com afastamento de 2px.
- **Error:** borda `destructive`, `aria-invalid`, mensagem abaixo em 12px/500 `destructive` com `role="alert"`.
- **Busca:** ícone de lupa à esquerda (padding 36px); no desktop leva um `kbd` "/" à direita.

### Navigation
- **Sidebar (desktop):** branca, 240px, borda direita de 1px; logotipo SF de 32px e nome em 15px/600 numa faixa de 64px. Itens de 36px, 14px/500, ícone de 16px, raio 6px; ativo em `accent` com texto `accent-foreground` e `aria-current="page"`; inativo `muted-foreground` com hover em `secondary`. "Sair" isolado no rodapé.
- **Barra inferior (celular):** fundo de card com borda superior; ícone de 20px sobre rótulo de 12px/500; ativo em `primary` com um traço de 32×2px acima do ícone. O quinto item abre a folha "Mais".

### Barra de próximo passo (assinatura)
No detalhe da OS, o ciclo de vida (`STATUS_FLOW`) define um único botão primário com o próximo passo ("Iniciar serviço", "Finalizar OS", "Retomar serviço") e desvios em outline. No desktop fica no card de resumo; no celular, numa barra fixa acima da barra inferior, com os botões dividindo a largura. A troca de status confirma com um toast "#0009 agora está finalizada" e uma ação "Desfazer".

### Toast
Raio 6px, borda 1px, sombra elevada, título 14px/600. Variante destrutiva em fundo `destructive` sólido com texto branco, para falhas ("Não foi possível trocar o status").

## Do's and Don'ts

### Do:
- **Do** usar `primary` só em ação primária, seleção, foco e links; um botão primário por contexto.
- **Do** mostrar status com o `StatusBadge` (pílula `-bg`, texto `-fg`, ponto sólido, rótulo escrito).
- **Do** aplicar `.tabular` a todo número de OS, data, quantidade e valor.
- **Do** separar superfícies com borda de 1px e divisórias; reservar `--shadow-md`/`--shadow-lg` para o que flutua.
- **Do** dar 44px a alvos de toque no celular e fixar a ação principal na zona do polegar, reservando espaço no fim da página.
- **Do** isolar a ação destrutiva no fim da tela, separada por borda, e confirmá-la em diálogo.
- **Do** usar `text-primary`/`text-destructive` para texto colorido, para herdar o remapeamento do tema escuro.

### Don't:
- **Don't** montar fileiras de cards de KPI com fundos coloridos; o resumo é um card segmentado com pontos de status.
- **Don't** usar o tom sólido de status como fundo de texto nem comunicar status só por cor.
- **Don't** usar cores cruas da paleta do Tailwind (`text-red-500`, `bg-green-100`); toda cor vem de um token.
- **Don't** dar elevação de hover a cards em repouso (`hover:shadow-soft`) nem animar a entrada de linhas de lista.
- **Don't** usar vidro ou desfoque de fundo em superfícies do fluxo.
- **Don't** levar a marca do produto ao recibo impresso: ele é monocromático e carrega a identidade do negócio do usuário.
