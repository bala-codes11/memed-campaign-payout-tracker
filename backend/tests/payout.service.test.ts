import {
  calculateTargetPayout,
  calculateAdditionalPayout,
} from "../src/services/payout.service";

const milestones = [
  { views: 10000, payout: 500 },
  { views: 50000, payout: 2000 },
  { views: 100000, payout: 5000 },
];

describe("calculateTargetPayout", () => {
  test("returns zero below the first milestone", () => {
    expect(calculateTargetPayout(5000, milestones)).toBe(0);
  });

  test("returns the first milestone payout", () => {
    expect(calculateTargetPayout(10000, milestones)).toBe(500);
  });

  test("returns the highest milestone payout, not their sum", () => {
    expect(calculateTargetPayout(60000, milestones)).toBe(2000);
  });

  test("returns the highest payout at the final milestone", () => {
    expect(calculateTargetPayout(100000, milestones)).toBe(5000);
  });
});

describe("calculateAdditionalPayout", () => {
  test("pays the target amount when nothing has been paid", () => {
    expect(calculateAdditionalPayout(500, 0, 10000)).toBe(500);
  });

  test("does not pay twice for the same milestone", () => {
    expect(calculateAdditionalPayout(500, 500, 9500)).toBe(0);
  });

  test("pays only the difference between milestones", () => {
    expect(calculateAdditionalPayout(2000, 500, 9500)).toBe(1500);
  });

  test("never pays more than the remaining budget", () => {
    expect(calculateAdditionalPayout(2000, 500, 800)).toBe(800);
  });

  test("returns zero when the budget is exhausted", () => {
    expect(calculateAdditionalPayout(2000, 500, 0)).toBe(0);
  });

  test("never produces a negative payout", () => {
    expect(calculateAdditionalPayout(500, 1000, 5000)).toBe(0);
  });
});