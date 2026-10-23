import { Router } from 'express';
import { createApplication, listApplications, updateApplicationStatus } from '../controllers/applicationController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.use(requireAuth);
router.get('/', requireRole('Brand', 'Creator', 'Admin'), listApplications);
router.post('/', requireRole('Creator'), createApplication);
router.patch('/:id/status', requireRole('Brand'), updateApplicationStatus);

export default router;
