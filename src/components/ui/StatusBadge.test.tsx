import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "./StatusBadge";
import type { OrderStatus } from "@/types";

describe("StatusBadge", () => {
  const casos: Array<[OrderStatus, string]> = [
    ["start", "Iniciar"],
    ["progress", "Em andamento"],
    ["waiting", "Aguardando"],
    ["cancelled", "Cancelado"],
    ["finished", "Finalizado"],
  ];

  it.each(casos)("renderiza o rótulo em português para %s", (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("aplica a cor correspondente ao status", () => {
    render(<StatusBadge status="finished" />);
    expect(screen.getByText("Finalizado")).toHaveClass("text-status-finished");
  });

  it("mescla a className recebida por prop", () => {
    render(<StatusBadge status="start" className="minha-classe" />);
    expect(screen.getByText("Iniciar")).toHaveClass("minha-classe");
  });
});
