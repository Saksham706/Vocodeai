import mongoose from "mongoose";

const recycleBinSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.Mixed, ref: "User", required: true },
    workspaceId: { type: mongoose.Schema.Types.Mixed, ref: "Workspace", required: true },
    workspaceName: { type: String, default: "Workspace" },
    name: { type: String, required: true },
    originalPath: { type: String, required: true },
    type: { type: String, enum: ["file", "folder", "workspace"], default: "file" },
    content: { type: String, default: "" },
    items: [
      {
        path: String,
        type: { type: String },
        content: String,
        r2Key: String,
        size: Number,
      },
    ],
    r2Key: { type: String, default: null },
    size: { type: Number, default: 0 },
    storageType: {
      type: String,
      enum: ["local", "r2", "hybrid"],
      default: "hybrid",
    },
    deletedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

recycleBinSchema.index({ userId: 1, deletedAt: -1 });

export default mongoose.model("RecycleBin", recycleBinSchema);
