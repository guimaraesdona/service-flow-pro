import { createClient } from "@supabase/supabase-js";
import { createMockSupabase } from "./mockSupabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// `pnpm dev:mock` liga VITE_MOCK (ver .env.mock): o app roda contra um banco
// em memória, sem credenciais. O Vite substitui a variável por literal no
// build, então em produção o mock é descartado junto com este ramo.
const useMock = import.meta.env.VITE_MOCK === "true";

if (!useMock && (!supabaseUrl || !supabaseAnonKey)) {
    // O Vite inlina estas variáveis em tempo de build. Se elas chegaram vazias
    // aqui, o bundle foi gerado sem credenciais e não há o que recuperar em
    // runtime — o antigo fallback de `createClient("", "")` não evitava a
    // quebra, só a transformava no opaco "supabaseUrl is required".
    throw new Error(
        "Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY " +
        "no ambiente de build e gere o bundle novamente. Veja .env.example.",
    );
}

export const supabase = useMock ? createMockSupabase() : createClient(supabaseUrl, supabaseAnonKey);

// URL absoluta de uma rota do app, para os links dos e-mails do Supabase Auth
// (confirmação de cadastro, recuperação de senha). Respeita o BASE_PATH do
// build, então funciona tanto no GitHub Pages quanto na raiz de um domínio.
// A URL também precisa constar em Authentication → URL Configuration no
// Supabase; senão o link cai no Site URL.
export const authRedirectUrl = (path: string) =>
    new URL(path.replace(/^\//, ""), window.location.origin + import.meta.env.BASE_URL).href;
