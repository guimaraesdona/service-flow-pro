# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Donos e equipes de pequenos prestadores de serviço: oficinas, lava-jatos, assistência técnica, manutenção, instalações. O app não é feito para um ramo só; o automotivo é um dos casos. Quem usa é o dono ou o atendente no balcão (desktop ou celular) e o técnico no local do serviço (celular). O trabalho deles: registrar o cliente, abrir a ordem de serviço, acompanhar o andamento, entregar um recibo e receber o pagamento.

## Product Purpose

Gestão de ordens de serviço para pequenos negócios: clientes, catálogo de serviços, abertura e acompanhamento de OS com status e prioridade, pagamentos, relatórios e impressão da OS. Sucesso é o negócio largar o papel e a planilha: toda OS registrada, o status visível para a equipe e o dinheiro a receber sob controle.

## Positioning

Campos personalizados por entidade (cliente, serviço, ordem) deixam cada ramo registrar o que importa para ele, como placa e km numa oficina ou número de série numa assistência, sem um produto separado por vertical.

## Operating Context

- Uso no balcão e em campo, com muito acesso pelo celular.
- A OS impressa (recibo em bobina de 58/80 mm) é o documento que o cliente final leva. Ela carrega a identidade do negócio que usa o app, não a do produto.
- Interface em português (pt-BR), moeda BRL, documentos brasileiros (CPF/CNPJ, CEP).

## Capabilities and Constraints

- SaaS multiempresa: cada negócio cria a própria conta, e os dados são isolados por usuário (RLS no Supabase).
- Frontend estático (React + Vite) com backend Supabase (Auth, Postgres, Storage), hospedado no GitHub Pages em os.guimaraesdona.com.br.
- Status de OS: `start`, `progress`, `waiting`, `cancelled`, `finished`. Prioridade: `low`, `normal`, `high`.
- Em aberto: exportação de relatórios (PDF/Excel/email) e notificações ainda não existem. A UI não deve fingir que existem.
- Em aberto: numeração sequencial de OS. O campo `number` existe no banco, mas nada o preenche.
- Em aberto: modelo de cobrança do SaaS.

## Brand Commitments

- Nome do produto: **Service Flow Pro**.
- Visual convencional por escolha (18/10/2026): o padrão da categoria, executado no nível de acabamento de Conta Azul/Bling, Linear e Jobber/Housecall Pro. Não buscar uma identidade temática; o diferencial está na clareza e no capricho.
- O app não pode parecer de um ramo só, nem de brinquedo. O tema escuro é de primeira classe.

## Evidence on Hand

Nenhum depoimento, cliente nomeado, métrica de uso ou case. Não inventar nada disso. Os dados de exemplo do modo mock (`src/lib/mockSeed.ts`) são fictícios.

## Product Principles

1. Funciona para qualquer prestador de serviço. O específico de cada ramo entra por campos personalizados, não por telas dedicadas.
2. A OS é o centro: andamento, recibo e pagamento partem dela.
3. Celular primeiro para quem está no serviço: tudo que o desktop faz tem que ser alcançável no celular.
4. Nunca fingir: recurso que não existe não aparece como se funcionasse.
5. O recibo é do cliente do usuário: sai com a marca do negócio, não com a do produto.
