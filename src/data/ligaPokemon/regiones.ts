import { GIMNASIOS_KANTO } from './gimnasios';
import { ELITE_FOUR_KANTO, CAMPEON_KANTO } from './eliteFour';
import { Region } from '../../components/ui/battleTypes';

// Región Kanto completa
export const REGION_KANTO: Region = {
  nombre: 'Kanto',
  gimnasios: GIMNASIOS_KANTO,
  eliteFour: ELITE_FOUR_KANTO,
  campeon: CAMPEON_KANTO
};

// Todas las regiones disponibles (expandible)
export const REGIONES: Region[] = [REGION_KANTO];
