import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISubmission extends Document {
  campaignId: Types.ObjectId;
  creatorId: Types.ObjectId;
  postUrl: string;
  views: number;
  paidAmount: number;
  payoutCapped: boolean;
}

const submissionSchema = new Schema<ISubmission>(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      index: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    postUrl: {
      type: String,
      required: true,
      trim: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    payoutCapped: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

submissionSchema.index(
  { campaignId: 1, creatorId: 1, postUrl: 1 },
  { unique: true }
);

const Submission = mongoose.model<ISubmission>(
  "Submission",
  submissionSchema
);

export default Submission;