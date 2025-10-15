import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger.js';

export const initializeFirebase = (): void => {
  try {
    // Initialize Firebase Admin SDK
    if (!admin.apps.length) {
      // Try to load service account from file first (recommended for development)
      try {
        const serviceAccountPath = join(process.cwd(), 'o3-tt-subscription-firebase-adminsdk-fbsvc-77934d2e1a.json');
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });

        logger.info('Firebase Admin SDK initialized from service account file');
      } catch (fileError) {
        // If file not found, try environment variable
        const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;

        if (serviceAccountEnv) {
          // Remove newlines and parse
          const cleanedJson = serviceAccountEnv.replace(/\n/g, '\\n');
          admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(cleanedJson))
          });

          logger.info('Firebase Admin SDK initialized from environment variable');
        } else {
          // Last resort: use application default credentials
          admin.initializeApp();
          logger.info('Firebase Admin SDK initialized with default credentials');
        }
      }
    }
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
};

export const verifyFirebaseToken = async (token: string): Promise<admin.auth.DecodedIdToken> => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    logger.error('Failed to verify Firebase token:', error);
    throw new Error('Invalid or expired token');
  }
};

export { admin };
