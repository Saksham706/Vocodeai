import mongoose from "mongoose";

const recycleBinSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.Mixed, ref: "User", required: true },
    workspaceId: { type: mongoose.Schema.Types.Mixed, ref: "Workspace", required: true },
    workspaceName: { type: String, default: "Workspace" },
    name: { type: String, required: true },
    originalPath: { type: String, required: true },
    type: { type: String, enum: ["file", "folder"], default: "file" },
    content: { type: String, default: "" },
    items: [
      {
        path: String,
        type: { type: String },
        content: String,
      },
    ],
    deletedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("RecycleBin", recycleBinSchema);
