-- ============================================
-- Script SQL pour créer les tables
-- Compatible PostgreSQL et MySQL
-- ============================================

-- Table: Participant
-- Stocke les informations sur les participants
CREATE TABLE IF NOT EXISTS "Participant" (
    "id" VARCHAR(36) PRIMARY KEY,
    "participantId" VARCHAR(255) NOT NULL,
    "germanLevel" VARCHAR(10), -- Niveau en allemand: "A1", "A2", "B1", "B2", "C1", "C2"
    "nativeLanguage" VARCHAR(20), -- "french" ou "portuguese"
    "ipAddress" VARCHAR(45),
    "startTime" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: Experiment
-- Stocke les configurations et métadonnées des expériences
CREATE TABLE IF NOT EXISTS "Experiment" (
    "id" VARCHAR(36) PRIMARY KEY,
    "participantId" VARCHAR(36) NOT NULL,
    "practiceTrials" INT NOT NULL,
    "totalTrials" INT NOT NULL,
    "pauseAfterTrials" INT NOT NULL,
    "sentenceDisplayTime" INT NOT NULL,
    "feedbackTime" INT NOT NULL,
    "startTime" TIMESTAMP NOT NULL,
    "endTime" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE
);

-- Table: Trial
-- Stocke les détails de chaque essai (trial)
CREATE TABLE IF NOT EXISTS "Trial" (
    "id" VARCHAR(36) PRIMARY KEY,
    "experimentId" VARCHAR(36) NOT NULL,
    "trialNumber" INT NOT NULL,
    "sentence" TEXT NOT NULL,
    "condition" VARCHAR(255) NOT NULL,
    "expected" VARCHAR(50) NOT NULL,
    "response" VARCHAR(50) NOT NULL,
    "responseTime" INT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "timestamp" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE CASCADE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS "idx_participant_participantId" ON "Participant"("participantId");
CREATE INDEX IF NOT EXISTS "idx_experiment_participantId" ON "Experiment"("participantId");
CREATE INDEX IF NOT EXISTS "idx_trial_experimentId" ON "Trial"("experimentId");
CREATE INDEX IF NOT EXISTS "idx_trial_trialNumber" ON "Trial"("trialNumber");
CREATE INDEX IF NOT EXISTS "idx_trial_correct" ON "Trial"("correct");

