import { Router } from 'express';
import { listCollaborations } from '../controllers/collaborationController.js';
import { createMessage, listMessages } from '../controllers/messageController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.use(requireAuth);
router.get('/', requireRole('Brand', 'Creator', 'Admin'), listCollaborations);
router.get('/:id/messages', requireRole('Brand', 'Creator'), listMessages);
router.post('/:id/messages', requireRole('Brand', 'Creator'), createMessage);

export default router;
