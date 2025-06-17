// src/data/pokemonConstants.ts
import aceroIcon from '@/img/teratipos/Teratipo_acero_icono_EP.png';
import aguaIcon from '@/img/teratipos/Teratipo_agua_icono_EP.png';
import astralIcon from '@/img/teratipos/Teratipo_astral_icono_EP.png';
import bichoIcon from '@/img/teratipos/Teratipo_bicho_icono_EP.png';
import dragónIcon from '@/img/teratipos/Teratipo_dragón_icono_EP.png';
import eléctricoIcon from '@/img/teratipos/Teratipo_eléctrico_icono_EP.png';
import fantasmaIcon from '@/img/teratipos/Teratipo_fantasma_icono_EP.png';
import fuegoIcon from '@/img/teratipos/Teratipo_fuego_icono_EP.png';
import hadaIcon from '@/img/teratipos/Teratipo_hada_icono_EP.png';
import hieloIcon from '@/img/teratipos/Teratipo_hielo_icono_EP.png';
import luchaIcon from '@/img/teratipos/Teratipo_lucha_icono_EP.png';
import normalIcon from '@/img/teratipos/Teratipo_normal_icono_EP.png';
import plantaIcon from '@/img/teratipos/Teratipo_planta_icono_EP.png';
import psíquicoIcon from '@/img/teratipos/Teratipo_psíquico_icono_EP.png';
import rocaIcon from '@/img/teratipos/Teratipo_roca_icono_EP.png';
import siniestroIcon from '@/img/teratipos/Teratipo_siniestro_icono_EP.png';
import tierraIcon from '@/img/teratipos/Teratipo_tierra_icono_EP.png';
import venenoIcon from '@/img/teratipos/Teratipo_veneno_icono_EP.png';
import voladorIcon from '@/img/teratipos/Teratipo_volador_icono_EP.png';

export const teraOptions = [
  { key: 'Steel',    label: 'Acero' },
  { key: 'Water',    label: 'Agua' },
  { key: 'Stellar',  label: 'Astral' },
  { key: 'Bug',      label: 'Bicho' },
  { key: 'Dragon',   label: 'Dragón' },
  { key: 'Electric', label: 'Eléctrico' },
  { key: 'Ghost',    label: 'Fantasma' },
  { key: 'Fire',     label: 'Fuego' },
  { key: 'Fairy',    label: 'Hada' },
  { key: 'Ice',      label: 'Hielo' },
  { key: 'Fighting', label: 'Lucha' },
  { key: 'Normal',   label: 'Normal' },
  { key: 'Grass',    label: 'Planta' },
  { key: 'Psychic',  label: 'Psíquico' },
  { key: 'Rock',     label: 'Roca' },
  { key: 'Dark',     label: 'Siniestro' },
  { key: 'Ground',   label: 'Tierra' },
  { key: 'Poison',   label: 'Veneno' },
  { key: 'Flying',   label: 'Volador' },
];

export const statsKeys = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const;

export const statLabels: Record<typeof statsKeys[number], string> = {
  hp: 'HP',
  atk: 'Atk',
  def: 'Def',
  spa: 'SpA',
  spd: 'SpD',
  spe: 'Spe',
};

// Standard Showdown stat names
export const statShowdownMap: Record<string, string> = {
    hp: "HP",
    atk: "Atk",
    def: "Def",
    spa: "SpA",
    spd: "SpD",
    spe: "Spe"
};

// Map Pokémon types to Tailwind background color classes
export const typeColors: Record<string, string> = {
  normal: 'bg-gray-500 text-white',
  fire: 'bg-red-500 text-white',
  water: 'bg-blue-500 text-white',
  electric: 'bg-yellow-500 text-white',
  grass: 'bg-green-500 text-white',
  ice: 'bg-blue-300 text-white',
  astral: 'bg-prismatic text-gray-800 shadow-sm',
  fighting: 'bg-red-700 text-white',
  poison: 'bg-purple-500 text-white',
  ground: 'bg-yellow-700 text-white',
  flying: 'bg-indigo-500 text-white',
  psychic: 'bg-pink-500 text-white',
  bug: 'bg-green-700 text-white',
  rock: 'bg-gray-600 text-white',
  ghost: 'bg-indigo-700 text-white',
  dragon: 'bg-purple-700 text-white',
  dark: 'bg-gray-900 text-white',
  steel: 'bg-gray-400 text-white',
  fairy: 'bg-pink-300 text-white',
};

// Sprites de teratipo locales (claves en inglés para hacer match con chosenTera)
export const teraSprites: Record<string, string> = {
  Steel: aceroIcon,
  Water: aguaIcon,
  Stellar: astralIcon,
  Bug: bichoIcon,
  Dragon: dragónIcon,
  Electric: eléctricoIcon,
  Ghost: fantasmaIcon,
  Fire: fuegoIcon,
  Fairy: hadaIcon,
  Ice: hieloIcon,
  Fighting: luchaIcon,
  Normal: normalIcon,
  Grass: plantaIcon,
  Psychic: psíquicoIcon,
  Rock: rocaIcon,
  Dark: siniestroIcon,
  Ground: tierraIcon,
  Poison: venenoIcon,
  Flying: voladorIcon,
};

// Tera Type Map for Showdown Export (English key to English value, but used for Spanish label to English key in some contexts)
// For clarity, this maps the user-facing Spanish label (or internal key if already English) to the Showdown English term.
// The `teraOptions` provides { key: 'English', label: 'Spanish' }.
// `chosenTera` state stores the English key (e.g., 'Steel').
// This map is used in `generateShowdownText` where `chosenTera` (English) is looked up.
// It seems `teraTypeMap` in the original code was mapping lowercase Spanish to Capitalized English.
// Let's ensure this map correctly serves its purpose in `generateShowdownText`.
// Original: `teraTypeMap[chosenTera.toLowerCase()] || chosenTera`
// If `chosenTera` is already English 'Steel', `chosenTera.toLowerCase()` is 'steel'.
// So, the map should be `spanish_lowercase: English_Showdown_Format`.
// Or, if `chosenTera` is always the English key from `teraOptions`, then this map might be redundant or needs to map English to English if Showdown format differs.
// Given `teraOptions` uses English keys like 'Steel', and `chosenTera` state is set from these keys,
// `generateShowdownText` uses `teraEnglish = teraTypeMap[chosenTera.toLowerCase()] || chosenTera;`
// If `chosenTera` is 'Steel', `chosenTera.toLowerCase()` is 'steel'. So `teraTypeMap` should have `steel: "Steel"`.
// The original `teraTypeMap` had `acero: "Steel"`. This implies `chosenTera` might hold Spanish at some point, or the lookup is incorrect.
// Let's assume `chosenTera` holds the English key from `teraOptions`.
// Then `teraTypeMap` should map these English keys (lowercase) to the desired Showdown string.
// If Showdown string is identical to the key, it's simpler.
// The current `teraOptions` have `key: 'Steel'`, `label: 'Acero'`. `chosenTera` state is `(currentPokemon as ParsedPokemon)?.teraType || teraOptions[0].key`. So `chosenTera` is English.
// `generateShowdownText` has `const teraEnglish = teraTypeMap[chosenTera.toLowerCase()] || chosenTera;`
// If `chosenTera` is "Stellar", `chosenTera.toLowerCase()` is "stellar". `teraTypeMap` needs `stellar: "Stellar"`.
// The provided `teraTypeMap` in `ediciontarjeta.tsx` was:
// const teraTypeMap: Record<string, string> = { acero: "Steel", ..., astral: "Stellar" }
// This suggests that `chosenTera` might be Spanish at the point of `generateShowdownText` or the map is misaligned with state.
// Let's assume `chosenTera` is English (e.g. "Steel", "Stellar") as per `useState` initialization.
// Then `chosenTera.toLowerCase()` (e.g. "steel", "stellar") should be the keys for this map.
export const showdownTeraTypeMap: Record<string, string> = {
  steel: "Steel",
  water: "Water",
  stellar: "Stellar",
  bug: "Bug",
  dragon: "Dragon",
  electric: "Electric",
  ghost: "Ghost",
  fire: "Fire",
  fairy: "Fairy",
  ice: "Ice",
  fighting: "Fighting",
  normal: "Normal",
  grass: "Grass",
  psychic: "Psychic",
  rock: "Rock",
  dark: "Dark",
  ground: "Ground",
  poison: "Poison",
  flying: "Flying",
  // Add any other specific mappings if Showdown format differs from the key
};
