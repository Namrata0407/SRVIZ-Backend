import { Request, Response, NextFunction } from 'express';
import eventService from './event.service';
import { AppError } from '../../middleware/error.middleware';
import { param, validationResult } from 'express-validator';

export class EventController {
  async getAllEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const events = await eventService.getAllEvents();
      res.json({
        success: true,
        data: events,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEventById(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(400, errors.array()[0].msg);
      }

      const event = await eventService.getEventById(req.params.id);
      if (!event) {
        throw new AppError(404, 'Event not found');
      }

      res.json({
        success: true,
        data: event,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEventPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(400, errors.array()[0].msg);
      }

      const packages = await eventService.getEventPackages(req.params.id);
      if (packages === null) {
        throw new AppError(404, 'Event not found');
      }

      res.json({
        success: true,
        data: packages,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const getEventByIdValidators = [
  param('id').isUUID().withMessage('Valid event ID (UUID) is required'),
];

export default new EventController();

