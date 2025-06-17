// Tipos e interfaces para el sistema de combate

export interface Gimnasio {
  id: number;
  nombre: string;
  tipo: string;
  color: string;
  pokemon: string[];
  sprite: string;
  medalla: {
    nombre: string;
    emoji: string;
    sprite: string;
  };
  entrenadores: Entrenador[];
  recompensas: {
    pokeballs: number;
    fichas: number;
  };
}

export interface EliteFour {
  id: number;
  nombre: string;
  tipo: string;
  color: string;
  pokemon: string[];
  sprite: string;
  titulo: string;
  recompensas: {
    pokeballs: number;
    fichas: number;
  };
}

export interface Campeon {
  id: number;
  nombre: string;
  tipo: string;
  color: string;
  pokemon: string[];
  sprite: string;
  titulo: string;
  recompensas: {
    pokeballs: number;
    fichas: number;
    legendario?: string;
  };
}

export interface Region {
  nombre: string;
  gimnasios: Gimnasio[];
  eliteFour: EliteFour[];
  campeon: Campeon;
}

export interface Entrenador {
  nombre: string;
  pokemon: string[];
  sprite: string;
}

export interface BattleState {
  tapsAcumulados: number;
  tiempoRestante: number;
  combateEnCurso: boolean;
  ataqueInminente: boolean;
  cuentaRegresiva: number;
  mostrarCuentaRegresiva: boolean;
}

export interface BattleProps {
  // Estado del combate
  gimnasioActual: number;
  entrenadorActual: number;
  pokemonActual: number;
  combatienteActual: CombatienteActual;
  tipoSeleccionado: string;
  
  // Datos
  gimnasios: Gimnasio[];
  eliteFour?: EliteFour[];
  campeon?: Campeon;
  
  // Callbacks
  onVictoria: () => void;
  onDerrota: () => void;
  onVolverAlGimnasio: () => void;
  
  // Estado del componente padre
  estado: EstadoLiga;
}

export type EstadoLiga = 'seleccion' | 'entrenador' | 'lider' | 'elite' | 'campeon' | 'victoria' | 'derrota' | 'final' | 'preparacion';

export type CombatienteActual = 'entrenador' | 'lider' | 'elite' | 'campeon';
