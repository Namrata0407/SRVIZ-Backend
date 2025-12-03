import { Request, Response, NextFunction } from 'express';
import leadService from './lead.service';
import { LeadStatus } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware';
import { body, query, param, validationResult } from 'express-validator';

export class LeadController {
  async createLead(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(400, errors.array()[0].msg);
      }

      const lead = await leadService.createLead(req.body);
      res.status(201).json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLeads(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(400, errors.array()[0].msg);
      }

      const filters = {
        status: req.query.status as LeadStatus | undefined,
        eventId: req.query.eventId as string | undefined,
        month: req.query.month ? parseInt(req.query.month as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await leadService.getLeads(filters);
      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateLeadStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(400, errors.array()[0].msg);
      }

      const lead = await leadService.updateLeadStatus(
        req.params.id,
        req.body.status
      );
      res.json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const createLeadValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().isString(),
  body('eventId').isUUID().withMessage('Valid eventId (UUID) is required'),
  body('travellersCount')
    .isInt({ min: 1 })
    .withMessage('Travellers count must be at least 1'),
];

export const getLeadsValidators = [
  query('status')
    .optional()
    .isIn(['New', 'Contacted', 'QuoteSent', 'Interested', 'ClosedWon', 'ClosedLost'])
    .withMessage('Invalid status'),
  query('eventId').optional().isUUID().withMessage('Invalid eventId format'),
  query('month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

export const updateLeadStatusValidators = [
  param('id').isUUID().withMessage('Valid lead ID (UUID) is required'),
  body('status')
    .isIn(['New', 'Contacted', 'QuoteSent', 'Interested', 'ClosedWon', 'ClosedLost'])
    .withMessage('Valid status is required'),
];

export default new LeadController();

