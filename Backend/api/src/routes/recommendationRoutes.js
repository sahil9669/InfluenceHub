import { Router } from 'express';
import { recommendCampaigns, recommendCreators } from '../controllers/recommendationController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.use(requireAuth);
router.get('/creators', requireRole('Brand'), recommendCreators);
router.get('/campaigns', requireRole('Creator'), recommendCampaigns);

export default router;
