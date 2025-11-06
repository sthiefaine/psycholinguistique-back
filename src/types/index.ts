// Types pour les requêtes API

export interface ParticipantData {
  id: string;
  germanLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | string | null; // Niveau en allemand d'après le test
  nativeLanguage?: 'french' | 'portuguese' | null; // Langue maternelle
  startTime: string;
}

export interface ExperimentConfig {
  practiceTrials: number;
  totalTrials: number;
  pauseAfterTrials: number;
  sentenceDisplayTime: number;
  feedbackTime: number;
}

export interface TrialData {
  trial: number;
  sentence: string;
  condition: string;
  expected: string;
  response: string;
  responseTime: number;
  correct: boolean;
  timestamp: string;
}

export interface ExperimentData {
  config: ExperimentConfig;
  endTime?: string | null;
  data: TrialData[];
}

export interface ResultsRequestBody {
  participant: ParticipantData;
  experiment: ExperimentData;
}

