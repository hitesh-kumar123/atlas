import { describe, it, expect } from "vitest";

function computeHandFixtureFunnel(
  events: Array<{ distinctId: string; name: string; occurredAt: Date }>,
  steps: string[]
) {
  const stepCounts: number[] = new Array(steps.length).fill(0);
  const userProgress = new Map<string, number>();

  for (const ev of events) {
    const stepIdx = steps.indexOf(ev.name);
    if (stepIdx === -1) continue;

    const currentProgress = userProgress.get(ev.distinctId) ?? 0;
    if (stepIdx === currentProgress) {
      userProgress.set(ev.distinctId, currentProgress + 1);
      stepCounts[stepIdx] = (stepCounts[stepIdx] ?? 0) + 1;
    }
  }

  return steps.map((name, idx) => ({
    stepIndex: idx + 1,
    eventName: name,
    count: stepCounts[idx] ?? 0,
    conversionFromPrev:
      idx === 0
        ? 100
        : Number((((stepCounts[idx] ?? 0) / (stepCounts[idx - 1] || 1)) * 100).toFixed(1)),
  }));
}

describe("Phase 3: Funnel Mathematics Unit Test Fixtures", () => {
  it("accurately calculates conversion per step against hand-computed fixture", () => {
    const fixtureEvents = [
      { distinctId: "user1", name: "page_view", occurredAt: new Date("2026-08-01T10:00:00Z") },
      { distinctId: "user1", name: "signup", occurredAt: new Date("2026-08-01T10:05:00Z") },
      { distinctId: "user1", name: "checkout", occurredAt: new Date("2026-08-01T10:10:00Z") },
      
      { distinctId: "user2", name: "page_view", occurredAt: new Date("2026-08-01T11:00:00Z") },
      { distinctId: "user2", name: "signup", occurredAt: new Date("2026-08-01T11:05:00Z") },
      
      { distinctId: "user3", name: "page_view", occurredAt: new Date("2026-08-01T12:00:00Z") },
    ];

    const steps = ["page_view", "signup", "checkout"];
    const results = computeHandFixtureFunnel(fixtureEvents, steps);

    // Hand computed expectations:
    // Step 1 (page_view): user1, user2, user3 = 3 users (100%)
    // Step 2 (signup): user1, user2 = 2 users (66.7%)
    // Step 3 (checkout): user1 = 1 user (50.0%)
    expect(results[0]?.count).toBe(3);
    expect(results[1]?.count).toBe(2);
    expect(results[2]?.count).toBe(1);

    expect(results[1]?.conversionFromPrev).toBe(66.7);
    expect(results[2]?.conversionFromPrev).toBe(50.0);
  });

  it("prevents out-of-order step progression (off-by-one ordering guard)", () => {
    // User attempts step 2 before step 1
    const outOfOrderEvents = [
      { distinctId: "attacker", name: "signup", occurredAt: new Date("2026-08-01T10:00:00Z") },
      { distinctId: "attacker", name: "page_view", occurredAt: new Date("2026-08-01T10:05:00Z") },
    ];

    const steps = ["page_view", "signup"];
    const results = computeHandFixtureFunnel(outOfOrderEvents, steps);

    // Attacker does NOT convert to Step 2 because signup happened BEFORE page_view!
    expect(results[0]?.count).toBe(1);
    expect(results[1]?.count).toBe(0);
    expect(results[1]?.conversionFromPrev).toBe(0);
  });
});
