import { Pokedex, SpeciesData, GenderName } from '../data/sv/pokedex_module';
import { Learnsets } from '../data/sv/learnsets';

// Interface updated to include types and abilities
export interface PokemonDetails {
  gender: GenderName | undefined;
  moves: string[];
  types: string[] | undefined;
  abilities: { [key: string]: string; H?: string; S?: string; } | undefined;
}

/**
 * Retrieves specific details for a Pokémon species.
 * @param speciesName The name of the Pokémon species.
 * @returns An object containing gender, potential moves, types, and abilities, or null if species not found.
 */
export function getPokemonDetails(speciesName: string): PokemonDetails | null {
  const speciesId = speciesName.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const speciesData = Pokedex[speciesId] as SpeciesData | undefined;

  if (!speciesData) {
    console.error(`Pokemon species "${speciesName}" not found in Pokedex.`);
    return null;
  }

  let finalGender: GenderName | undefined = undefined;
  if (speciesData.gender) {
    finalGender = speciesData.gender;
  } else if (speciesData.genderRatio) {
    finalGender = Math.random() < speciesData.genderRatio.M ? 'M' : 'F';
  } else {
    finalGender = 'N'; // Default to Neutral if no gender info
  }

  let availableMoves: string[] = [];
  if (speciesData.randomBattleMoves && speciesData.randomBattleMoves.length > 0) {
    availableMoves = [...speciesData.randomBattleMoves];
  } else if (speciesData.learnset) {
    availableMoves = Object.keys(speciesData.learnset);
  }

  const selectedMoves: string[] = [];
  const movesPoolCopy = [...availableMoves]; // Create a copy to draw from
  for (let i = 0; i < 4 && movesPoolCopy.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * movesPoolCopy.length);
      selectedMoves.push(movesPoolCopy.splice(randomIndex, 1)[0]);
  }
  // Ensure 4 moves, padding with "-" if necessary
  while (selectedMoves.length < 4) {
    selectedMoves.push("-");
  }

  return {
    gender: finalGender,
    moves: selectedMoves,
    types: speciesData.types,
    abilities: speciesData.abilities,
  };
}

/**
 * Gets a specific gender for a species, prioritizing defined gender or calculating from ratio.
 * @param speciesName The name of the Pokémon species.
 * @returns GenderName ('M', 'F', 'N') or undefined if not determinable.
 */
export function getGenderForSpecies(speciesName: string): GenderName | undefined {
  const speciesId = speciesName.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const speciesData = Pokedex[speciesId] as SpeciesData | undefined;

  if (!speciesData) {
    console.warn(`Species "${speciesName}" not found for gender lookup.`);
    return undefined;
  }

  if (speciesData.gender) {
    return speciesData.gender;
  }
  if (speciesData.genderRatio) {
    return Math.random() < speciesData.genderRatio.M ? 'M' : 'F';
  }
  return 'N'; // Default for species with no specified gender or ratio (e.g., genderless)
}

/**
 * Gets a list of up to 4 random valid moves for a species.
 * @param speciesName The name of the Pokémon species.
 * @returns An array of move names.
 */
export function getRandomMovesForSpecies(speciesName: string): string[] {
  const speciesId = speciesName.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const speciesData = Pokedex[speciesId] as SpeciesData | undefined;

  let availableMovesPool: string[] = [];
  if (speciesData) {
    if (speciesData.randomBattleMoves && speciesData.randomBattleMoves.length > 0) {
      availableMovesPool = [...speciesData.randomBattleMoves];
    } else if (speciesData.learnset) {
      const learnableMovesFromLearnset = Object.keys(speciesData.learnset);
      if (learnableMovesFromLearnset.length > 0) {
        availableMovesPool = learnableMovesFromLearnset;
      }
    }
  }
  // If still empty, try Learnsets
  if (availableMovesPool.length === 0) {
    const learnsetObj = Learnsets[speciesId]?.learnset;
    if (learnsetObj) {
      availableMovesPool = Object.keys(learnsetObj);
    }
  }
  if (availableMovesPool.length === 0) return ['-', '-', '-', '-'];
  const resultMoves: string[] = [];
  const poolCopy = [...availableMovesPool];
  for (let i = 0; i < 4 && poolCopy.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * poolCopy.length);
    resultMoves.push(poolCopy.splice(randomIndex, 1)[0]);
  }
  while (resultMoves.length < 4) {
    resultMoves.push('-');
  }
  return resultMoves;
}
