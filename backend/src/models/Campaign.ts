import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMilestone {
  views: number;
  payout: number;
}

export interface ICampaign extends Document {
  name: string;
  platform: "Instagram" | "YouTube";
  totalBudget: number;
  spentBudget: number;
  milestones: IMilestone[];
  brandId: Types.ObjectId;
  isLive: boolean;
}

const milestoneSchema = new Schema<IMilestone>(
  {
    views: {
      type: Number,
      required: true,
      min: 1,
    },
    payout: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const campaignSchema = new Schema<ICampaign>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    platform: {
      type: String,
      enum: ["Instagram", "YouTube"],
      required: true,
    },
    totalBudget: {
      type: Number,
      required: true,
      min: 1,
    },
    spentBudget: {
      type: Number,
      default: 0,
      min: 0,
    },
    milestones: {
      type: [milestoneSchema],
      required: true,
      validate: {
        validator: (milestones: IMilestone[]) =>
          milestones.length > 0,
        message: "At least one milestone is required",
      },
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isLive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

campaignSchema.index({ isLive: 1, createdAt: -1 });
campaignSchema.index({ brandId: 1, createdAt: -1 });

const Campaign = mongoose.model<ICampaign>(
  "Campaign",
  campaignSchema
);

export default Campaign;