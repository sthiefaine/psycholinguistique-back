import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

/**
 * Contrôleur pour gérer les statistiques
 */
export class StatsController {
  /**
   * GET /api/stats - Récupère toutes les statistiques
   */
  static async getStats(_req: Request, res: Response): Promise<void> {
    try {
      const totalParticipants = await prisma.participant.count();
      const totalExperiments = await prisma.experiment.count();
      const totalTrials = await prisma.trial.count();
      
      // Compter les réponses correctes (on ne peut pas faire _avg sur un booléen)
      const correctTrials = await prisma.trial.count({
        where: {
          correct: true
        }
      });

      // Calculer le pourcentage de précision
      const averageAccuracy = totalTrials > 0 
        ? ((correctTrials / totalTrials) * 100).toFixed(2) + '%'
        : '0%';

      res.json({
        totalParticipants,
        totalExperiments,
        totalTrials,
        averageAccuracy
      });
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      res.status(500).json({ error: 'Erreur serveur', message: errorMessage });
    }
  }
}

