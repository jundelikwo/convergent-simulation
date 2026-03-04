"use client";

import { useState } from "react";

interface ValidationError {
  field: string;
  message: string;
}

interface DecisionPanelProps {
  onAdvance: (decisions: {
    price: number;
    new_engineers: number;
    new_sales: number;
    salary_pct: number;
  }) => Promise<{ errors?: ValidationError[]; error?: string }>;
  lastSalaryPct?: number;
}

export function DecisionPanel({ onAdvance, lastSalaryPct = 100 }: DecisionPanelProps) {
  const [price, setPrice] = useState("100");
  const [newEngineers, setNewEngineers] = useState("0");
  const [newSales, setNewSales] = useState("0");
  const [salaryPct, setSalaryPct] = useState(String(lastSalaryPct));
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    setSubmitError(null);

    const result = await onAdvance({
      price: parseFloat(price) || 0,
      new_engineers: parseInt(newEngineers, 10) || 0,
      new_sales: parseInt(newSales, 10) || 0,
      salary_pct: parseFloat(salaryPct) || 100,
    });

    setLoading(false);

    if (!result) return;
    if (result.errors) {
      setErrors(result.errors);
      return;
    }
    if (result.error) {
      setSubmitError(result.error);
      return;
    }
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
      <h2 className="mb-4 text-lg font-semibold">Quarterly Decisions</h2>
      <form data-testid="decision-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="price" className="mb-1 block text-sm text-slate-300">
            Unit Price ($)
          </label>
          <input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="new_engineers" className="mb-1 block text-sm text-slate-300">
            New Engineers to Hire
          </label>
          <input
            id="new_engineers"
            type="number"
            min="0"
            step="1"
            value={newEngineers}
            onChange={(e) => setNewEngineers(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="new_sales" className="mb-1 block text-sm text-slate-300">
            New Sales to Hire
          </label>
          <input
            id="new_sales"
            type="number"
            min="0"
            step="1"
            value={newSales}
            onChange={(e) => setNewSales(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="salary_pct" className="mb-1 block text-sm text-slate-300">
            Salary % of Industry Average (default 100)
          </label>
          <input
            id="salary_pct"
            type="number"
            min="0.01"
            step="0.1"
            value={salaryPct}
            onChange={(e) => setSalaryPct(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {errors.length > 0 && (
          <ul className="space-y-1 text-sm text-red-400">
            {errors.map((e) => (
              <li key={e.field}>
                {e.field}: {e.message}
              </li>
            ))}
          </ul>
        )}

        {submitError && (
          <p className="text-sm text-red-400">{submitError}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Advancing..." : "Advance Quarter"}
        </button>
      </form>
    </div>
  );
}
