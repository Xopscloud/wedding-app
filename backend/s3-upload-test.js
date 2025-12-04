import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function uploadTest() {
  try {
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    // Path of a file in your backend folder to upload
    const filePath = path.resolve("test-image.jpg");

    if (!fs.existsSync(filePath)) {
      console.error("❌ File not found:", filePath);
      console.log("➡ Create a small file named test-image.jpg in the backend folder.");
      return;
    }

    const fileStream = fs.createReadStream(filePath);

    const uploadParams = {
      Bucket: process.env.S3_BUCKET,
      Key: "tests/test-image.jpg", // folder/key in S3
      Body: fileStream,
      ContentType: "image/jpeg"
    };

    console.log("📤 Uploading test-image.jpg to S3...");

    await s3.send(new PutObjectCommand(uploadParams));

    console.log("✅ Upload successful!");
    console.log(`📁 File available at: https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/tests/test-image.jpg`);

  } catch (err) {
    console.error("❌ Upload failed:", err.message);
  }
}

uploadTest();
