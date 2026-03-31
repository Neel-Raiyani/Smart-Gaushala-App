import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
import logger from '@utils/logger.js';

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
export const getPresignedUploadUrl = async (fileName: string, contentType: string) => {
    const bucket = process.env.S3_BUCKET_NAME || 'cms-media';
    const key = `gallery/${Date.now()}-${fileName}`;
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
export const getPresignedViewUrl = async (key: string) => {
    const bucket = process.env.S3_BUCKET_NAME || 'cms-media';
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

/**
 * Delete an object from S3/MinIO
 */
export const deleteS3Object = async (key: string): Promise<void> => {
    try {
        const bucket = process.env.S3_BUCKET_NAME || 'cms-media';
        const command = new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        });
        await s3Client.send(command);
    } catch (error) {
        logger.error(`[s3]: Error deleting object ${key}: ${error}`);
    }
};

export default s3Client;
