
export enum GameStep {
  VARIATION = 0,
  MUTATION = 1,
  ENV_CHANGE = 2,
  SELECTION = 3,
  INHERITANCE = 4,
  POPULATION_CHANGE = 5,
  QUIZ = 6
}

export type Allele = 'G' | 'B'; // G = Green, B = Brown

export interface Individual {
  id: string;
  alleles: [Allele, Allele];
  color: string; // Hex representation
  isAlive: boolean;
  x: number;
  y: number;
}

export interface Environment {
  name: string;
  color: string;
  type: 'LUSH' | 'ARID' | 'MEADOW';
  description: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
