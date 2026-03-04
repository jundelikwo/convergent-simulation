import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runSimulation } from "@/lib/sim/simulation";
import { validateAdvanceDecisions } from "@/lib/sim/validation";
import type { DashboardViewModel, GameStatus } from "@/lib/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const validation = validateAdvanceDecisions(body as Record<string, unknown>);
  if (!validation.valid) {
    return NextResponse.json(
      { error: "Validation failed", errors: validation.errors },
      { status: 400 }
    );
  }

  const { price, new_engineers, new_sales, salary_pct } = validation.data;

  const { data: game, error: fetchError } = await supabase
    .from("games")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (fetchError || !game) {
    return NextResponse.json(
      { error: "No game found" },
      { status: 404 }
    );
  }

  if (game.status !== "active") {
    return NextResponse.json(
      { error: "Game has ended" },
      { status: 409 }
    );
  }

  const output = runSimulation({
    cash: Number(game.cash),
    engineers: game.engineers,
    sales_staff: game.sales_staff,
    quality: Number(game.quality),
    price,
    new_engineers,
    new_sales,
    salary_pct,
    year: game.current_year,
    quarter: game.current_quarter,
  });

  const cash_end = output.cash_end;
  const isLost = cash_end <= 0;

  const nextYear = output.next_year;
  const nextQuarter = output.next_quarter;
  // Win: completing Year 10 Quarter 4 with positive cash
  const isWon =
    game.current_year === 10 &&
    game.current_quarter === 4 &&
    cash_end > 0;

  const newStatus: GameStatus = isLost ? "lost" : isWon ? "won" : "active";
  const cumulativeProfit =
    Number(game.cumulative_profit) +
    output.net_income_for_cumulative -
    output.hire_cost_for_cumulative;

  const { error: quarterError } = await supabase.from("quarters").insert({
    game_id: game.id,
    year: game.current_year,
    quarter: game.current_quarter,
    price,
    new_engineers,
    new_sales,
    salary_pct,
    salary_cost_per_person: output.salary_cost_per_person,
    quality_after: output.quality_after,
    demand: output.demand,
    units_sold: output.units_sold,
    revenue: output.revenue,
    total_payroll: output.total_payroll,
    net_income: output.net_income,
    hire_cost: output.hire_cost,
    cash_start: output.cash_start,
    cash_end: output.cash_end,
    engineers_end: output.engineers_end,
    sales_end: output.sales_end,
  });

  if (quarterError) {
    return NextResponse.json(
      { error: quarterError.message },
      { status: 500 }
    );
  }

  const { data: updatedRow, error: updateError } = await supabase
    .from("games")
    .update({
      status: newStatus,
      current_year: nextYear,
      current_quarter: nextQuarter,
      cash: cash_end,
      engineers: output.engineers_end,
      sales_staff: output.sales_end,
      quality: output.quality_after,
      cumulative_profit: cumulativeProfit,
      version: game.version + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", game.id)
    .eq("version", game.version)
    .select()
    .single();

  if (updateError || !updatedRow) {
    return NextResponse.json(
      { error: "Conflict: possible double-advance. Please refresh." },
      { status: 409 }
    );
  }

  const updatedGame = {
    id: game.id,
    cash: cash_end,
    engineers: output.engineers_end,
    sales_staff: output.sales_end,
    quality: output.quality_after,
    year: nextYear,
    quarter: nextQuarter,
    status: newStatus,
    cumulative_profit: cumulativeProfit,
  };

  const { data: quarters } = await supabase
    .from("quarters")
    .select("year, quarter, cash_end, revenue, net_income, engineers_end, sales_end")
    .eq("game_id", game.id)
    .order("year", { ascending: false })
    .order("quarter", { ascending: false })
    .limit(4);

  const lastQuarters = (quarters ?? []).reverse().slice(0, 4);

  const viewModel: DashboardViewModel = {
    game: updatedGame,
    lastQuarters: lastQuarters.map((q) => ({
      year: q.year,
      quarter: q.quarter,
      cash_end: Number(q.cash_end),
      revenue: Number(q.revenue),
      net_income: Number(q.net_income),
      engineers_end: q.engineers_end,
      sales_end: q.sales_end,
    })),
  };

  return NextResponse.json(viewModel);
}
