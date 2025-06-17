import { Pokedex as PokedexData } from './pokedex';

export type GenderName = 'M' | 'F' | 'N'; // MODIFIED: Changed from interface to type union

export interface GenderRatio { // ADDED: Interface for gender ratio
  M: number;
  F: number;
}

export interface SpeciesAbility {
  [key: string]: string;
}

export interface SpeciesData {
  name: string;
  types: string[];
  // ... other properties ...
  gender?: GenderName; // MODIFIED: Uses the updated GenderName type
  genderRatio?: GenderRatio; // ADDED: Optional genderRatio property
  abilities?: SpeciesAbility;
  [key: string]: any; // Allow other properties
}

export interface Pokedex {
  [key: string]: SpeciesData;
}

// @ts-ignore
export const Pokedex: Pokedex = PokedexData;
