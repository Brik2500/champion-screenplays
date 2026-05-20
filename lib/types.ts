export interface AnalyzeRequest {
  title: string;
  writerName: string;
  genre: string;
  secondaryGenre?: string;
  format: "Feature" | "Short" | "TV Pilot";
  scriptText: string;
}

export interface CategoryScores {
  concept: number;
  structure: number;
  characters: number;
  dialogue: number;
  pacing: number;
  marketability: number;
}

export interface CraftNotes {
  working: string[];
  needsImprovement: string[];
}

export interface IndustryVerdict {
  label: "Recommend" | "Consider" | "Develop";
  rationale: string;
}

export interface ComparableTitle {
  title: string;
  reason: string;
}

export interface AnalysisReport {
  title: string;
  writerName: string;
  genreNote?: string;
  industryVerdict: IndustryVerdict;
  scriptIntent: string;
  quickSnapshot: string[];
  overallScore: number;
  scoreJustification: string;
  topFixes: string[];
  executiveSummary: string;
  readerReaction: string;
  categoryScores: CategoryScores;
  comparableTitles: ComparableTitle[];
  commercialOutlook: string[];
  loglineFeedback: string;
  strengths: string[];
  weaknesses: string[];
  structureNotes: CraftNotes;
  characterNotes: CraftNotes;
  dialogueNotes: CraftNotes;
  pacingNotes: CraftNotes;
  marketabilityNotes: CraftNotes;
}
