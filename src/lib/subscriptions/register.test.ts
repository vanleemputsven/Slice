import { describe, expect, it } from "vitest";
import { matchesRegisterQuery } from "@/lib/subscriptions/register";

const row = { name: "Jaarlijks archief", provider: "Studio" };

describe("matchesRegisterQuery", () => {
  it("keeps every row when the query is blank", () => {
    expect(matchesRegisterQuery(row, "  ")).toBe(true);
  });

  it("matches the name or the provider without case", () => {
    expect(matchesRegisterQuery(row, "archief")).toBe(true);
    expect(matchesRegisterQuery(row, "STUDIO")).toBe(true);
    expect(matchesRegisterQuery(row, "krant")).toBe(false);
  });
});
