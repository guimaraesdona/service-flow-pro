export interface Address {
    id: string;
    label: string;
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    isDefault?: boolean;
}

export interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    document: string;
    birthDate: string;
    addresses: Address[];
    avatar?: string;
}

export interface ServiceItem {
    name: string;
    quantity: number;
    price: number;
}

export type OrderStatus = "start" | "progress" | "waiting" | "cancelled" | "finished";
export type OrderPriority = "low" | "normal" | "high";

export interface ServiceOrder {
    id: string;
    clientId: string;
    clientName: string;
    services: ServiceItem[];
    total: number;
    date: string;
    status: OrderStatus;
    priority: OrderPriority;
    description?: string;
    scheduledAt?: string;
    discount?: number;
}
