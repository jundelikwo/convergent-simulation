import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DecisionPanel } from "../DecisionPanel";

describe("DecisionPanel", () => {
  it("renders all form fields", () => {
    const onAdvance = vi.fn().mockResolvedValue({});
    render(<DecisionPanel onAdvance={onAdvance} />);

    expect(screen.getByLabelText(/unit price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new engineers/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new sales/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/salary/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /advance quarter/i })).toBeInTheDocument();
  });

  it("has default values", () => {
    const onAdvance = vi.fn().mockResolvedValue({});
    render(<DecisionPanel onAdvance={onAdvance} />);

    expect(screen.getByLabelText(/unit price/i)).toHaveValue(100);
    expect(screen.getByLabelText(/new engineers/i)).toHaveValue(0);
    expect(screen.getByLabelText(/new sales/i)).toHaveValue(0);
    expect(screen.getByLabelText(/salary/i)).toHaveValue(100);
  });

  it("uses lastSalaryPct when provided", () => {
    const onAdvance = vi.fn().mockResolvedValue({});
    render(<DecisionPanel onAdvance={onAdvance} lastSalaryPct={85} />);
    expect(screen.getByLabelText(/salary/i)).toHaveValue(85);
  });

  it("calls onAdvance with form values on submit", async () => {
    const onAdvance = vi.fn().mockResolvedValue({});
    render(<DecisionPanel onAdvance={onAdvance} />);

    fireEvent.change(screen.getByLabelText(/unit price/i), { target: { value: "150" } });
    fireEvent.change(screen.getByLabelText(/new engineers/i), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText(/new sales/i), { target: { value: "2" } });

    fireEvent.submit(screen.getByTestId("decision-form"));

    await waitFor(() => {
      expect(onAdvance).toHaveBeenCalledWith({
        price: 150,
        new_engineers: 1,
        new_sales: 2,
        salary_pct: 100,
      });
    });
  });

  it("disables button while loading", async () => {
    let resolveAdvance: () => void;
    const advancePromise = new Promise<void>((r) => {
      resolveAdvance = r;
    });
    const onAdvance = vi.fn().mockReturnValue(advancePromise);

    render(<DecisionPanel onAdvance={onAdvance} />);
    const button = screen.getByRole("button", { name: /advance quarter/i });

    fireEvent.submit(screen.getByTestId("decision-form"));

    await waitFor(() => {
      expect(button).toBeDisabled();
      expect(screen.getByRole("button", { name: /advancing/i })).toBeInTheDocument();
    });

    resolveAdvance!();
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it("displays validation errors from onAdvance", async () => {
    const onAdvance = vi.fn().mockResolvedValue({
      errors: [
        { field: "price", message: "Price must be a non-negative number" },
        { field: "new_engineers", message: "New engineers must be a non-negative integer" },
      ],
    });

    render(<DecisionPanel onAdvance={onAdvance} />);
    fireEvent.submit(screen.getByTestId("decision-form"));

    await waitFor(() => {
      expect(screen.getByText(/price must be a non-negative number/i)).toBeInTheDocument();
      expect(screen.getByText(/new engineers must be a non-negative integer/i)).toBeInTheDocument();
    });
  });

  it("displays submit error from onAdvance", async () => {
    const onAdvance = vi.fn().mockResolvedValue({
      error: "Conflict: possible double-advance",
    });

    render(<DecisionPanel onAdvance={onAdvance} />);
    fireEvent.submit(screen.getByTestId("decision-form"));

    await waitFor(() => {
      expect(screen.getByText(/conflict: possible double-advance/i)).toBeInTheDocument();
    });
  });

  it("clears errors on subsequent submit", async () => {
    const onAdvance = vi
      .fn()
      .mockResolvedValueOnce({ errors: [{ field: "price", message: "Invalid" }] })
      .mockResolvedValueOnce({});

    render(<DecisionPanel onAdvance={onAdvance} />);

    fireEvent.submit(screen.getByTestId("decision-form"));
    await waitFor(() => {
      expect(screen.getByText(/invalid/i)).toBeInTheDocument();
    });

    fireEvent.submit(screen.getByTestId("decision-form"));
    await waitFor(() => {
      expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
    });
  });
});
