import { Router, type Router as ExpressRouter } from 'express';
import { StatsController } from '../controllers/statsController';

const router: ExpressRouter = Router();

/**
 * Routes pour les statistiques
 */
router.get('/', StatsController.getStats);

export default router;

