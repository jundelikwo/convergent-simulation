import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EndStatePanel } from "../EndStatePanel";

describe("EndStatePanel", () => {
  it("shows win message when status is won", () => {
    render(
      <EndStatePanel
        status="won"
        cumulativeProfit={500000}
        cash={1200000}
        onNewGame={vi.fn()}
      />
    );
    expect(screen.getByText("You Win!")).toBeInTheDocument();
    expect(screen.getByText(/you reached year 10 with positive cash/i)).toBeInTheDocument();
  });

  it("shows bankrupt message when status is lost", () => {
    render(
      <EndStatePanel
        status="lost"
        cumulativeProfit={-50000}
        cash={0}
        onNewGame={vi.fn()}
      />
    );
    expect(screen.getByText("Bankrupt")).toBeInTheDocument();
    expect(screen.getByText(/your cash reached zero/i)).toBeInTheDocument();
  });

  it("displays cumulative profit", () => {
    render(
      <EndStatePanel
        status="won"
        cumulativeProfit={1234567}
        cash={2000000}
        onNewGame={vi.fn()}
      />
    );
    expect(screen.getByText(/cumulative profit/i)).toBeInTheDocument();
    expect(screen.getByText(/\$1,234,567/)).toBeInTheDocument();
  });

  it("displays final cash", () => {
    render(
      <EndStatePanel
        status="lost"
        cumulativeProfit={-100000}
        cash={0}
        onNewGame={vi.fn()}
      />
    );
    expect(screen.getByText(/final cash/i)).toBeInTheDocument();
    expect(screen.getByText(/\$0/)).toBeInTheDocument();
  });

  it("calls onNewGame when Start New Game is clicked", async () => {
    const user = userEvent.setup();
    const onNewGame = vi.fn();
    render(
      <EndStatePanel
        status="won"
        cumulativeProfit={100000}
        cash={1100000}
        onNewGame={onNewGame}
      />
    );

    await user.click(screen.getByRole("button", { name: /start new game/i }));
    expect(onNewGame).toHaveBeenCalledTimes(1);
  });
});
