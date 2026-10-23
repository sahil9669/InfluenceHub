import { Router } from 'express';
import { createCampaign, listCampaigns, updateCampaignStatus } from '../controllers/campaignController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.use(requireAuth);
router.get('/', requireRole('Brand', 'Creator', 'Admin'), listCampaigns);
router.post('/', requireRole('Brand'), createCampaign);
router.patch('/:id/status', requireRole('Brand'), updateCampaignStatus);

export default router;
