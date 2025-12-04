import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

async function testS3() {
  try {
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    console.log("🔍 Testing S3 connection...");

    const result = await s3.send(new ListBucketsCommand({}));

    console.log("✅ S3 Connected Successfully!");
    console.log("📦 Buckets:", result.Buckets);

  } catch (err) {
    console.error("❌ S3 Connection Failed:", err.message);
  }
}

testS3();

