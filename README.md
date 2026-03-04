# Startup Simulator

A single-player, turn-based startup business simulation. Each turn represents one business quarter. The player inputs decisions, advances the turn, and the server runs the simulation model, persists state in Postgres (via Supabase), and returns updated results.

## Setup (under 5 commands)

```bash
cd startup-sim
cp .env.example .env.local
# Edit .env.local with your Supabase URL and anon key
npm install
# Run migrations in Supabase SQL Editor (in order): 001_initial_schema.sql, then 002_add_quarters_delete_policy.sql
npm run dev
```

1. Create a [Supabase](https://supabase.com) project
2. Copy the project URL and anon key to `.env.local`
3. Run the SQL migration in Supabase Dashboard → SQL Editor
4. `npm run dev` and open http://localhost:3000

## What Was Built

- **Auth**: Email/password sign up and login via Supabase Auth. Session persists across reloads.
- **Quarterly Decision Panel**: Unit price, new engineers, new sales, salary % of industry average (default 100).
- **Advance Turn**: `POST /api/game/advance` — server-authoritative simulation, persists to DB, returns updated state. Optimistic concurrency via `version` field prevents double-advance.
- **Dashboard**: Cash, headcount (engineers/sales), product quality, current quarter (Year + Quarter).
- **History**: Last 4 quarters as a table (quarter, cash, revenue, net income, engineers, sales).
- **Office Visualization**: Grid of desks; engineers (amber), sales (blue), empty (dashed). Capacity = `max(12, headcount + 6)` rounded to nearest multiple of 6.
- **Win/Lose**: Lose when cash ≤ 0. Win when completing Year 10 Quarter 4 with positive cash. Both show cumulative profit and "Start New Game".

## Developer Notes

- **Quarter boundaries**: Game starts at Year 1 Quarter 1. When the user advances, we simulate the current quarter (Y1Q1), create a `quarters` record, then update the game to the next quarter (Y1Q2). The dashboard shows the quarter we're about to make decisions for.
- **Office capacity**: `max(12, headcount + 6)` rounded up to nearest multiple of 6. Ensures empty desks remain visible.
- **Cumulative profit**: `sum(net_income) - sum(hire_cost)` — matches cash effects.
- **Payroll/units**: Use starting-quarter headcount. New hires take effect after the quarter (post calculations).

## What Was Cut

- Charts for history (table only; chart would be a nice addition).
- Multiple games per user (one game per user, reset on "Start New Game").
- Email confirmation for sign up (Supabase can enable this; disabled for quick dev flow).

## Known Issues

- None at this time.

## Constants

All simulation constants match the PRD exactly. No adjustments made.
