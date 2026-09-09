import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // O Vite inlina estas variáveis em tempo de build. Se elas chegaram vazias
    // aqui, o bundle foi gerado sem credenciais e não há o que recuperar em
    // runtime — o antigo fallback de `createClient("", "")` não evitava a
    // quebra, só a transformava no opaco "supabaseUrl is required".
    throw new Error(
        "Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY " +
        "no ambiente de build e gere o bundle novamente. Veja .env.example.",
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
