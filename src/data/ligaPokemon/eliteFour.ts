import { EliteFour, Campeon } from '../../components/ui/battleTypes';

// Elite Four de Kanto
export const ELITE_FOUR_KANTO: EliteFour[] = [
  {
    id: 1,
    nombre: 'Lorelei',
    tipo: 'Hielo',
    color: 'from-cyan-300 to-blue-500',
    pokemon: ['Dewgong', 'Cloyster', 'Slowbro', 'Jynx', 'Lapras'],
    sprite: 'https://archives.bulbagarden.net/media/upload/a/a5/Spr_FRLG_Lorelei.png',
    titulo: 'Especialista en Hielo',
    recompensas: { pokeballs: 5, fichas: 50 }
  },
  {
    id: 2,
    nombre: 'Bruno',
    tipo: 'Lucha',
    color: 'from-orange-400 to-red-600',
    pokemon: ['Onix', 'Hitmonchan', 'Hitmonlee', 'Onix', 'Machamp'],
    sprite: 'https://archives.bulbagarden.net/media/upload/3/3d/Spr_FRLG_Bruno.png',
    titulo: 'Rey de la Lucha',
    recompensas: { pokeballs: 5, fichas: 55 }
  },
  {
    id: 3,
    nombre: 'Agatha',
    tipo: 'Fantasma',
    color: 'from-purple-400 to-indigo-700',
    pokemon: ['Gengar', 'Golbat', 'Haunter', 'Arbok', 'Gengar'],
    sprite: 'https://archives.bulbagarden.net/media/upload/a/a9/Spr_FRLG_Agatha.png',
    titulo: 'Maestra Fantasma',
    recompensas: { pokeballs: 5, fichas: 60 }
  },
  {
    id: 4,
    nombre: 'Lance',
    tipo: 'Dragón',
    color: 'from-red-500 to-purple-600',
    pokemon: ['Gyarados', 'Dragonair', 'Dragonair', 'Aerodactyl', 'Dragonite'],
    sprite: 'https://archives.bulbagarden.net/media/upload/5/57/Spr_FRLG_Lance.png',
    titulo: 'Maestro Dragón',
    recompensas: { pokeballs: 6, fichas: 65 }
  }
];

// Campeón de Kanto  
export const CAMPEON_KANTO: Campeon = {
  id: 1,
  nombre: 'Blue',
  tipo: 'Variado',
  color: 'from-indigo-500 via-purple-500 to-pink-500',
  pokemon: ['Pidgeot', 'Alakazam', 'Rhydon', 'Arcanine', 'Gyarados', 'Venusaur'],
  sprite: 'https://archives.bulbagarden.net/media/upload/b/b1/Spr_FRLG_Blue.png',
  titulo: 'Campeón de Kanto',
  recompensas: { pokeballs: 10, fichas: 100, legendario: 'Mew' }
};
