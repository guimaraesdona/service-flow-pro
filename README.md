# Service Flow Pro

Sistema web para gestão de **ordens de serviço**: cadastro de clientes, catálogo de serviços, abertura e acompanhamento de OS, controle financeiro, relatórios e impressão de ordens.

Interface em português (pt-BR), responsiva (sidebar no desktop, bottom nav no mobile), com tema claro/escuro e campos personalizados configuráveis por entidade.

---

## Stack

| Camada | Tecnologia |
| --- | --- |
| Build | [Vite 5](https://vitejs.dev/) + `@vitejs/plugin-react-swc` |
| UI | React 18, TypeScript 5, Tailwind CSS 3, [shadcn/ui](https://ui.shadcn.com/) (Radix UI) |
| Rotas | React Router DOM 6 |
| Dados / cache | TanStack Query 5 |
| Backend | [Supabase](https://supabase.com/) — Auth, Postgres e Storage |
| Formulários | React Hook Form + Zod |
| Gráficos | Recharts |
| Extras | dnd-kit (reordenação de campos), react-to-print (impressão), framer-motion, lucide-react, sonner |
| Fonte | League Spartan (`@fontsource`) |

---

## Como rodar

Pré-requisitos: **Node.js 18+** e **[pnpm](https://pnpm.io/)** — este é o gerenciador de pacotes oficial do projeto (fixado em `packageManager` no `package.json`). Use apenas `pnpm-lock.yaml`; lockfiles de npm, yarn e bun estão no `.gitignore`.

```sh
# 1. Clonar
git clone https://github.com/guimaraesdona/service-flow-pro.git
cd service-flow-pro

# 2. Instalar dependências
pnpm install

# 3. Configurar variáveis de ambiente (ver seção abaixo)

# 4. Subir o servidor de desenvolvimento
pnpm dev
```

> Não tem pnpm? Com Node 18+ basta `corepack enable pnpm`, ou instale com `npm i -g pnpm`.
>
> O `pnpm-workspace.yaml` autoriza os scripts de build de `@swc/core` e `esbuild` (bloqueados por padrão no pnpm 11). Sem isso, `pnpm build` falha com `ERR_PNPM_IGNORED_BUILDS`.

A aplicação sobe em **http://localhost:8080** (porta definida em `vite.config.ts`).

### Variáveis de ambiente

Crie um arquivo `.env.local` na raiz com as credenciais do seu projeto Supabase:

```env
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<sua-anon-key>
```

> `.env.local` está coberto pelo `.gitignore` (padrão `*.local`) e **não deve ser commitado**.
> Sem essas variáveis o app carrega, mas nenhuma operação de dados funciona — o client Supabase apenas emite um warning no console.

### Scripts

| Comando | O que faz |
| --- | --- |
| `pnpm dev` | Servidor de desenvolvimento com HMR (porta 8080) |
| `pnpm build` | Build de produção em `dist/` |
| `pnpm build:dev` | Build usando o modo `development` |
| `pnpm preview` | Serve localmente o conteúdo de `dist/` |
| `pnpm lint` | ESLint em todo o projeto |
| `pnpm test` | Suíte de testes (Vitest), execução única |
| `pnpm test:watch` | Testes em modo watch |
| `pnpm test:coverage` | Testes com relatório de cobertura |

---

## Funcionalidades

- **Autenticação** — login, cadastro e recuperação de senha via Supabase Auth. Rotas internas protegidas por `ProtectedRoute`.
- **Dashboard** — totais de clientes, serviços e ordens, contadores por status, faturamento do mês e gráfico de receita dos últimos 6 meses.
- **Clientes** — CRUD completo, máscaras e validação de CPF/CNPJ, telefone e CEP, múltiplos endereços por cliente (com endereço padrão) e avatar.
- **Serviços** — CRUD do catálogo, com preço, descrição, flag de ativo/inativo e imagem.
- **Ordens de serviço** — CRUD com cliente vinculado, itens de serviço (nome, quantidade, preço), total, desconto, agendamento, descrição, observações, imagem, prioridade (`low` / `normal` / `high`) e status:

  | Status | Rótulo na UI |
  | --- | --- |
  | `start` | Iniciar |
  | `progress` | Em andamento |
  | `waiting` | Aguardando |
  | `cancelled` | Cancelado |
  | `finished` | Finalizado |

- **Impressão de OS** — layout dedicado de impressão (`react-to-print`), com opção de usar o logo do perfil no cabeçalho.
- **Financeiro** — registro de pagamentos vinculados a ordens, com totais recebidos e pendentes.
- **Relatórios** — filtros por mês, ano e cliente, com resumo de faturamento e contagem por status.
- **Campos personalizados** — o usuário define campos extras para clientes, serviços e ordens direto em Configurações. Tipos suportados: `text`, `textarea`, `number`, `date`, `select`, `multiselect`, `checkbox`, `email`, `phone`, `document`, `zip`, `plate`. Aceitam obrigatoriedade, placeholder e reordenação por drag-and-drop.
- **Configurações** — dados do perfil/empresa (contato, documento, endereço), logo, preferência de logo na impressão e alternância de tema claro/escuro/sistema.
- **Upload de imagens** — componente `ImageUploader` gravando no bucket `app-images` do Supabase Storage.

---

## Rotas

| Rota | Página | Acesso |
| --- | --- | --- |
| `/` | Login | pública |
| `/cadastro` | Registro | pública |
| `/esqueci-senha` | Recuperação de senha | pública |
| `/dashboard` | Dashboard | protegida |
| `/clientes`, `/clientes/novo`, `/clientes/:id`, `/clientes/:id/editar` | Clientes | protegida |
| `/servicos`, `/servicos/novo`, `/servicos/:id`, `/servicos/:id/editar` | Serviços | protegida |
| `/ordens`, `/ordens/nova`, `/ordens/:id`, `/ordens/:id/editar` | Ordens de serviço | protegida |
| `/ordens/:id/imprimir` | Impressão da OS | protegida |
| `/financeiro` | Financeiro | protegida |
| `/relatorios` | Relatórios | protegida |
| `/notificacoes` | Notificações | protegida |
| `/configuracoes` | Configurações | protegida |
| `*` | Not Found | — |

---

## Estrutura do projeto

```
src/
├── components/
│   ├── client/          # AddressManager (endereços do cliente)
│   ├── form/            # CustomFieldsRenderer, ImageUploader
│   ├── layout/          # AppLayout, Sidebar, BottomNav, TopNav, DesktopHeader
│   ├── print/           # ServiceOrderPrint
│   ├── settings/        # CustomFieldsSettings
│   ├── ui/              # shadcn/ui + StatusBadge, app-logo
│   ├── ProtectedRoute.tsx
│   └── theme-provider.tsx
├── contexts/AuthContext.tsx   # sessão Supabase
├── hooks/                     # useClients, useServices, useOrders, useTransactions,
│                              # useProfile, useStorage, useCustomFieldDefinitions
├── lib/                       # supabase.ts (client), formatters.ts, utils.ts
├── pages/                     # uma página por rota
├── test/setup.ts              # setup global do Vitest
├── types/index.ts             # Client, Address, Service, ServiceOrder, Transaction, Profile...
├── utils/                     # masks.ts (telefone, CPF/CNPJ, CEP, placa), validations.ts
└── index.css                  # design tokens (HSL) para tema claro/escuro

supabase/
└── migrations/                # schema versionado (tabelas, RLS, triggers, storage)
```

O alias `@` aponta para `src/` (configurado em `vite.config.ts` e `tsconfig.json`).

### Acesso a dados

Todo acesso ao backend passa pelos hooks em `src/hooks/`, que encapsulam TanStack Query sobre o client Supabase — cada hook expõe a lista e as mutations de create/update/delete, invalidando o cache no sucesso. As páginas não chamam o Supabase diretamente.

Os hooks também fazem a tradução entre o `snake_case` do banco e o `camelCase` dos tipos do frontend (ex.: `birth_date` → `birthDate`, `image_url` → `imageUrl`, `custom_fields` → `customFields`).

---

## Banco de dados (Supabase)

O schema vive em `supabase/migrations/`:

| Migration | Conteúdo |
| --- | --- |
| `20260825120000_initial_schema.sql` | Tabelas, índices, constraints, RLS e o trigger de criação de perfil |
| `20260825120100_storage.sql` | Bucket `app-images` e suas policies |

```sh
# Aplicar em um projeto Supabase
supabase link --project-ref <seu-project-ref>
supabase db push
```

> **Importante:** o projeto em produção foi criado pela UI do Supabase, e estas migrations são um **baseline reconstruído a partir das queries em `src/hooks/`**. Elas levantam um banco novo corretamente, mas podem divergir do banco existente em tipos, defaults e constraints. Antes de aplicar sobre a base atual, rode `supabase db diff` e revise. O ideal é substituir este baseline por um `supabase db pull` do banco real assim que possível.

Pontos de projeto que valem destaque:

- **RLS em todas as tabelas** — é a única barreira entre tenants, já que o app acessa o banco direto com a anon key. Tabelas com `user_id` usam `auth.uid() = user_id`; `client_addresses` e `order_items` herdam a posse do registro pai via `exists (...)`.
- **Trigger `handle_new_user`** — `RegisterPage.tsx` só chama `auth.signUp()` e nunca insere em `profiles`, mas `useProfile()` faz `.single()` e trata a ausência da linha como erro. Sem o trigger, todo usuário novo quebra a tela de configurações. A migration também preenche perfis de usuários que já existiam.
- **Cascatas** — apagar um usuário limpa clientes, endereços, ordens, itens e transações; apagar um cliente leva junto seus endereços e ordens. Isso sustenta a estratégia de "regravar tudo" (delete + insert) usada nos hooks.
- **CHECK constraints** em `status`, `priority`, `type` e `entity_type`, espelhando as unions do TypeScript em `src/types/index.ts`.

O schema resultante:

| Tabela | Colunas usadas pelo app |
| --- | --- |
| `profiles` | `id` (= `auth.users.id`), `name`, `email`, `phone`, `document`, `avatar_url`, `use_logo_for_print`, `birth_date`, `cep`, `street`, `number`, `complement`, `neighborhood`, `city`, `state`, `updated_at` |
| `clients` | `id`, `user_id`, `name`, `email`, `phone`, `document`, `birth_date`, `custom_fields` (jsonb), `avatar_url`, `created_at` |
| `client_addresses` | `id`, `client_id`, `label`, `cep`, `street`, `number`, `complement`, `neighborhood`, `city`, `state`, `is_default` |
| `services` | `id`, `user_id`, `name`, `description`, `price`, `active`, `custom_fields` (jsonb), `image_url`, `created_at` |
| `service_orders` | `id`, `user_id`, `client_id`, `number`, `status`, `priority`, `total`, `discount`, `description`, `observations`, `scheduled_at`, `custom_fields` (jsonb), `image_url`, `created_at` |
| `order_items` | `id`, `order_id`, `name`, `quantity`, `price` |
| `transactions` | `id`, `user_id`, `order_id`, `amount`, `date`, `type` |
| `custom_field_definitions` | `id`, `user_id`, `entity_type` (`client` \| `service` \| `order`), `name`, `type`, `required`, `options` (array), `placeholder`, `order_index`, `created_at` |

**Storage:** bucket `app-images` — avatares de clientes, imagens de serviços e ordens, logo do perfil. Leitura pública (as URLs vão direto em `<img>` e no layout de impressão), escrita restrita a usuários autenticados.

---

## Testes

[Vitest](https://vitest.dev/) + Testing Library, com ambiente `jsdom`. A configuração fica no bloco `test` do `vite.config.ts` e o setup global em `src/test/setup.ts`.

```sh
pnpm test              # execução única
pnpm test:watch        # modo watch
pnpm test:coverage     # com cobertura
```

Os testes ficam ao lado do código que exercitam (`src/**/*.test.ts{,x}`). A cobertura atual concentra-se na lógica pura, que é onde moram as regras de negócio de verdade:

| Arquivo | O que cobre |
| --- | --- |
| `src/utils/validations.test.ts` | Dígitos verificadores de CPF/CNPJ, e-mail e placas (padrão antigo e Mercosul) |
| `src/utils/masks.test.ts` | Máscaras de telefone, documento, CEP e placa, incluindo estados parciais durante a digitação |
| `src/lib/formatters.test.ts` | Formatação de documento, telefone, CEP e moeda BRL |
| `src/components/ui/StatusBadge.test.tsx` | Renderização dos cinco status e composição de `className` |

O relatório de cobertura (`pnpm test:coverage`) mede apenas `src/utils`, `src/lib` e `StatusBadge` — componentes gerados pelo shadcn/ui e boilerplate de bootstrap ficam de fora para o número não virar ruído.

---

## Estado atual / pendências conhecidas

- **Relatórios**: os botões de exportar PDF/Excel e enviar por e-mail em `ReportsPage` ainda são simulados (apenas exibem um toast); a geração de arquivo não está implementada.
- **Notificações**: `NotificationsPage` usa uma lista mockada — não há tabela de notificações no backend.
- **Endereços e itens de OS** são regravados por completo (delete + insert) a cada update, em vez de diff incremental.
- **Migrations são um baseline reconstruído**, não um dump do banco em produção — veja o aviso na seção de banco de dados.
- **Cobertura de testes concentrada na lógica pura**: hooks de dados, páginas e fluxos de formulário ainda não têm testes.
- **Dívida de lint**: `pnpm lint` ainda acusa ~34 erros, quase todos `@typescript-eslint/no-explicit-any` (incluindo em componentes gerados pelo shadcn/ui). O typecheck (`tsc --noEmit`) e o build estão limpos.

---

## Deploy

`pnpm build` gera um site estático em `dist/`, publicável em qualquer host de estáticos (Vercel, Netlify, Cloudflare Pages, S3, nginx). Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no ambiente de build e habilite o fallback de SPA para `index.html` (necessário pelo React Router).
