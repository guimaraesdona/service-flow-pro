import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockSupabase } from "./mockSupabase";
import { MOCK_USER } from "./mockSeed";

type Client = ReturnType<typeof createMockSupabase>;

// O localStorage global do Node 22+ (sem --localstorage-file) não funciona e
// encobre o do jsdom; um Storage em memória basta para o mock.
function memoryStorage(): Storage {
    const items = new Map<string, string>();
    return {
        get length() {
            return items.size;
        },
        clear: () => items.clear(),
        getItem: (key) => items.get(key) ?? null,
        key: (index) => [...items.keys()][index] ?? null,
        removeItem: (key) => void items.delete(key),
        setItem: (key, value) => void items.set(key, String(value)),
    };
}

describe("mockSupabase", () => {
    let supabase: Client;

    beforeEach(async () => {
        vi.stubGlobal("localStorage", memoryStorage());
        vi.spyOn(console, "info").mockImplementation(() => {});
        supabase = createMockSupabase();
        await supabase.auth.signInWithPassword({ email: MOCK_USER.email, password: MOCK_USER.password });
    });

    it("recusa senha errada com o código que a tela de login traduz", async () => {
        await supabase.auth.signOut();
        const { error } = await supabase.auth.signInWithPassword({ email: MOCK_USER.email, password: "errada" });
        expect(error?.code).toBe("invalid_credentials");
    });

    it("não devolve dados sem sessão", async () => {
        await supabase.auth.signOut();
        const { data } = await supabase.from("clients").select("*");
        expect(data).toEqual([]);
    });

    it("resolve embeds um-para-muitos e muitos-para-um, inclusive aninhados", async () => {
        const { data: orders } = await supabase
            .from("service_orders")
            .select("*, client:clients(name), items:order_items(*)")
            .order("created_at", { ascending: false });

        expect(orders!.length).toBeGreaterThan(0);
        expect(orders![0].client).toEqual({ name: expect.any(String) });
        expect(orders![0].items.length).toBeGreaterThan(0);

        const { data: transactions } = await supabase
            .from("transactions")
            .select("*, order:service_orders( client:clients(name) )");
        expect(transactions![0].order.client.name).toEqual(expect.any(String));
    });

    it("insere com defaults e devolve a linha com .select().single()", async () => {
        const { data, error } = await supabase
            .from("services")
            .insert({ user_id: MOCK_USER.id, name: "Novo serviço", image_url: undefined })
            .select()
            .single();

        expect(error).toBeNull();
        expect(data).toMatchObject({ name: "Novo serviço", price: 0, active: true, id: expect.any(String) });
    });

    it("apaga em cascata como o schema", async () => {
        const { data: client } = await supabase
            .from("clients")
            .select("*, addresses:client_addresses(*)")
            .eq("name", "Mariana Costa")
            .single();

        await supabase.from("clients").delete().eq("id", client!.id);

        const { data: orders } = await supabase.from("service_orders").select("*").eq("client_id", client!.id);
        const { data: addresses } = await supabase.from("client_addresses").select("*").eq("client_id", client!.id);
        expect(orders).toEqual([]);
        expect(addresses).toEqual([]);
    });

    it("single() sem linha devolve PGRST116, como o PostgREST", async () => {
        const { error } = await supabase.from("clients").select("*").eq("id", "inexistente").single();
        expect(error?.code).toBe("PGRST116");
    });

    it("cadastro cria o perfil e persiste entre recargas", async () => {
        await supabase.auth.signUp({ email: "nova@exemplo.com", password: "123456", options: { data: { full_name: "Nova" } } });
        const reloaded = createMockSupabase();
        const { error } = await reloaded.auth.signInWithPassword({ email: "nova@exemplo.com", password: "123456" });
        const { data: profile } = await reloaded.from("profiles").select("*").single();

        expect(error).toBeNull();
        expect(profile).toMatchObject({ name: "Nova", email: "nova@exemplo.com" });
    });
});
