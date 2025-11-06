import { Router, type Router as ExpressRouter } from 'express';
import { ResultsController } from '../controllers/resultsController';

const router: ExpressRouter = Router();

/**
 * Routes pour les résultats des expériences
 */
router.post('/', ResultsController.createResults);
router.get('/:participantId', ResultsController.getResultsByParticipantId);

export default router;

