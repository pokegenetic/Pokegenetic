import { Pokedex } from '@/data/sv/pokedex_module';
import { formatNameForPokedexLookup } from './equipoUtils';

export const preciosPokemon = {
  normal: 990,
  legendarioSingular: 1390,
  incrementoShiny: 190, // Nuevo: Incremento por ser shiny
};

export const preciosPacks = {
  paradox: 6500,
  eeveelution: 5000,
  starters: 1990,
};

export const descuentos = {
  porEquipoGrande: {
    cantidadMinimaPokemon: 7, // A partir de 7 Pokémon (más de 6)
    porcentajeDescuento: 10, // Ejemplo: 10% de descuento
    // o podría ser un monto fijo: montoDescuento: 500,
  },
  // Puedes agregar más tipos de descuentos aquí
};

// Puedes agregar más categorías de Pokémon o packs aquí según sea necesario.
// Por ejemplo:
// export const otrosPrecios = {
//   pokemonEventoEspecial: 2500,
// };

// Add a rule to ensure caught Pokémon have a price of $0
export const getPokemonPrice = (pokemon) => {
  // Consider caught if the property exists and is truthy (badge or boolean)
  if (pokemon.caught || pokemon.badge === 'ATRAPADO') {
    return 0; // Caught Pokémon are free
  }

  let price = preciosPokemon.normal;
  const pokedexEntry = Pokedex[formatNameForPokedexLookup(pokemon.species)];
  if (pokedexEntry) {
    const isLegendaryOrMythical = pokedexEntry.tags?.some(tag =>
      tag === "Legendary" || tag === "Mythical" || tag === "Sub-Legendary" || tag === "Restricted Legendary"
    );
    if (isLegendaryOrMythical) {
      price = preciosPokemon.legendarioSingular;
    }
  }
  if (pokemon.isShiny) {
    price += preciosPokemon.incrementoShiny;
  }
  return price;
};

// Function to get original price (without considering caught status)
export const getPokemonOriginalPrice = (pokemon) => {
  let price = preciosPokemon.normal;
  const pokedexEntry = Pokedex[formatNameForPokedexLookup(pokemon.species)];
  if (pokedexEntry) {
    const isLegendaryOrMythical = pokedexEntry.tags?.some(tag =>
      tag === "Legendary" || tag === "Mythical" || tag === "Sub-Legendary" || tag === "Restricted Legendary"
    );
    if (isLegendaryOrMythical) {
      price = preciosPokemon.legendarioSingular;
    }
  }
  if (pokemon.isShiny) {
    price += preciosPokemon.incrementoShiny;
  }
  return price;
};
