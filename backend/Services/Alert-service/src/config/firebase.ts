import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import logger from '@utils/logger.js';

const serviceAccountPath = path.resolve('src/config/serviceAccountKey.json');

let serviceAccount: any = null;

if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    logger.info('[firebase]: Initializing with serviceAccountKey.json');
} else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        const configStr = process.env.FIREBASE_SERVICE_ACCOUNT.startsWith('{') 
            ? process.env.FIREBASE_SERVICE_ACCOUNT 
            : Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString();
        serviceAccount = JSON.parse(configStr);
        logger.info('[firebase]: Initializing with FIREBASE_SERVICE_ACCOUNT environment variable');
    } catch (error) {
        logger.error('[firebase]: Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:', error);
    }
}

if (serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    logger.info('[firebase]: Firebase Admin initialized successfully');
} else {
    logger.warn('[firebase]: No Firebase credentials found (no JSON file or FIREBASE_SERVICE_ACCOUNT env). Push notifications will be disabled.');
}

export default admin;
