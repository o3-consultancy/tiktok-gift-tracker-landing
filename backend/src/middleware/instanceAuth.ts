import { Request, Response, NextFunction } from 'express';
import { TrackerInstance } from '../models/TrackerInstance.js';
import { createError } from './errorHandler.js';
import { logger } from '../utils/logger.js';
import { Types } from 'mongoose';

// Extend Express Request type to include instance data
declare global {
  namespace Express {
    interface Request {
      instance?: {
        accountId: string;
        userId: string;
        apiKey: string;
        instanceUrl?: string;
      };
    }
  }
}

/**
 * Middleware to authenticate tracker instances using API keys
 * Expects headers: X-API-Key and X-Account-ID
 */
export const authenticateInstance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get API key and Account ID from headers
    const apiKey = req.headers['x-api-key'] as string;
    const accountId = req.headers['x-account-id'] as string;

    // Validate headers presence
    if (!apiKey) {
      throw createError('API key is required. Please provide X-API-Key header.', 401);
    }

    if (!accountId) {
      throw createError('Account ID is required. Please provide X-Account-ID header.', 401);
    }

    // Validate accountId format
    if (!Types.ObjectId.isValid(accountId)) {
      throw createError('Invalid Account ID format', 400);
    }

    // Find tracker instance
    const instance = await TrackerInstance.findOne({
      apiKey: apiKey,
      accountId: accountId,
      status: 'active'
    }).populate('userId', '_id');

    // Validate instance exists
    if (!instance) {
      logger.warn(`Authentication failed: Invalid API key or Account ID`, {
        accountId,
        apiKey: apiKey.substring(0, 8) + '...' // Log partial key for security
      });
      throw createError('Invalid API key or Account ID', 401);
    }

    // Update last accessed time (non-blocking)
    instance.updateLastAccessed().catch((err) => {
      logger.error('Failed to update lastAccessedAt:', err);
    });

    // Attach instance info to request
    req.instance = {
      accountId: instance.accountId.toString(),
      userId: instance.userId.toString(),
      apiKey: instance.apiKey,
      instanceUrl: instance.instanceUrl
    };

    logger.info(`Instance authenticated: Account ${accountId}`);

    next();
  } catch (error: any) {
    logger.error('Instance authentication error:', error);
    next(error);
  }
};
