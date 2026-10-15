import { Request, Response } from "express";
import Campaign from "../models/Campaign";

export async function createCampaign(
  req: Request,
  res: Response
) {
  try {
    const { name, platform, totalBudget, milestones } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      !["Instagram", "YouTube"].includes(platform) ||
      typeof totalBudget !== "number" ||
      !Number.isFinite(totalBudget) ||
      totalBudget <= 0 ||
      !Array.isArray(milestones) ||
      milestones.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign details",
      });
    }

    let previousViews = 0;
    let previousPayout = -1;

    for (const milestone of milestones) {
      if (
        !Number.isSafeInteger(milestone.views) ||
        milestone.views <= previousViews ||
        !Number.isSafeInteger(milestone.payout) ||
        milestone.payout < 0 ||
        milestone.payout <= previousPayout
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Milestones must have increasing positive view thresholds and increasing non-negative payouts",
        });
      }

      previousViews = milestone.views;
      previousPayout = milestone.payout;
    }

    if (milestones.some((m: { payout: number }) => m.payout > totalBudget)) {
      return res.status(400).json({
        success: false,
        message: "A milestone payout cannot exceed the campaign budget",
      });
    }

    const campaign = await Campaign.create({
      name: name.trim(),
      platform,
      totalBudget,
      milestones,
      brandId: req.user!.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Campaign created successfully",
      campaign,
    });
  } catch (error) {
    console.error("Create campaign error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getBrandCampaigns(
  req: Request,
  res: Response
) {
  try {
    const campaigns = await Campaign.find({
      brandId: req.user!.userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      campaigns: campaigns.map((campaign) => ({
        ...campaign.toObject(),
        remainingBudget:
          campaign.totalBudget - campaign.spentBudget,
      })),
    });
  } catch (error) {
    console.error("Get brand campaigns error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getLiveCampaigns(
  _req: Request,
  res: Response
) {
  try {
    const campaigns = await Campaign.find({
      isLive: true,
      $expr: { $gt: ["$totalBudget", "$spentBudget"] },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      campaigns: campaigns.map((campaign) => ({
        ...campaign.toObject(),
        remainingBudget:
          campaign.totalBudget - campaign.spentBudget,
      })),
    });
  } catch (error) {
    console.error("Get live campaigns error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}