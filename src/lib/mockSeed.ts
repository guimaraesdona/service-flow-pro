// Dados iniciais do modo mock (`pnpm dev:mock`). As datas são relativas a
// hoje, para o dashboard e os relatórios sempre terem movimento nos últimos
// meses.

export const MOCK_USER = {
    id: "00000000-0000-4000-8000-000000000001",
    email: "demo@guimaraesdona.com.br",
    password: "demo1234",
    user_metadata: { full_name: "Oficina Demonstração" },
    created_at: new Date().toISOString(),
};

const userId = MOCK_USER.id;
const id = (prefix: string, n: number) => `${prefix}-0000-4000-8000-${String(n).padStart(12, "0")}`;

const daysAgo = (days: number, hour = 10) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(hour, 0, 0, 0);
    return date.toISOString();
};

export function buildSeed(): Record<string, Record<string, unknown>[]> {
    const clients = [
        { name: "Mariana Costa", email: "mariana.costa@email.com", phone: "(31) 98765-4321", document: "529.982.247-25", birth_date: "1988-03-14" },
        { name: "Transportes Horizonte Ltda", email: "contato@horizonte.com.br", phone: "(31) 3344-5566", document: "11.222.333/0001-81", birth_date: null },
        { name: "Rafael Almeida", email: "rafael.almeida@email.com", phone: "(31) 99123-4567", document: "153.509.460-56", birth_date: "1979-11-02" },
        { name: "Juliana Pereira", email: "ju.pereira@email.com", phone: "(31) 98888-1234", document: "390.533.447-05", birth_date: "1995-07-21" },
        { name: "Padaria Pão Dourado", email: "financeiro@paodourado.com.br", phone: "(31) 3222-9988", document: "45.723.174/0001-10", birth_date: null },
    ].map((client, index) => ({
        ...client,
        id: id("10000000", index + 1),
        user_id: userId,
        custom_fields: {},
        avatar_url: null,
        created_at: daysAgo(200 - index * 30),
    }));

    const client_addresses = [
        { client: 0, label: "Casa", cep: "30130-000", street: "Av. Afonso Pena", number: "1500", neighborhood: "Centro", city: "Belo Horizonte", state: "MG" },
        { client: 1, label: "Garagem", cep: "32010-000", street: "Rua das Indústrias", number: "420", neighborhood: "Cinco", city: "Contagem", state: "MG" },
        { client: 2, label: "Casa", cep: "30320-000", street: "Rua Grão Mogol", number: "88", neighborhood: "Sion", city: "Belo Horizonte", state: "MG" },
        { client: 4, label: "Loja", cep: "31170-000", street: "Rua Itapecerica", number: "1020", neighborhood: "Lagoinha", city: "Belo Horizonte", state: "MG" },
    ].map(({ client, ...address }, index) => ({
        ...address,
        id: id("11000000", index + 1),
        client_id: clients[client].id,
        complement: null,
        is_default: true,
        created_at: clients[client].created_at,
    }));

    const services = [
        { name: "Troca de óleo e filtro", description: "Óleo sintético 5W30 e filtro de óleo.", price: 250 },
        { name: "Alinhamento e balanceamento", description: "Alinhamento 3D e balanceamento das quatro rodas.", price: 180 },
        { name: "Revisão de freios", description: "Inspeção, troca de pastilhas e fluido de freio.", price: 420 },
        { name: "Diagnóstico eletrônico", description: "Leitura de falhas com scanner.", price: 150 },
        { name: "Higienização do ar-condicionado", description: "Limpeza do sistema e troca do filtro de cabine.", price: 200 },
        { name: "Polimento", description: "Polimento técnico com cristalização.", price: 600, active: false },
    ].map((service, index) => ({
        active: true,
        ...service,
        id: id("20000000", index + 1),
        user_id: userId,
        custom_fields: {},
        image_url: null,
        created_at: daysAgo(210 - index),
    }));

    const svc = (index: number, quantity = 1) => ({ name: services[index].name, quantity, price: services[index].price });

    const orderSpecs = [
        { client: 0, days: 160, status: "finished", priority: "normal", items: [svc(0), svc(1)] },
        { client: 1, days: 140, status: "finished", priority: "high", items: [svc(2, 2), svc(3)] },
        { client: 2, days: 115, status: "finished", priority: "normal", items: [svc(4)] },
        { client: 3, days: 95, status: "cancelled", priority: "low", items: [svc(5)] },
        { client: 1, days: 75, status: "finished", priority: "normal", items: [svc(0, 3)] },
        { client: 4, days: 50, status: "finished", priority: "normal", items: [svc(3), svc(4)] },
        { client: 0, days: 30, status: "finished", priority: "high", items: [svc(2)], discount: 20 },
        { client: 2, days: 12, status: "waiting", priority: "normal", items: [svc(1)] },
        { client: 3, days: 6, status: "progress", priority: "high", items: [svc(2), svc(3)] },
        { client: 4, days: 2, status: "start", priority: "normal", items: [svc(0)], scheduledInDays: 3 },
        { client: 1, days: 1, status: "start", priority: "low", items: [svc(4, 2)], scheduledInDays: 7 },
    ];

    const service_orders = orderSpecs.map((spec, index) => {
        const subtotal = spec.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const discount = spec.discount ?? 0;
        return {
            id: id("30000000", index + 1),
            user_id: userId,
            client_id: clients[spec.client].id,
            number: String(index + 1).padStart(4, "0"),
            status: spec.status,
            priority: spec.priority,
            total: subtotal - discount,
            discount,
            description: spec.items.map((item) => item.name).join(", "),
            observations: null,
            scheduled_at: spec.scheduledInDays ? daysAgo(-spec.scheduledInDays, 9) : null,
            custom_fields: {},
            image_url: null,
            created_at: daysAgo(spec.days),
        };
    });

    const order_items = orderSpecs.flatMap((spec, orderIndex) =>
        spec.items.map((item, itemIndex) => ({
            ...item,
            id: id("31000000", orderIndex * 10 + itemIndex + 1),
            order_id: service_orders[orderIndex].id,
            created_at: service_orders[orderIndex].created_at,
        })),
    );

    // Ordens finalizadas foram pagas; a mais recente ainda tem parte pendente.
    const transactions = service_orders
        .filter((order) => order.status === "finished" || order.status === "progress")
        .flatMap((order) => {
            const date = order.created_at.slice(0, 10);
            if (order.status === "progress") {
                return [{ order, amount: order.total / 2, type: "received", date }, { order, amount: order.total / 2, type: "pending", date }];
            }
            return [{ order, amount: order.total, type: "received", date }];
        })
        .map(({ order, ...transaction }, index) => ({
            ...transaction,
            id: id("40000000", index + 1),
            user_id: userId,
            order_id: order.id,
            created_at: order.created_at,
        }));

    const custom_field_definitions = [
        { entity_type: "order", name: "Placa do veículo", type: "plate", required: false, placeholder: "ABC1D23" },
        { entity_type: "order", name: "Quilometragem", type: "number", required: false, placeholder: "Ex.: 45000" },
        { entity_type: "client", name: "Como nos conheceu", type: "select", required: false, options: ["Indicação", "Instagram", "Google", "Passou na frente"] },
    ].map((field, index) => ({
        options: [],
        ...field,
        id: id("50000000", index + 1),
        user_id: userId,
        order_index: index + 1,
        created_at: daysAgo(220),
    }));

    const profiles = [
        {
            id: userId,
            name: MOCK_USER.user_metadata.full_name,
            email: MOCK_USER.email,
            phone: "(31) 3333-4444",
            document: "12.345.678/0001-95",
            avatar_url: null,
            use_logo_for_print: true,
            cep: "30140-000",
            street: "Rua da Bahia",
            number: "1200",
            complement: null,
            neighborhood: "Lourdes",
            city: "Belo Horizonte",
            state: "MG",
            created_at: daysAgo(230),
        },
    ];

    return { profiles, clients, client_addresses, services, service_orders, order_items, transactions, custom_field_definitions };
}
