import { Router } from 'express';
import leadController, {
  createLeadValidators,
  getLeadsValidators,
  updateLeadStatusValidators,
} from './lead.controller';

const router = Router();

router.post(
  '/',
  createLeadValidators,
  leadController.createLead.bind(leadController)
);

router.get(
  '/',
  getLeadsValidators,
  leadController.getLeads.bind(leadController)
);

router.patch(
  '/:id/status',
  updateLeadStatusValidators,
  leadController.updateLeadStatus.bind(leadController)
);

export default router;
