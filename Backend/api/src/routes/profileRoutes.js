import { Router } from 'express';
import {
  getMarketplaceProfile,
  getMyProfile,
  listCreatorProfiles,
  saveMyProfile,
} from '../controllers/profileController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.use(requireAuth, requireRole('Creator', 'Brand'));
router.get('/me', getMyProfile);
router.put('/me', saveMyProfile);
router.get('/creators', requireRole('Brand'), listCreatorProfiles);
router.get('/:userId', getMarketplaceProfile);

export default router;
