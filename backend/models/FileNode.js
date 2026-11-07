import mongoose from "mongoose";

const fileNodeSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.Mixed, ref: "Workspace", required: true },
    path: String,
    type: { type: String, enum: ["file", "folder"] },
    content: {
      type: String,
      default: "",
      maxlength: 2_000_000,
    },
    r2Key: { type: String, default: null },
    size: { type: Number, default: 0 },
    storageType: {
      type: String,
      enum: ["local", "r2", "hybrid"],
      default: "hybrid",
    },
  },
  { timestamps: true }
);

fileNodeSchema.index({ workspaceId: 1, path: 1 }, { unique: true });

export default mongoose.model("FileNode", fileNodeSchema);
