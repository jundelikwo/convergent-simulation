export interface ValidationError {
  field: string;
  message: string;
}

export function validateAdvanceDecisions(input: {
  price?: unknown;
  new_engineers?: unknown;
  new_sales?: unknown;
  salary_pct?: unknown;
}): { valid: true; data: { price: number; new_engineers: number; new_sales: number; salary_pct: number } } | { valid: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  const price = typeof input.price === "number" ? input.price : parseFloat(String(input.price ?? ""));
  if (Number.isNaN(price) || price < 0) {
    errors.push({ field: "price", message: "Price must be a non-negative number" });
  }

  const new_engineers = typeof input.new_engineers === "number"
    ? input.new_engineers
    : parseInt(String(input.new_engineers ?? "0"), 10);
  if (Number.isNaN(new_engineers) || new_engineers < 0 || !Number.isInteger(new_engineers)) {
    errors.push({ field: "new_engineers", message: "New engineers must be a non-negative integer" });
  }

  const new_sales = typeof input.new_sales === "number"
    ? input.new_sales
    : parseInt(String(input.new_sales ?? "0"), 10);
  if (Number.isNaN(new_sales) || new_sales < 0 || !Number.isInteger(new_sales)) {
    errors.push({ field: "new_sales", message: "New sales must be a non-negative integer" });
  }

  const salary_pct = typeof input.salary_pct === "number" ? input.salary_pct : parseFloat(String(input.salary_pct ?? "100"));
  if (Number.isNaN(salary_pct) || salary_pct <= 0) {
    errors.push({ field: "salary_pct", message: "Salary % must be a positive number" });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      price: Math.round(price * 100) / 100,
      new_engineers,
      new_sales,
      salary_pct: Math.round(salary_pct * 100) / 100,
    },
  };
}
