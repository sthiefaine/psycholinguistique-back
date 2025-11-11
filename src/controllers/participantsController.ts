import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

/**
 * Contrôleur pour gérer les participants
 */
export class ParticipantsController {
  /**
   * GET /api/participants - Récupère la liste de tous les participants
   * 
   * Query parameters optionnels:
   * - page: numéro de page (défaut: 1)
   * - limit: nombre d'éléments par page (défaut: 50, max: 100)
   * - nativeLanguage: filtrer par langue maternelle ("french" ou "portuguese")
   * - germanLevel: filtrer par niveau d'allemand ("A1", "A2", "B1", "B2", "C1", "C2")
   */
  static async getParticipants(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const skip = (page - 1) * limit;
      
      const nativeLanguage = req.query.nativeLanguage as string | undefined;
      const germanLevel = req.query.germanLevel as string | undefined;

      // Construire les filtres
      const where: Record<string, unknown> = {};

      if (nativeLanguage && (nativeLanguage === 'french' || nativeLanguage === 'portuguese')) {
        where.nativeLanguage = nativeLanguage;
      }

      if (germanLevel && ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(germanLevel)) {
        where.germanLevel = germanLevel;
      }

      // Récupérer les participants avec pagination
      const [participants, total] = await Promise.all([
        prisma.participant.findMany({
          where: Object.keys(where).length > 0 ? where : undefined,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                experiments: true
              }
            }
          }
        }),
        prisma.participant.count({
          where: Object.keys(where).length > 0 ? where : undefined
        })
      ]);

      // Formater la réponse selon les attentes du frontend
      const formattedParticipants = participants.map((participant: any) => ({
        id: participant.participantId, // Le frontend attend participantId comme id
        participantId: participant.participantId,
        nativeLanguage: participant.nativeLanguage || null,
        germanLevel: participant.germanLevel || null,
        notBilingual: participant.notBilingual !== undefined ? participant.notBilingual : null,
        startTime: participant.startTime.toISOString(),
        ipAddress: participant.ipAddress || null,
        // Données du questionnaire optionnel
        age: participant.age || null,
        gender: participant.gender || null,
        learningDuration: participant.learningDuration || null,
        feeling: participant.feeling || null,
        educationLevel: participant.educationLevel || null,
        germanUsageFrequency: participant.germanUsageFrequency || null,
        questionnaireSubmittedAt: participant.questionnaireSubmittedAt ? participant.questionnaireSubmittedAt.toISOString() : null,
        experiments: [] // Vide ici, on récupère les détails après
      }));

      res.json(formattedParticipants);
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      res.status(500).json({ error: 'Erreur serveur', message: errorMessage });
    }
  }

  /**
   * GET /api/participants/:participantId - Récupère un participant spécifique par son participantId
   */
  static async getParticipantById(req: Request, res: Response): Promise<void> {
    try {
      const { participantId } = req.params;
      
      const participant = await prisma.participant.findFirst({
        where: { participantId },
        include: {
          experiments: {
            include: {
              _count: {
                select: {
                  trials: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              experiments: true
            }
          }
        }
      });

      if (!participant) {
        res.status(404).json({ error: 'Participant non trouvé' });
        return;
      }

      // Formater la réponse selon les attentes du frontend
      const formattedParticipant = {
        id: participant.participantId, // Le frontend attend participantId comme id
        participantId: participant.participantId,
        nativeLanguage: (participant as any).nativeLanguage || null,
        germanLevel: (participant as any).germanLevel || null,
        notBilingual: (participant as any).notBilingual !== undefined ? (participant as any).notBilingual : null,
        startTime: participant.startTime.toISOString(),
        ipAddress: participant.ipAddress || null,
        // Données du questionnaire optionnel
        age: (participant as any).age || null,
        gender: (participant as any).gender || null,
        learningDuration: (participant as any).learningDuration || null,
        feeling: (participant as any).feeling || null,
        educationLevel: (participant as any).educationLevel || null,
        germanUsageFrequency: (participant as any).germanUsageFrequency || null,
        questionnaireSubmittedAt: (participant as any).questionnaireSubmittedAt ? (participant as any).questionnaireSubmittedAt.toISOString() : null,
        experiments: participant.experiments.map((exp: any) => ({
          id: exp.id,
          config: {}, // Configuration vide comme attendu par le frontend
          endTime: exp.endTime ? exp.endTime.toISOString() : null,
          trials: exp.trials.map((trial: any) => ({
            trial: trial.trialNumber,
            sentence: trial.sentence,
            condition: trial.condition,
            expected: trial.expected,
            response: trial.response,
            responseTime: trial.responseTime,
            correct: trial.correct
            // Note: timestamp n'est pas demandé par le frontend dans les trials
          }))
        }))
      };

      res.json(formattedParticipant);
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      res.status(500).json({ error: 'Erreur serveur', message: errorMessage });
    }
  }

  /**
   * POST /api/participants/process - Récupère les données complètes de plusieurs participants pour traitement
   * Body: { participantIds: ["P001", "P002", "P003"] }
   */
  static async processParticipants(req: Request, res: Response): Promise<void> {
    try {
      const { participantIds } = req.body;

      if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
        res.status(400).json({ 
          error: 'Données invalides: participantIds doit être un tableau non vide' 
        });
        return;
      }

      // Récupérer tous les participants avec leurs expériences et trials
      const participants = await prisma.participant.findMany({
        where: {
          participantId: {
            in: participantIds
          }
        },
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

      if (participants.length === 0) {
        res.status(404).json({ error: 'Aucun participant trouvé' });
        return;
      }

      // Formater les données selon les attentes du frontend
      const formattedData = participants.map((participant: any) => {
        // Formater chaque expérience avec ses trials
        const experiments = participant.experiments.map((exp: any) => ({
          id: exp.id,
          config: {}, // Configuration vide comme attendu
          endTime: exp.endTime ? exp.endTime.toISOString() : null,
          trials: exp.trials.map((trial: any) => ({
            trial: trial.trialNumber,
            sentence: trial.sentence,
            condition: trial.condition,
            expected: trial.expected,
            response: trial.response,
            responseTime: trial.responseTime,
            correct: trial.correct
          }))
        }));

        return {
          id: participant.participantId,
          participantId: participant.participantId,
          nativeLanguage: participant.nativeLanguage || null,
          germanLevel: participant.germanLevel || null,
          notBilingual: participant.notBilingual !== undefined ? participant.notBilingual : null,
          startTime: participant.startTime.toISOString(),
          ipAddress: participant.ipAddress || null,
          // Données du questionnaire optionnel
          age: participant.age || null,
          gender: participant.gender || null,
          learningDuration: participant.learningDuration || null,
          feeling: participant.feeling || null,
          educationLevel: participant.educationLevel || null,
          germanUsageFrequency: participant.germanUsageFrequency || null,
          questionnaireSubmittedAt: participant.questionnaireSubmittedAt ? participant.questionnaireSubmittedAt.toISOString() : null,
          experiments: experiments
        };
      });

      res.json({
        success: true,
        count: formattedData.length,
        data: formattedData
      });

    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      res.status(500).json({ error: 'Erreur serveur', message: errorMessage });
    }
  }
}

