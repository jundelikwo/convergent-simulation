import { describe, it, expect } from "vitest";
import { runSimulation, INITIAL_STATE } from "./simulation";

/**
 * Integration-style tests: run full game scenarios through multiple quarters
 * to verify the simulation behaves correctly end-to-end.
 */
describe("Simulation integration scenarios", () => {
  it("advances through 8 quarters with state propagating correctly", () => {
    let state = {
      cash: INITIAL_STATE.cash,
      engineers: INITIAL_STATE.engineers,
      sales_staff: INITIAL_STATE.sales_staff,
      quality: INITIAL_STATE.quality,
      year: 1,
      quarter: 1,
    };

    for (let i = 0; i < 8; i++) {
      const out = runSimulation({
        ...state,
        price: 50,
        new_engineers: 0,
        new_sales: 0,
        salary_pct: 80,
      });

      state = {
        cash: out.cash_end,
        engineers: out.engineers_end,
        sales_staff: out.sales_end,
        quality: out.quality_after,
        year: out.next_year,
        quarter: out.next_quarter,
      };
    }

    expect(state.year).toBe(3);
    expect(state.quarter).toBe(1);
    expect(state.quality).toBeGreaterThan(INITIAL_STATE.quality);
  });

  it("goes bankrupt with aggressive hiring and high salary", () => {
    let state = {
      cash: INITIAL_STATE.cash,
      engineers: INITIAL_STATE.engineers,
      sales_staff: INITIAL_STATE.sales_staff,
      quality: INITIAL_STATE.quality,
      year: 1,
      quarter: 1,
    };

    let bankruptAt: number | null = null;

    for (let i = 0; i < 20; i++) {
      const out = runSimulation({
        ...state,
        price: 10,
        new_engineers: 5,
        new_sales: 5,
        salary_pct: 150,
      });

      state = {
        cash: out.cash_end,
        engineers: out.engineers_end,
        sales_staff: out.sales_end,
        quality: out.quality_after,
        year: out.next_year,
        quarter: out.next_quarter,
      };

      if (state.cash <= 0) {
        bankruptAt = i + 1;
        break;
      }
    }

    expect(bankruptAt).not.toBeNull();
    expect(state.cash).toBeLessThanOrEqual(0);
  });

  it("cumulative profit tracks correctly across quarters", () => {
    let cumulativeProfit = 0;
    let state = {
      cash: INITIAL_STATE.cash,
      engineers: INITIAL_STATE.engineers,
      sales_staff: INITIAL_STATE.sales_staff,
      quality: INITIAL_STATE.quality,
      year: 1,
      quarter: 1,
    };

    for (let i = 0; i < 8; i++) {
      const out = runSimulation({
        ...state,
        price: 100,
        new_engineers: 0,
        new_sales: 0,
        salary_pct: 100,
      });

      cumulativeProfit += out.net_income_for_cumulative - out.hire_cost_for_cumulative;
      state = {
        cash: out.cash_end,
        engineers: out.engineers_end,
        sales_staff: out.sales_end,
        quality: out.quality_after,
        year: out.next_year,
        quarter: out.next_quarter,
      };
    }

    const expectedCashChange = state.cash - INITIAL_STATE.cash;
    expect(cumulativeProfit).toBeCloseTo(expectedCashChange, 0);
  });
});
