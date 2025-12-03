import { Router } from 'express';
import eventController, { getEventByIdValidators } from './event.controller';

const router = Router();

router.get('/', eventController.getAllEvents.bind(eventController));

router.get('/:id', getEventByIdValidators, eventController.getEventById.bind(eventController));

router.get(
  '/:id/packages',
  getEventByIdValidators,
  eventController.getEventPackages.bind(eventController)
);

export default router;

