import { Router, type Router as ExpressRouter } from 'express';
import resultsRoutes from './resultsRoutes';
import statsRoutes from './statsRoutes';
import participantsRoutes from './participantsRoutes';

const router: ExpressRouter = Router();

/**
 * Configuration de toutes les routes de l'API
 */
router.use('/results', resultsRoutes);
router.use('/stats', statsRoutes);
router.use('/participants', participantsRoutes);

export default router;

