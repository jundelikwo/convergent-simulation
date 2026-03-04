import { describe, it, expect } from "vitest";
import { validateAdvanceDecisions } from "./validation";

describe("validateAdvanceDecisions", () => {
  describe("valid inputs", () => {
    it("accepts valid numeric inputs", () => {
      const result = validateAdvanceDecisions({
        price: 100,
        new_engineers: 2,
        new_sales: 1,
        salary_pct: 100,
      });
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data).toEqual({
          price: 100,
          new_engineers: 2,
          new_sales: 1,
          salary_pct: 100,
        });
      }
    });

    it("accepts valid string inputs", () => {
      const result = validateAdvanceDecisions({
        price: "100",
        new_engineers: "0",
        new_sales: "0",
        salary_pct: "100",
      });
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data.price).toBe(100);
        expect(result.data.new_engineers).toBe(0);
        expect(result.data.new_sales).toBe(0);
        expect(result.data.salary_pct).toBe(100);
      }
    });

    it("defaults salary_pct to 100 when missing", () => {
      const result = validateAdvanceDecisions({
        price: 50,
        new_engineers: 0,
        new_sales: 0,
      });
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data.salary_pct).toBe(100);
      }
    });

    it("accepts zero for all optional fields", () => {
      const result = validateAdvanceDecisions({
        price: 0,
        new_engineers: 0,
        new_sales: 0,
        salary_pct: 100,
      });
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data.price).toBe(0);
        expect(result.data.new_engineers).toBe(0);
        expect(result.data.new_sales).toBe(0);
      }
    });

    it("rounds price to 2 decimals", () => {
      const result = validateAdvanceDecisions({
        price: 99.999,
        new_engineers: 0,
        new_sales: 0,
        salary_pct: 100,
      });
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data.price).toBe(100);
      }
    });

    it("accepts decimal salary_pct", () => {
      const result = validateAdvanceDecisions({
        price: 100,
        new_engineers: 0,
        new_sales: 0,
        salary_pct: 100.5,
      });
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data.salary_pct).toBe(100.5);
      }
    });
  });

  describe("price validation", () => {
    it("rejects negative price", () => {
      const result = validateAdvanceDecisions({
        price: -1,
        new_engineers: 0,
        new_sales: 0,
        salary_pct: 100,
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors).toContainEqual({
          field: "price",
          message: "Price must be a non-negative number",
        });
      }
    });

    it("rejects NaN price", () => {
      const result = validateAdvanceDecisions({
        price: "invalid",
        new_engineers: 0,
        new_sales: 0,
        salary_pct: 100,
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some((e) => e.field === "price")).toBe(true);
      }
    });

    it("rejects undefined price when parsed as NaN", () => {
      const result = validateAdvanceDecisions({
        new_engineers: 0,
        new_sales: 0,
        salary_pct: 100,
      });
      expect(result.valid).toBe(false);
    });
  });

  describe("new_engineers validation", () => {
    it("rejects negative new_engineers", () => {
      const result = validateAdvanceDecisions({
        price: 100,
        new_engineers: -1,
        new_sales: 0,
        salary_pct: 100,
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors).toContainEqual({
          field: "new_engineers",
          message: "New engineers must be a non-negative integer",
        });
      }
    });

    it("rejects NaN new_engineers", () => {
      const result = validateAdvanceDecisions({
        price: 100,
        new_engineers: "abc",
        new_sales: 0,
        salary_pct: 100,
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some((e) => e.field === "new_engineers")).toBe(true);
      }
    });

    it("rejects decimal new_engineers", () => {
      const result = validateAdvanceDecisions({
        price: 100,
        new_engineers: 2.5,
        new_sales: 0,
        salary_pct: 100,
      });
      expect(result.valid).toBe(false);
    });
  });

  describe("new_sales validation", () => {
    it("rejects negative new_sales", () => {
      const result = validateAdvanceDecisions({
        price: 100,
        new_engineers: 0,
        new_sales: -1,
        salary_pct: 100,
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors).toContainEqual({
          field: "new_sales",
          message: "New sales must be a non-negative integer",
        });
      }
    });

    it("rejects decimal new_sales", () => {
      const result = validateAdvanceDecisions({
        price: 100,
        new_engineers: 0,
        new_sales: 1.7,
        salary_pct: 100,
      });
      expect(result.valid).toBe(false);
    });
  });

  describe("salary_pct validation", () => {
    it("rejects zero salary_pct", () => {
      const result = validateAdvanceDecisions({
        price: 100,
        new_engineers: 0,
        new_sales: 0,
        salary_pct: 0,
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors).toContainEqual({
          field: "salary_pct",
          message: "Salary % must be a positive number",
        });
      }
    });

    it("rejects negative salary_pct", () => {
      const result = validateAdvanceDecisions({
        price: 100,
        new_engineers: 0,
        new_sales: 0,
        salary_pct: -10,
      });
      expect(result.valid).toBe(false);
    });

    it("rejects NaN salary_pct", () => {
      const result = validateAdvanceDecisions({
        price: 100,
        new_engineers: 0,
        new_sales: 0,
        salary_pct: "invalid",
      });
      expect(result.valid).toBe(false);
    });
  });

  describe("multiple errors", () => {
    it("returns all validation errors", () => {
      const result = validateAdvanceDecisions({
        price: -1,
        new_engineers: -1,
        new_sales: -1,
        salary_pct: 0,
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.length).toBeGreaterThanOrEqual(2);
      }
    });
  });
});
