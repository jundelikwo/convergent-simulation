"use client";

interface QuarterRow {
  year: number;
  quarter: number;
  cash_end: number;
  revenue: number;
  net_income: number;
  engineers_end: number;
  sales_end: number;
}

interface HistoryTableProps {
  quarters: QuarterRow[];
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function HistoryTable({ quarters }: HistoryTableProps) {
  const displayQuarters = quarters.slice(0, 4);

  if (displayQuarters.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
        <h2 className="mb-4 text-lg font-semibold">Last 4 Quarters</h2>
        <p className="text-slate-400">No quarters completed yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
      <div className="p-4">
        <h2 className="text-lg font-semibold">Last 4 Quarters</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800 px-4 py-2 text-xs uppercase text-slate-400">
              <th className="px-4 py-3">Quarter</th>
              <th className="px-4 py-3">Cash</th>
              <th className="px-4 py-3">Revenue</th>
              <th className="px-4 py-3">Net Income</th>
              <th className="px-4 py-3">Engineers</th>
              <th className="px-4 py-3">Sales</th>
            </tr>
          </thead>
          <tbody>
            {displayQuarters.map((q) => (
              <tr
                key={`${q.year}-${q.quarter}`}
                className="border-b border-slate-700/50 last:border-0"
              >
                <td className="px-4 py-3">Y{q.year} Q{q.quarter}</td>
                <td className="px-4 py-3">{formatCurrency(q.cash_end)}</td>
                <td className="px-4 py-3">{formatCurrency(q.revenue)}</td>
                <td className="px-4 py-3">{formatCurrency(q.net_income)}</td>
                <td className="px-4 py-3">{q.engineers_end}</td>
                <td className="px-4 py-3">{q.sales_end}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
