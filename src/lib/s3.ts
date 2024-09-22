import dotenv from "dotenv";
dotenv.config();
import { S3Client } from "@aws-sdk/client-s3";

let s3Client: S3Client | null = null;

const getS3Client = (): S3Client => {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION as string,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY as string,
        secretAccessKey: process.env.AWS_SECRET_KEY_ID as string,
      },
    });
  }

  return s3Client;
};

export default getS3Client;
