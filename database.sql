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
    "notBilingual" BOOLEAN, -- true = n'est pas bilingue, false = est bilingue ou n'a pas répondu
    "ipAddress" VARCHAR(45),
    "startTime" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- Données du questionnaire optionnel
    "age" INTEGER, -- Âge (optionnel)
    "gender" VARCHAR(20), -- "male", "female", "other", "prefer_not_to_say" (optionnel)
    "learningDuration" VARCHAR(30), -- "less_than_1_year", "1_to_2_years", "2_to_5_years", "5_to_10_years", "more_than_10_years" (optionnel)
    "feeling" VARCHAR(20), -- "like", "fear", "dislike", "indifferent" (optionnel)
    "educationLevel" VARCHAR(20), -- "lycee", "bac", "bac_plus_2", "licence", "master", "doctorat" (optionnel)
    "germanUsageFrequency" VARCHAR(30), -- "everyday", "several_times_week", "rarely" (optionnel)
    "questionnaireSubmittedAt" TIMESTAMP -- Date de soumission du questionnaire
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

