import { useEffect, useState } from "react";

// Mesmo ponto de quebra do `lg:` do Tailwind, onde entram o Sidebar e o DesktopHeader.
const QUERY = "(min-width: 1024px)";

// Para telas que mudam de estrutura (não só de estilo) no desktop e não
// podem montar as duas versões ao mesmo tempo.
export function useDesktop() {
  const [desktop, setDesktop] = useState(() => typeof window !== "undefined" && window.matchMedia(QUERY).matches);

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const update = () => setDesktop(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return desktop;
}
