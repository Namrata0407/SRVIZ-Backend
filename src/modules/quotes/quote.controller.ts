import { Request, Response, NextFunction } from 'express';
import quoteService from './quote.service';
import { AppError } from '../../middleware/error.middleware';
import { body, validationResult } from 'express-validator';

export class QuoteController {
  async generateQuote(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(400, errors.array()[0].msg);
      }

      const result = await quoteService.generateQuote(req.body);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const generateQuoteValidators = [
  body('leadId').isUUID().withMessage('Valid leadId (UUID) is required'),
  body('packageId').isUUID().withMessage('Valid packageId (UUID) is required'),
  body('travellersCount')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Travellers count must be at least 1'),
];

export default new QuoteController();

