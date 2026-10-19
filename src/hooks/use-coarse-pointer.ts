import { useEffect, useState } from "react";

const QUERY = "(pointer: coarse)";

// Telas de toque (celular, tablet) preferem os seletores nativos do sistema;
// mouse e trackpad ganham os popovers do app.
export function useCoarsePointer() {
  const [coarse, setCoarse] = useState(() => typeof window !== "undefined" && window.matchMedia(QUERY).matches);

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const update = () => setCoarse(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return coarse;
}
