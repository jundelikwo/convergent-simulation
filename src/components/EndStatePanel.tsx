"use client";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

interface EndStatePanelProps {
  status: "won" | "lost";
  cumulativeProfit: number;
  cash: number;
  onNewGame: () => void;
}

export function EndStatePanel({
  status,
  cumulativeProfit,
  cash,
  onNewGame,
}: EndStatePanelProps) {
  const isWon = status === "won";

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-700 bg-slate-900 p-8 text-center">
      <h2
        className={`mb-4 text-3xl font-bold ${
          isWon ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {isWon ? "You Win!" : "Bankrupt"}
      </h2>
      <p className="mb-2 text-slate-400">
        {isWon
          ? "You reached Year 10 with positive cash."
          : "Your cash reached zero."}
      </p>
      <p className="mb-2 text-lg font-semibold">
        Cumulative Profit: {formatCurrency(cumulativeProfit)}
      </p>
      <p className="mb-6 text-slate-400">Final Cash: {formatCurrency(cash)}</p>
      <button
        onClick={onNewGame}
        className="rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white transition hover:bg-emerald-500 cursor-pointer"
      >
        Start New Game
      </button>
    </div>
  );
}
