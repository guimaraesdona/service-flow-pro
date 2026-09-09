import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const REQUIRED_ENV = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"] as const;

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // As VITE_* são inlinadas no bundle em tempo de build. Se faltarem aqui, o
  // build "passa" e publica um site que quebra na primeira tela. Falhar o
  // deploy é melhor do que publicar um bundle morto.
  if (command === "build" && mode !== "development") {
    const env = loadEnv(mode, process.cwd(), "VITE_");
    const missing = REQUIRED_ENV.filter((key) => !env[key]);

    if (missing.length > 0) {
      throw new Error(
        `Build abortado — variáveis de ambiente ausentes: ${missing.join(", ")}.\n` +
          "Defina-as no ambiente de build (ou em .env.local, para builds locais). Veja .env.example.",
      );
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/test/setup.ts"],
      css: false,
      include: ["src/**/*.{test,spec}.{ts,tsx}"],
      coverage: {
        provider: "v8",
        reporter: ["text", "html"],
        // Só o código com lógica própria entra na medição; componentes gerados
        // pelo shadcn/ui e o boilerplate de bootstrap ficam de fora.
        include: ["src/utils/**", "src/lib/**", "src/components/ui/StatusBadge.tsx"],
      },
    },
  };
});
