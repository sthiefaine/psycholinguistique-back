import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { getClientIp } from '../utils/ip';
import { ResultsRequestBody, TrialData } from '../types';

/**
 * Contrôleur pour gérer les résultats des expériences
 */
export class ResultsController {
  /**
   * POST /api/results - Enregistre les résultats d'une expérience
   */
  static async createResults(req: Request<{}, {}, ResultsRequestBody>, res: Response): Promise<void> {
    try {
      const data = req.body;
      
      // Validation basique
      if (!data.participant || !data.experiment) {
        res.status(400).json({ 
          error: 'Données invalides: participant et experiment sont requis' 
        });
        return;
      }

      // Extraire l'IP de l'utilisateur
      const clientIp = getClientIp(req);
      console.log(`📡 IP du client: ${clientIp}`);

      // Créer ou récupérer le participant
      let participant = await prisma.participant.findFirst({
        where: {
          participantId: data.participant.id
        }
      });

      if (!participant) {
        participant = await prisma.participant.create({
          data: {
            participantId: data.participant.id,
            germanLevel: data.participant.germanLevel || null,
            nativeLanguage: data.participant.nativeLanguage || null,
            notBilingual: data.participant.notBilingual !== undefined ? data.participant.notBilingual : null,
            ipAddress: clientIp,
            startTime: new Date(data.participant.startTime)
          } as any
        });
      } else {
        // Mettre à jour l'IP, le niveau d'allemand, la langue maternelle et notBilingual si nécessaire
        const updateData: Record<string, unknown> = {};
        if (!participant.ipAddress) {
          updateData.ipAddress = clientIp;
        }
        const participantAny = participant as any;
        if (!participantAny.germanLevel && data.participant.germanLevel) {
          updateData.germanLevel = data.participant.germanLevel;
        }
        if (!participantAny.nativeLanguage && data.participant.nativeLanguage) {
          updateData.nativeLanguage = data.participant.nativeLanguage;
        }
        if (data.participant.notBilingual !== undefined && participantAny.notBilingual === null) {
          updateData.notBilingual = data.participant.notBilingual;
        }
        if (Object.keys(updateData).length > 0) {
          participant = await prisma.participant.update({
            where: { id: participant.id },
            data: updateData as any
          });
        }
      }

      // Créer l'expérience
      const experiment = await prisma.experiment.create({
        data: {
          participantId: participant.id,
          practiceTrials: data.experiment.config.practiceTrials,
          totalTrials: data.experiment.config.totalTrials,
          pauseAfterTrials: data.experiment.config.pauseAfterTrials,
          sentenceDisplayTime: data.experiment.config.sentenceDisplayTime,
          feedbackTime: data.experiment.config.feedbackTime,
          startTime: new Date(data.participant.startTime),
          endTime: data.experiment.endTime ? new Date(data.experiment.endTime) : null
        }
      });

      // Créer les essais (trials)
      const trials = data.experiment.data.map((trial: TrialData) => ({
        experimentId: experiment.id,
        trialNumber: trial.trial,
        sentence: trial.sentence,
        condition: trial.condition,
        expected: trial.expected,
        response: trial.response,
        responseTime: trial.responseTime,
        correct: trial.correct,
        timestamp: new Date(trial.timestamp)
      }));

      await prisma.trial.createMany({
        data: trials
      });

      res.json({
        success: true,
        message: 'Résultats enregistrés avec succès',
        participantId: participant.id,
        experimentId: experiment.id,
        trialsCount: trials.length,
        ipAddress: clientIp
      });

    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      res.status(500).json({
        error: 'Erreur serveur',
        message: errorMessage
      });
    }
  }

  /**
   * GET /api/results/:participantId - Récupère les résultats d'un participant
   */
  static async getResultsByParticipantId(req: Request, res: Response): Promise<void> {
    try {
      const { participantId } = req.params;
      
      const participant = await prisma.participant.findFirst({
        where: { participantId },
        include: {
          experiments: {
            include: {
              trials: {
                orderBy: { trialNumber: 'asc' }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!participant) {
        res.status(404).json({ error: 'Participant non trouvé' });
        return;
      }

      res.json(participant);
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      res.status(500).json({ error: 'Erreur serveur', message: errorMessage });
    }
  }
}

