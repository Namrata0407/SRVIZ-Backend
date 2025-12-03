import { Router } from 'express';
import quoteController, { generateQuoteValidators } from './quote.controller';

const router = Router();

router.post(
  '/generate',
  generateQuoteValidators,
  quoteController.generateQuote.bind(quoteController)
);

export default router;

