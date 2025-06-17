import type { ParsedPokemon } from './parseShowdown';

export type PackEntry = {
  type: 'pack';
  packName: string;
  pokemons: ParsedPokemon[];
};

export type HomePackEntry = {
  type: 'homepack';
  packName: string;
  trainerName: string;
  isShiny: boolean;
  price?: number;
  gameIcon?: string;
};

export function getPokemonTeam(): (ParsedPokemon | PackEntry | HomePackEntry)[] {
  try {
    const raw = localStorage.getItem('pokemonTeam');
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr)
      ? arr.filter(p => typeof p === 'object' && p !== null &&
        (
          (p.species && Array.isArray(p.moves)) ||
          (p.type === 'pack' && typeof p.packName === 'string' && Array.isArray(p.pokemons)) ||
          (p.type === 'homepack' && typeof p.packName === 'string' && typeof p.trainerName === 'string')
        ))
      : [];
  } catch (e) {
    localStorage.removeItem('pokemonTeam');
    return [];
  }
}

export function setPokemonTeam(team: (ParsedPokemon | PackEntry | HomePackEntry)[]): void {
  localStorage.setItem('pokemonTeam', JSON.stringify(team));
}

export const addPokemonToTeam = (pokemon: ParsedPokemon): void => {
  const team = getPokemonTeam();
  team.push(pokemon);
  setPokemonTeam(team);
};

export const addHomePackToTeam = (homePack: HomePackEntry): void => {
  const team = getPokemonTeam();
  team.push(homePack);
  setPokemonTeam(team);
};
