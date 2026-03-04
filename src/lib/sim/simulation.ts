/**
 * Server-only simulation logic.
 * Implements the startup business model exactly as specified in the PRD.
 */

const INDUSTRY_AVG_SALARY = 30000;
const HIRE_COST_PER_PERSON = 5000;
const QUALITY_GAIN_PER_ENGINEER = 0.5;

export interface SimulationInput {
  cash: number;
  engineers: number;
  sales_staff: number;
  quality: number;
  price: number;
  new_engineers: number;
  new_sales: number;
  salary_pct: number;
  year: number;
  quarter: number;
}

export interface SimulationOutput {
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
  net_income_for_cumulative: number;
  hire_cost_for_cumulative: number;
  next_year: number;
  next_quarter: number;
}

export function runSimulation(input: SimulationInput): SimulationOutput {
  const {
    cash,
    engineers,
    sales_staff,
    quality,
    price,
    new_engineers,
    new_sales,
    salary_pct,
    year,
    quarter,
  } = input;

  // 1. Salary cost per person
  const salary_cost_per_person = (salary_pct / 100) * INDUSTRY_AVG_SALARY;

  // 2. Product quality (uses current engineers, cap at 100)
  let quality_after = quality + engineers * QUALITY_GAIN_PER_ENGINEER;
  quality_after = Math.min(100, quality_after);

  // 3. Market demand
  let demand = quality_after * 10 - price * 0.0001;
  demand = Math.max(0, demand);

  // 4. Units sold (integer, floor)
  const units_sold = Math.floor(demand * sales_staff * 0.5);

  // 5. Revenue
  const revenue = price * units_sold;

  // 6. Total payroll (uses starting headcount)
  const total_payroll = salary_cost_per_person * (engineers + sales_staff);

  // 7. Net income
  const net_income = revenue - total_payroll;

  // 8. Cash end of quarter (pre-hiring)
  const cash_end_pre_hire = cash + net_income;

  // 9. New hire cost
  const new_hires = new_engineers + new_sales;
  const hire_cost = new_hires * HIRE_COST_PER_PERSON;
  const cash_end = cash_end_pre_hire - hire_cost;

  // 10. New headcount (effective next quarter)
  const engineers_end = engineers + new_engineers;
  const sales_end = sales_staff + new_sales;

  // 11. Advance quarter
  let next_quarter = quarter + 1;
  let next_year = year;
  if (next_quarter > 4) {
    next_quarter = 1;
    next_year += 1;
  }

  return {
    salary_cost_per_person,
    quality_after,
    demand,
    units_sold,
    revenue,
    total_payroll,
    net_income,
    hire_cost,
    cash_start: cash,
    cash_end,
    engineers_end,
    sales_end,
    net_income_for_cumulative: net_income,
    hire_cost_for_cumulative: hire_cost,
    next_year,
    next_quarter,
  };
}

export const INITIAL_STATE = {
  cash: 1_000_000,
  engineers: 4,
  sales_staff: 2,
  quality: 50,
  competitors: 2,
  current_year: 1,
  current_quarter: 1,
};
