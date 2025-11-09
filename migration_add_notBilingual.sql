-- ============================================
-- Migration: Ajouter le champ notBilingual
-- Utilisez ce script si vous avez déjà créé les tables
-- ============================================

-- Pour PostgreSQL
ALTER TABLE "Participant" 
ADD COLUMN IF NOT EXISTS "notBilingual" BOOLEAN;

-- Commentaire pour PostgreSQL
COMMENT ON COLUMN "Participant"."notBilingual" IS 'true = n''est pas bilingue, false = est bilingue ou n''a pas répondu';

-- Pour MySQL (si vous utilisez MySQL)
-- ALTER TABLE `Participant` 
-- ADD COLUMN `notBilingual` BOOLEAN;

