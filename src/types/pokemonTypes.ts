// src/types/pokemonTypes.ts
import { Pokedex as PokedexDataSource, SpeciesData } from '@/data/sv/pokedex_module'; // Ensure SpeciesData is exported if PokedexEntry is to be based on it
import { ParsedPokemon as ImportedParsedPokemon } from '@/lib/parseShowdown';
import { statsKeys } from '@/data/pokemonConstants';

export type GenderName = "M" | "F" | "N";

export type StatKey = typeof statsKeys[number];

export type BasePokemon = {
  name: string;
  num: number;
  sprite: string;
};

// PokedexEntry can be more specific if SpeciesData is well-defined and exported
// For now, using the same definition as in ediciontarjeta.tsx
export type PokedexEntry = typeof PokedexDataSource[keyof typeof PokedexDataSource];
// Alternatively, if SpeciesData from pokedex_module.ts is the correct type for a single entry:
// export type PokedexEntry = SpeciesData;

// Re-export ParsedPokemon for centralized access
export type ParsedPokemon = ImportedParsedPokemon;

export interface NatureEntry {
  name: string;
  plus?: StatKey;
  minus?: StatKey;
}

// For dropdowns like teraOptions
export interface SelectOption {
  key: string;
  label: string;
}

// You can add other shared types here as the refactoring progresses.
