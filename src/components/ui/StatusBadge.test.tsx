import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "./StatusBadge";
import type { OrderStatus } from "@/types";

describe("StatusBadge", () => {
  const casos: Array<[OrderStatus, string]> = [
    ["start", "Aberta"],
    ["progress", "Em andamento"],
    ["waiting", "Aguardando"],
    ["cancelled", "Cancelada"],
    ["finished", "Finalizada"],
  ];

  it.each(casos)("renderiza o rótulo em português para %s", (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("aplica a cor correspondente ao status", () => {
    render(<StatusBadge status="finished" />);
    expect(screen.getByText("Finalizada")).toHaveClass("text-status-finished-fg");
  });

  it("mescla a className recebida por prop", () => {
    render(<StatusBadge status="start" className="minha-classe" />);
    expect(screen.getByText("Aberta")).toHaveClass("minha-classe");
  });
});
