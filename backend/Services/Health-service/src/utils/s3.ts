import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || '',
        secretAccessKey: process.env.S3_SECRET_KEY || ''
    },
    forcePathStyle: true // Required for MinIO
});

/**
 * Generate a pre-signed URL for uploading a file to S3/MinIO
 */
export const getPresignedUploadUrl = async (bucketName: string, fileName: string, contentType: string) => {
    const bucket = process.env.S3_BUCKET_NAME || bucketName;
    const key = `${Date.now()}-${fileName}`;
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    return { url, key, bucket };
};

/**
 * Generate a pre-signed URL for viewing a file from S3/MinIO
 */
export const getPresignedViewUrl = async (bucketName: string, key: string) => {
    const bucket = process.env.S3_BUCKET_NAME || bucketName;
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

export default s3Client;
