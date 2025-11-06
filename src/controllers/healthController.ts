import { Request, Response } from 'express';

/**
 * Contrôleur pour la route de santé
 */
export class HealthController {
  /**
   * GET /health - Vérifie que le serveur fonctionne
   */
  static getHealth(_req: Request, res: Response): void {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  }
}

