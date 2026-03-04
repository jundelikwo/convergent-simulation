/**
 * Integration tests for POST /api/game/advance
 *
 * These tests require a running Supabase instance and authenticated session.
 * Run with: npm run test:run -- --testPathPattern=advance.integration
 *
 * For unit-level coverage of the advance logic, see:
 * - src/lib/sim/simulation.test.ts (simulation formulas)
 * - src/lib/sim/validation.test.ts (input validation)
 */

import { describe, it, expect } from "vitest";

describe("POST /api/game/advance (integration)", () => {
  it.skip("requires authenticated session", () => {
    // E2E: fetch without cookies should return 401
  });

  it.skip("validates request body", () => {
    // E2E: invalid body returns 400 with errors
  });

  it.skip("advances game state and returns updated view model", () => {
    // E2E: valid request returns 200 with game + lastQuarters
  });

  it.skip("returns 409 when game has ended", () => {
    // E2E: advancing a won/lost game returns 409
  });
});
