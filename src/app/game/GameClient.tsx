"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { DashboardViewModel } from "@/lib/types";
import { DecisionPanel } from "@/components/DecisionPanel";
import { DashboardCards } from "@/components/DashboardCards";
import { HistoryTable } from "@/components/HistoryTable";
import { OfficeViz } from "@/components/OfficeViz";
import { EndStatePanel } from "@/components/EndStatePanel";

export function GameClient() {
  const [data, setData] = useState<DashboardViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchState = async () => {
    const res = await fetch("/api/game/state");
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.status === 404) {
      const createRes = await fetch("/api/game/new", { method: "POST" });
      if (!createRes.ok) {
        setError("Failed to create game");
        setLoading(false);
        return;
      }
      const created = await createRes.json();
      setData(created);
      setLoading(false);
      return;
    }
    if (!res.ok) {
      setError("Failed to load game");
      setLoading(false);
      return;
    }
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => {
    fetchState();
  }, []);

  const handleAdvance = async (decisions: {
    price: number;
    new_engineers: number;
    new_sales: number;
    salary_pct: number;
  }) => {
    const res = await fetch("/api/game/advance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(decisions),
    });

    const json = await res.json();

    if (!res.ok) {
      if (res.status === 400 && json.errors) {
        return { errors: json.errors };
      }
      return { error: json.error || "Failed to advance" };
    }

    setData(json);
    return {};
  };

  const handleNewGame = async () => {
    const res = await fetch("/api/game/new", { method: "POST" });
    if (!res.ok) {
      setError("Failed to start new game");
      return;
    }
    const json = await res.json();
    setData(json);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-red-400">{error || "Failed to load game"}</p>
      </div>
    );
  }

  const isEnded = data.game.status === "won" || data.game.status === "lost";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-700 bg-slate-900 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-bold">Startup Simulator</h1>
          <div className="flex items-center gap-4">
            {!isEnded && (
              <button
                onClick={handleNewGame}
                className="text-sm text-slate-400 hover:text-white cursor-pointer"
              >
                Reset Game
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="text-sm text-slate-400 hover:text-white cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 p-6">
        {isEnded ? (
          <EndStatePanel
            status={data.game.status as "won" | "lost"}
            cumulativeProfit={data.game.cumulative_profit}
            cash={data.game.cash}
            onNewGame={handleNewGame}
          />
        ) : (
          <>
            <div className="grid gap-8 lg:grid-cols-2">
              <DecisionPanel onAdvance={handleAdvance} lastSalaryPct={100} />
              <DashboardCards
                game={data.game}
                lastQuarter={data.lastQuarter ? { revenue: data.lastQuarter.revenue, net_income: data.lastQuarter.net_income } : undefined}
              />
            </div>

            <HistoryTable quarters={data.lastQuarters} />
            <OfficeViz
              engineers={data.game.engineers}
              salesStaff={data.game.sales_staff}
            />
          </>
        )}
      </main>
    </div>
  );
}
