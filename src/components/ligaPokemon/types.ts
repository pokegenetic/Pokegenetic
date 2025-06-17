// Tipos e interfaces para el sistema de batalla Liga Pokémon

export interface BattleAnimationState {
  phase: 'intro' | 'pokeball-throw' | 'pokemon-appear' | 'countdown' | 'battle' | 'pokemon-faint' | 'victory' | 'defeat';
  trainerDialogue: boolean;
  pokeballAnimation: boolean;
  pokemonVisible: boolean;
  countdownVisible: boolean;
  combatActive: boolean;
}

export interface TrainerData {
  nombre: string;
  sprite: string;
  pokemon: string[];
  isLeader?: boolean;
}

export interface BattleIntroConfig {
  trainer: TrainerData;
  isLeader: boolean;
  pokemonIndex: number;
}

export interface PokeballAnimationConfig {
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  duration: number;
  throwDelay: number;
}

export interface PokemonFaintConfig {
  pokemon: string;
  duration: number;
  effectType: 'fade' | 'fall' | 'spiral';
}

export interface BattleAudioConfig {
  gymMusic: string;
  trainerBattleMusic: string;
  gymLeaderBattleMusic: string;
  victoryMusic: string;
  pokemonFaintSound: string;
}

// Frases aleatorias para entrenadores
export const TRAINER_INTRO_PHRASES = [
  "¡No podrás contra mis Pokémon!",
  "¡Me he preparado mucho para este combate!",
  "¡Veamos de qué estás hecho!",
  "¡Mis Pokémon están llenos de energía!",
  "¡Te mostraré el poder de mis compañeros!",
  "¡No subestimes mi entrenamiento!",
  "¡Esta vez no perderé!",
  "¡Mis Pokémon y yo somos invencibles!"
];

// Frases aleatorias para líderes de gimnasio
export const GYM_LEADER_INTRO_PHRASES = [
  "¡Como líder de este gimnasio, no te haré las cosas fáciles!",
  "¡Demuéstrame que mereces mi medalla!",
  "¡He entrenado durante años para este momento!",
  "¡El poder de mis Pokémon te sorprenderá!",
  "¡Solo los entrenadores más fuertes pueden vencerme!",
  "¡Mis Pokémon reflejan mi determinación como líder!",
  "¡Esta batalla decidirá si eres digno de mi medalla!"
];

export type BattlePhase = 
  | 'pre-battle'      // Antes de empezar
  | 'trainer-intro'   // Aparece el entrenador y habla
  | 'pokeball-throw'  // Animación de lanzar pokeball
  | 'pokemon-appear'  // Aparece el pokémon
  | 'countdown'       // Cuenta regresiva 3-2-1
  | 'battle-active'   // Combate activo (taps)
  | 'pokemon-faint'   // Pokémon se desmaya
  | 'victory-partial' // Victoria parcial (próximo pokémon)
  | 'victory-total'   // Victoria total
  | 'defeat';         // Derrota