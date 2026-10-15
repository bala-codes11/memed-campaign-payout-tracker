import { IMilestone } from "../models/Campaign";

export function calculateTargetPayout(
  views: number,
  milestones: IMilestone[]
): number {
  let targetPayout = 0;

  for (const milestone of milestones) {
    if (views >= milestone.views) {
      targetPayout = milestone.payout;
    } else {
      break;
    }
  }

  return targetPayout;
}

export function calculateAdditionalPayout(
  targetPayout: number,
  alreadyPaid: number,
  remainingBudget: number
): number {
  const amountOwed = Math.max(0, targetPayout - alreadyPaid);

  return Math.min(amountOwed, Math.max(0, remainingBudget));
}