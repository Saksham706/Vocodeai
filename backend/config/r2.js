import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config();

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "vocodeai-storage";
const endpoint =
  process.env.CLOUDFLARE_R2_ENDPOINT ||
  (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

export const isR2Configured = Boolean(
  accessKeyId && secretAccessKey && (endpoint || accountId)
);

export const BUCKET_NAME = bucketName;

export const r2Client = isR2Configured
  ? new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  : null;

export default r2Client;
