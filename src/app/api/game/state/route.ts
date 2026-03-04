import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { DashboardViewModel } from "@/lib/types";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: game, error: gameError } = await supabase
    .from("games")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (gameError && gameError.code !== "PGRST116") {
    return NextResponse.json(
      { error: gameError.message },
      { status: 500 }
    );
  }

  if (!game) {
    return NextResponse.json(
      { error: "No game found. Create one first." },
      { status: 404 }
    );
  }

  const { data: quarters } = await supabase
    .from("quarters")
    .select("*")
    .eq("game_id", game.id)
    .order("year", { ascending: false })
    .order("quarter", { ascending: false })
    .limit(4);

  const lastQuarters = (quarters ?? []).reverse().slice(0, 4);
  const lastQuarter = quarters?.[0] ?? null;

  const viewModel: DashboardViewModel = {
    game: {
      id: game.id,
      cash: Number(game.cash),
      engineers: game.engineers,
      sales_staff: game.sales_staff,
      quality: Number(game.quality),
      year: game.current_year,
      quarter: game.current_quarter,
      status: game.status,
      cumulative_profit: Number(game.cumulative_profit),
    },
    lastQuarters: lastQuarters.map((q) => ({
      year: q.year,
      quarter: q.quarter,
      cash_end: Number(q.cash_end),
      revenue: Number(q.revenue),
      net_income: Number(q.net_income),
      engineers_end: q.engineers_end,
      sales_end: q.sales_end,
    })),
    lastQuarter: lastQuarter
      ? {
          id: lastQuarter.id,
          game_id: lastQuarter.game_id,
          year: lastQuarter.year,
          quarter: lastQuarter.quarter,
          price: Number(lastQuarter.price),
          new_engineers: lastQuarter.new_engineers,
          new_sales: lastQuarter.new_sales,
          salary_pct: Number(lastQuarter.salary_pct),
          salary_cost_per_person: Number(lastQuarter.salary_cost_per_person),
          quality_after: Number(lastQuarter.quality_after),
          demand: Number(lastQuarter.demand),
          units_sold: lastQuarter.units_sold,
          revenue: Number(lastQuarter.revenue),
          total_payroll: Number(lastQuarter.total_payroll),
          net_income: Number(lastQuarter.net_income),
          hire_cost: Number(lastQuarter.hire_cost),
          cash_start: Number(lastQuarter.cash_start),
          cash_end: Number(lastQuarter.cash_end),
          engineers_end: lastQuarter.engineers_end,
          sales_end: lastQuarter.sales_end,
          created_at: lastQuarter.created_at,
        }
      : undefined,
  };

  return NextResponse.json(viewModel);
}
