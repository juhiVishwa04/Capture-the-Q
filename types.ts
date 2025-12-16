export enum QuestionType {
  MCQ = 'MCQ',
  THEORY = 'THEORY',
  UNKNOWN = 'UNKNOWN'
}

export interface SolvedQuestion {
  type: QuestionType;
  questionText: string;
  options?: string[]; // For MCQs
  correctAnswer: string;
  explanation: string;
  confidenceScore: number; // 0-100
  isLegible: boolean;
}

export interface AnalysisResult {
  questions: SolvedQuestion[];
  overallSummary?: string;
}

export enum AppState {
  IDLE = 'IDLE',
  CAPTURING = 'CAPTURING',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}
