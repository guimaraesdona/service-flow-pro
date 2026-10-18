import type { SupabaseClient } from "@supabase/supabase-js";
import { buildSeed, MOCK_USER } from "./mockSeed";

// Client do Supabase em memória, para rodar o app sem banco (`pnpm dev:mock`).
// Implementa só o subconjunto da API que os hooks e as páginas usam: from()
// com select/insert/update/delete/eq/order/limit/single, os embeds do select
// ("alias:tabela(colunas)"), auth com email/senha e storage de imagens.
// O estado fica no localStorage, então sobrevive a um F5; para zerar, rode
// `localStorage.removeItem("sfp-mock-db")` no console.

// Linhas sem schema, como o client sem tipos gerados devolve.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;
type Db = Record<string, Row[]>;
type MockUser = { id: string; email: string; password: string; user_metadata: Row; created_at: string };
type State = { db: Db; users: MockUser[]; sessionUserId: string | null; files: Record<string, string> };

const STORAGE_KEY = "sfp-mock-db";
const PUBLIC_URL_PREFIX = "mock-storage://";

// Equivalente às foreign keys do schema: de onde sai o embed e por qual coluna.
// "many": a tabela embutida aponta para a de origem (vira array).
// "one": a tabela de origem aponta para a embutida (vira objeto ou null).
const RELATIONS: Record<string, { kind: "one" | "many"; fk: string }> = {
    "clients.client_addresses": { kind: "many", fk: "client_id" },
    "service_orders.clients": { kind: "one", fk: "client_id" },
    "service_orders.order_items": { kind: "many", fk: "order_id" },
    "transactions.service_orders": { kind: "one", fk: "order_id" },
};

// on delete cascade do schema.
const CASCADES: Record<string, { table: string; fk: string }[]> = {
    clients: [
        { table: "client_addresses", fk: "client_id" },
        { table: "service_orders", fk: "client_id" },
    ],
    service_orders: [
        { table: "order_items", fk: "order_id" },
        { table: "transactions", fk: "order_id" },
    ],
};

// Defaults das colunas, aplicados no insert.
const DEFAULTS: Record<string, () => Row> = {
    clients: () => ({ custom_fields: {} }),
    client_addresses: () => ({ is_default: false }),
    services: () => ({ price: 0, active: true, custom_fields: {} }),
    service_orders: () => ({ status: "start", priority: "normal", total: 0, discount: 0, custom_fields: {} }),
    order_items: () => ({ quantity: 1, price: 0 }),
    transactions: () => ({ date: new Date().toISOString().slice(0, 10), type: "received" }),
    custom_field_definitions: () => ({ required: false, order_index: 0 }),
};

// Tabelas isoladas por usuário, como a RLS faz no banco real.
const OWNER_COLUMN: Record<string, string> = {
    profiles: "id",
    clients: "user_id",
    services: "user_id",
    service_orders: "user_id",
    transactions: "user_id",
    custom_field_definitions: "user_id",
};

const latency = () => new Promise((resolve) => setTimeout(resolve, 150));
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

function loadState(): State {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch {
        // localStorage indisponível ou corrompido: recomeça do seed.
    }
    return { db: buildSeed(), users: [MOCK_USER], sessionUserId: null, files: {} };
}

// Carregado só em createMockSupabase(): sem efeito colateral no topo do
// módulo, o Rollup consegue descartá-lo do bundle de produção.
let state: State;

function persist() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
        console.warn("[mock] não foi possível salvar o estado no localStorage:", err);
    }
}

const table = (name: string) => (state.db[name] ??= []);

// ---------------------------------------------------------------------------
// select("*, alias:tabela(colunas)")

type Selection = { columns: string[]; embeds: { alias: string; table: string; selection: Selection }[] };

function splitTopLevel(input: string): string[] {
    const parts: string[] = [];
    let depth = 0;
    let current = "";
    for (const char of input) {
        if (char === "(") depth++;
        if (char === ")") depth--;
        if (char === "," && depth === 0) {
            parts.push(current);
            current = "";
        } else {
            current += char;
        }
    }
    parts.push(current);
    return parts.map((part) => part.trim()).filter(Boolean);
}

function parseSelection(input: string): Selection {
    const selection: Selection = { columns: [], embeds: [] };
    for (const part of splitTopLevel(input.replace(/\s+/g, " "))) {
        const embed = part.match(/^(?:(\w+)\s*:\s*)?(\w+)\s*\(([\s\S]*)\)$/);
        if (embed) {
            const [, alias, target, inner] = embed;
            selection.embeds.push({ alias: alias ?? target, table: target, selection: parseSelection(inner) });
        } else {
            selection.columns.push(part);
        }
    }
    return selection;
}

function project(source: string, row: Row, selection: Selection): Row {
    const result: Row = selection.columns.includes("*")
        ? { ...row }
        : Object.fromEntries(selection.columns.map((col) => [col, row[col] ?? null]));

    for (const embed of selection.embeds) {
        const relation = RELATIONS[`${source}.${embed.table}`];
        if (!relation) throw new Error(`[mock] relação não mapeada: ${source} → ${embed.table}`);

        if (relation.kind === "many") {
            result[embed.alias] = table(embed.table)
                .filter((child) => child[relation.fk] === row.id)
                .map((child) => project(embed.table, child, embed.selection));
        } else {
            const parent = table(embed.table).find((candidate) => candidate.id === row[relation.fk]);
            result[embed.alias] = parent ? project(embed.table, parent, embed.selection) : null;
        }
    }
    return result;
}

// ---------------------------------------------------------------------------
// Query builder: encadeável e "thenable", executa no await como o PostgREST.

type Result = { data: Row | Row[] | null; error: { message: string; code?: string } | null; count?: number | null };

class MockQuery implements PromiseLike<Result> {
    private action: "select" | "insert" | "update" | "delete" = "select";
    private payload: Row | Row[] | null = null;
    private selection: Selection | null = null;
    private filters: [string, unknown][] = [];
    private orders: { column: string; ascending: boolean }[] = [];
    private limitCount: number | null = null;
    private singleRow = false;

    constructor(private tableName: string) {}

    select(columns = "*") {
        this.selection = parseSelection(columns);
        return this;
    }

    insert(rows: Row | Row[]) {
        this.action = "insert";
        this.payload = rows;
        return this;
    }

    update(values: Row) {
        this.action = "update";
        this.payload = values;
        return this;
    }

    delete() {
        this.action = "delete";
        return this;
    }

    eq(column: string, value: unknown) {
        this.filters.push([column, value]);
        return this;
    }

    order(column: string, { ascending = true }: { ascending?: boolean } = {}) {
        this.orders.push({ column, ascending });
        return this;
    }

    limit(count: number) {
        this.limitCount = count;
        return this;
    }

    single() {
        this.singleRow = true;
        return this;
    }

    then<T1 = Result, T2 = never>(
        onFulfilled?: ((value: Result) => T1 | PromiseLike<T1>) | null,
        onRejected?: ((reason: unknown) => T2 | PromiseLike<T2>) | null,
    ): PromiseLike<T1 | T2> {
        return latency()
            .then(() => this.execute())
            .then(onFulfilled, onRejected);
    }

    private visible(row: Row) {
        const owner = OWNER_COLUMN[this.tableName];
        return !owner || row[owner] === state.sessionUserId;
    }

    private matches(row: Row) {
        return this.visible(row) && this.filters.every(([column, value]) => row[column] === value);
    }

    private execute(): Result {
        if (OWNER_COLUMN[this.tableName] && !state.sessionUserId) {
            return { data: this.singleRow ? null : [], error: null };
        }

        let rows: Row[];
        switch (this.action) {
            case "insert":
                rows = this.runInsert();
                break;
            case "update":
                rows = this.runUpdate();
                break;
            case "delete":
                rows = this.runDelete();
                break;
            default:
                rows = table(this.tableName).filter((row) => this.matches(row));
        }

        if (this.action !== "select") persist();
        // Sem .select(), insert/update/delete não devolvem linhas no PostgREST.
        if (this.action !== "select" && !this.selection) return { data: null, error: null };

        rows = this.sorted(rows);
        if (this.limitCount !== null) rows = rows.slice(0, this.limitCount);
        const data = rows.map((row) => project(this.tableName, row, this.selection ?? parseSelection("*")));

        if (this.singleRow) {
            if (data.length !== 1) {
                return {
                    data: null,
                    error: { code: "PGRST116", message: "JSON object requested, multiple (or no) rows returned" },
                };
            }
            return { data: clone(data[0]), error: null };
        }
        return { data: clone(data), error: null };
    }

    private sorted(rows: Row[]) {
        if (this.orders.length === 0) return rows;
        return [...rows].sort((a, b) => {
            for (const { column, ascending } of this.orders) {
                if (a[column] === b[column]) continue;
                if (a[column] == null) return 1;
                if (b[column] == null) return -1;
                const diff = a[column] < b[column] ? -1 : 1;
                return ascending ? diff : -diff;
            }
            return 0;
        });
    }

    private runInsert() {
        const now = new Date().toISOString();
        const inserted = (Array.isArray(this.payload) ? this.payload : [this.payload!]).map((values) => ({
            ...DEFAULTS[this.tableName]?.(),
            id: crypto.randomUUID(),
            created_at: now,
            // undefined vira o default da coluna, como no PostgREST.
            ...Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined)),
        }));
        table(this.tableName).push(...inserted);
        return inserted;
    }

    private runUpdate() {
        const values = Object.fromEntries(
            Object.entries(this.payload as Row).filter(([, value]) => value !== undefined),
        );
        const updated = table(this.tableName).filter((row) => this.matches(row));
        for (const row of updated) Object.assign(row, values, { updated_at: new Date().toISOString() });
        return updated;
    }

    private runDelete() {
        const removed = table(this.tableName).filter((row) => this.matches(row));
        removeRows(this.tableName, removed);
        return removed;
    }
}

function removeRows(tableName: string, rows: Row[]) {
    if (rows.length === 0) return;
    const ids = new Set(rows.map((row) => row.id));
    state.db[tableName] = table(tableName).filter((row) => !ids.has(row.id));

    for (const { table: child, fk } of CASCADES[tableName] ?? []) {
        removeRows(child, table(child).filter((row) => ids.has(row[fk])));
    }
}

// ---------------------------------------------------------------------------
// Auth

type AuthListener = (event: string, session: Row | null) => void;
const listeners = new Set<AuthListener>();

function publicUser(user: MockUser) {
    return {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        app_metadata: { provider: "email" },
        aud: "authenticated",
        role: "authenticated",
        created_at: user.created_at,
    };
}

function currentSession() {
    const user = state.users.find((candidate) => candidate.id === state.sessionUserId);
    if (!user) return null;
    return {
        access_token: "mock-access-token",
        refresh_token: "mock-refresh-token",
        token_type: "bearer",
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        user: publicUser(user),
    };
}

function emit(event: string) {
    const session = currentSession();
    // O supabase-js dispara os listeners fora da call stack de quem chamou.
    setTimeout(() => listeners.forEach((listener) => listener(event, session)), 0);
}

const authError = (code: string, message: string) => ({ code, message, name: "AuthApiError", status: 400 });

const auth = {
    async getSession() {
        return { data: { session: currentSession() }, error: null };
    },

    onAuthStateChange(callback: AuthListener) {
        listeners.add(callback);
        setTimeout(() => callback("INITIAL_SESSION", currentSession()), 0);
        return { data: { subscription: { id: crypto.randomUUID(), unsubscribe: () => listeners.delete(callback) } } };
    },

    async signInWithPassword({ email, password }: { email: string; password: string }) {
        await latency();
        const user = state.users.find((candidate) => candidate.email === email.trim().toLowerCase());
        if (!user || user.password !== password) {
            return { data: { user: null, session: null }, error: authError("invalid_credentials", "Invalid login credentials") };
        }
        state.sessionUserId = user.id;
        persist();
        emit("SIGNED_IN");
        return { data: { user: publicUser(user), session: currentSession() }, error: null };
    },

    async signUp({ email, password, options }: { email: string; password: string; options?: { data?: Row } }) {
        await latency();
        const normalized = email.trim().toLowerCase();
        if (state.users.some((candidate) => candidate.email === normalized)) {
            return { data: { user: null, session: null }, error: authError("user_already_exists", "User already registered") };
        }
        const metadata = options?.data ?? {};
        const user: MockUser = {
            id: crypto.randomUUID(),
            email: normalized,
            password,
            user_metadata: metadata,
            created_at: new Date().toISOString(),
        };
        state.users.push(user);
        // Mesmo papel do trigger handle_new_user.
        table("profiles").push({
            id: user.id,
            email: normalized,
            name: metadata.full_name ?? null,
            phone: metadata.phone ?? null,
            document: metadata.document ?? null,
            use_logo_for_print: true,
            created_at: user.created_at,
        });
        persist();
        // Como no Supabase com confirmação de email ligada: cria a conta, mas não abre sessão.
        return { data: { user: publicUser(user), session: null }, error: null };
    },

    async signOut() {
        state.sessionUserId = null;
        persist();
        emit("SIGNED_OUT");
        return { error: null };
    },

    async resetPasswordForEmail(email: string) {
        await latency();
        console.info(`[mock] email de recuperação de senha "enviado" para ${email} (nenhum email sai no modo mock).`);
        return { data: {}, error: null };
    },

    async updateUser({ password, data }: { password?: string; data?: Row }) {
        await latency();
        const user = state.users.find((candidate) => candidate.id === state.sessionUserId);
        if (!user) return { data: { user: null }, error: authError("session_not_found", "Auth session missing!") };
        if (password) user.password = password;
        if (data) user.user_metadata = { ...user.user_metadata, ...data };
        persist();
        emit("USER_UPDATED");
        return { data: { user: publicUser(user) }, error: null };
    },
};

// ---------------------------------------------------------------------------
// Storage: as imagens viram data URLs guardadas no próprio estado.

const readAsDataUrl = (file: Blob) =>
    new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });

const storage = {
    from(bucket: string) {
        const key = (path: string) => `${bucket}/${path}`;
        return {
            async upload(path: string, file: Blob) {
                await latency();
                state.files[key(path)] = await readAsDataUrl(file);
                persist();
                return { data: { path }, error: null };
            },
            getPublicUrl(path: string) {
                return { data: { publicUrl: state.files[key(path)] ?? `${PUBLIC_URL_PREFIX}${key(path)}` } };
            },
            async remove(paths: string[]) {
                for (const path of paths) delete state.files[key(path)];
                persist();
                return { data: [], error: null };
            },
        };
    },
};

export function createMockSupabase() {
    state = loadState();
    console.info(
        `[mock] Supabase em memória ativo. Login de demonstração: ${MOCK_USER.email} / ${MOCK_USER.password}`,
    );
    return {
        from: (tableName: string) => new MockQuery(tableName),
        auth,
        storage,
    } as unknown as SupabaseClient;
}
