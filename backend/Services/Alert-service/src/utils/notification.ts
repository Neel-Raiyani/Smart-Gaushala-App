import admin from '@config/firebase.js';
import logger from './logger.js';

/**
 * Sends a push notification to a specific device.
 * @param token The FCM registration token of the device.
 * @param title The notification title.
 * @param body The notification body.
 * @param data Optional extra data payload.
 */
export const sendPushNotification = async (token: string, title: string, body: string, data?: any) => {
    // Skip if firebase was not initialized
    if (!admin.apps.length) {
        logger.warn('[notification]: Firebase not initialized, skipping notification');
        return;
    }

    const message = {
        notification: { title, body },
        token: token,
        data: data || {},
    };

    try {
        await admin.messaging().send(message);
        logger.info(`[notification]: Successfully sent notification to token: ${token.substring(0, 10)}...`);
    } catch (error) {
        logger.error('[notification]: Error sending push notification:', error);
    }
};

/**
 * Sends a push notification to multiple devices.
 */
export const sendMulticastNotification = async (tokens: string[], title: string, body: string, data?: any) => {
    if (!admin.apps.length || tokens.length === 0) return;

    try {
        const response = await admin.messaging().sendEachForMulticast({
            notification: { title, body },
            tokens,
            data: data || {},
        });
        logger.info(`[notification]: Successfully sent multicast: ${response.successCount} success, ${response.failureCount} failure`);
    } catch (error) {
        logger.error('[notification]: Error sending multicast notification:', error);
    }
};
