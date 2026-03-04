import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { INITIAL_STATE } from "@/lib/sim/simulation";
import type { DashboardViewModel } from "@/lib/types";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from("games")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (existing) {
    // Delete old quarters so history is cleared for the reset game
    await supabase.from("quarters").delete().eq("game_id", existing.id);

    const { error: updateError } = await supabase
      .from("games")
      .update({
        status: "active",
        current_year: INITIAL_STATE.current_year,
        current_quarter: INITIAL_STATE.current_quarter,
        cash: INITIAL_STATE.cash,
        engineers: INITIAL_STATE.engineers,
        sales_staff: INITIAL_STATE.sales_staff,
        quality: INITIAL_STATE.quality,
        competitors: INITIAL_STATE.competitors,
        cumulative_profit: 0,
        version: 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    const { data: game } = await supabase
      .from("games")
      .select("*")
      .eq("id", existing.id)
      .single();

    const viewModel: DashboardViewModel = {
      game: {
        id: game!.id,
        cash: Number(game!.cash),
        engineers: game!.engineers,
        sales_staff: game!.sales_staff,
        quality: Number(game!.quality),
        year: game!.current_year,
        quarter: game!.current_quarter,
        status: game!.status,
        cumulative_profit: Number(game!.cumulative_profit),
      },
      lastQuarters: [],
    };

    return NextResponse.json(viewModel);
  }

  const { data: newGame, error: insertError } = await supabase
    .from("games")
    .insert({
      user_id: user.id,
      status: "active",
      current_year: INITIAL_STATE.current_year,
      current_quarter: INITIAL_STATE.current_quarter,
      cash: INITIAL_STATE.cash,
      engineers: INITIAL_STATE.engineers,
      sales_staff: INITIAL_STATE.sales_staff,
      quality: INITIAL_STATE.quality,
      competitors: INITIAL_STATE.competitors,
      cumulative_profit: 0,
      version: 1,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: insertError.message },
      { status: 500 }
    );
  }

  const viewModel: DashboardViewModel = {
    game: {
      id: newGame.id,
      cash: Number(newGame.cash),
      engineers: newGame.engineers,
      sales_staff: newGame.sales_staff,
      quality: Number(newGame.quality),
      year: newGame.current_year,
      quarter: newGame.current_quarter,
      status: newGame.status,
      cumulative_profit: Number(newGame.cumulative_profit),
    },
    lastQuarters: [],
  };

  return NextResponse.json(viewModel);
}
