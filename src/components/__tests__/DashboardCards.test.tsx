import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardCards } from "../DashboardCards";

const baseGame = {
  cash: 1_000_000,
  engineers: 4,
  sales_staff: 2,
  quality: 50,
  year: 1,
  quarter: 1,
};

describe("DashboardCards", () => {
  it("renders all game metrics", () => {
    render(<DashboardCards game={baseGame} />);

    expect(screen.getByText(/cash on hand/i)).toBeInTheDocument();
    expect(screen.getByText(/\$1,000,000/)).toBeInTheDocument();
    expect(screen.getByText(/engineers/i)).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText(/sales staff/i)).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText(/product quality/i)).toBeInTheDocument();
    expect(screen.getByText("50.0")).toBeInTheDocument();
    expect(screen.getByText(/current quarter/i)).toBeInTheDocument();
    expect(screen.getByText(/year 1 q1/i)).toBeInTheDocument();
  });

  it("does not show revenue/net income when no lastQuarter", () => {
    render(<DashboardCards game={baseGame} />);
    expect(screen.queryByText(/revenue \(last qtr\)/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/net income \(last qtr\)/i)).not.toBeInTheDocument();
  });

  it("shows revenue and net income when lastQuarter provided", () => {
    render(
      <DashboardCards
        game={baseGame}
        lastQuarter={{ revenue: 75000, net_income: 25000 }}
      />
    );
    expect(screen.getByText(/revenue \(last qtr\)/i)).toBeInTheDocument();
    expect(screen.getByText(/\$75,000/)).toBeInTheDocument();
    expect(screen.getByText(/net income \(last qtr\)/i)).toBeInTheDocument();
    expect(screen.getByText(/\$25,000/)).toBeInTheDocument();
  });

  it("styles net income red when negative", () => {
    render(
      <DashboardCards
        game={baseGame}
        lastQuarter={{ revenue: 50000, net_income: -30000 }}
      />
    );
    const netIncomeEl = screen.getByText(/-?\$30,000/);
    expect(netIncomeEl).toHaveClass("text-red-400");
  });

  it("styles net income green when positive", () => {
    render(
      <DashboardCards
        game={baseGame}
        lastQuarter={{ revenue: 100000, net_income: 25000 }}
      />
    );
    const netIncomeEl = screen.getByText(/\$25,000/);
    expect(netIncomeEl).toHaveClass("text-emerald-400");
  });
});
