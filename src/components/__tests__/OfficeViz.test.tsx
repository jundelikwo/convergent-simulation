import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OfficeViz } from "../OfficeViz";

describe("OfficeViz", () => {
  it("renders legend with Engineer, Sales, Empty", () => {
    render(<OfficeViz engineers={4} salesStaff={2} />);
    expect(screen.getByText("Engineer")).toBeInTheDocument();
    expect(screen.getByText("Sales")).toBeInTheDocument();
    expect(screen.getByText("Empty")).toBeInTheDocument();
  });

  it("renders correct number of engineer and sales desks", () => {
    const { container } = render(<OfficeViz engineers={3} salesStaff={2} />);
    const engineerSlots = container.querySelectorAll('[title="Engineer"]');
    const salesSlots = container.querySelectorAll('[title="Sales"]');
    const emptySlots = container.querySelectorAll('[title="Empty"]');

    expect(engineerSlots.length).toBe(3);
    expect(salesSlots.length).toBe(2);
    expect(emptySlots.length).toBeGreaterThan(0);
  });

  it("shows empty desks when headcount is below capacity", () => {
    const { container } = render(<OfficeViz engineers={0} salesStaff={0} />);
    const emptySlots = container.querySelectorAll('[title="Empty"]');
    expect(emptySlots.length).toBeGreaterThan(0);
  });

  it("capacity is at least 12 for small teams", () => {
    const { container } = render(<OfficeViz engineers={2} salesStaff={1} />);
    const totalSlots =
      container.querySelectorAll('[title="Engineer"]').length +
      container.querySelectorAll('[title="Sales"]').length +
      container.querySelectorAll('[title="Empty"]').length;
    expect(totalSlots).toBeGreaterThanOrEqual(12);
  });

  it("capacity grows with headcount", () => {
    const { container: small } = render(<OfficeViz engineers={4} salesStaff={2} />);
    const { container: large } = render(<OfficeViz engineers={10} salesStaff={8} />);

    const smallTotal =
      small.querySelectorAll('[title="Engineer"]').length +
      small.querySelectorAll('[title="Sales"]').length +
      small.querySelectorAll('[title="Empty"]').length;
    const largeTotal =
      large.querySelectorAll('[title="Engineer"]').length +
      large.querySelectorAll('[title="Sales"]').length +
      large.querySelectorAll('[title="Empty"]').length;

    expect(largeTotal).toBeGreaterThan(smallTotal);
  });

  it("capacity is multiple of 6", () => {
    const { container } = render(<OfficeViz engineers={5} salesStaff={5} />);
    const totalSlots =
      container.querySelectorAll('[title="Engineer"]').length +
      container.querySelectorAll('[title="Sales"]').length +
      container.querySelectorAll('[title="Empty"]').length;
    expect(totalSlots % 6).toBe(0);
  });
});
