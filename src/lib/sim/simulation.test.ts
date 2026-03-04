import { describe, it, expect } from "vitest";
import {
  runSimulation,
  INITIAL_STATE,
} from "./simulation";

const baseInput = {
  cash: 1_000_000,
  engineers: 4,
  sales_staff: 2,
  quality: 50,
  price: 100,
  new_engineers: 0,
  new_sales: 0,
  salary_pct: 100,
  year: 1,
  quarter: 1,
};

describe("runSimulation", () => {
  describe("initial state and first quarter", () => {
    it("matches INITIAL_STATE constants", () => {
      expect(INITIAL_STATE.cash).toBe(1_000_000);
      expect(INITIAL_STATE.engineers).toBe(4);
      expect(INITIAL_STATE.sales_staff).toBe(2);
      expect(INITIAL_STATE.quality).toBe(50);
      expect(INITIAL_STATE.competitors).toBe(2);
      expect(INITIAL_STATE.current_year).toBe(1);
      expect(INITIAL_STATE.current_quarter).toBe(1);
    });

    it("computes salary cost correctly at 100% industry average", () => {
      const out = runSimulation(baseInput);
      expect(out.salary_cost_per_person).toBe(30000);
    });

    it("computes salary cost correctly at 50% industry average", () => {
      const out = runSimulation({ ...baseInput, salary_pct: 50 });
      expect(out.salary_cost_per_person).toBe(15000);
    });

    it("computes salary cost correctly at 150% industry average", () => {
      const out = runSimulation({ ...baseInput, salary_pct: 150 });
      expect(out.salary_cost_per_person).toBe(45000);
    });

    it("increases quality by 0.5 per engineer", () => {
      const out = runSimulation(baseInput);
      // quality 50 + 4*0.5 = 52
      expect(out.quality_after).toBe(52);
    });

    it("caps quality at 100", () => {
      const out = runSimulation({
        ...baseInput,
        quality: 99,
        engineers: 100,
      });
      expect(out.quality_after).toBe(100);
    });

    it("computes demand: quality*10 - price*0.0001", () => {
      const out = runSimulation(baseInput);
      // quality_after=52, demand = 52*10 - 100*0.0001 = 520 - 0.01 = 519.99
      expect(out.demand).toBeCloseTo(519.99, 2);
    });

    it("floors demand at 0", () => {
      const out = runSimulation({
        ...baseInput,
        quality: 0,
        engineers: 0,
        price: 1_000_000,
      });
      expect(out.demand).toBe(0);
    });

    it("computes units sold as integer floor of demand * sales_staff * 0.5", () => {
      const out = runSimulation(baseInput);
      // demand ~ 519.99, units = floor(519.99 * 2 * 0.5) = floor(519.99) = 519
      expect(out.units_sold).toBe(Math.floor(519.99));
      expect(Number.isInteger(out.units_sold)).toBe(true);
    });

    it("computes revenue as price * units", () => {
      const out = runSimulation(baseInput);
      expect(out.revenue).toBe(baseInput.price * out.units_sold);
    });

    it("computes total payroll using starting headcount", () => {
      const out = runSimulation(baseInput);
      expect(out.total_payroll).toBe(30000 * (4 + 2)); // 180000
    });

    it("computes net income as revenue - total_payroll", () => {
      const out = runSimulation(baseInput);
      expect(out.net_income).toBe(out.revenue - out.total_payroll);
    });

    it("computes hire cost as (new_engineers + new_sales) * 5000", () => {
      const out = runSimulation({
        ...baseInput,
        new_engineers: 2,
        new_sales: 1,
      });
      expect(out.hire_cost).toBe(3 * 5000);
    });

    it("deducts hire cost from cash", () => {
      const out = runSimulation({
        ...baseInput,
        new_engineers: 1,
        new_sales: 0,
      });
      const cash_end_pre_hire = baseInput.cash + out.net_income;
      expect(out.cash_end).toBe(cash_end_pre_hire - 5000);
    });

    it("adds new hires to headcount for next quarter", () => {
      const out = runSimulation({
        ...baseInput,
        new_engineers: 2,
        new_sales: 1,
      });
      expect(out.engineers_end).toBe(6);
      expect(out.sales_end).toBe(3);
    });

    it("advances quarter within same year", () => {
      const out = runSimulation(baseInput);
      expect(out.next_year).toBe(1);
      expect(out.next_quarter).toBe(2);
    });

    it("advances to next year when quarter 4 -> 1", () => {
      const out = runSimulation({ ...baseInput, year: 1, quarter: 4 });
      expect(out.next_year).toBe(2);
      expect(out.next_quarter).toBe(1);
    });

    it("preserves cash_start for cumulative tracking", () => {
      const out = runSimulation(baseInput);
      expect(out.cash_start).toBe(baseInput.cash);
    });
  });

  describe("lose condition", () => {
    it("cash_end can be zero or negative when bankrupt", () => {
      const out = runSimulation({
        ...baseInput,
        cash: 0,
        engineers: 0,
        sales_staff: 0,
        quality: 0,
        price: 0,
      });
      expect(out.revenue).toBe(0);
      expect(out.total_payroll).toBe(0);
      expect(out.net_income).toBe(0);
      expect(out.cash_end).toBe(0);
    });

    it("cash_end goes negative when hire cost exceeds cash + net income", () => {
      const out = runSimulation({
        ...baseInput,
        cash: 10000,
        engineers: 0,
        sales_staff: 0,
        quality: 0,
        price: 0,
        new_engineers: 5,
        new_sales: 0,
      });
      expect(out.cash_end).toBeLessThan(0);
    });
  });

  describe("multi-quarter simulation", () => {
    it("chains correctly across 4 quarters", () => {
      let state = { ...baseInput };
      for (let i = 0; i < 4; i++) {
        const out = runSimulation(state);
        state = {
          ...state,
          cash: out.cash_end,
          engineers: out.engineers_end,
          sales_staff: out.sales_end,
          quality: out.quality_after,
          year: out.next_year,
          quarter: out.next_quarter,
        };
      }
      expect(state.year).toBe(2);
      expect(state.quarter).toBe(1);
    });

    it("quality accumulates across quarters", () => {
      let quality = 50;
      let engineers = 4;
      for (let i = 0; i < 4; i++) {
        const out = runSimulation({
          ...baseInput,
          quality,
          engineers,
          year: 1,
          quarter: (i % 4) + 1,
        });
        quality = out.quality_after;
        engineers = out.engineers_end;
      }
      expect(quality).toBeGreaterThan(50);
    });
  });

  describe("edge cases", () => {
    it("handles zero sales staff", () => {
      const out = runSimulation({
        ...baseInput,
        sales_staff: 0,
      });
      expect(out.units_sold).toBe(0);
      expect(out.revenue).toBe(0);
    });

    it("handles zero price", () => {
      const out = runSimulation({
        ...baseInput,
        price: 0,
      });
      expect(out.revenue).toBe(0);
      expect(out.demand).toBeCloseTo(520, 0);
    });

    it("handles very high price", () => {
      const out = runSimulation({
        ...baseInput,
        price: 10_000_000, // demand = 520 - 1000 = 0 (floored)
      });
      expect(out.demand).toBe(0);
      expect(out.units_sold).toBe(0);
      expect(out.revenue).toBe(0);
    });

    it("handles decimal salary_pct", () => {
      const out = runSimulation({
        ...baseInput,
        salary_pct: 100.5,
      });
      expect(out.salary_cost_per_person).toBeCloseTo(30150, 0);
    });
  });
});
