import { Router, type Router as ExpressRouter } from 'express';
import { HealthController } from '../controllers/healthController';

const router: ExpressRouter = Router();

/**
 * Routes pour la santé du serveur
 */
router.get('/', HealthController.getHealth);

export default router;

