import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "general",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

workspaceSchema.index({ userId: 1, isPinned: -1, createdAt: -1 });

export default mongoose.model("Workspace", workspaceSchema);
