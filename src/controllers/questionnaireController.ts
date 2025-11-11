import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

/**
 * Contrôleur pour gérer le questionnaire optionnel
 */
export class QuestionnaireController {
  /**
   * POST /api/participants/:participantId/questionnaire - Enregistre les réponses du questionnaire
   */
  static async submitQuestionnaire(req: Request, res: Response): Promise<void> {
    try {
      const { participantId } = req.params;
      const { age, gender, learningDuration, feeling, educationLevel, germanUsageFrequency } = req.body;

      // Vérifier que le participant existe
      const participant = await prisma.participant.findFirst({
        where: { participantId }
      });

      if (!participant) {
        res.status(404).json({
          success: false,
          message: 'Participant non trouvé'
        });
        return;
      }

      // Valider les valeurs enum
      const validGenders = ['male', 'female', 'other', 'prefer_not_to_say'];
      const validDurations = ['less_than_1_year', '1_to_2_years', '2_to_5_years', '5_to_10_years', 'more_than_10_years'];
      const validFeelings = ['like', 'fear', 'dislike', 'indifferent'];
      const validEducationLevels = ['lycee', 'bac', 'bac_plus_2', 'licence', 'master', 'doctorat'];
      const validUsageFrequencies = ['everyday', 'several_times_week', 'rarely'];

      if (gender !== null && gender !== undefined && !validGenders.includes(gender)) {
        res.status(400).json({
          success: false,
          message: 'Valeur de gender invalide'
        });
        return;
      }

      if (learningDuration !== null && learningDuration !== undefined && !validDurations.includes(learningDuration)) {
        res.status(400).json({
          success: false,
          message: 'Valeur de learningDuration invalide'
        });
        return;
      }

      if (feeling !== null && feeling !== undefined && !validFeelings.includes(feeling)) {
        res.status(400).json({
          success: false,
          message: 'Valeur de feeling invalide'
        });
        return;
      }

      if (educationLevel !== null && educationLevel !== undefined && !validEducationLevels.includes(educationLevel)) {
        res.status(400).json({
          success: false,
          message: 'Valeur de educationLevel invalide'
        });
        return;
      }

      if (germanUsageFrequency !== null && germanUsageFrequency !== undefined && !validUsageFrequencies.includes(germanUsageFrequency)) {
        res.status(400).json({
          success: false,
          message: 'Valeur de germanUsageFrequency invalide'
        });
        return;
      }

      // Valider l'âge (doit être un nombre positif si fourni)
      if (age !== null && age !== undefined) {
        const ageNum = Number(age);
        if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
          res.status(400).json({
            success: false,
            message: 'Valeur d\'âge invalide'
          });
          return;
        }
      }

      // Mettre à jour le participant avec les données du questionnaire
      const updated = await prisma.participant.update({
        where: { id: participant.id },
        data: {
          age: age !== null && age !== undefined ? Number(age) : null,
          gender: gender || null,
          learningDuration: learningDuration || null,
          feeling: feeling || null,
          educationLevel: educationLevel || null,
          germanUsageFrequency: germanUsageFrequency || null,
          questionnaireSubmittedAt: new Date()
        } as any
      });

      res.json({
        success: true,
        message: 'Questionnaire enregistré avec succès',
        data: {
          participantId: updated.participantId,
          age: (updated as any).age,
          gender: (updated as any).gender,
          learningDuration: (updated as any).learningDuration,
          feeling: (updated as any).feeling,
          educationLevel: (updated as any).educationLevel,
          germanUsageFrequency: (updated as any).germanUsageFrequency,
          submittedAt: (updated as any).questionnaireSubmittedAt
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du questionnaire:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de l\'enregistrement du questionnaire',
        error: errorMessage
      });
    }
  }
}

