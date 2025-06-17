// Type definitions for natures and other data

export interface NatureData {
  name: string;
  plus?: string;
  minus?: string;
}

export interface NatureDataTable {
  [key: string]: NatureData;
}

export interface PokemonData {
  num: number;
  name: string;
  types: string[];
  baseStats: {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
  abilities: {
    0: string;
    1?: string;
    H?: string;
  };
  heightm?: number;
  weightkg?: number;
  color?: string;
  evos?: string[];
  prevo?: string;
  evoType?: string;
  evoCondition?: string;
  evoLevel?: number;
  evoItem?: string;
  eggGroups?: string[];
  [key: string]: any;
}

export interface PokemonDataTable {
  [key: string]: PokemonData;
}
