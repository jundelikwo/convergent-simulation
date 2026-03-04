"use client";

interface DashboardCardsProps {
  game: {
    cash: number;
    engineers: number;
    sales_staff: number;
    quality: number;
    year: number;
    quarter: number;
  };
  lastQuarter?: {
    revenue: number;
    net_income: number;
  };
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function DashboardCards({ game, lastQuarter }: DashboardCardsProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
      <h2 className="mb-4 text-lg font-semibold">Dashboard</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-slate-800 p-4">
          <p className="text-xs uppercase text-slate-400">Cash on Hand</p>
          <p className="text-xl font-bold text-emerald-400">
            {formatCurrency(game.cash)}
          </p>
        </div>
        {lastQuarter && (
          <>
            <div className="rounded-lg bg-slate-800 p-4">
              <p className="text-xs uppercase text-slate-400">Revenue (last qtr)</p>
              <p className="text-xl font-bold">{formatCurrency(lastQuarter.revenue)}</p>
            </div>
            <div className="rounded-lg bg-slate-800 p-4">
              <p className="text-xs uppercase text-slate-400">Net Income (last qtr)</p>
              <p className={`text-xl font-bold ${lastQuarter.net_income >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {formatCurrency(lastQuarter.net_income)}
              </p>
            </div>
          </>
        )}
        <div className="rounded-lg bg-slate-800 p-4">
          <p className="text-xs uppercase text-slate-400">Engineers</p>
          <p className="text-xl font-bold">{game.engineers}</p>
        </div>
        <div className="rounded-lg bg-slate-800 p-4">
          <p className="text-xs uppercase text-slate-400">Sales Staff</p>
          <p className="text-xl font-bold">{game.sales_staff}</p>
        </div>
        <div className="rounded-lg bg-slate-800 p-4">
          <p className="text-xs uppercase text-slate-400">Product Quality</p>
          <p className="text-xl font-bold">{game.quality.toFixed(1)}</p>
        </div>
        <div className="rounded-lg bg-slate-800 p-4">
          <p className="text-xs uppercase text-slate-400">Current Quarter</p>
          <p className="text-xl font-bold">
            Year {game.year} Q{game.quarter}
          </p>
        </div>
      </div>
    </div>
  );
}
