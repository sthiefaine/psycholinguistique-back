import { Router, type Router as ExpressRouter } from 'express';
import { ParticipantsController } from '../controllers/participantsController';

const router: ExpressRouter = Router();

/**
 * Routes pour les participants
 */
router.get('/', ParticipantsController.getParticipants);
router.get('/:participantId', ParticipantsController.getParticipantById);
router.post('/process', ParticipantsController.processParticipants);

export default router;

