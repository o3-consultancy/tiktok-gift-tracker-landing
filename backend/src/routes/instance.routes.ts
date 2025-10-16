import { Router, Request, Response } from 'express';
import { authenticateInstance } from '../middleware/instanceAuth.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { InstanceData } from '../models/InstanceData.js';
import { logger } from '../utils/logger.js';
import { Types } from 'mongoose';

const router = Router();

/**
 * GET /api/instances/:accountId/gift-groups
 * Load gift groups for an instance
 */
router.get(
  '/:accountId/gift-groups',
  authenticateInstance,
  asyncHandler(async (req: Request, res: Response) => {
    const { accountId } = req.params;

    // Verify accountId matches authenticated instance
    if (accountId !== req.instance!.accountId) {
      throw createError('Account ID mismatch', 403);
    }

    // Get or create gift groups data
    const instanceData = await InstanceData.findOrCreate(
      new Types.ObjectId(accountId),
      'gift-groups',
      {} // Empty object as default
    );

    logger.info(`Loaded gift groups for account ${accountId}`);

    res.json({
      success: true,
      data: instanceData.data
    });
  })
);

/**
 * POST /api/instances/:accountId/gift-groups
 * Save gift groups for an instance
 */
router.post(
  '/:accountId/gift-groups',
  authenticateInstance,
  asyncHandler(async (req: Request, res: Response) => {
    const { accountId } = req.params;
    const { groups } = req.body;

    // Verify accountId matches authenticated instance
    if (accountId !== req.instance!.accountId) {
      throw createError('Account ID mismatch', 403);
    }

    if (!groups || typeof groups !== 'object') {
      throw createError('Invalid groups data format', 400);
    }

    // Upsert gift groups data
    await InstanceData.upsertData(
      new Types.ObjectId(accountId),
      'gift-groups',
      groups
    );

    logger.info(`Saved gift groups for account ${accountId}`, {
      groupCount: Object.keys(groups).length
    });

    res.json({
      success: true,
      message: 'Gift groups saved successfully'
    });
  })
);

/**
 * GET /api/instances/:accountId/config
 * Load configuration for an instance
 */
router.get(
  '/:accountId/config',
  authenticateInstance,
  asyncHandler(async (req: Request, res: Response) => {
    const { accountId } = req.params;

    // Verify accountId matches authenticated instance
    if (accountId !== req.instance!.accountId) {
      throw createError('Account ID mismatch', 403);
    }

    // Get or create config data
    const instanceData = await InstanceData.findOrCreate(
      new Types.ObjectId(accountId),
      'config',
      {
        theme: 'dark',
        language: 'en',
        notifications: true,
        autoConnect: false
      }
    );

    logger.info(`Loaded config for account ${accountId}`);

    res.json({
      success: true,
      data: instanceData.data
    });
  })
);

/**
 * POST /api/instances/:accountId/config
 * Save configuration for an instance
 */
router.post(
  '/:accountId/config',
  authenticateInstance,
  asyncHandler(async (req: Request, res: Response) => {
    const { accountId } = req.params;
    const configData = req.body;

    // Verify accountId matches authenticated instance
    if (accountId !== req.instance!.accountId) {
      throw createError('Account ID mismatch', 403);
    }

    if (!configData || typeof configData !== 'object') {
      throw createError('Invalid config data format', 400);
    }

    // Get existing config
    const existingData = await InstanceData.findOne({
      accountId: new Types.ObjectId(accountId),
      dataType: 'config'
    });

    // Merge with existing config
    const mergedConfig = {
      ...(existingData?.data || {}),
      ...configData
    };

    // Upsert config data
    await InstanceData.upsertData(
      new Types.ObjectId(accountId),
      'config',
      mergedConfig
    );

    logger.info(`Saved config for account ${accountId}`);

    res.json({
      success: true,
      message: 'Configuration saved successfully',
      data: mergedConfig
    });
  })
);

/**
 * POST /api/instances/:accountId/analytics
 * Store analytics snapshot (optional - for future use)
 */
router.post(
  '/:accountId/analytics',
  authenticateInstance,
  asyncHandler(async (req: Request, res: Response) => {
    const { accountId } = req.params;
    const analyticsData = req.body;

    // Verify accountId matches authenticated instance
    if (accountId !== req.instance!.accountId) {
      throw createError('Account ID mismatch', 403);
    }

    // For now, just acknowledge receipt
    // In the future, you can store this in a time-series format

    logger.info(`Received analytics for account ${accountId}`, {
      timestamp: analyticsData.timestamp
    });

    res.json({
      success: true,
      message: 'Analytics received successfully'
    });
  })
);

export default router;
