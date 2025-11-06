const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

// Middleware pour extraire l'IP réelle (même derrière un proxy)
app.set('trust proxy', true);

// Middleware
app.use(cors()); // Permet les requêtes depuis votre frontend
app.use(express.json()); // Parse les requêtes JSON

// Fonction pour extraire l'IP de l'utilisateur
function getClientIp(req) {
  // Si derrière un proxy, vérifier x-forwarded-for
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // x-forwarded-for peut contenir plusieurs IPs, prendre la première
    return forwarded.split(',')[0].trim();
  }
  // Sinon utiliser req.ip (fonctionne avec trust proxy)
  return req.ip || req.connection.remoteAddress || 'unknown';
}

// Route pour recevoir les résultats
app.post('/api/results', async (req, res) => {
  try {
    const data = req.body;
    
    // Validation basique
    if (!data.participant || !data.experiment) {
      return res.status(400).json({ 
        error: 'Données invalides: participant et experiment sont requis' 
      });
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
          languageGroup: data.participant.languageGroup || null,
          ipAddress: clientIp,
          startTime: new Date(data.participant.startTime)
        }
      });
    } else {
      // Mettre à jour l'IP si elle n'existe pas encore
      if (!participant.ipAddress) {
        participant = await prisma.participant.update({
          where: { id: participant.id },
          data: { ipAddress: clientIp }
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
    const trials = data.experiment.data.map(trial => ({
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
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
});

// Route pour récupérer les résultats d'un participant
app.get('/api/results/:participantId', async (req, res) => {
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
      return res.status(404).json({ error: 'Participant non trouvé' });
    }

    res.json(participant);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
});

// Route pour récupérer toutes les statistiques
app.get('/api/stats', async (req, res) => {
  try {
    const totalParticipants = await prisma.participant.count();
    const totalExperiments = await prisma.experiment.count();
    const totalTrials = await prisma.trial.count();
    
    const avgAccuracy = await prisma.trial.aggregate({
      _avg: {
        correct: true
      }
    });

    res.json({
      totalParticipants,
      totalExperiments,
      totalTrials,
      averageAccuracy: avgAccuracy._avg.correct ? (avgAccuracy._avg.correct * 100).toFixed(2) + '%' : '0%'
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
});

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 Endpoint API: http://localhost:${PORT}/api/results`);
});

// Gestion propre de l'arrêt
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

