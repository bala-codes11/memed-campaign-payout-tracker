import { Request, Response } from "express";
import mongoose from "mongoose";
import Campaign from "../models/Campaign";
import Submission from "../models/Submission";
import {
  calculateTargetPayout,
  calculateAdditionalPayout,
} from "../services/payout.service";

export async function createSubmission(
  req: Request,
  res: Response
) {
  try {
    const { campaignId, postUrl } = req.body;

    if (
      typeof campaignId !== "string" ||
      !mongoose.isValidObjectId(campaignId) ||
      typeof postUrl !== "string" ||
      !postUrl.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid campaign ID and post URL are required",
      });
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(postUrl.trim());
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid post URL",
      });
    }

    if (
      parsedUrl.protocol !== "https:" ||
      !["instagram.com", "www.instagram.com", "youtube.com", "www.youtube.com", "youtu.be"].includes(parsedUrl.hostname)
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide an HTTPS Instagram or YouTube post URL",
      });
    }

    const campaign = await Campaign.findOne({
      _id: campaignId,
      isLive: true,
      $expr: { $gt: ["$totalBudget", "$spentBudget"] },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Live campaign not found or budget exhausted",
      });
    }

    if (
      parsedUrl.hostname.includes("instagram.com") &&
      campaign.platform !== "Instagram"
    ) {
      return res.status(400).json({
        success: false,
        message: "Post platform does not match the campaign",
      });
    }

    if (
      ["youtube.com", "www.youtube.com", "youtu.be"].includes(parsedUrl.hostname) &&
      campaign.platform !== "YouTube"
    ) {
      return res.status(400).json({
        success: false,
        message: "Post platform does not match the campaign",
      });
    }

    const submission = await Submission.create({
      campaignId: campaign._id,
      creatorId: req.user!.userId,
      postUrl: parsedUrl.toString(),
      views: 0,
      paidAmount: 0,
    });

    return res.status(201).json({
      success: true,
      message: "Post submitted successfully",
      submission,
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message: "This post has already been submitted to this campaign",
      });
    }

    console.error("Create submission error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getMySubmissions(
  req: Request,
  res: Response
) {
  try {
    const submissions = await Submission.find({
      creatorId: req.user!.userId,
    })
      .populate("campaignId", "name platform milestones totalBudget")
      .sort({ createdAt: -1 });

    const totalEarnings = submissions.reduce(
      (total, submission) => total + submission.paidAmount,
      0
    );

    return res.status(200).json({
      success: true,
      totalEarnings,
      submissions,
    });
  } catch (error) {
    console.error("Get submissions error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateSubmissionViews(
  req: Request,
  res: Response
) {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;
    const { views } = req.body;

    if (
      !mongoose.isValidObjectId(id) ||
      !Number.isSafeInteger(views) ||
      views < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid submission ID and non-negative integer views are required",
      });
    }

    let result:
      | {
          submissionId: string;
          views: number;
          targetPayout: number;
          additionalPayout: number;
          paidAmount: number;
          remainingBudget: number;
          payoutCapped: boolean;
        }
      | undefined;

    await session.withTransaction(async () => {
      const submission = await Submission.findById(id).session(session);

      if (!submission) {
        throw Object.assign(new Error("Submission not found"), {
          statusCode: 404,
        });
      }
      if (submission.creatorId.toString() !== req.user!.userId) {
  throw Object.assign(
    new Error("You can only update your own submissions"),
    { statusCode: 403 }
  );
}

      const campaign = await Campaign.findById(
        submission.campaignId
      ).session(session);

      if (!campaign) {
        throw Object.assign(new Error("Campaign not found"), {
          statusCode: 404,
        });
      }

      if (views < submission.views) {
        throw Object.assign(
          new Error("Views cannot be lower than the previously recorded count"),
          { statusCode: 400 }
        );
      }

      const targetPayout = calculateTargetPayout(
        views,
        campaign.milestones
      );

      const remainingBudget = Math.max(
        0,
        campaign.totalBudget - campaign.spentBudget
      );

      const additionalPayout = calculateAdditionalPayout(
        targetPayout,
        submission.paidAmount,
        remainingBudget
      );

      if (additionalPayout > 0) {
        const campaignUpdate = await Campaign.updateOne(
          {
            _id: campaign._id,
            $expr: {
              $gte: [
                { $subtract: ["$totalBudget", "$spentBudget"] },
                additionalPayout,
              ],
            },
          },
          {
            $inc: { spentBudget: additionalPayout },
          },
          { session }
        );

        if (campaignUpdate.modifiedCount !== 1) {
          throw new Error("Budget changed concurrently; retry the update");
        }
      }

      submission.views = views;
      submission.paidAmount += additionalPayout;
      submission.payoutCapped =
        submission.paidAmount < targetPayout;

      await submission.save({ session });

      result = {
        submissionId: submission._id.toString(),
        views: submission.views,
        targetPayout,
        additionalPayout,
        paidAmount: submission.paidAmount,
        remainingBudget: Math.max(
          0,
          campaign.totalBudget -
            campaign.spentBudget -
            additionalPayout
        ),
        payoutCapped: submission.payoutCapped,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Views updated successfully",
      ...result,
    });
  } catch (error) {
    const statusCode =
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      typeof error.statusCode === "number"
        ? error.statusCode
        : 500;

    if (statusCode === 500) {
      console.error("Update views error:", error);
    }

    return res.status(statusCode).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Internal server error",
    });
  } finally {
    await session.endSession();
  }
}