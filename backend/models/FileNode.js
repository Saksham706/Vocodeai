import mongoose from "mongoose";

const fileNodeSchema = new mongoose.Schema({
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
  path: String,
  type: { type: String, enum: ["file", "folder"] },
  content: {
  type: String,
  default: "",
  maxlength: 2_000_000,
},
}, { timestamps: true });

fileNodeSchema.index(
  { workspaceId: 1, path: 1 },
  { unique: true }
);;

export default mongoose.model("FileNode", fileNodeSchema);