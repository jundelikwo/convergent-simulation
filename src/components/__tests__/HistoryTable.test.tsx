import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HistoryTable } from "../HistoryTable";

const sampleQuarters = [
  { year: 1, quarter: 1, cash_end: 950000, revenue: 50000, net_income: -50000, engineers_end: 4, sales_end: 2 },
  { year: 1, quarter: 2, cash_end: 900000, revenue: 60000, net_income: -40000, engineers_end: 5, sales_end: 2 },
  { year: 1, quarter: 3, cash_end: 870000, revenue: 70000, net_income: -30000, engineers_end: 5, sales_end: 3 },
  { year: 1, quarter: 4, cash_end: 850000, revenue: 80000, net_income: -20000, engineers_end: 6, sales_end: 3 },
];

describe("HistoryTable", () => {
  it("shows empty state when no quarters", () => {
    render(<HistoryTable quarters={[]} />);
    expect(screen.getByText(/no quarters completed yet/i)).toBeInTheDocument();
    expect(screen.getByText(/last 4 quarters/i)).toBeInTheDocument();
  });

  it("renders table with quarter data", () => {
    render(<HistoryTable quarters={sampleQuarters} />);

    expect(screen.getByText("Y1 Q1")).toBeInTheDocument();
    expect(screen.getByText("Y1 Q2")).toBeInTheDocument();
    expect(screen.getByText("Y1 Q3")).toBeInTheDocument();
    expect(screen.getByText("Y1 Q4")).toBeInTheDocument();

    expect(screen.getByText("$950,000")).toBeInTheDocument();
    expect(screen.getByText("$50,000")).toBeInTheDocument();
    expect(screen.getByText("-$50,000")).toBeInTheDocument();
    expect(screen.getByText("$900,000")).toBeInTheDocument();
    expect(screen.getByText("$60,000")).toBeInTheDocument();
  });

  it("displays at most 4 quarters", () => {
    const fiveQuarters = [
      ...sampleQuarters,
      { year: 2, quarter: 1, cash_end: 830000, revenue: 90000, net_income: -10000, engineers_end: 6, sales_end: 4 },
    ];
    render(<HistoryTable quarters={fiveQuarters} />);

    expect(screen.getByText("Y1 Q1")).toBeInTheDocument();
    expect(screen.getByText("Y1 Q4")).toBeInTheDocument();
    expect(screen.queryByText("Y2 Q1")).not.toBeInTheDocument();
  });

  it("has correct table headers", () => {
    render(<HistoryTable quarters={sampleQuarters} />);
    expect(screen.getByRole("columnheader", { name: /quarter/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /cash/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /revenue/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /net income/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /engineers/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /sales/i })).toBeInTheDocument();
  });
});
