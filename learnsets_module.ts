import { Learnsets as LearnsetsData } from './learnsets';

export interface LearnsetMove {
  [source: string]: number[];
}

export interface LearnsetData {
  learnset?: {
    [moveid: string]: LearnsetMove;
  };
  [key: string]: any;
}

export interface Learnsets {
  [species: string]: LearnsetData;
}

// @ts-ignore
export const Learnsets: Learnsets = LearnsetsData;
