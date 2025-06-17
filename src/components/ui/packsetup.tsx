import { Moves } from '@/data/sv/moves';
import { preciosPokemon } from './preciospokemon';
import { items_sv } from '@/data/sv/items_sv';
import { getRandomMovesForSpecies, getGenderForSpecies, getPokemonDetails } from '@/lib/pokedexHelper';

function getRandomItem() {
  const battleItems = [
    "Leftovers", "Choice Band", "Choice Specs", "Choice Scarf", "Life Orb", "Focus Sash", "Assault Vest", "Rocky Helmet", "Sitrus Berry", "Expert Belt", "Air Balloon", "Heavy-Duty Boots", "Lum Berry", "Weakness Policy", "Safety Goggles", "Light Clay", "Eviolite", "Black Sludge", "Quick Claw", "Scope Lens", "Muscle Band", "Wise Glasses", "Metronome", "Mystic Water", "Charcoal", "Magnet", "Miracle Seed", "Never-Melt Ice", "Poison Barb", "Soft Sand", "Sharp Beak", "Twisted Spoon", "Silver Powder", "Hard Stone", "Spell Tag", "Dragon Fang", "Black Glasses", "Metal Coat", "Bright Powder", "King's Rock", "Razor Claw", "Razor Fang", "Leftovers"
  ];
  return battleItems[Math.floor(Math.random() * battleItems.length)];
}

function buildShowdownText({ species, shiny, item, ability, nature, moves }) {
  // Formatea los movimientos si existen
  let movesText = '';
  if (moves && Array.isArray(moves)) {
    movesText = moves.map(m => {
      // Usa el nombre formateado desde Moves, igual que en la edición
      const moveName = Moves[m]?.name || m;
      return `- ${moveName}`;
    }).join('\n');
  } else {
    movesText = '- Move 1\n- Move 2\n- Move 3\n- Move 4';
  }
  return `${species} @ ${item}\nAbility: ${ability}\nLevel: 100\nShiny: ${shiny ? 'Yes' : 'No'}\nEVs: 0 HP / 0 Atk / 0 Def / 0 SpA / 0 SpD / 0 Spe\nIVs: 31 HP / 31 Atk / 31 Def / 31 SpA / 31 SpD / 31 Spe\nNature: ${nature}\n${movesText}`;
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNature() {
  const natures = [
    'Adamant', 'Modest', 'Jolly', 'Timid', 'Bold', 'Calm', 'Impish', 'Careful', 'Hardy', 'Serious', 'Docile', 'Bashful', 'Quirky',
  ];
  return getRandomElement(natures);
}

const eeveelutions = [
  { species: "Eevee", gender: "M" },
  { species: "Flareon", gender: "F" },
  { species: "Jolteon", gender: "M" },
  { species: "Vaporeon", gender: "M" },
  { species: "Leafeon", gender: "M" },
  { species: "Glaceon", gender: "F" },
  { species: "Sylveon", gender: "M" },
  { species: "Umbreon", gender: "M" },
  { species: "Espeon", gender: "N" },
];
const paradox = ["Great-Tusk", "Scream-Tail", "Brute-Bonnet", "Flutter-Mane", "Slither-Wing", "Sandy-Shocks", "Iron-Treads", "Iron-Bundle", "Iron-Hands", "Iron-Jugulis", "Iron-Moth", "Iron-Thorns"];
const starters = ["Sprigatito", "Quaxly", "Fuecoco"];
const clasicosKanto = ["Pikachu", "Charizard", "Blastoise", "Venusaur", "Alakazam", "Machamp", "Mewtwo",];

const packSetup = [
  {
    name: "Pack Eeveelutions",
    description: "Incluye todas las formas de Eevee con 6 IVs perfectos, sin EVs asignados, y objetos útiles equipados como Master Ball, Ability Patch y objetos de batalla populares. Puedes editar cada uno luego en tu equipo",
    pokemon: eeveelutions.map(({ species, gender }) => {
      const moves = getRandomMovesForSpecies(species);
      const abilities = getPokemonDetails(species)?.abilities;
      const ability = abilities ? getRandomElement(Object.values(abilities)) : '';
      const nature = getRandomNature();
      return {
        species,
        gender: getGenderForSpecies(species) || gender,
        showdownText: buildShowdownText({
          species,
          shiny: true,
          item: getRandomItem(),
          ability,
          nature,
          moves
        })
      };
    }),
    price: 4990,
  },
  {
    name: "Pack Paradox",
    description: "Incluye todos los Pokémon Paradox de Scarlet/Violet con 6 IVs perfectos, sin EVs asignados. . Puedes editar cada uno luego en tu equipo",
    pokemon: paradox.map(species => {
      const moves = getRandomMovesForSpecies(species);
      const abilities = getPokemonDetails(species)?.abilities;
      const ability = abilities ? getRandomElement(Object.values(abilities)) : '';
      const nature = getRandomNature();
      return {
        species,
        showdownText: buildShowdownText({
          species,
          shiny: false,
          item: getRandomItem(),
          ability,
          nature,
          moves
        })
      };
    }),
    price: 9990,
  },
  {
    name: "Pack Starters",
    description: "Incluye un Sprigatito, Quaxly y Fuecoco shiny con Ability Patch equipado. . Puedes editar cada uno luego en tu equipo",
    pokemon: starters.map(species => {
      const moves = getRandomMovesForSpecies(species);
      const abilities = getPokemonDetails(species)?.abilities;
      const ability = abilities ? getRandomElement(Object.values(abilities)) : '';
      const nature = getRandomNature();
      return {
        species,
        showdownText: buildShowdownText({
          species,
          shiny: true,
          item: getRandomItem(),
          ability,
          nature,
          moves
        })
      };
    }),
    price: 1990,
  },
  {
    name: "Pack Clásicos Kanto",
    description: "Incluye los Pokémon más icónicos de la región de Kanto: Pikachu, los starters finales y legendarios clásicos. . Puedes editar cada uno luego en tu equipo",
    pokemon: clasicosKanto.map(species => {
      const moves = getRandomMovesForSpecies(species);
      const abilities = getPokemonDetails(species)?.abilities;
      const ability = abilities ? getRandomElement(Object.values(abilities)) : '';
      const nature = getRandomNature();
      return {
        species,
        showdownText: buildShowdownText({
          species,
          shiny: Math.random() > 0.5,
          item: getRandomItem(),
          ability,
          nature,
          moves
        })
      };
    }),
    price: 4990,
  },
];

export default packSetup;
