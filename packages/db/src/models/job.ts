import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    url: { type: String, required: true },
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },
    publicUrl: { type: String },
    error: { type: String },
    duration: { type: Number },
  },
  { timestamps: true }
);

export const Job = mongoose.models.Job || mongoose.model("Job", JobSchema);
