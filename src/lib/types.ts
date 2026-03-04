export type GameStatus = "active" | "won" | "lost";

export interface Game {
  id: string;
  user_id: string;
  status: GameStatus;
  current_year: number;
  current_quarter: number;
  cash: number;
  engineers: number;
  sales_staff: number;
  quality: number;
  competitors: number;
  cumulative_profit: number;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface Quarter {
  id: string;
  game_id: string;
  year: number;
  quarter: number;
  price: number;
  new_engineers: number;
  new_sales: number;
  salary_pct: number;
  salary_cost_per_person: number;
  quality_after: number;
  demand: number;
  units_sold: number;
  revenue: number;
  total_payroll: number;
  net_income: number;
  hire_cost: number;
  cash_start: number;
  cash_end: number;
  engineers_end: number;
  sales_end: number;
  created_at: string;
}

export interface AdvanceDecisions {
  price: number;
  new_engineers: number;
  new_sales: number;
  salary_pct: number;
}

export interface DashboardViewModel {
  game: {
    id: string;
    cash: number;
    engineers: number;
    sales_staff: number;
    quality: number;
    year: number;
    quarter: number;
    status: GameStatus;
    cumulative_profit: number;
  };
  lastQuarters: Array<{
    year: number;
    quarter: number;
    cash_end: number;
    revenue: number;
    net_income: number;
    engineers_end: number;
    sales_end: number;
  }>;
  lastQuarter?: Quarter;
}
